package com.tax.dto.tax;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalCalculations;
    private TaxHistorySummaryResponse latestCalculation;
    private BigDecimal averageTaxableIncome;
    private BigDecimal averageTaxLiability;
    private long oldRegimeCount;
    private long newRegimeCount;
    private BigDecimal latestPotentialSavings;

    /** Most recent calculations (newest first), capped for chart/list display. */
    private List<TaxHistorySummaryResponse> recentCalculations;
}
