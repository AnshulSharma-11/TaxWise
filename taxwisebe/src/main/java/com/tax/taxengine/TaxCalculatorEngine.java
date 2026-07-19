package com.tax.taxengine;

import com.tax.entity.TaxRegime;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Pure Indian income-tax computation engine. No persistence, no HTTP concerns -
 * just numbers in, numbers out, so it's easy to unit test and reuse for both the
 * "quick calculate" and "save to history" flows.
 *
 * Simplifications applied (documented for transparency, typical of consumer tax
 * calculators): surcharge thresholds are evaluated on taxable income rather than
 * total income, and marginal relief at the 87A rebate boundary / surcharge
 * boundaries is not modelled. Deduction sections (80C, 80D, 80CCD(1B), 24(b)) use
 * their standard statutory caps.
 */
@Component
public class TaxCalculatorEngine {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal CESS_RATE = BigDecimal.valueOf(4);

    private static final BigDecimal CAP_80C = BigDecimal.valueOf(150_000);
    private static final BigDecimal CAP_80D_UNDER_60 = BigDecimal.valueOf(25_000);
    private static final BigDecimal CAP_80D_60_PLUS = BigDecimal.valueOf(50_000);
    private static final BigDecimal CAP_80CCD_1B = BigDecimal.valueOf(50_000);
    private static final BigDecimal CAP_24B = BigDecimal.valueOf(200_000);

    public TaxBreakdown calculate(TaxEngineInput input) {
        FinancialYearTaxConfig config = TaxSlabProvider.getConfig(input.financialYear());
        return input.regime() == TaxRegime.NEW
                ? calculateNewRegime(input, config)
                : calculateOldRegime(input, config);
    }

    /** Convenience for building regime-comparison views: computes both regimes for the same inputs. */
    public TaxBreakdown calculateOther(TaxEngineInput input) {
        TaxRegime other = input.regime() == TaxRegime.NEW ? TaxRegime.OLD : TaxRegime.NEW;
        return calculate(input.withRegime(other));
    }

    private TaxBreakdown calculateNewRegime(TaxEngineInput input, FinancialYearTaxConfig config) {
        BigDecimal gross = input.grossIncome();
        BigDecimal standardDeduction = config.getStandardDeductionNew().min(gross.max(BigDecimal.ZERO));
        BigDecimal taxableIncome = zeroFloor(gross.subtract(standardDeduction));

        BigDecimal tax = slabTax(taxableIncome, config.getNewRegimeSlabs());
        BigDecimal rebate = taxableIncome.compareTo(config.getRebateLimitNew()) <= 0
                ? tax.min(config.getRebateMaxNew())
                : BigDecimal.ZERO;

        return finalizeBreakdown(gross, standardDeduction, BigDecimal.ZERO, standardDeduction,
                taxableIncome, tax, rebate, input.regime());
    }

    private TaxBreakdown calculateOldRegime(TaxEngineInput input, FinancialYearTaxConfig config) {
        BigDecimal gross = input.grossIncome();
        BigDecimal standardDeduction = config.getStandardDeductionOld().min(gross.max(BigDecimal.ZERO));

        BigDecimal hraExemption = calculateHraExemption(input);
        BigDecimal cap80D = input.age() >= 60 ? CAP_80D_60_PLUS : CAP_80D_UNDER_60;

        BigDecimal deduction80C = input.deduction80C().min(CAP_80C);
        BigDecimal deduction80D = input.deduction80D().min(cap80D);
        BigDecimal deduction80CCD1B = input.deduction80CCD1B().min(CAP_80CCD_1B);
        BigDecimal homeLoanInterest = input.homeLoanInterest24B().min(CAP_24B);
        BigDecimal otherDeductions = input.otherDeductions();

        BigDecimal totalDeductions = standardDeduction
                .add(hraExemption)
                .add(deduction80C)
                .add(deduction80D)
                .add(deduction80CCD1B)
                .add(homeLoanInterest)
                .add(otherDeductions);

        BigDecimal taxableIncome = zeroFloor(gross.subtract(totalDeductions));

        List<TaxSlab> slabs = config.oldRegimeSlabsForAge(input.age());
        BigDecimal tax = slabTax(taxableIncome, slabs);
        BigDecimal rebate = taxableIncome.compareTo(config.getRebateLimitOld()) <= 0
                ? tax.min(config.getRebateMaxOld())
                : BigDecimal.ZERO;

        return finalizeBreakdown(gross, standardDeduction, hraExemption, totalDeductions,
                taxableIncome, tax, rebate, input.regime());
    }

