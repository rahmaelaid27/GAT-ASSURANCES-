package com.gat.assurances.service;

import com.gat.assurances.dto.GarageRecommandationDto;
import com.gat.assurances.entity.Garage;
import com.gat.assurances.entity.Sinistre;
import com.gat.assurances.exception.ResourceNotFoundException;
import com.gat.assurances.repository.GarageRepository;
import com.gat.assurances.repository.SinistreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Moteur intelligent de recommandation de garages.
 *
 * Score /100 :
 *   20% distance        (plus c'est proche = mieux)
 *   20% disponibilité   (slots libres)
 *   20% note moyenne    (étoiles /5)
 *   15% délai moyen     (moins de jours = mieux)
 *   10% convention GAT  (booléen)
 *   10% spécialité      (match type véhicule)
 *    5% performances    (historique note pondérée)
 */
@Service
@RequiredArgsConstructor
public class GarageRecommandationService {

    private static final double MAX_DISTANCE_KM = 100.0;
    private static final double MAX_DELAI_JOURS  = 30.0;

    private final GarageRepository garageRepository;
    private final SinistreRepository sinistreRepository;
    private final GeoService geoService;

    public List<GarageRecommandationDto> recommander(Long sinistreId) {
        Sinistre sinistre = sinistreRepository.findById(sinistreId)
                .orElseThrow(() -> new ResourceNotFoundException("Sinistre", sinistreId));

        double[] sinistreCoords = geoService.parseCoords(sinistre.getCoordonneesGps());

        List<Garage> garages = garageRepository.findAvailableWithCoordinates();

        return garages.stream()
                .map(g -> score(g, sinistre, sinistreCoords))
                .sorted(Comparator.comparingDouble(GarageRecommandationDto::getScore).reversed())
                .collect(Collectors.toList());
    }

    private GarageRecommandationDto score(Garage g, Sinistre sinistre, double[] sinistreCoords) {

        // --- Distance ---
        double distKm = 0;
        double scoreDistance = 0;
        if (sinistreCoords != null && g.getLatitude() != null && g.getLongitude() != null) {
            distKm = geoService.distanceKm(sinistreCoords[0], sinistreCoords[1],
                    g.getLatitude(), g.getLongitude());
            scoreDistance = Math.max(0, (1.0 - distKm / MAX_DISTANCE_KM)) * 20.0;
        }

        // --- Disponibilité ---
        int slots = (g.getCapaciteMax() != null && g.getCapaciteActuelle() != null)
                ? g.getCapaciteMax() - g.getCapaciteActuelle() : 0;
        double scoreDisponibilite = g.getCapaciteMax() != null && g.getCapaciteMax() > 0
                ? Math.min(1.0, (double) slots / g.getCapaciteMax()) * 20.0 : 0;

        // --- Note ---
        double note = g.getNote() != null ? g.getNote() : 0.0;
        double scoreNote = (note / 5.0) * 20.0;

        // --- Délai ---
        double delai = g.getDelaiMoyenJours() != null ? g.getDelaiMoyenJours() : MAX_DELAI_JOURS;
        double scoreDelai = Math.max(0, (1.0 - delai / MAX_DELAI_JOURS)) * 15.0;

        // --- Convention GAT ---
        double scoreConvention = Boolean.TRUE.equals(g.getConventionGat()) ? 10.0 : 0.0;

        // --- Spécialité ---
        double scoreSpecialite = 0;
        String typeVehicule = sinistre.getVehicule() != null
                ? sinistre.getVehicule().getTypeVehicule().name() : "";
        if (g.getSpecialites() != null && typeVehicule != null
                && g.getSpecialites().toLowerCase().contains(typeVehicule.toLowerCase())) {
            scoreSpecialite = 10.0;
        }

        // --- Performances historiques (réutilise la note) ---
        double scorePerformance = (note / 5.0) * 5.0;

        double total = scoreDistance + scoreDisponibilite + scoreNote + scoreDelai
                     + scoreConvention + scoreSpecialite + scorePerformance;

        return GarageRecommandationDto.builder()
                .id(g.getId())
                .nom(g.getNom())
                .adresse(g.getAdresse())
                .ville(g.getVille())
                .telephone(g.getTelephone())
                .email(g.getEmail())
                .specialites(g.getSpecialites())
                .statut(g.getStatut())
                .note(g.getNote())
                .capaciteMax(g.getCapaciteMax())
                .capaciteActuelle(g.getCapaciteActuelle())
                .slotsDisponibles(slots)
                .conventionGat(g.getConventionGat())
                .delaiMoyenJours(g.getDelaiMoyenJours())
                .latitude(g.getLatitude())
                .longitude(g.getLongitude())
                .distanceKm(Math.round(distKm * 10.0) / 10.0)
                .score(Math.round(total * 100.0) / 100.0)
                .scoreDistance(scoreDistance)
                .scoreDisponibilite(scoreDisponibilite)
                .scoreNote(scoreNote)
                .scoreDelai(scoreDelai)
                .scoreConvention(scoreConvention)
                .scoreSpecialite(scoreSpecialite)
                .scorePerformance(scorePerformance)
                .build();
    }
}
