package com.gat.assurances.service;

import com.gat.assurances.dto.GarageDto;
import com.gat.assurances.entity.Garage;
import com.gat.assurances.entity.enums.StatutGarage;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.GarageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GarageService {

    private final GarageRepository garageRepository;

    public List<GarageDto> findAll() {
        return garageRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public GarageDto findById(Long id) {
        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Garage", id));
        return mapToDto(garage);
    }

    public GarageDto create(GarageDto dto) {
        Garage garage = mapToEntity(dto);
        garage = garageRepository.save(garage);
        return mapToDto(garage);
    }

    public GarageDto update(Long id, GarageDto dto) {
        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Garage", id));
        garage.setNom(dto.getNom());
        garage.setAdresse(dto.getAdresse());
        garage.setVille(dto.getVille());
        garage.setCodePostal(dto.getCodePostal());
        garage.setTelephone(dto.getTelephone());
        garage.setEmail(dto.getEmail());
        garage.setCapaciteMax(dto.getCapaciteMax());
        garage.setCapaciteActuelle(dto.getCapaciteActuelle());
        garage.setSpecialites(dto.getSpecialites());
        garage.setStatut(dto.getStatut());
        garage.setNote(dto.getNote());
        garage = garageRepository.save(garage);
        return mapToDto(garage);
    }

    public void delete(Long id) {
        if (!garageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Garage", id);
        }
        garageRepository.deleteById(id);
    }

    private GarageDto mapToDto(Garage garage) {
        return GarageDto.builder()
                .id(garage.getId())
                .nom(garage.getNom())
                .adresse(garage.getAdresse())
                .ville(garage.getVille())
                .codePostal(garage.getCodePostal())
                .telephone(garage.getTelephone())
                .email(garage.getEmail())
                .capaciteMax(garage.getCapaciteMax())
                .capaciteActuelle(garage.getCapaciteActuelle())
                .specialites(garage.getSpecialites())
                .statut(garage.getStatut())
                .note(garage.getNote())
                .createdAt(garage.getCreatedAt())
                .updatedAt(garage.getUpdatedAt())
                .build();
    }

    private Garage mapToEntity(GarageDto dto) {
        return Garage.builder()
                .nom(dto.getNom())
                .adresse(dto.getAdresse())
                .ville(dto.getVille())
                .codePostal(dto.getCodePostal())
                .telephone(dto.getTelephone())
                .email(dto.getEmail())
                .capaciteMax(dto.getCapaciteMax())
                .capaciteActuelle(dto.getCapaciteActuelle() != null ? dto.getCapaciteActuelle() : 0)
                .specialites(dto.getSpecialites())
                .statut(dto.getStatut() != null ? dto.getStatut() : StatutGarage.ACTIF)
                .note(dto.getNote() != null ? dto.getNote() : 0.0)
                .build();
    }
}