    private TaxBreakdown finalizeBreakdown(BigDecimal gross, BigDecimal standardDeduction, BigDecimal hraExemption,
                                            BigDecimal totalDeductions, BigDecimal taxableIncome, BigDecimal tax,
                                            BigDecimal rebate, TaxRegime regime) {
        BigDecimal taxAfterRebate = zeroFloor(tax.subtract(rebate));
        BigDecimal surchargeRate = surchargeRatePercent(taxableIncome, regime);
        BigDecimal surcharge = taxAfterRebate.multiply(surchargeRate).divide(HUNDRED, 4, RoundingMode.HALF_UP);
        BigDecimal cess = taxAfterRebate.add(surcharge).multiply(CESS_RATE).divide(HUNDRED, 4, RoundingMode.HALF_UP);
        BigDecimal totalTax = taxAfterRebate.add(surcharge).add(cess);
        BigDecimal netAnnual = gross.subtract(totalTax);
        BigDecimal netMonthly = netAnnual.divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        BigDecimal effectiveRate = gross.signum() > 0
                ? totalTax.multiply(HUNDRED).divide(gross, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new TaxBreakdown(
                round(gross), round(standardDeduction), round(hraExemption), round(totalDeductions),
                round(taxableIncome), round(tax), round(rebate), round(surcharge), round(cess),
                round(totalTax), round(netAnnual), round(netMonthly), round(effectiveRate)
        );
    }

    private BigDecimal calculateHraExemption(TaxEngineInput input) {
        if (input.hraReceived().signum() <= 0 || input.basicSalary().signum() <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal tenPercentBasic = input.basicSalary().multiply(BigDecimal.valueOf(0.10));
        BigDecimal rentMinusTenPercent = zeroFloor(input.rentPaid().subtract(tenPercentBasic));
        BigDecimal percentOfBasic = input.basicSalary().multiply(input.isMetroCity() ? BigDecimal.valueOf(0.50) : BigDecimal.valueOf(0.40));

        return input.hraReceived().min(rentMinusTenPercent).min(percentOfBasic).max(BigDecimal.ZERO);
    }

    private BigDecimal surchargeRatePercent(BigDecimal taxableIncome, TaxRegime regime) {
        BigDecimal fiftyLakh = BigDecimal.valueOf(5_000_000);
        BigDecimal oneCrore = BigDecimal.valueOf(10_000_000);
        BigDecimal twoCrore = BigDecimal.valueOf(20_000_000);
        BigDecimal fiveCrore = BigDecimal.valueOf(50_000_000);

        if (taxableIncome.compareTo(fiveCrore) > 0) {
            return regime == TaxRegime.NEW ? BigDecimal.valueOf(25) : BigDecimal.valueOf(37);
        }
        if (taxableIncome.compareTo(twoCrore) > 0) {
            return BigDecimal.valueOf(25);
        }
        if (taxableIncome.compareTo(oneCrore) > 0) {
            return BigDecimal.valueOf(15);
        }
        if (taxableIncome.compareTo(fiftyLakh) > 0) {
            return BigDecimal.valueOf(10);
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal slabTax(BigDecimal taxableIncome, List<TaxSlab> slabs) {
        BigDecimal tax = BigDecimal.ZERO;
        for (TaxSlab slab : slabs) {
            if (taxableIncome.compareTo(slab.from()) <= 0) {
                break;
            }
            BigDecimal sliceUpper = slab.to() == null ? taxableIncome : slab.to().min(taxableIncome);
            BigDecimal taxableInSlab = sliceUpper.subtract(slab.from());
            if (taxableInSlab.signum() > 0) {
                tax = tax.add(taxableInSlab.multiply(slab.ratePercent()).divide(HUNDRED, 4, RoundingMode.HALF_UP));
            }
        }
        return tax;
    }

    private BigDecimal zeroFloor(BigDecimal value) {
        return value.signum() < 0 ? BigDecimal.ZERO : value;
    }

    private BigDecimal round(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
