package com.gmpp.controller;

import com.gmpp.dto.PointMaintenanceRequest;
import com.gmpp.dto.PointMaintenanceResponse;
import com.gmpp.enums.Frequence;
import com.gmpp.service.PointMaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/points-maintenance")
@Tag(name = "Points de Maintenance", description = "Gestion des points de maintenance")
public class PointMaintenanceController {

    private final PointMaintenanceService pointMaintenanceService;

    public PointMaintenanceController(PointMaintenanceService pointMaintenanceService) {
        this.pointMaintenanceService = pointMaintenanceService;
    }

    @GetMapping
    @Operation(summary = "Lister les points de maintenance")
    public ResponseEntity<List<PointMaintenanceResponse>> getAll(
            @RequestParam(required = false) UUID machineId,
            @RequestParam(required = false) Frequence frequence) {
        if (machineId != null) {
            return ResponseEntity.ok(pointMaintenanceService.getByMachineId(machineId));
        }
        if (frequence != null) {
            return ResponseEntity.ok(pointMaintenanceService.getByFrequence(frequence));
        }
        return ResponseEntity.ok(pointMaintenanceService.getByMachineId(null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un point de maintenance")
    public ResponseEntity<PointMaintenanceResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(pointMaintenanceService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un point de maintenance")
    public ResponseEntity<PointMaintenanceResponse> create(@Valid @RequestBody PointMaintenanceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pointMaintenanceService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un point de maintenance")
    public ResponseEntity<PointMaintenanceResponse> update(@PathVariable UUID id,
                                                            @Valid @RequestBody PointMaintenanceRequest request) {
        return ResponseEntity.ok(pointMaintenanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un point de maintenance")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        pointMaintenanceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/retard")
    @Operation(summary = "Points de maintenance en retard")
    public ResponseEntity<List<PointMaintenanceResponse>> getPointsEnRetard() {
        return ResponseEntity.ok(pointMaintenanceService.getPointsEnRetard());
    }
}
