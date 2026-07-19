package com.tax.repository;

import com.tax.entity.TaxCalculation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxCalculationRepository extends JpaRepository<TaxCalculation, Long> {

    List<TaxCalculation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<TaxCalculation> findByUserIdAndFinancialYearOrderByCreatedAtDesc(Long userId, String financialYear);

    long countByUserId(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
