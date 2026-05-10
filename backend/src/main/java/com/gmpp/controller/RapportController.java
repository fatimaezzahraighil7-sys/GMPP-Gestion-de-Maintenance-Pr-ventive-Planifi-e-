package com.gmpp.controller;

import com.gmpp.dto.DashboardStatsDTO;
import com.gmpp.service.RapportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rapports")
@PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE')")
@Tag(name = "Rapports", description = "Rapports et KPIs (ADMIN, RESPONSABLE)")
public class RapportController {

    private final RapportService rapportService;

    public RapportController(RapportService rapportService) {
        this.rapportService = rapportService;
    }

    @GetMapping("/kpis")
    @Operation(summary = "Indicateurs clés (KPIs)")
    public ResponseEntity<DashboardStatsDTO> getKPIs(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(rapportService.getKPIs(dateDebut, dateFin));
    }

    @GetMapping("/performance-techniciens")
    @Operation(summary = "Rapport de performance des techniciens")
    public ResponseEntity<List<Map<String, Object>>> getPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(rapportService.getPerformanceTechniciens(dateDebut, dateFin));
    }

    @GetMapping("/consommation-consommables")
    @Operation(summary = "Rapport de consommation des consommables")
    public ResponseEntity<List<Map<String, Object>>> getConsommation(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(rapportService.getConsommationConsommables(dateDebut, dateFin));
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "Exporter le rapport en PDF")
    public ResponseEntity<byte[]> exportPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        byte[] pdfBytes = rapportService.exportPDF(dateDebut, dateFin);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport_gmpp.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/export/excel")
    @Operation(summary = "Exporter le rapport en Excel (XLSX)")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        byte[] xlsxBytes = rapportService.exportExcel(dateDebut, dateFin);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport_gmpp.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(xlsxBytes);
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Exporter le rapport en CSV")
    public ResponseEntity<byte[]> exportCSV(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        byte[] csvBytes = rapportService.exportCSV(dateDebut, dateFin);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport_gmpp.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
