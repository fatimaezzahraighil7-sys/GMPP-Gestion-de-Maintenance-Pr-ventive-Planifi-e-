package com.gmpp.service;

import com.gmpp.dto.DashboardStatsDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface RapportService {
    DashboardStatsDTO getKPIs(LocalDate debut, LocalDate fin);
    byte[] exportPDF(LocalDate debut, LocalDate fin);
    byte[] exportCSV(LocalDate debut, LocalDate fin);
    byte[] exportExcel(LocalDate debut, LocalDate fin);
    
    // Nouveaux rapports
    List<Map<String, Object>> getPerformanceTechniciens(LocalDate debut, LocalDate fin);
    List<Map<String, Object>> getConsommationConsommables(LocalDate debut, LocalDate fin);
}
