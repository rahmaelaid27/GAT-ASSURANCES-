package com.gat.assurances.controller;

import com.gat.assurances.dto.*;
import com.gat.assurances.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboards", description = "Tableaux de bord par rôle")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Dashboard Client")
    @GetMapping("/client")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public ResponseEntity<DashboardClientDto> client(Authentication auth) {
        return ResponseEntity.ok(dashboardService.dashboardClient(auth));
    }

    @Operation(summary = "Dashboard Gestionnaire")
    @GetMapping("/gestionnaire")
    @PreAuthorize("hasAnyRole('GESTIONNAIRE','ADMIN')")
    public ResponseEntity<DashboardGestionnaireDto> gestionnaire(Authentication auth) {
        return ResponseEntity.ok(dashboardService.dashboardGestionnaire(auth));
    }

    @Operation(summary = "Dashboard Garage")
    @GetMapping("/garage")
    @PreAuthorize("hasAnyRole('GARAGE','ADMIN')")
    public ResponseEntity<DashboardGarageDto> garage(Authentication auth) {
        return ResponseEntity.ok(dashboardService.dashboardGarage(auth));
    }

    @Operation(summary = "Dashboard Expert")
    @GetMapping("/expert")
    @PreAuthorize("hasAnyRole('EXPERT','ADMIN')")
    public ResponseEntity<DashboardExpertDto> expert(Authentication auth) {
        return ResponseEntity.ok(dashboardService.dashboardExpert(auth));
    }

    @Operation(summary = "Dashboard Remorqueur")
    @GetMapping("/remorqueur")
    @PreAuthorize("hasAnyRole('REMORQUEUR','ADMIN')")
    public ResponseEntity<DashboardRemorqueurDto> remorqueur(Authentication auth) {
        return ResponseEntity.ok(dashboardService.dashboardRemorqueur(auth));
    }

    @Operation(summary = "Dashboard Manager — KPI globaux")
    @GetMapping("/manager")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public ResponseEntity<DashboardManagerDto> manager(Authentication auth) {
        return ResponseEntity.ok(dashboardService.dashboardManager(auth));
    }

    @Operation(summary = "Dashboard Administrateur")
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardAdminDto> admin(Authentication auth) {
        return ResponseEntity.ok(dashboardService.dashboardAdmin(auth));
    }
}
