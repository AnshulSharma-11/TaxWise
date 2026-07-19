package com.tax.dto.tax;

import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class SaveCalculationRequest extends TaxCalculationRequest {

    @Size(max = 150, message = "Label must be under 150 characters")
    private String label;
}
