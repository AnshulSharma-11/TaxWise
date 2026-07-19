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
public class TaxHistorySummaryResponse {
    private Long id;
    private String label;
    private String financialYear;
    private TaxRegime regime;
    private BigDecimal grossIncome;
    private BigDecimal taxableIncome;
    private BigDecimal totalTaxLiability;
    private LocalDateTime createdAt;
}
