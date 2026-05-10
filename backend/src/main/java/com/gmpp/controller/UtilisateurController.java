package com.gmpp.controller;

import com.gmpp.dto.UtilisateurRequest;
import com.gmpp.dto.UtilisateurResponse;
import com.gmpp.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/utilisateurs")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Utilisateurs", description = "Gestion des utilisateurs (ADMIN uniquement)")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @GetMapping
    @Operation(summary = "Lister tous les utilisateurs")
    public ResponseEntity<List<UtilisateurResponse>> getAll() {
        return ResponseEntity.ok(utilisateurService.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un utilisateur")
    public ResponseEntity<UtilisateurResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(utilisateurService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un utilisateur")
    public ResponseEntity<UtilisateurResponse> create(@Valid @RequestBody UtilisateurRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un utilisateur")
    public ResponseEntity<UtilisateurResponse> update(@PathVariable UUID id,
                                                       @Valid @RequestBody UtilisateurRequest request) {
        return ResponseEntity.ok(utilisateurService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un utilisateur")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        utilisateurService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activer")
    @Operation(summary = "Activer/désactiver un utilisateur")
    public ResponseEntity<UtilisateurResponse> activerDesactiver(@PathVariable UUID id) {
        return ResponseEntity.ok(utilisateurService.activerDesactiver(id));
    }

    @PostMapping("/{id}/changer-mot-de-passe")
    @Operation(summary = "Changer le mot de passe d'un utilisateur")
    public ResponseEntity<Void> changerMotDePasse(@PathVariable UUID id,
                                                    @RequestBody Map<String, String> body) {
        utilisateurService.changerMotDePasse(id, body.get("ancienMotDePasse"), body.get("nouveauMotDePasse"));
        return ResponseEntity.ok().build();
    }
}
