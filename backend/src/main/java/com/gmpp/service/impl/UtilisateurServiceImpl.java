package com.gmpp.service.impl;

import com.gmpp.dto.UtilisateurRequest;
import com.gmpp.dto.UtilisateurResponse;
import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.Role;
import com.gmpp.enums.StatutIntervention;
import com.gmpp.exception.BusinessException;
import com.gmpp.exception.ResourceNotFoundException;
import com.gmpp.mapper.UtilisateurMapper;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.UtilisateurRepository;
import com.gmpp.service.UtilisateurService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final InterventionRepository interventionRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurServiceImpl(UtilisateurRepository utilisateurRepository,
                                   InterventionRepository interventionRepository,
                                   UtilisateurMapper utilisateurMapper,
                                   PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.interventionRepository = interventionRepository;
        this.utilisateurMapper = utilisateurMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UtilisateurResponse create(UtilisateurRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Un utilisateur avec l'email '" + request.getEmail() + "' existe déjà");
        }
        if (utilisateurRepository.existsByMatricule(request.getMatricule())) {
            throw new BusinessException("Un utilisateur avec le matricule '" + request.getMatricule() + "' existe déjà");
        }

        Utilisateur utilisateur = utilisateurMapper.toEntity(request);
        if (request.getMotDePasse() != null && !request.getMotDePasse().isEmpty()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        } else {
            utilisateur.setMotDePasse(passwordEncoder.encode("changeme123"));
        }
        utilisateur.setActif(true);

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return utilisateurMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UtilisateurResponse getById(UUID id) {
        return utilisateurMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilisateurResponse> getAll() {
        return utilisateurMapper.toResponseList(utilisateurRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilisateurResponse> getByRole(Role role) {
        return utilisateurMapper.toResponseList(utilisateurRepository.findByRole(role));
    }

    @Override
    public UtilisateurResponse update(UUID id, UtilisateurRequest request) {
        Utilisateur utilisateur = findById(id);

        utilisateurRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BusinessException("L'email '" + request.getEmail() + "' est déjà utilisé");
                    }
                });

        utilisateurRepository.findByMatricule(request.getMatricule())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BusinessException("Le matricule '" + request.getMatricule() + "' est déjà utilisé");
                    }
                });

        utilisateurMapper.updateEntity(request, utilisateur);
        Utilisateur updated = utilisateurRepository.save(utilisateur);
        return utilisateurMapper.toResponse(updated);
    }

    @Override
    public void delete(UUID id) {
        Utilisateur utilisateur = findById(id);
        utilisateurRepository.delete(utilisateur);
    }

    @Override
    public void changerMotDePasse(UUID id, String ancienMotDePasse, String nouveauMotDePasse) {
        Utilisateur utilisateur = findById(id);
        if (!passwordEncoder.matches(ancienMotDePasse, utilisateur.getMotDePasse())) {
            throw new BusinessException("L'ancien mot de passe est incorrect");
        }
        if (nouveauMotDePasse == null || nouveauMotDePasse.length() < 6) {
            throw new BusinessException("Le nouveau mot de passe doit contenir au moins 6 caractères");
        }
        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);
    }

    @Override
    public UtilisateurResponse activerDesactiver(UUID id) {
        Utilisateur utilisateur = findById(id);
        utilisateur.setActif(!utilisateur.getActif());
        Utilisateur updated = utilisateurRepository.save(utilisateur);
        return utilisateurMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public long getChargeTravail(UUID techId) {
        findById(techId);
        return interventionRepository.countByTechnicienIdAndStatut(techId, StatutIntervention.PLANIFIEE)
                + interventionRepository.countByTechnicienIdAndStatut(techId, StatutIntervention.EN_COURS);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilisateurResponse> getActiveTechniciens() {
        return utilisateurMapper.toResponseList(utilisateurRepository.findActiveTechniciens());
    }

    private Utilisateur findById(UUID id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", id));
    }
}
