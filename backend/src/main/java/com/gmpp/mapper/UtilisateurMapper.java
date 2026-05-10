package com.gmpp.mapper;

import com.gmpp.dto.UtilisateurRequest;
import com.gmpp.dto.UtilisateurResponse;
import com.gmpp.entity.Utilisateur;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UtilisateurMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "motDePasse", ignore = true)
    @Mapping(target = "actif", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    Utilisateur toEntity(UtilisateurRequest request);

    UtilisateurResponse toResponse(Utilisateur utilisateur);

    List<UtilisateurResponse> toResponseList(List<Utilisateur> utilisateurs);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "motDePasse", ignore = true)
    @Mapping(target = "actif", ignore = true)
    @Mapping(target = "interventions", ignore = true)
    void updateEntity(UtilisateurRequest request, @MappingTarget Utilisateur entity);
}
