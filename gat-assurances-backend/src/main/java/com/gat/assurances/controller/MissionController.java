package com.gat.assurances.controller;

import com.gat.assurances.dto.MissionDto;
import com.gat.assurances.service.MissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/missions")
@RequiredArgsConstructor
@Tag(name = "Missions", description = "Gestion des missions (expertise, devis, réparation)")
@SecurityRequirement(name = "bearerAuth")
public class MissionController {

    private final MissionService missionService;

    // ─── READ ────────────────────────────────────────────────────────────────

    @GetMapping("/par-sinistre/{sinistreId}")
    @Operation(summary = "Missions d'un dossier sinistre")
    public ResponseEntity<List<MissionDto>> parSinistre(@PathVariable Long sinistreId) {
        return ResponseEntity.ok(missionService.findBySinistre(sinistreId));
    }

    @GetMapping
    @Operation(summary = "Toutes les missions")
    public ResponseEntity<List<MissionDto>> findAll() {
        return ResponseEntity.ok(missionService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une mission")
    public ResponseEntity<MissionDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.findById(id));
    }

    @GetMapping("/mes-missions-garage")
    @PreAuthorize("hasAnyRole('GARAGE','ADMIN')")
    @Operation(summary = "Missions du garage connecté")
    public ResponseEntity<List<MissionDto>> mesMissionsGarage(Authentication auth) {
        return ResponseEntity.ok(missionService.findByGarage(auth));
    }

    @GetMapping("/mes-missions-expert")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Operation(summary = "Missions de l'expert connecté")
    public ResponseEntity<List<MissionDto>> mesMissionsExpert(Authentication auth) {
        return ResponseEntity.ok(missionService.findByExpert(auth));
    }

    // ─── CRUD basique ─────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<MissionDto> create(@RequestBody MissionDto dto) {
        return ResponseEntity.ok(missionService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MissionDto> update(@PathVariable Long id, @RequestBody MissionDto dto) {
        return ResponseEntity.ok(missionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        missionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FLUX EXPERTISE : Expert → Rapport → Gestionnaire
    // ═══════════════════════════════════════════════════════════════════════

    @PutMapping("/{id}/planifier")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Operation(summary = "Expert planifie la date d'inspection")
    public ResponseEntity<MissionDto> planifier(
            @PathVariable Long id,
            @RequestParam String datePrevue,
            Authentication auth) {
        return ResponseEntity.ok(missionService.planifier(id, datePrevue, auth));
    }

    @PutMapping("/{id}/demarrer-inspection")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Operation(summary = "Expert démarre l'inspection du véhicule")
    public ResponseEntity<MissionDto> demarrerInspection(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(missionService.demarrerInspection(id, auth));
    }

    @PutMapping("/{id}/deposer-rapport")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Operation(summary = "Expert dépose son rapport d'expertise → envoyé au gestionnaire")
    public ResponseEntity<MissionDto> deposerRapportExpert(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(
                missionService.deposerRapportExpert(id, body.getOrDefault("rapport", ""), auth));
    }

    @PutMapping("/{id}/valider-rapport")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    @Operation(summary = "Gestionnaire valide le rapport → client notifié")
    public ResponseEntity<MissionDto> validerRapport(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(missionService.validerRapport(id, auth));
    }

    @PutMapping("/{id}/rejeter-rapport")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    @Operation(summary = "Gestionnaire demande correction du rapport à l'expert")
    public ResponseEntity<MissionDto> rejeterRapport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(
                missionService.rejeterRapport(id, body.getOrDefault("motif", ""), auth));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FLUX DEVIS : Garage → Expert → Gestionnaire
    // ═══════════════════════════════════════════════════════════════════════

    @PutMapping("/{id}/deposer-devis")
    @PreAuthorize("hasAnyRole('GARAGE','ADMIN')")
    @Operation(summary = "Garage dépose le devis → envoyé à l'expert pour vérification")
    public ResponseEntity<MissionDto> deposerDevis(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        String devisTexte = body.getOrDefault("devis", "");
        BigDecimal montant;
        try { montant = new BigDecimal(body.getOrDefault("montant", "0")); }
        catch (NumberFormatException e) { montant = BigDecimal.ZERO; }
        return ResponseEntity.ok(missionService.deposerDevis(id, devisTexte, montant, auth));
    }

    @PutMapping("/{id}/commencer-verification-devis")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Operation(summary = "Expert commence la vérification du devis")
    public ResponseEntity<MissionDto> commencerVerification(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(missionService.commencerVerificationDevis(id, auth));
    }

    @PutMapping("/{id}/demander-complement-devis")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Operation(summary = "Expert demande un complément au garage (devis incomplet)")
    public ResponseEntity<MissionDto> demanderComplementDevis(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(
                missionService.demanderComplementDevis(id, body.getOrDefault("motif", ""), auth));
    }

    @PutMapping("/{id}/valider-devis-expert")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    @Operation(summary = "Expert valide techniquement le devis → envoyé au gestionnaire")
    public ResponseEntity<MissionDto> validerDevisExpert(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(missionService.validerDevisExpert(id, auth));
    }

    @PutMapping("/{id}/valider-devis-final")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    @Operation(summary = "Gestionnaire valide définitivement le devis → garage peut commencer")
    public ResponseEntity<MissionDto> validerDevisFinal(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(missionService.validerDevisFinal(id, auth));
    }

    @PutMapping("/{id}/refuser-devis")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    @Operation(summary = "Gestionnaire refuse le devis → retour garage/expert")
    public ResponseEntity<MissionDto> refuserDevis(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(
                missionService.refuserDevis(id, body.getOrDefault("motif", ""), auth));
    }

    // ─── AVANCEMENT + FACTURE ─────────────────────────────────────────────

    @PutMapping("/{id}/avancement")
    @PreAuthorize("hasAnyRole('GARAGE','ADMIN')")
    @Operation(summary = "Garage met à jour l'avancement physique de la réparation")
    public ResponseEntity<MissionDto> majAvancement(
            @PathVariable Long id,
            @RequestParam String avancement,
            Authentication auth) {
        return ResponseEntity.ok(missionService.majAvancement(id, avancement, auth));
    }

    @PutMapping("/{id}/deposer-facture")
    @PreAuthorize("hasAnyRole('GARAGE','ADMIN')")
    @Operation(summary = "Garage dépose la facture finale")
    public ResponseEntity<MissionDto> deposerFacture(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        BigDecimal montant;
        try { montant = new BigDecimal(body.getOrDefault("montant", "0")); }
        catch (NumberFormatException e) { montant = BigDecimal.ZERO; }
        return ResponseEntity.ok(
                missionService.deposerFacture(id, body.getOrDefault("facture", ""), montant, auth));
    }

    @PutMapping("/{id}/terminer")
    @PreAuthorize("hasAnyRole('GARAGE','ADMIN')")
    @Operation(summary = "Marquer la mission comme terminée")
    public ResponseEntity<MissionDto> terminer(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(missionService.terminer(id, auth));
    }
}
