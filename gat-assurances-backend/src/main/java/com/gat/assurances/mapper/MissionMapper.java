package com.gat.assurances.mapper;

import com.gat.assurances.dto.MissionDto;
import com.gat.assurances.entity.Mission;
import org.springframework.stereotype.Component;

@Component
public class MissionMapper {

    public MissionDto toDto(Mission m) {
        if (m == null) return null;
        MissionDto dto = new MissionDto();
        dto.setId(m.getId());
        dto.setStatut(m.getStatut());
        dto.setTypeMission(m.getTypeMission());
        dto.setDescription(m.getDescription());
        dto.setDevis(m.getDevis());
        dto.setMontantDevis(m.getMontantDevis());
        dto.setFacture(m.getFacture());
        dto.setMontantFacture(m.getMontantFacture());
        dto.setPhotos(m.getPhotos());
        dto.setAvancementGarage(m.getAvancementGarage());
        dto.setDateExpertisePrevue(m.getDateExpertisePrevue());
        dto.setMotifRefus(m.getMotifRefus());
        if (m.getSinistre() != null) {
            dto.setSinistreId(m.getSinistre().getId());
            dto.setSinistreReference(m.getSinistre().getReference());
        }
        if (m.getGarage() != null) {
            dto.setGarageId(m.getGarage().getId());
            dto.setGarageNom(m.getGarage().getNom());
        }
        if (m.getExpert() != null) {
            dto.setExpertId(m.getExpert().getId());
            dto.setExpertNom(m.getExpert().getNom() + " " + m.getExpert().getPrenom());
        }
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());
        return dto;
    }
}
