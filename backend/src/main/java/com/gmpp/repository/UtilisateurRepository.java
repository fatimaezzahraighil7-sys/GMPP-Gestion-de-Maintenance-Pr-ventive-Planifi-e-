package com.gmpp.repository;

import com.gmpp.entity.Utilisateur;
import com.gmpp.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, UUID> {

    Optional<Utilisateur> findByEmail(String email);

    List<Utilisateur> findByRole(Role role);

    Optional<Utilisateur> findByMatricule(String matricule);

    List<Utilisateur> findByActif(Boolean actif);

    @Query("SELECT u FROM Utilisateur u JOIN u.specialites s WHERE s = :specialite AND u.role = 'TECHNICIEN' AND u.actif = true")
    List<Utilisateur> findTechniciensBySpecialite(@Param("specialite") String specialite);

    @Query("SELECT u FROM Utilisateur u WHERE u.role = 'TECHNICIEN' AND u.actif = true")
    List<Utilisateur> findActiveTechniciens();

    boolean existsByEmail(String email);

    boolean existsByMatricule(String matricule);
}
