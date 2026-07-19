package com.tax.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A saved snapshot of one tax computation run by a user, covering both
 * the inputs (income + deductions) and the derived results, so history
 * can be displayed/exported without re-running the engine.
 */
@Entity
@Table(name = "tax_calculations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxCalculation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** User-friendly label, e.g. "FY 2025-26 Salary Plan". */
    @Column(length = 150)
    private String label;

    /** e.g. "2025-26" */
    @Column(nullable = false, length = 10)
    private String financialYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TaxRegime regime;

    // ---- Inputs ----
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal annualGrossIncome;

    @Column(precision = 15, scale = 2)
    private BigDecimal basicSalary;

    @Column(precision = 15, scale = 2)
    private BigDecimal hraReceived;

    @Column(precision = 15, scale = 2)
    private BigDecimal rentPaid;

    @Column
    private Boolean metroCity;

    @Column(precision = 15, scale = 2)
    private BigDecimal deduction80C;

    @Column(precision = 15, scale = 2)
    private BigDecimal deduction80D;

    @Column(precision = 15, scale = 2)
    private BigDecimal deduction80CCD1B;

    @Column(precision = 15, scale = 2)
    private BigDecimal homeLoanInterest24B;

    @Column(precision = 15, scale = 2)
    private BigDecimal otherDeductions;

    @Column
    private Integer age;

    // ---- Results ----
    @Column(precision = 15, scale = 2)
    private BigDecimal standardDeduction;

    @Column(precision = 15, scale = 2)
    private BigDecimal hraExemption;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalDeductions;

    @Column(precision = 15, scale = 2)
    private BigDecimal taxableIncome;

    @Column(precision = 15, scale = 2)
    private BigDecimal taxBeforeCess;

    @Column(precision = 15, scale = 2)
    private BigDecimal surcharge;

    @Column(precision = 15, scale = 2)
    private BigDecimal cess;

    @Column(precision = 15, scale = 2)
    private BigDecimal rebate87A;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalTaxLiability;

    @Column(precision = 15, scale = 2)
    private BigDecimal netTakeHomeAnnual;

    @Column(precision = 15, scale = 2)
    private BigDecimal netTakeHomeMonthly;

    /** Tax payable under the other regime, stored so the UI can show a comparison without recomputation. */
    @Column(precision = 15, scale = 2)
    private BigDecimal comparisonRegimeTax;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
