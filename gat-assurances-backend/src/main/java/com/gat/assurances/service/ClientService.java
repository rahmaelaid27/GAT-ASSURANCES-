package com.gat.assurances.service;

import com.gat.assurances.dto.ClientDto;
import com.gat.assurances.entity.Client;
import com.gat.assurances.entity.User;
import com.gat.assurances.entity.enums.Role;
import com.gat.assurances.exception.BusinessException;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.ClientRepository;
import com.gat.assurances.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public List<ClientDto> findAll() {
        return clientRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ClientDto findById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id));
        return mapToDto(client);
    }

    @Transactional
    public ClientDto create(ClientDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Cet email est déjà utilisé");
        }
        if (clientRepository.existsByNumeroPolice(dto.getNumeroPolice())) {
            throw new BusinessException("Ce numéro de police est déjà utilisé");
        }

        User user = User.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "default123"))
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .telephone(dto.getTelephone())
                .cin(dto.getCin())
                .role(Role.CLIENT)
                .enabled(true)
                .build();
        userRepository.save(user);

        Client client = Client.builder()
                .user(user)
                .adresse(dto.getAdresse())
                .ville(dto.getVille())
                .codePostal(dto.getCodePostal())
                .numeroPolice(dto.getNumeroPolice())
                .build();
        clientRepository.save(client);

        auditService.log("CREATION_CLIENT", "Création du client " + user.getEmail(),
                "clients", client.getId(), null, null, "SUCCES");

        return mapToDto(client);
    }

    @Transactional
    public ClientDto update(Long id, ClientDto dto) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id));

        User user = client.getUser();
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setTelephone(dto.getTelephone());
        user.setCin(dto.getCin());
        userRepository.save(user);

        client.setAdresse(dto.getAdresse());
        client.setVille(dto.getVille());
        client.setCodePostal(dto.getCodePostal());
        clientRepository.save(client);

        return mapToDto(client);
    }

    public List<ClientDto> search(String search) {
        return clientRepository.search(search).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ClientDto mapToDto(Client client) {
        return ClientDto.builder()
                .id(client.getId())
                .email(client.getUser().getEmail())
                .nom(client.getUser().getNom())
                .prenom(client.getUser().getPrenom())
                .telephone(client.getUser().getTelephone())
                .adresse(client.getAdresse())
                .ville(client.getVille())
                .codePostal(client.getCodePostal())
                .numeroPolice(client.getNumeroPolice())
                .cin(client.getUser().getCin())
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .build();
    }
}

