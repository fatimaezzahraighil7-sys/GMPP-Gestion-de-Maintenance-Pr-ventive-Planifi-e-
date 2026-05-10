package com.gmpp.controller;

import com.gmpp.dto.InterventionCalendarDTO;
import com.gmpp.dto.UtilisateurResponse;
import com.gmpp.service.InterventionService;
import com.gmpp.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/techniciens")
@Tag(name = "Techniciens", description = "Gestion des techniciens")
public class TechnicienController {

    private final UtilisateurService utilisateurService;
    private final InterventionService interventionService;

    public TechnicienController(UtilisateurService utilisateurService,
                                 InterventionService interventionService) {
        this.utilisateurService = utilisateurService;
        this.interventionService = interventionService;
    }

    @GetMapping
    @Operation(summary = "Liste des techniciens actifs")
    public ResponseEntity<List<UtilisateurResponse>> getAll() {
        return ResponseEntity.ok(utilisateurService.getActiveTechniciens());
    }

    @GetMapping("/{id}/planning")
    @Operation(summary = "Planning d'un technicien")
    public ResponseEntity<List<InterventionCalendarDTO>> getPlanning(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(interventionService.getTechnicienPlanning(id, debut, fin));
    }

    @GetMapping("/{id}/charge")
    @Operation(summary = "Charge de travail d'un technicien")
    public ResponseEntity<Map<String, Long>> getCharge(@PathVariable UUID id) {
        long charge = utilisateurService.getChargeTravail(id);
        return ResponseEntity.ok(Map.of("charge", charge));
    }
}
