package com.gmpp.dto;

import com.gmpp.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurResponse {
    private UUID id;
    private String nom;
    private String prenom;
    private String matricule;
    private String email;
    private Role role;
    private List<String> specialites;
    private List<String> certifications;
    private Boolean actif;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
