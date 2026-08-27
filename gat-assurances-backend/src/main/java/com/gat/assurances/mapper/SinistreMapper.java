package com.gat.assurances.mapper;

import com.gat.assurances.dto.SinistreDto;
import com.gat.assurances.entity.Sinistre;
import org.springframework.stereotype.Component;

@Component
public class SinistreMapper {

    public SinistreDto toDto(Sinistre s) {
        if (s == null) return null;
        SinistreDto dto = new SinistreDto();
        dto.setId(s.getId());
        dto.setReference(s.getReference());
        dto.setStatut(s.getStatut());
        dto.setTypeSinistre(s.getTypeSinistre());
        dto.setDescription(s.getDescription());
        dto.setDateSinistre(s.getDateDeclaration() != null ? s.getDateDeclaration()
                : s.getDateSinistre());
        dto.setGouvernorat(s.getGouvernorat());
        dto.setLocalite(s.getLocalite());
        dto.setCoordonneesGps(s.getCoordonneesGps());
        dto.setPhotos(s.getPhotos());
        dto.setDocuments(s.getDocuments());
        dto.setMotifRejet(s.getMotifRejet());
        if (s.getClient() != null) {
            dto.setClientId(s.getClient().getId());
            dto.setClientNom(s.getClient().getUser() != null
                    ? s.getClient().getUser().getNom() + " " + s.getClient().getUser().getPrenom() : "");
        }
        if (s.getVehicule() != null) {
            dto.setVehiculeId(s.getVehicule().getId());
            dto.setVehiculeImmatriculation(s.getVehicule().getImmatriculation());
        }
        if (s.getGarage() != null) {
            dto.setGarageId(s.getGarage().getId());
            dto.setGarageNom(s.getGarage().getNom());
        }
        if (s.getExpert() != null) {
            dto.setExpertId(s.getExpert().getId());
            dto.setExpertNom(s.getExpert().getNom() + " " + s.getExpert().getPrenom());
        }
        if (s.getGestionnaire() != null) {
            dto.setGestionnaireId(s.getGestionnaire().getId());
        }
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }
}
