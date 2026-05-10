package com.gmpp.service;

import com.gmpp.dto.UtilisateurRequest;
import com.gmpp.dto.UtilisateurResponse;
import com.gmpp.enums.Role;

import java.util.List;
import java.util.UUID;

public interface UtilisateurService {
    UtilisateurResponse create(UtilisateurRequest request);
    UtilisateurResponse getById(UUID id);
    List<UtilisateurResponse> getAll();
    List<UtilisateurResponse> getByRole(Role role);
    UtilisateurResponse update(UUID id, UtilisateurRequest request);
    void delete(UUID id);
    void changerMotDePasse(UUID id, String ancienMotDePasse, String nouveauMotDePasse);
    UtilisateurResponse activerDesactiver(UUID id);
    long getChargeTravail(UUID techId);
    List<UtilisateurResponse> getActiveTechniciens();
}
