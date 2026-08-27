package com.gat.assurances.service;

import com.gat.assurances.dto.ExpertDto;
import com.gat.assurances.entity.Expert;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.ExpertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpertService {

    private final ExpertRepository expertRepository;

    public List<ExpertDto> findAll() {
        return expertRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ExpertDto findById(Long id) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expert", id));
        return mapToDto(expert);
    }

    @Transactional
    public ExpertDto create(ExpertDto dto) {
        Expert expert = Expert.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .telephone(dto.getTelephone())
                .specialite(dto.getSpecialite() != null ? dto.getSpecialite() : "Généraliste")
                .zoneIntervention(dto.getZoneIntervention())
                .disponibilite(dto.getDisponibilite() != null ? dto.getDisponibilite() : true)
                .note(dto.getNote() != null ? dto.getNote() : 0.0)
                .missionsActives(0)
                .build();
        expert = expertRepository.save(expert);
        return mapToDto(expert);
    }

    @Transactional
    public ExpertDto update(Long id, ExpertDto dto) {
        Expert expert = expertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expert", id));
        expert.setNom(dto.getNom());
        expert.setPrenom(dto.getPrenom());
        expert.setEmail(dto.getEmail());
        expert.setTelephone(dto.getTelephone());
        if (dto.getSpecialite() != null) expert.setSpecialite(dto.getSpecialite());
        if (dto.getZoneIntervention() != null) expert.setZoneIntervention(dto.getZoneIntervention());
        if (dto.getDisponibilite() != null) expert.setDisponibilite(dto.getDisponibilite());
        expert = expertRepository.save(expert);
        return mapToDto(expert);
    }

    public void delete(Long id) {
        if (!expertRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expert", id);
        }
        expertRepository.deleteById(id);
    }

    private ExpertDto mapToDto(Expert expert) {
        return ExpertDto.builder()
                .id(expert.getId())
                .nom(expert.getNom())
                .prenom(expert.getPrenom())
                .email(expert.getEmail())
                .telephone(expert.getTelephone())
                .specialite(expert.getSpecialite())
                .zoneIntervention(expert.getZoneIntervention())
                .disponibilite(expert.getDisponibilite())
                .missionsActives(expert.getMissionsActives())
                .note(expert.getNote())
                .createdAt(expert.getCreatedAt())
                .updatedAt(expert.getUpdatedAt())
                .build();
    }
}
