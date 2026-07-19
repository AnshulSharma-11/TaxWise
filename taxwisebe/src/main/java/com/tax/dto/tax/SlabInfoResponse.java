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
public class SlabInfoResponse {

    private String financialYear;
    private BigDecimal standardDeductionNew;
    private BigDecimal standardDeductionOld;
    private BigDecimal rebateLimitNew;
    private BigDecimal rebateMaxNew;
    private BigDecimal rebateLimitOld;
    private BigDecimal rebateMaxOld;

    private List<SlabRow> newRegimeSlabs;
    private List<SlabRow> oldRegimeSlabsBelow60;
    private List<SlabRow> oldRegimeSlabs60To80;
    private List<SlabRow> oldRegimeSlabs80Plus;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlabRow {
        private BigDecimal from;
        private BigDecimal to;
        private BigDecimal ratePercent;
    }
}
