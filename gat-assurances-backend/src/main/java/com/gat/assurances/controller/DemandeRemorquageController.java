package com.gat.assurances.controller;

import com.gat.assurances.dto.DemandeRemorquageDto;
import com.gat.assurances.entity.DemandeRemorquage;
import com.gat.assurances.entity.enums.StatutRemorquage;
import com.gat.assurances.service.DemandeRemorquageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Remorquage", description = "Gestion des demandes de remorquage")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/remorquages")
@RequiredArgsConstructor
public class DemandeRemorquageController {

    private final DemandeRemorquageService remorquageService;

    @Operation(summary = "Créer une demande de remorquage")
    @PostMapping
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<DemandeRemorquage> creer(@RequestBody Map<String, String> body,
                                                    Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                remorquageService.creer(
                        Long.parseLong(body.get("sinistreId")),
                        body.get("localisationDepart"),
                        body.get("coordonneesDepart"),
                        body.get("localisationDestination"),
                        body.get("coordonneesDestination"),
                        auth));
    }

    @Operation(summary = "Demandes en attente (visibles par les remorqueurs)")
    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('REMORQUEUR','ADMIN')")
    public ResponseEntity<List<DemandeRemorquage>> pendantes() {
        return ResponseEntity.ok(remorquageService.findPending());
    }

    @Operation(summary = "Mes missions de remorquage (remorqueur connecté)")
    @GetMapping("/mes-missions")
    @PreAuthorize("hasAnyRole('REMORQUEUR','ADMIN')")
    public ResponseEntity<List<DemandeRemorquage>> mesMissions(Authentication auth) {
        return ResponseEntity.ok(remorquageService.findByRemorqueur(auth));
    }

    @Operation(summary = "Accepter une demande de remorquage")
    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasRole('REMORQUEUR')")
    public ResponseEntity<DemandeRemorquage> accepter(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(remorquageService.accepter(id, auth));
    }

    @Operation(summary = "Avancer le statut d'une mission de remorquage")
    @PutMapping("/{id}/avancer")
    @PreAuthorize("hasAnyRole('REMORQUEUR','ADMIN')")
    public ResponseEntity<DemandeRemorquage> avancer(@PathVariable Long id,
                                                      @RequestParam StatutRemorquage statut,
                                                      @RequestParam(required = false) String photos,
                                                      Authentication auth) {
        return ResponseEntity.ok(remorquageService.avancer(id, statut, photos, auth));
    }
}
