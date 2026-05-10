package com.gmpp.controller;

import com.gmpp.dto.*;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.security.UserDetailsImpl;
import com.gmpp.service.InterventionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/interventions")
@Tag(name = "Interventions", description = "Gestion des interventions")
public class InterventionController {

    private final InterventionService interventionService;
    private final String PHOTO_DIR = "uploads/interventions";

    public InterventionController(InterventionService interventionService) {
        this.interventionService = interventionService;
    }

    /**
     * ADMIN, RESPONSABLE, CHEF_EQUIPE → voir toutes les interventions avec filtres
     * TECHNICIEN → redirigé vers /mes-interventions (voir section ci-dessous)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Lister les interventions avec filtres")
    public ResponseEntity<Page<InterventionResponse>> getAll(
            @RequestParam(required = false) UUID machineId,
            @RequestParam(required = false) StatutIntervention statut,
            @RequestParam(required = false) UUID technicienId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PageableDefault(size = 10) Pageable pageable) {

        // 🔐 Si TECHNICIEN : force le filtre sur son propre ID
        UUID filterTechId = technicienId;
        if (currentUser != null && "TECHNICIEN".equals(currentUser.getRole())) {
            filterTechId = currentUser.getId();
        }

        return ResponseEntity.ok(interventionService.getAll(machineId, statut, filterTechId, dateDebut, dateFin, pageable));
    }

    /**
     * Endpoint dédié TECHNICIEN : retourne uniquement ses propres interventions
     */
    @GetMapping("/mes-interventions")
    @PreAuthorize("hasAnyRole('TECHNICIEN', 'CHEF_EQUIPE')")
    @Operation(summary = "Mes interventions (technicien connecté)")
    public ResponseEntity<Page<InterventionResponse>> getMesInterventions(
            @RequestParam(required = false) StatutIntervention statut,
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(
            interventionService.getAll(null, statut, currentUser.getId(), null, null, pageable)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Détail d'une intervention")
    public ResponseEntity<InterventionResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(interventionService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE')")
    @Operation(summary = "Planifier une intervention")
    public ResponseEntity<InterventionResponse> planifier(@Valid @RequestBody InterventionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interventionService.planifier(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE')")
    @Operation(summary = "Modifier une intervention")
    public ResponseEntity<InterventionResponse> update(@PathVariable UUID id,
                                                        @Valid @RequestBody InterventionRequest request) {
        return ResponseEntity.ok(interventionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Supprimer une intervention")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        interventionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/demarrer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Démarrer une intervention")
    public ResponseEntity<InterventionResponse> demarrer(@PathVariable UUID id) {
        return ResponseEntity.ok(interventionService.demarrer(id));
    }

    @PostMapping("/{id}/terminer")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Terminer une intervention")
    public ResponseEntity<InterventionResponse> terminer(@PathVariable UUID id,
                                                          @Valid @RequestBody TerminerInterventionRequest request) {
        return ResponseEntity.ok(interventionService.terminer(id, request));
    }

    @PostMapping("/{id}/annuler")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE')")
    @Operation(summary = "Annuler une intervention (pas TECHNICIEN)")
    public ResponseEntity<InterventionResponse> annuler(@PathVariable UUID id,
                                                         @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(interventionService.annuler(id, body.get("justification")));
    }

    @GetMapping("/calendar")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE', 'TECHNICIEN')")
    @Operation(summary = "Interventions pour le calendrier")
    public ResponseEntity<List<InterventionCalendarDTO>> getCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return ResponseEntity.ok(interventionService.getCalendar(debut, fin));
    }

    @GetMapping("/retard")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE')")
    @Operation(summary = "Interventions en retard")
    public ResponseEntity<List<InterventionResponse>> getRetard() {
        return ResponseEntity.ok(interventionService.getInterventionsEnRetard());
    }

    @PostMapping("/{id}/photo")
    @PreAuthorize("hasAnyRole('TECHNICIEN', 'CHEF_EQUIPE', 'ADMIN')")
    @Operation(summary = "Uploader une photo pour une intervention")
    public ResponseEntity<String> uploadPhoto(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("Fichier vide");

        // Bug 5 fix: validation du type MIME côté serveur
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Seules les images sont acceptées (JPEG, PNG, GIF, WebP)");
        }

        try {
            Path root = Paths.get(PHOTO_DIR);
            if (!Files.exists(root)) Files.createDirectories(root);
            
            // Nettoyage du nom de fichier
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
            String sanitizedName = originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
            
            String fileName = id + "_" + System.currentTimeMillis() + "_" + sanitizedName;
            Path path = root.resolve(fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            
            String photoUrl = "/api/interventions/photo/" + fileName;
            interventionService.updatePhoto(id, photoUrl);
            
            return ResponseEntity.ok(photoUrl);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur upload: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Valider une intervention terminée (Responsable)")
    public ResponseEntity<InterventionResponse> valider(@PathVariable UUID id) {
        return ResponseEntity.ok(interventionService.validerIntervention(id));
    }

    @PatchMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE')")
    @Operation(summary = "Mettre à jour le statut d'une intervention (Kanban)")
    public ResponseEntity<InterventionResponse> updateStatut(@PathVariable UUID id,
                                                              @RequestBody Map<String, String> body) {
        StatutIntervention statut = StatutIntervention.valueOf(body.get("statut"));
        return ResponseEntity.ok(interventionService.updateStatut(id, statut));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasAnyRole('TECHNICIEN', 'CHEF_EQUIPE', 'ADMIN', 'RESPONSABLE_MAINTENANCE')")
    @Operation(summary = "Ajouter des images à une intervention")
    public ResponseEntity<?> addImages(@PathVariable UUID id, @RequestParam("files") MultipartFile[] files) {
        if (files.length == 0) return ResponseEntity.badRequest().body("Aucun fichier fourni");
        if (files.length > 10) return ResponseEntity.badRequest().body("Maximum 10 images par upload");

        List<String> urls = new java.util.ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String ct = file.getContentType();
            if (ct == null || !ct.startsWith("image/")) continue;
            if (file.getSize() > 5 * 1024 * 1024) continue;

            try {
                Path root = Paths.get(PHOTO_DIR);
                if (!Files.exists(root)) Files.createDirectories(root);
                
                // Nettoyage du nom de fichier (remplace espaces et caractères spéciaux)
                String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
                String sanitizedName = originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
                
                String fileName = id + "_" + System.currentTimeMillis() + "_" + sanitizedName;
                Path path = root.resolve(fileName);
                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                urls.add("/api/interventions/photo/" + fileName);
            } catch (IOException e) {
                // skip failed files
            }
        }

        if (urls.isEmpty()) return ResponseEntity.badRequest().body("Aucune image valide uploadée");

        return ResponseEntity.ok(interventionService.addImages(id, urls));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE')")
    @Operation(summary = "Supprimer une image d'une intervention")
    public ResponseEntity<Void> deleteImage(@PathVariable UUID id, @PathVariable UUID imageId) {
        interventionService.removeImage(id, imageId);
        return ResponseEntity.noContent().build();
    }
}
