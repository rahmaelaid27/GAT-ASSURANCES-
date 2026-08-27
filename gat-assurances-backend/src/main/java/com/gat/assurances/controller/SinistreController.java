package com.gat.assurances.controller;

import com.gat.assurances.dto.GarageRecommandationDto;
import com.gat.assurances.dto.SinistreDto;
import com.gat.assurances.entity.Sinistre;
import com.gat.assurances.entity.enums.StatutSinistre;
import com.gat.assurances.mapper.SinistreMapper;
import com.gat.assurances.service.GarageRecommandationService;
import com.gat.assurances.service.SinistreService;
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

@Tag(name = "Sinistres", description = "Gestion du cycle de vie des sinistres automobiles")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/sinistres")
@RequiredArgsConstructor
public class SinistreController {

    private final SinistreService sinistreService;
    private final SinistreMapper sinistreMapper;
    private final GarageRecommandationService garageRecommandationService;

    // ─── Déclaration (CLIENT) ────────────────────────────────────────────────
    @Operation(summary = "Déclarer un sinistre")
    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public ResponseEntity<SinistreDto> declarer(@RequestBody SinistreDto dto,
                                                Authentication auth) {
        Sinistre s = sinistreService.declarer(dto, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(sinistreMapper.toDto(s));
    }

    // ─── Mes sinistres (CLIENT) ──────────────────────────────────────────────
    @Operation(summary = "Mes sinistres (client connecté)")
    @GetMapping("/mes-sinistres")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public ResponseEntity<List<SinistreDto>> mesSinistres(Authentication auth) {
        return ResponseEntity.ok(
                sinistreService.findByClient(auth).stream()
                        .map(sinistreMapper::toDto).collect(Collectors.toList()));
    }

    // ─── Dossiers du gestionnaire ────────────────────────────────────────────
    @Operation(summary = "Dossiers affectés au gestionnaire connecté")
    @GetMapping("/mes-dossiers")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<List<SinistreDto>> mesDossiers(Authentication auth) {
        return ResponseEntity.ok(
                sinistreService.findByGestionnaire(auth).stream()
                        .map(sinistreMapper::toDto).collect(Collectors.toList()));
    }

    // ─── Dossiers du garage (GARAGE) ─────────────────────────────────────────
    @Operation(summary = "Dossiers affectés au garage connecté")
    @GetMapping("/mes-dossiers-garage")
    @PreAuthorize("hasAnyRole('GARAGE','ADMIN')")
    public ResponseEntity<List<SinistreDto>> mesDossiersGarage(Authentication auth) {
        return ResponseEntity.ok(
                sinistreService.findByGarage(auth).stream()
                        .map(sinistreMapper::toDto).collect(Collectors.toList()));
    }

    // ─── Tous les sinistres (MANAGER / ADMIN) ────────────────────────────────
    @Operation(summary = "Tous les sinistres")
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<List<SinistreDto>> findAll() {
        return ResponseEntity.ok(
                sinistreService.findAll().stream()
                        .map(sinistreMapper::toDto).collect(Collectors.toList()));
    }

    // ─── Détail ──────────────────────────────────────────────────────────────
    @Operation(summary = "Détail d'un sinistre")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT','GESTIONNAIRE','GARAGE','EXPERT','REMORQUEUR','MANAGER','ADMIN')")
    public ResponseEntity<SinistreDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sinistreMapper.toDto(sinistreService.getById(id)));
    }

    // ─── Changement de statut (GESTIONNAIRE / ADMIN) ─────────────────────────
    @Operation(summary = "Changer le statut d'un dossier")
    @PutMapping("/{id}/statut")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<SinistreDto> changerStatut(@PathVariable Long id,
                                                      @RequestParam StatutSinistre statut,
                                                      @RequestParam(required = false) String motif,
                                                      Authentication auth) {
        return ResponseEntity.ok(sinistreMapper.toDto(
                sinistreService.changerStatut(id, statut, motif, auth)));
    }

    // ─── Affecter un garage (CLIENT) ─────────────────────────────────────────
    @Operation(summary = "Le client choisit son garage depuis les recommandations")
    @PostMapping("/{id}/affecter-garage/{garageId}")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public ResponseEntity<SinistreDto> affecterGarage(@PathVariable Long id,
                                                       @PathVariable Long garageId,
                                                       Authentication auth) {
        return ResponseEntity.ok(sinistreMapper.toDto(
                sinistreService.affecterGarage(id, garageId, auth)));
    }

    // ─── Approuver (GESTIONNAIRE) ─────────────────────────────────────────────
    @Operation(summary = "Approuver un dossier")
    @PutMapping("/{id}/approuver")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<SinistreDto> approuver(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(sinistreMapper.toDto(sinistreService.approuver(id, auth)));
    }

    // ─── Clôturer (GESTIONNAIRE) ──────────────────────────────────────────────
    @Operation(summary = "Clôturer un dossier")
    @PutMapping("/{id}/cloturer")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<SinistreDto> cloturer(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(sinistreMapper.toDto(sinistreService.cloturer(id, auth)));
    }

    // ─── Refuser (GESTIONNAIRE) ──────────────────────────────────────────────
    @Operation(summary = "Refuser un dossier")
    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<SinistreDto> refuser(@PathVariable Long id,
                                                @RequestParam String motif,
                                                Authentication auth) {
        return ResponseEntity.ok(sinistreMapper.toDto(sinistreService.refuser(id, motif, auth)));
    }

    // ─── Demander complément (GESTIONNAIRE) ──────────────────────────────────
    @Operation(summary = "Demander des informations complémentaires au client")
    @PutMapping("/{id}/demander-complement")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<SinistreDto> demanderComplement(@PathVariable Long id,
                                                           @RequestParam String motif,
                                                           Authentication auth) {
        return ResponseEntity.ok(sinistreMapper.toDto(
                sinistreService.demanderComplement(id, motif, auth)));
    }

    // ─── Recommandations garages (CLIENT + GESTIONNAIRE) ─────────────────────
    @Operation(summary = "Recommandations intelligentes de garages pour un sinistre")
    @GetMapping("/{id}/garages-recommandes")
    @PreAuthorize("hasAnyRole('CLIENT','GESTIONNAIRE','ADMIN')")
    public ResponseEntity<List<GarageRecommandationDto>> garagesRecommandesParSinistre(
            @PathVariable Long id) {
        return ResponseEntity.ok(garageRecommandationService.recommander(id));
    }
}
