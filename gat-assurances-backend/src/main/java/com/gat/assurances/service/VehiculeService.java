package com.gat.assurances.service;

import com.gat.assurances.dto.VehiculeDto;
import com.gat.assurances.entity.Client;
import com.gat.assurances.entity.User;
import com.gat.assurances.entity.Vehicule;
import com.gat.assurances.entity.enums.Role;
import com.gat.assurances.exception.BusinessException;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.ClientRepository;
import com.gat.assurances.repository.VehiculeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final ClientRepository clientRepository;

    public List<VehiculeDto> findAll() {
        return vehiculeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public VehiculeDto findById(Long id) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", id));
        return mapToDto(vehicule);
    }

    public List<VehiculeDto> search(String search) {
        return vehiculeRepository.findByImmatriculationLike("%" + search + "%")
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VehiculeDto> findByClient(Long clientId) {
        return vehiculeRepository.findByClientId(clientId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<VehiculeDto> findMesVehicules(Authentication auth) {
        User user = (User) auth.getPrincipal();
        Client client = clientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Aucun profil client trouvé pour cet utilisateur."));
        return vehiculeRepository.findByClientId(client.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehiculeDto create(VehiculeDto dto, Authentication auth) {
        Client client;

        User user = (User) auth.getPrincipal();

        if (user.getRole() == Role.CLIENT) {
            client = clientRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new BusinessException("Aucun profil client trouvé pour cet utilisateur. Veuillez contacter l'administration."));
        } else {
            if (dto.getClientId() == null) {
                throw new BusinessException("L'ID du client est requis");
            }
            client = clientRepository.findById(dto.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client", dto.getClientId()));
        }

        if (vehiculeRepository.existsByImmatriculation(dto.getImmatriculation())) {
            throw new BusinessException("Un véhicule avec cette immatriculation existe déjà");
        }

        Vehicule vehicule = Vehicule.builder()
                .marque(dto.getMarque())
                .modele(dto.getModele())
                .annee(dto.getAnnee())
                .immatriculation(dto.getImmatriculation())
                .couleur(dto.getCouleur() != null ? dto.getCouleur() : "")
                .typeVehicule(dto.getTypeVehicule())
                .client(client)
                .build();

        vehiculeRepository.save(vehicule);
        return mapToDto(vehicule);
    }

    @Transactional
    public VehiculeDto update(Long id, VehiculeDto dto) {
        Vehicule vehicule = vehiculeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Véhicule", id));

        vehicule.setMarque(dto.getMarque());
        vehicule.setModele(dto.getModele());
        vehicule.setAnnee(dto.getAnnee());
        vehicule.setCouleur(dto.getCouleur() != null ? dto.getCouleur() : "");
        vehicule.setTypeVehicule(dto.getTypeVehicule());

        vehiculeRepository.save(vehicule);
        return mapToDto(vehicule);
    }

    private VehiculeDto mapToDto(Vehicule vehicule) {
        return VehiculeDto.builder()
                .id(vehicule.getId())
                .marque(vehicule.getMarque())
                .modele(vehicule.getModele())
                .annee(vehicule.getAnnee())
                .immatriculation(vehicule.getImmatriculation())
                .couleur(vehicule.getCouleur())
                .typeVehicule(vehicule.getTypeVehicule())
                .clientId(vehicule.getClient().getId())
                .clientNom(vehicule.getClient().getUser().getNom() + " " + vehicule.getClient().getUser().getPrenom())
                .createdAt(vehicule.getCreatedAt())
                .updatedAt(vehicule.getUpdatedAt())
                .build();
    }
}

