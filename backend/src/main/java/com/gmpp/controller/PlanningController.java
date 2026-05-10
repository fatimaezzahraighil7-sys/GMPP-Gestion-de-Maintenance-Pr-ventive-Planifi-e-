package com.gmpp.controller;

import com.gmpp.dto.InterventionResponse;
import com.gmpp.service.PlanningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/planning")
@Tag(name = "Planning", description = "Gestion du planning de maintenance")
public class PlanningController {

    private final PlanningService planningService;

    public PlanningController(PlanningService planningService) {
        this.planningService = planningService;
    }

    @PostMapping("/generer")
    @Operation(summary = "Générer les interventions planifiées", description = "Crée automatiquement les interventions pour les 7 prochains jours")
    public ResponseEntity<List<InterventionResponse>> generer() {
        return ResponseEntity.ok(planningService.genererInterventionsPlanifiees());
    }

    @GetMapping("/alertes")
    @Operation(summary = "Alertes d'interventions", description = "Retourne les interventions à J-7, J-3, J-1")
    public ResponseEntity<List<InterventionResponse>> getAlertes() {
        return ResponseEntity.ok(planningService.getAlertes());
    }

    @PostMapping("/{id}/assigner")
    @Operation(summary = "Assigner un technicien à une intervention")
    public ResponseEntity<InterventionResponse> assigner(@PathVariable UUID id,
                                                          @RequestBody Map<String, UUID> body) {
        return ResponseEntity.ok(planningService.assignerTechnicien(id, body.get("technicienId")));
    }

    @PostMapping("/{id}/assigner-auto")
    @Operation(summary = "Assigner automatiquement un technicien")
    public ResponseEntity<InterventionResponse> assignerAuto(@PathVariable UUID id) {
        return ResponseEntity.ok(planningService.assignerAutomatiquement(id));
    }

    @PutMapping("/{id}/reprogrammer")
    @Operation(summary = "Reprogrammer une intervention")
    public ResponseEntity<InterventionResponse> reprogrammer(@PathVariable UUID id,
                                                               @RequestBody Map<String, String> body) {
        LocalDateTime nouvelleDatePlanifiee = LocalDateTime.parse(body.get("nouvelleDatePlanifiee"));
        String justification = body.get("justification");
        return ResponseEntity.ok(planningService.reprogrammer(id, nouvelleDatePlanifiee, justification));
    }
}
