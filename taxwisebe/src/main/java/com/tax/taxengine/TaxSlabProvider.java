package com.tax.taxengine;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Registry of supported financial years. Add a new {@link FinancialYearTaxConfig}
 * here whenever a fresh Union Budget changes the slabs.
 *
 * Sources: Budget 2024 (FY 2024-25 / AY 2025-26) and Budget 2025 (FY 2025-26 / AY 2026-27)
 * new-regime slab revisions. Old regime slabs have been unchanged for several years.
 */
public final class TaxSlabProvider {

    public static final String FY_2024_25 = "2024-25";
    public static final String FY_2025_26 = "2025-26";

    private static final Map<String, FinancialYearTaxConfig> CONFIGS = new LinkedHashMap<>();

    static {
        // Old regime slab tables are identical across both supported years.
        List<TaxSlab> oldBelow60 = List.of(
                TaxSlab.of(0, 250_000L, 0),
                TaxSlab.of(250_000, 500_000L, 5),
                TaxSlab.of(500_000, 1_000_000L, 20),
                TaxSlab.of(1_000_000, null, 30)
        );
        List<TaxSlab> old60to80 = List.of(
                TaxSlab.of(0, 300_000L, 0),
                TaxSlab.of(300_000, 500_000L, 5),
                TaxSlab.of(500_000, 1_000_000L, 20),
                TaxSlab.of(1_000_000, null, 30)
        );
        List<TaxSlab> old80Plus = List.of(
                TaxSlab.of(0, 500_000L, 0),
                TaxSlab.of(500_000, 1_000_000L, 20),
                TaxSlab.of(1_000_000, null, 30)
        );

        // FY 2024-25 (AY 2025-26) new regime slabs, per Budget 2024.
        List<TaxSlab> newRegime2425 = List.of(
                TaxSlab.of(0, 300_000L, 0),
                TaxSlab.of(300_000, 700_000L, 5),
                TaxSlab.of(700_000, 1_000_000L, 10),
                TaxSlab.of(1_000_000, 1_200_000L, 15),
                TaxSlab.of(1_200_000, 1_500_000L, 20),
                TaxSlab.of(1_500_000, null, 30)
        );

        CONFIGS.put(FY_2024_25, new FinancialYearTaxConfig(
                FY_2024_25,
                newRegime2425,
                oldBelow60, old60to80, old80Plus,
                BigDecimal.valueOf(75_000),   // standard deduction - new regime
                BigDecimal.valueOf(50_000),   // standard deduction - old regime
                BigDecimal.valueOf(700_000),  // 87A rebate limit - new regime
                BigDecimal.valueOf(25_000),   // 87A rebate max - new regime
                BigDecimal.valueOf(500_000),  // 87A rebate limit - old regime
                BigDecimal.valueOf(12_500)    // 87A rebate max - old regime
        ));

        // FY 2025-26 (AY 2026-27) new regime slabs, per Budget 2025.
        List<TaxSlab> newRegime2526 = List.of(
                TaxSlab.of(0, 400_000L, 0),
                TaxSlab.of(400_000, 800_000L, 5),
                TaxSlab.of(800_000, 1_200_000L, 10),
                TaxSlab.of(1_200_000, 1_600_000L, 15),
                TaxSlab.of(1_600_000, 2_000_000L, 20),
                TaxSlab.of(2_000_000, 2_400_000L, 25),
                TaxSlab.of(2_400_000, null, 30)
        );

        CONFIGS.put(FY_2025_26, new FinancialYearTaxConfig(
                FY_2025_26,
                newRegime2526,
                oldBelow60, old60to80, old80Plus,
                BigDecimal.valueOf(75_000),
                BigDecimal.valueOf(50_000),
                BigDecimal.valueOf(1_200_000), // 87A rebate limit - new regime
                BigDecimal.valueOf(60_000),    // 87A rebate max - new regime
                BigDecimal.valueOf(500_000),
                BigDecimal.valueOf(12_500)
        ));
    }

    private TaxSlabProvider() {
    }

    public static FinancialYearTaxConfig getConfig(String financialYear) {
        FinancialYearTaxConfig config = CONFIGS.get(financialYear);
        if (config == null) {
            throw new IllegalArgumentException(
                    "Unsupported financial year '" + financialYear + "'. Supported years: " + CONFIGS.keySet());
        }
        return config;
    }

    public static List<String> getSupportedYears() {
        return List.copyOf(CONFIGS.keySet());
    }
}
