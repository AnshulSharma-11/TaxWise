package com.tax.dto.tax;

import com.tax.entity.TaxRegime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxCalculationResponse {

    private Long id;
    private String label;
    private String financialYear;
    private TaxRegime regime;

    private BigDecimal grossIncome;
    private BigDecimal standardDeduction;
    private BigDecimal hraExemption;
    private BigDecimal totalDeductions;
    private BigDecimal taxableIncome;
    private BigDecimal taxBeforeCess;
    private BigDecimal rebate87A;
    private BigDecimal surcharge;
    private BigDecimal cess;
    private BigDecimal totalTaxLiability;
    private BigDecimal netTakeHomeAnnual;
    private BigDecimal netTakeHomeMonthly;
    private BigDecimal effectiveTaxRatePercent;

    /** Total tax liability if the *other* regime were chosen, for a side-by-side comparison. */
    private BigDecimal comparisonRegimeTax;
    private TaxRegime comparisonRegime;
    private TaxRegime betterRegime;
    private BigDecimal potentialSavings;

    private LocalDateTime createdAt;
}
