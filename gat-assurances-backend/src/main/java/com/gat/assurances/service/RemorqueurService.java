package com.gat.assurances.service;

import com.gat.assurances.dto.RemorqueurDto;
import com.gat.assurances.entity.Remorqueur;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.RemorqueurRepository;
import com.gat.assurances.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RemorqueurService {

    private final RemorqueurRepository remorqueurRepository;
    private final UserRepository userRepository;

    @Transactional
    public RemorqueurDto changerDisponibilite(boolean disponible, Authentication auth) {
        Remorqueur remorqueur = userRepository.findByEmail(auth.getName())
            .map(user -> remorqueurRepository.findByUserId(user.getId())
                .orElseGet(() -> remorqueurRepository.findByEmail(auth.getName()).orElse(null)))
            .orElseGet(() -> remorqueurRepository.findByEmail(auth.getName()).orElse(null));
        if (remorqueur == null) {
            throw new ResourceNotFoundException("Remorqueur introuvable");
        }
        remorqueur.setDisponibilite(disponible);
        return mapToDto(remorqueurRepository.save(remorqueur));
    }

    public List<RemorqueurDto> findAll() {
        return remorqueurRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public RemorqueurDto findById(Long id) {
        Remorqueur remorqueur = remorqueurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remorqueur", id));
        return mapToDto(remorqueur);
    }

    public RemorqueurDto create(RemorqueurDto dto) {
        Remorqueur remorqueur = mapToEntity(dto);
        remorqueur = remorqueurRepository.save(remorqueur);
        return mapToDto(remorqueur);
    }

    public RemorqueurDto update(Long id, RemorqueurDto dto) {
        Remorqueur remorqueur = remorqueurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Remorqueur", id));
        remorqueur.setNom(dto.getNom());
        remorqueur.setPrenom(dto.getPrenom());
        remorqueur.setEmail(dto.getEmail());
        remorqueur.setTelephone(dto.getTelephone());
        remorqueur.setDisponibilite(dto.getDisponibilite());
        remorqueur.setLocalisation(dto.getLocalisation());
        remorqueur.setCapacite(dto.getCapacite());
        remorqueur = remorqueurRepository.save(remorqueur);
        return mapToDto(remorqueur);
    }

    public void delete(Long id) {
        if (!remorqueurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Remorqueur", id);
        }
        remorqueurRepository.deleteById(id);
    }

    private RemorqueurDto mapToDto(Remorqueur remorqueur) {
        return RemorqueurDto.builder()
                .id(remorqueur.getId())
                .nom(remorqueur.getNom())
                .prenom(remorqueur.getPrenom())
                .email(remorqueur.getEmail())
                .telephone(remorqueur.getTelephone())
                .disponibilite(remorqueur.getDisponibilite())
                .localisation(remorqueur.getLocalisation())
                .capacite(remorqueur.getCapacite())
                .createdAt(remorqueur.getCreatedAt())
                .updatedAt(remorqueur.getUpdatedAt())
                .build();
    }

    private Remorqueur mapToEntity(RemorqueurDto dto) {
        return Remorqueur.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .telephone(dto.getTelephone())
                .disponibilite(dto.getDisponibilite() != null ? dto.getDisponibilite() : true)
                .localisation(dto.getLocalisation())
                .capacite(dto.getCapacite() != null ? dto.getCapacite() : 1)
                .build();
    }
}
