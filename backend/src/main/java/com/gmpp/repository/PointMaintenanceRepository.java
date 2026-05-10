package com.gmpp.repository;

import com.gmpp.entity.PointMaintenance;
import com.gmpp.enums.Frequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PointMaintenanceRepository extends JpaRepository<PointMaintenance, UUID> {

    List<PointMaintenance> findByMachineId(UUID machineId);

    List<PointMaintenance> findByFrequence(Frequence frequence);

    List<PointMaintenance> findByProchaineInterventionBefore(LocalDate date);

    @Query("SELECT p FROM PointMaintenance p WHERE p.prochaineIntervention IS NOT NULL AND p.prochaineIntervention < :today")
    List<PointMaintenance> findPointsEnRetard(@Param("today") LocalDate today);

    @Query("SELECT p FROM PointMaintenance p WHERE p.prochaineIntervention IS NOT NULL AND p.prochaineIntervention BETWEEN :debut AND :fin")
    List<PointMaintenance> findByProchaineInterventionBetween(@Param("debut") LocalDate debut, @Param("fin") LocalDate fin);
}
