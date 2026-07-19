package com.tax.taxengine;

import com.tax.entity.TaxRegime;

import java.math.BigDecimal;

public record TaxEngineInput(
        String financialYear,
        TaxRegime regime,
        BigDecimal grossIncome,
        Integer age,
        BigDecimal basicSalary,
        BigDecimal hraReceived,
        BigDecimal rentPaid,
        Boolean isMetroCity,
        BigDecimal deduction80C,
        BigDecimal deduction80D,
        BigDecimal deduction80CCD1B,
        BigDecimal homeLoanInterest24B,
        BigDecimal otherDeductions
) {
    public TaxEngineInput {
        age = age == null ? 30 : age;
        basicSalary = nz(basicSalary);
        hraReceived = nz(hraReceived);
        rentPaid = nz(rentPaid);
        isMetroCity = isMetroCity != null && isMetroCity;
        deduction80C = nz(deduction80C);
        deduction80D = nz(deduction80D);
        deduction80CCD1B = nz(deduction80CCD1B);
        homeLoanInterest24B = nz(homeLoanInterest24B);
        otherDeductions = nz(otherDeductions);
    }

    private static BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public TaxEngineInput withRegime(TaxRegime newRegime) {
        return new TaxEngineInput(financialYear, newRegime, grossIncome, age, basicSalary, hraReceived,
                rentPaid, isMetroCity, deduction80C, deduction80D, deduction80CCD1B, homeLoanInterest24B,
                otherDeductions);
    }
}
