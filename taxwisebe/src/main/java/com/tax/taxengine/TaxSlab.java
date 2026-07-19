package com.tax.taxengine;

import java.math.BigDecimal;

/**
 * One income band of a slab table.
 * {@code to == null} means "and above" (the top-most, unbounded slab).
 */
public record TaxSlab(BigDecimal from, BigDecimal to, BigDecimal ratePercent) {

    public static TaxSlab of(long from, Long to, double ratePercent) {
        return new TaxSlab(
                BigDecimal.valueOf(from),
                to == null ? null : BigDecimal.valueOf(to),
                BigDecimal.valueOf(ratePercent)
        );
    }
}
