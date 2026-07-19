package com.tax.service;

import com.tax.dto.tax.SlabInfoResponse;
import com.tax.dto.tax.TaxCalculationRequest;
import com.tax.dto.tax.TaxCalculationResponse;
import com.tax.entity.TaxRegime;
import com.tax.taxengine.FinancialYearTaxConfig;
import com.tax.taxengine.TaxBreakdown;
import com.tax.taxengine.TaxCalculatorEngine;
import com.tax.taxengine.TaxEngineInput;
import com.tax.taxengine.TaxSlab;
import com.tax.taxengine.TaxSlabProvider;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TaxService {

    private final TaxCalculatorEngine engine;

    public TaxService(TaxCalculatorEngine engine) {
        this.engine = engine;
    }

    /** Runs the engine for the requested regime and attaches a same-inputs comparison against the other regime. */
    public TaxCalculationResponse calculate(TaxCalculationRequest request) {
        TaxEngineInput input = toEngineInput(request);

        TaxBreakdown primary = engine.calculate(input);
        TaxBreakdown other = engine.calculateOther(input);

        TaxRegime comparisonRegime = request.getRegime() == TaxRegime.NEW ? TaxRegime.OLD : TaxRegime.NEW;
        TaxRegime betterRegime = other.totalTaxLiability().compareTo(primary.totalTaxLiability()) < 0
                ? comparisonRegime
                : request.getRegime();
        BigDecimal potentialSavings = primary.totalTaxLiability().subtract(other.totalTaxLiability()).abs();

        return TaxCalculationResponse.builder()
                .label(null)
                .financialYear(request.getFinancialYear())
                .regime(request.getRegime())
                .grossIncome(primary.grossIncome())
                .standardDeduction(primary.standardDeduction())
                .hraExemption(primary.hraExemption())
                .totalDeductions(primary.totalDeductions())
                .taxableIncome(primary.taxableIncome())
                .taxBeforeCess(primary.taxBeforeCess())
                .rebate87A(primary.rebate87A())
                .surcharge(primary.surcharge())
                .cess(primary.cess())
                .totalTaxLiability(primary.totalTaxLiability())
                .netTakeHomeAnnual(primary.netTakeHomeAnnual())
                .netTakeHomeMonthly(primary.netTakeHomeMonthly())
                .effectiveTaxRatePercent(primary.effectiveTaxRatePercent())
                .comparisonRegimeTax(other.totalTaxLiability())
                .comparisonRegime(comparisonRegime)
                .betterRegime(betterRegime)
                .potentialSavings(potentialSavings)
                .build();
    }

    public SlabInfoResponse getSlabInfo(String financialYear) {
        FinancialYearTaxConfig config = TaxSlabProvider.getConfig(financialYear);
        return SlabInfoResponse.builder()
                .financialYear(config.getFinancialYear())
                .standardDeductionNew(config.getStandardDeductionNew())
                .standardDeductionOld(config.getStandardDeductionOld())
                .rebateLimitNew(config.getRebateLimitNew())
                .rebateMaxNew(config.getRebateMaxNew())
                .rebateLimitOld(config.getRebateLimitOld())
                .rebateMaxOld(config.getRebateMaxOld())
                .newRegimeSlabs(toRows(config.getNewRegimeSlabs()))
                .oldRegimeSlabsBelow60(toRows(config.oldRegimeSlabsForAge(30)))
                .oldRegimeSlabs60To80(toRows(config.oldRegimeSlabsForAge(65)))
                .oldRegimeSlabs80Plus(toRows(config.oldRegimeSlabsForAge(85)))
                .build();
    }

    public List<String> getSupportedFinancialYears() {
        return TaxSlabProvider.getSupportedYears();
    }

    private List<SlabInfoResponse.SlabRow> toRows(List<TaxSlab> slabs) {
        return slabs.stream()
                .map(s -> SlabInfoResponse.SlabRow.builder().from(s.from()).to(s.to()).ratePercent(s.ratePercent()).build())
                .toList();
    }

    private TaxEngineInput toEngineInput(TaxCalculationRequest r) {
        return new TaxEngineInput(
                r.getFinancialYear(), r.getRegime(), r.getAnnualGrossIncome(), r.getAge(),
                r.getBasicSalary(), r.getHraReceived(), r.getRentPaid(), r.getMetroCity(),
                r.getDeduction80C(), r.getDeduction80D(), r.getDeduction80CCD1B(),
                r.getHomeLoanInterest24B(), r.getOtherDeductions()
        );
    }
}
