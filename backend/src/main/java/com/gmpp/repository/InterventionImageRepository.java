package com.gmpp.repository;

import com.gmpp.entity.InterventionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterventionImageRepository extends JpaRepository<InterventionImage, UUID> {
    List<InterventionImage> findByInterventionId(UUID interventionId);
    void deleteByInterventionId(UUID interventionId);
}
