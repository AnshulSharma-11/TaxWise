package com.tax.dto.tax;

import com.tax.entity.TaxRegime;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TaxCalculationRequest {

    @NotBlank(message = "Financial year is required")
    private String financialYear;

    @NotNull(message = "Regime is required")
    private TaxRegime regime;

    @NotNull(message = "Annual gross income is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Annual gross income cannot be negative")
    private BigDecimal annualGrossIncome;

    @Min(value = 0, message = "Age cannot be negative")
    @Max(value = 120, message = "Enter a valid age")
    private Integer age;

    @DecimalMin(value = "0.0", message = "Basic salary cannot be negative")
    private BigDecimal basicSalary;

    @DecimalMin(value = "0.0", message = "HRA received cannot be negative")
    private BigDecimal hraReceived;

    @DecimalMin(value = "0.0", message = "Rent paid cannot be negative")
    private BigDecimal rentPaid;

    private Boolean metroCity;

    @DecimalMin(value = "0.0", message = "Section 80C amount cannot be negative")
    private BigDecimal deduction80C;

    @DecimalMin(value = "0.0", message = "Section 80D amount cannot be negative")
    private BigDecimal deduction80D;

    @DecimalMin(value = "0.0", message = "Section 80CCD(1B) amount cannot be negative")
    private BigDecimal deduction80CCD1B;

    @DecimalMin(value = "0.0", message = "Home loan interest cannot be negative")
    private BigDecimal homeLoanInterest24B;

    @DecimalMin(value = "0.0", message = "Other deductions cannot be negative")
    private BigDecimal otherDeductions;
}
