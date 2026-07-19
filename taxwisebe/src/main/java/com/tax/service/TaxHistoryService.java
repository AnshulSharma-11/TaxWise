package com.tax.service;

import com.tax.dto.tax.DashboardResponse;
import com.tax.dto.tax.SaveCalculationRequest;
import com.tax.dto.tax.TaxCalculationResponse;
import com.tax.dto.tax.TaxHistorySummaryResponse;
import com.tax.entity.TaxCalculation;
import com.tax.entity.TaxRegime;
import com.tax.entity.User;
import com.tax.exception.ResourceNotFoundException;
import com.tax.repository.TaxCalculationRepository;
import com.tax.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TaxHistoryService {

    private static final int RECENT_LIMIT = 10;

    private final TaxCalculationRepository historyRepository;
    private final UserRepository userRepository;
    private final TaxService taxService;

    public TaxHistoryService(TaxCalculationRepository historyRepository, UserRepository userRepository,
                              TaxService taxService) {
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
        this.taxService = taxService;
    }

    @Transactional
    public TaxCalculationResponse saveCalculation(Long userId, SaveCalculationRequest request) {
        TaxCalculationResponse result = taxService.calculate(request);
        User userRef = userRepository.getReferenceById(userId);

        TaxCalculation entity = TaxCalculation.builder()
                .user(userRef)
                .label(request.getLabel() == null || request.getLabel().isBlank()
                        ? defaultLabel(request.getFinancialYear(), request.getRegime())
                        : request.getLabel().trim())
                .financialYear(request.getFinancialYear())
                .regime(request.getRegime())
                .annualGrossIncome(request.getAnnualGrossIncome())
                .basicSalary(request.getBasicSalary())
                .hraReceived(request.getHraReceived())
                .rentPaid(request.getRentPaid())
                .metroCity(request.getMetroCity())
                .deduction80C(request.getDeduction80C())
                .deduction80D(request.getDeduction80D())
                .deduction80CCD1B(request.getDeduction80CCD1B())
                .homeLoanInterest24B(request.getHomeLoanInterest24B())
                .otherDeductions(request.getOtherDeductions())
                .age(request.getAge())
                .standardDeduction(result.getStandardDeduction())
                .hraExemption(result.getHraExemption())
                .totalDeductions(result.getTotalDeductions())
                .taxableIncome(result.getTaxableIncome())
                .taxBeforeCess(result.getTaxBeforeCess())
                .surcharge(result.getSurcharge())
                .cess(result.getCess())
                .rebate87A(result.getRebate87A())
                .totalTaxLiability(result.getTotalTaxLiability())
                .netTakeHomeAnnual(result.getNetTakeHomeAnnual())
                .netTakeHomeMonthly(result.getNetTakeHomeMonthly())
                .comparisonRegimeTax(result.getComparisonRegimeTax())
                .build();

        TaxCalculation saved = historyRepository.save(entity);
        result.setId(saved.getId());
        result.setLabel(saved.getLabel());
        result.setCreatedAt(saved.getCreatedAt());
        return result;
    }

    public List<TaxHistorySummaryResponse> listHistory(Long userId) {
        return historyRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toSummary)
                .toList();
    }

    public TaxCalculationResponse getOne(Long userId, Long calculationId) {
        TaxCalculation entity = findOwned(userId, calculationId);
        TaxRegime comparisonRegime = entity.getRegime() == TaxRegime.NEW ? TaxRegime.OLD : TaxRegime.NEW;
        BigDecimal potentialSavings = entity.getComparisonRegimeTax() == null
                ? null
                : entity.getTotalTaxLiability().subtract(entity.getComparisonRegimeTax()).abs();
        TaxRegime betterRegime = entity.getComparisonRegimeTax() != null
                && entity.getComparisonRegimeTax().compareTo(entity.getTotalTaxLiability()) < 0
                ? comparisonRegime
                : entity.getRegime();

        return TaxCalculationResponse.builder()
                .id(entity.getId())
                .label(entity.getLabel())
                .financialYear(entity.getFinancialYear())
                .regime(entity.getRegime())
                .grossIncome(entity.getAnnualGrossIncome())
                .standardDeduction(entity.getStandardDeduction())
                .hraExemption(entity.getHraExemption())
                .totalDeductions(entity.getTotalDeductions())
                .taxableIncome(entity.getTaxableIncome())
                .taxBeforeCess(entity.getTaxBeforeCess())
                .rebate87A(entity.getRebate87A())
                .surcharge(entity.getSurcharge())
                .cess(entity.getCess())
                .totalTaxLiability(entity.getTotalTaxLiability())
                .netTakeHomeAnnual(entity.getNetTakeHomeAnnual())
                .netTakeHomeMonthly(entity.getNetTakeHomeMonthly())
                .comparisonRegimeTax(entity.getComparisonRegimeTax())
                .comparisonRegime(comparisonRegime)
                .betterRegime(betterRegime)
                .potentialSavings(potentialSavings)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    @Transactional
    public void delete(Long userId, Long calculationId) {
        findOwned(userId, calculationId);
        historyRepository.deleteByIdAndUserId(calculationId, userId);
    }

    public DashboardResponse getDashboard(Long userId) {
        List<TaxCalculation> all = historyRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (all.isEmpty()) {
            return DashboardResponse.builder()
                    .totalCalculations(0)
                    .averageTaxableIncome(BigDecimal.ZERO)
                    .averageTaxLiability(BigDecimal.ZERO)
                    .oldRegimeCount(0)
                    .newRegimeCount(0)
                    .recentCalculations(List.of())
                    .build();
        }

        long oldCount = all.stream().filter(c -> c.getRegime() == TaxRegime.OLD).count();
        long newCount = all.size() - oldCount;

        BigDecimal avgTaxable = average(all.stream().map(TaxCalculation::getTaxableIncome).toList());
        BigDecimal avgTax = average(all.stream().map(TaxCalculation::getTotalTaxLiability).toList());

        TaxCalculation latest = all.get(0);
        BigDecimal latestSavings = latest.getComparisonRegimeTax() == null
                ? BigDecimal.ZERO
                : latest.getTotalTaxLiability().subtract(latest.getComparisonRegimeTax()).abs();

        List<TaxHistorySummaryResponse> recent = all.stream().limit(RECENT_LIMIT).map(this::toSummary).toList();

        return DashboardResponse.builder()
                .totalCalculations(all.size())
                .latestCalculation(toSummary(latest))
                .averageTaxableIncome(avgTaxable)
                .averageTaxLiability(avgTax)
                .oldRegimeCount(oldCount)
                .newRegimeCount(newCount)
                .latestPotentialSavings(latestSavings)
                .recentCalculations(recent)
                .build();
    }

    private TaxCalculation findOwned(Long userId, Long calculationId) {
        TaxCalculation entity = historyRepository.findById(calculationId)
                .orElseThrow(() -> new ResourceNotFoundException("Calculation not found."));
        if (!entity.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Calculation not found.");
        }
        return entity;
    }

    private TaxHistorySummaryResponse toSummary(TaxCalculation c) {
        return TaxHistorySummaryResponse.builder()
                .id(c.getId())
                .label(c.getLabel())
                .financialYear(c.getFinancialYear())
                .regime(c.getRegime())
                .grossIncome(c.getAnnualGrossIncome())
                .taxableIncome(c.getTaxableIncome())
                .totalTaxLiability(c.getTotalTaxLiability())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private BigDecimal average(List<BigDecimal> values) {
        if (values.isEmpty()) return BigDecimal.ZERO;
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }

    private String defaultLabel(String financialYear, TaxRegime regime) {
        return "FY " + financialYear + " - " + (regime == TaxRegime.NEW ? "New Regime" : "Old Regime");
    }
}
