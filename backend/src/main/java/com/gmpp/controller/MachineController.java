package com.gmpp.controller;

import com.gmpp.dto.InterventionResponse;
import com.gmpp.dto.MachineRequest;
import com.gmpp.dto.MachineResponse;
import com.gmpp.dto.MachineStatsResponse;
import com.gmpp.enums.StatutMachine;
import com.gmpp.enums.TypeMachine;
import com.gmpp.service.MachineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/machines")
@Tag(name = "Machines", description = "Gestion des machines")
public class MachineController {

    private final MachineService machineService;

    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Lister les machines")
    public ResponseEntity<Page<MachineResponse>> getAll(
            @RequestParam(required = false) StatutMachine statut,
            @RequestParam(required = false) TypeMachine type,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(machineService.getAll(statut, type, search, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Détail d'une machine")
    public ResponseEntity<MachineResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(machineService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Créer une machine")
    public ResponseEntity<MachineResponse> create(@Valid @RequestBody MachineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(machineService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Modifier une machine")
    public ResponseEntity<MachineResponse> update(@PathVariable UUID id, @Valid @RequestBody MachineRequest request) {
        return ResponseEntity.ok(machineService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une machine (ADMIN uniquement)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        machineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/interventions")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Historique des interventions d'une machine")
    public ResponseEntity<List<InterventionResponse>> getHistorique(@PathVariable UUID id) {
        return ResponseEntity.ok(machineService.getHistoriqueInterventions(id));
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Changer le statut d'une machine")
    public ResponseEntity<MachineResponse> updateStatut(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        StatutMachine statut = StatutMachine.valueOf(body.get("statut"));
        return ResponseEntity.ok(machineService.updateStatut(id, statut));
    }

    @PatchMapping("/{id}/compteur")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'TECHNICIEN')")
    @Operation(summary = "Mettre à jour le compteur horaire")
    public ResponseEntity<MachineResponse> updateCompteur(
            @PathVariable UUID id, @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(machineService.updateCompteurHoraire(id, body.get("compteurHoraire")));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Statistiques des machines")
    public ResponseEntity<MachineStatsResponse> getStats() {
        return ResponseEntity.ok(machineService.getMachinesStats());
    }
}
