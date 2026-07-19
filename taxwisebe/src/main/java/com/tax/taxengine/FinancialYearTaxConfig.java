package com.tax.taxengine;

import java.math.BigDecimal;
import java.util.List;

/**
 * All the numbers that change from one Indian financial year's Budget to the next:
 * slab tables (new regime + old regime by age band), standard deduction, and
 * Section 87A rebate thresholds. Everything else in the engine (surcharge bands,
 * cess rate, 80C/80D/80CCD(1B)/24(b) caps) is treated as stable across years.
 */
public class FinancialYearTaxConfig {

    private final String financialYear;
    private final List<TaxSlab> newRegimeSlabs;
    private final List<TaxSlab> oldRegimeSlabsBelow60;
    private final List<TaxSlab> oldRegimeSlabs60To80;
    private final List<TaxSlab> oldRegimeSlabs80Plus;
    private final BigDecimal standardDeductionNew;
    private final BigDecimal standardDeductionOld;
    private final BigDecimal rebateLimitNew;
    private final BigDecimal rebateMaxNew;
    private final BigDecimal rebateLimitOld;
    private final BigDecimal rebateMaxOld;

    public FinancialYearTaxConfig(String financialYear, List<TaxSlab> newRegimeSlabs,
                                   List<TaxSlab> oldRegimeSlabsBelow60, List<TaxSlab> oldRegimeSlabs60To80,
                                   List<TaxSlab> oldRegimeSlabs80Plus, BigDecimal standardDeductionNew,
                                   BigDecimal standardDeductionOld, BigDecimal rebateLimitNew,
                                   BigDecimal rebateMaxNew, BigDecimal rebateLimitOld, BigDecimal rebateMaxOld) {
        this.financialYear = financialYear;
        this.newRegimeSlabs = newRegimeSlabs;
        this.oldRegimeSlabsBelow60 = oldRegimeSlabsBelow60;
        this.oldRegimeSlabs60To80 = oldRegimeSlabs60To80;
        this.oldRegimeSlabs80Plus = oldRegimeSlabs80Plus;
        this.standardDeductionNew = standardDeductionNew;
        this.standardDeductionOld = standardDeductionOld;
        this.rebateLimitNew = rebateLimitNew;
        this.rebateMaxNew = rebateMaxNew;
        this.rebateLimitOld = rebateLimitOld;
        this.rebateMaxOld = rebateMaxOld;
    }

    public List<TaxSlab> oldRegimeSlabsForAge(int age) {
        if (age >= 80) return oldRegimeSlabs80Plus;
        if (age >= 60) return oldRegimeSlabs60To80;
        return oldRegimeSlabsBelow60;
    }

    public String getFinancialYear() {
        return financialYear;
    }

    public List<TaxSlab> getNewRegimeSlabs() {
        return newRegimeSlabs;
    }

    public BigDecimal getStandardDeductionNew() {
        return standardDeductionNew;
    }

    public BigDecimal getStandardDeductionOld() {
        return standardDeductionOld;
    }

    public BigDecimal getRebateLimitNew() {
        return rebateLimitNew;
    }

    public BigDecimal getRebateMaxNew() {
        return rebateMaxNew;
    }

    public BigDecimal getRebateLimitOld() {
        return rebateLimitOld;
    }

    public BigDecimal getRebateMaxOld() {
        return rebateMaxOld;
    }
}
