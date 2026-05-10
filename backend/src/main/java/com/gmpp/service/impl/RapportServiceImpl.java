package com.gmpp.service.impl;

import com.gmpp.dto.DashboardStatsDTO;
import com.gmpp.entity.Intervention;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.service.InterventionService;
import com.gmpp.service.RapportService;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RapportServiceImpl implements RapportService {

    private final InterventionService interventionService;
    private final InterventionRepository interventionRepository;

    public RapportServiceImpl(InterventionService interventionService,
                               InterventionRepository interventionRepository) {
        this.interventionService = interventionService;
        this.interventionRepository = interventionRepository;
    }

    @Override
    public DashboardStatsDTO getKPIs(LocalDate debut, LocalDate fin) {
        return interventionService.getStatistiques(debut, fin);
    }

    @Override
    public byte[] exportPDF(LocalDate debut, LocalDate fin) {
        try {
            DashboardStatsDTO stats = getKPIs(debut, fin);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
            com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.WHITE);
            com.itextpdf.text.Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);

            Paragraph title = new Paragraph("Rapport GMPP - Maintenance Préventive", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            Paragraph period = new Paragraph(
                    String.format("Période : %s au %s", debut.toString(), fin.toString()), cellFont);
            period.setAlignment(Element.ALIGN_CENTER);
            period.setSpacingAfter(20);
            document.add(period);

            document.add(new Paragraph("Indicateurs clés (KPIs)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(Chunk.NEWLINE);

            PdfPTable kpiTable = new PdfPTable(2);
            kpiTable.setWidthPercentage(100);
            addTableHeader(kpiTable, headerFont, "Indicateur", "Valeur");
            addTableRow(kpiTable, cellFont, "Taux de réalisation", String.format("%.1f%%", stats.getTauxRealisation()));
            addTableRow(kpiTable, cellFont, "Interventions planifiées", String.valueOf(stats.getNbInterventionsPlanifiees()));
            addTableRow(kpiTable, cellFont, "Interventions terminées", String.valueOf(stats.getNbInterventionsTerminees()));
            addTableRow(kpiTable, cellFont, "Interventions en retard", String.valueOf(stats.getNbInterventionsEnRetard()));
            addTableRow(kpiTable, cellFont, "Machines en service", String.valueOf(stats.getNbMachinesEnService()));
            addTableRow(kpiTable, cellFont, "Taux de disponibilité", String.format("%.1f%%", stats.getTauxDisponibilite()));
            addTableRow(kpiTable, cellFont, "Coût total maintenance", String.format("%.2f €", stats.getCoutTotalMaintenance()));
            addTableRow(kpiTable, cellFont, "Temps moyen intervention (min)", String.format("%.0f", stats.getTempsMoyenIntervention()));
            document.add(kpiTable);

            document.add(Chunk.NEWLINE);
            document.add(new Paragraph("Top machines par nombre d'interventions",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            document.add(Chunk.NEWLINE);

            if (stats.getTopMachines() != null && !stats.getTopMachines().isEmpty()) {
                PdfPTable topTable = new PdfPTable(2);
                topTable.setWidthPercentage(100);
                addTableHeader(topTable, headerFont, "Machine", "Nb interventions");
                for (DashboardStatsDTO.TopMachineDTO top : stats.getTopMachines()) {
                    addTableRow(topTable, cellFont, top.getMachineNom(), String.valueOf(top.getNbInterventions()));
                }
                document.add(topTable);
            }

            document.close();
            return baos.toByteArray();
        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }

    @Override
    public byte[] exportCSV(LocalDate debut, LocalDate fin) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

            writer.writeNext(new String[]{"ID", "Machine", "Point Maintenance", "Technicien",
                    "Date Planifiée", "Date Réelle", "Statut", "Durée (min)", "État Constaté", "Observations"});

            List<Intervention> interventions = getInterventionsBetween(debut, fin);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            for (Intervention i : interventions) {
                writer.writeNext(new String[]{
                        i.getId().toString(),
                        i.getMachine().getNom(),
                        i.getPointMaintenance() != null ? i.getPointMaintenance().getTypeOperation().name() : "",
                        i.getTechnicien() != null ? i.getTechnicien().getNom() + " " + i.getTechnicien().getPrenom() : "",
                        i.getDatePlanifiee() != null ? i.getDatePlanifiee().format(fmt) : "",
                        i.getDateReelle() != null ? i.getDateReelle().format(fmt) : "",
                        i.getStatut().name(),
                        i.getDureeMinutes() != null ? String.valueOf(i.getDureeMinutes()) : "",
                        i.getEtatConstate() != null ? i.getEtatConstate().name() : "",
                        i.getObservations() != null ? i.getObservations() : ""
                });
            }

            writer.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du CSV", e);
        }
    }

    @Override
    public byte[] exportExcel(LocalDate debut, LocalDate fin) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Interventions");
            
            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);

            // Create headers
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Machine", "Point Maintenance", "Technicien", "Date Planifiée", "Date Réelle", "Statut", "Durée (min)", "Observations"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            List<Intervention> interventions = getInterventionsBetween(debut, fin);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            int rowIdx = 1;
            for (Intervention i : interventions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(i.getId().toString());
                row.createCell(1).setCellValue(i.getMachine().getNom());
                row.createCell(2).setCellValue(i.getPointMaintenance() != null ? i.getPointMaintenance().getTypeOperation().name() : "");
                row.createCell(3).setCellValue(i.getTechnicien() != null ? i.getTechnicien().getNom() + " " + i.getTechnicien().getPrenom() : "");
                row.createCell(4).setCellValue(i.getDatePlanifiee() != null ? i.getDatePlanifiee().format(fmt) : "");
                row.createCell(5).setCellValue(i.getDateReelle() != null ? i.getDateReelle().format(fmt) : "");
                row.createCell(6).setCellValue(i.getStatut().name());
                row.createCell(7).setCellValue(i.getDureeMinutes() != null ? i.getDureeMinutes() : 0);
                row.createCell(8).setCellValue(i.getObservations() != null ? i.getObservations() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la génération de l'Excel", e);
        }
    }

    @Override
    public List<Map<String, Object>> getPerformanceTechniciens(LocalDate debut, LocalDate fin) {
        List<Intervention> list = getInterventionsBetween(debut, fin);
        
        // Group by technician
        Map<Utilisateur, List<Intervention>> byTech = list.stream()
                .filter(i -> i.getTechnicien() != null)
                .collect(Collectors.groupingBy(Intervention::getTechnicien));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Utilisateur, List<Intervention>> entry : byTech.entrySet()) {
            Utilisateur tech = entry.getKey();
            List<Intervention> techInterventions = entry.getValue();
            
            long total = techInterventions.size();
            long terminees = techInterventions.stream().filter(i -> i.getStatut() == StatutIntervention.TERMINEE).count();
            long enRetard = techInterventions.stream().filter(i -> i.getStatut() == StatutIntervention.EN_RETARD).count();
            double taux = total > 0 ? (double) terminees / total * 100 : 0;
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("technicienId", tech.getId());
            stats.put("technicienNom", tech.getPrenom() + " " + tech.getNom());
            stats.put("totalInterventions", total);
            stats.put("interventionsTerminees", terminees);
            stats.put("interventionsEnRetard", enRetard);
            stats.put("tauxCompletion", Math.round(taux * 10) / 10.0);
            result.add(stats);
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getConsommationConsommables(LocalDate debut, LocalDate fin) {
        List<Intervention> list = getInterventionsBetween(debut, fin);
        
        // Sum by consumable type
        Map<String, Double> consoMap = list.stream()
                .filter(i -> i.getStatut() == StatutIntervention.TERMINEE)
                .filter(i -> i.getPointMaintenance() != null && i.getPointMaintenance().getTypeConsommable() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getPointMaintenance().getTypeConsommable(),
                        Collectors.summingDouble(i -> i.getPointMaintenance().getQuantiteNecessaire())
                ));

        return consoMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("consommable", e.getKey());
                    map.put("quantite", e.getValue());
                    // Find unit (just use first found)
                    String unit = list.stream()
                            .filter(i -> i.getPointMaintenance() != null && e.getKey().equals(i.getPointMaintenance().getTypeConsommable()))
                            .map(i -> i.getPointMaintenance().getUnite())
                            .findFirst().orElse("");
                    map.put("unite", unit);
                    return map;
                })
                .collect(Collectors.toList());
    }

    private List<Intervention> getInterventionsBetween(LocalDate debut, LocalDate fin) {
        LocalDateTime debutDt = debut.atStartOfDay();
        LocalDateTime finDt = fin.atTime(23, 59, 59);
        return interventionRepository.findByDatePlanifieeBetween(debutDt, finDt);
    }

    private void addTableHeader(PdfPTable table, com.itextpdf.text.Font font, String... headers) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, font));
            cell.setBackgroundColor(new BaseColor(41, 128, 185));
            cell.setPadding(8);
            table.addCell(cell);
        }
    }

    private void addTableRow(PdfPTable table, com.itextpdf.text.Font font, String... values) {
        for (String v : values) {
            PdfPCell cell = new PdfPCell(new Phrase(v, font));
            cell.setPadding(6);
            table.addCell(cell);
        }
    }
}
