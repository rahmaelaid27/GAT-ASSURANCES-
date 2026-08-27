package com.gat.assurances.controller;

import com.gat.assurances.dto.VehiculeDto;
import com.gat.assurances.service.VehiculeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicules")
@RequiredArgsConstructor
@Tag(name = "Véhicules", description = "Gestion des véhicules assurés")
public class VehiculeController {

    private final VehiculeService vehiculeService;

    @GetMapping
    @Operation(summary = "Liste des véhicules")
    public ResponseEntity<List<VehiculeDto>> findAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(vehiculeService.search(search));
        }
        return ResponseEntity.ok(vehiculeService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détails d'un véhicule")
    public ResponseEntity<VehiculeDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vehiculeService.findById(id));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Véhicules d'un client")
    public ResponseEntity<List<VehiculeDto>> findByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(vehiculeService.findByClient(clientId));
    }

    @GetMapping("/mes-vehicules")
    @Operation(summary = "Mes véhicules (client connecté)")
    public ResponseEntity<List<VehiculeDto>> mesVehicules(Authentication authentication) {
        return ResponseEntity.ok(vehiculeService.findMesVehicules(authentication));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau véhicule")
    public ResponseEntity<VehiculeDto> create(@Valid @RequestBody VehiculeDto dto, Authentication authentication) {
        return ResponseEntity.ok(vehiculeService.create(dto, authentication));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un véhicule")
    public ResponseEntity<VehiculeDto> update(@PathVariable Long id, @Valid @RequestBody VehiculeDto dto) {
        return ResponseEntity.ok(vehiculeService.update(id, dto));
    }
}
