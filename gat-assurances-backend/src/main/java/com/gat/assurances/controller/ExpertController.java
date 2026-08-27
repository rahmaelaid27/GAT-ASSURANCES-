package com.gat.assurances.controller;

import com.gat.assurances.dto.ExpertDto;
import com.gat.assurances.service.ExpertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/experts")
@RequiredArgsConstructor
@Tag(name = "Experts", description = "Gestion des experts automobiles")
public class ExpertController {

    private final ExpertService expertService;

    @GetMapping
    @Operation(summary = "Liste des experts")
    public ResponseEntity<List<ExpertDto>> findAll() {
        return ResponseEntity.ok(expertService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détails d'un expert")
    public ResponseEntity<ExpertDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(expertService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Créer un expert")
    public ResponseEntity<ExpertDto> create(@Valid @RequestBody ExpertDto dto) {
        return ResponseEntity.ok(expertService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un expert")
    public ResponseEntity<ExpertDto> update(@PathVariable Long id, @Valid @RequestBody ExpertDto dto) {
        return ResponseEntity.ok(expertService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un expert")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        expertService.delete(id);
        return ResponseEntity.ok().build();
    }
}
