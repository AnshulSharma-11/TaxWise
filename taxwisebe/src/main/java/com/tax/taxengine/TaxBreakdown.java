package com.tax.taxengine;

import java.math.BigDecimal;

/**
 * Full result of running the engine for one regime. All monetary fields are
 * rounded to 2 decimal places.
 */
public record TaxBreakdown(
        BigDecimal grossIncome,
        BigDecimal standardDeduction,
        BigDecimal hraExemption,
        BigDecimal totalDeductions,
        BigDecimal taxableIncome,
        BigDecimal taxBeforeCess,
        BigDecimal rebate87A,
        BigDecimal surcharge,
        BigDecimal cess,
        BigDecimal totalTaxLiability,
        BigDecimal netTakeHomeAnnual,
        BigDecimal netTakeHomeMonthly,
        BigDecimal effectiveTaxRatePercent
) {
}
