package com.tax.controller;

import com.tax.dto.ApiResponse;
import com.tax.dto.tax.*;
import com.tax.security.UserPrincipal;
import com.tax.service.TaxHistoryService;
import com.tax.service.TaxService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax")
public class TaxController {

    private final TaxService taxService;
    private final TaxHistoryService historyService;

    public TaxController(TaxService taxService, TaxHistoryService historyService) {
        this.taxService = taxService;
        this.historyService = historyService;
    }

    // ---- Public: quick calculate (no login required, nothing saved) ----

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<TaxCalculationResponse>> calculate(@Valid @RequestBody TaxCalculationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taxService.calculate(request)));
    }

    @GetMapping("/financial-years")
    public ResponseEntity<ApiResponse<List<String>>> supportedYears() {
        return ResponseEntity.ok(ApiResponse.success(taxService.getSupportedFinancialYears()));
    }

    @GetMapping("/slabs/{financialYear}")
    public ResponseEntity<ApiResponse<SlabInfoResponse>> slabs(@PathVariable String financialYear) {
        return ResponseEntity.ok(ApiResponse.success(taxService.getSlabInfo(financialYear)));
    }

    // ---- Authenticated: saved calculation history ----

    @PostMapping("/history")
    public ResponseEntity<ApiResponse<TaxCalculationResponse>> save(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SaveCalculationRequest request
    ) {
        TaxCalculationResponse saved = historyService.saveCalculation(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Calculation saved.", saved));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<TaxHistorySummaryResponse>>> history(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(historyService.listHistory(principal.getId())));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<TaxCalculationResponse>> getOne(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(historyService.getOne(principal.getId(), id)));
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id
    ) {
        historyService.delete(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Calculation deleted.", null));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(historyService.getDashboard(principal.getId())));
    }
}
