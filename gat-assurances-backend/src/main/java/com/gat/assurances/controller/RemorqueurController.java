package com.gat.assurances.controller;

import com.gat.assurances.dto.RemorqueurDto;
import com.gat.assurances.service.RemorqueurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/remorqueurs")
@RequiredArgsConstructor
@Tag(name = "Remorqueurs", description = "Gestion des remorqueurs")
public class RemorqueurController {

    private final RemorqueurService remorqueurService;

    @GetMapping
    @Operation(summary = "Liste des remorqueurs")
    public ResponseEntity<List<RemorqueurDto>> findAll() {
        return ResponseEntity.ok(remorqueurService.findAll());
    }

    @GetMapping("/{id}")
@Operation(summary = "Détails d'un remorqueur")
    public ResponseEntity<RemorqueurDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(remorqueurService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un remorqueur")
    public ResponseEntity<RemorqueurDto> create(@Valid @RequestBody RemorqueurDto dto) {
        return ResponseEntity.ok(remorqueurService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un remorqueur")
    public ResponseEntity<RemorqueurDto> update(@PathVariable Long id, @Valid @RequestBody RemorqueurDto dto) {
        return ResponseEntity.ok(remorqueurService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un remorqueur")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        remorqueurService.delete(id);
        return ResponseEntity.ok().build();
    }
}
