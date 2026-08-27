package com.gat.assurances.controller;

import com.gat.assurances.dto.GarageDto;
import com.gat.assurances.dto.GarageRecommandationDto;
import com.gat.assurances.entity.Garage;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.GarageRepository;
import com.gat.assurances.service.GarageRecommandationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Garages", description = "Gestion des garages partenaires")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/garages")
@RequiredArgsConstructor
public class GarageController {

    private final GarageRepository garageRepository;
    private final GarageRecommandationService recommandationService;

    @Operation(summary = "Liste de tous les garages")
    @GetMapping
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','MANAGER','ADMIN')")
    public ResponseEntity<List<Garage>> findAll() {
        return ResponseEntity.ok(garageRepository.findAll());
    }

    @Operation(summary = "Détail d'un garage")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT','GESTIONNAIRE','EXPERT','MANAGER','ADMIN')")
    public ResponseEntity<Garage> findById(@PathVariable Long id) {
        return ResponseEntity.ok(garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Garage", id)));
    }

    @Operation(summary = "Recommandations intelligentes par sinistre")
    @GetMapping("/recommandations")
    @PreAuthorize("hasAnyRole('CLIENT','GESTIONNAIRE','ADMIN')")
    public ResponseEntity<List<GarageRecommandationDto>> recommandations(
            @RequestParam Long sinistreId) {
        return ResponseEntity.ok(recommandationService.recommander(sinistreId));
    }

    @Operation(summary = "Garages disponibles avec slots libres")
    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<List<Garage>> disponibles() {
        return ResponseEntity.ok(garageRepository.findAvailableWithCoordinates());
    }

    @Operation(summary = "Garages conventionnés GAT")
    @GetMapping("/conventionnes")
    @PreAuthorize("hasAnyRole('CLIENT','GESTIONNAIRE','ADMIN')")
    public ResponseEntity<List<Garage>> conventionnes() {
        return ResponseEntity.ok(garageRepository.findConventionnesGat());
    }

    @Operation(summary = "Créer un garage (Admin)")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Garage> create(@RequestBody Garage garage) {
        return ResponseEntity.ok(garageRepository.save(garage));
    }

    @Operation(summary = "Modifier un garage (Admin)")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Garage> update(@PathVariable Long id, @RequestBody Garage body) {
        Garage garage = garageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Garage", id));
        garage.setNom(body.getNom());
        garage.setAdresse(body.getAdresse());
        garage.setTelephone(body.getTelephone());
        garage.setEmail(body.getEmail());
        garage.setSpecialites(body.getSpecialites());
        garage.setStatut(body.getStatut());
        garage.setCapaciteMax(body.getCapaciteMax());
        garage.setConventionGat(body.getConventionGat());
        garage.setLatitude(body.getLatitude());
        garage.setLongitude(body.getLongitude());
        return ResponseEntity.ok(garageRepository.save(garage));
    }

    @Operation(summary = "Supprimer un garage (Admin)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        garageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
