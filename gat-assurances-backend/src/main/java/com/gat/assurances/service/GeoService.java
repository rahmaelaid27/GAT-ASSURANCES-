package com.gat.assurances.service;

import org.springframework.stereotype.Service;

/**
 * Calcul de distances géographiques (formule de Haversine).
 */
@Service
public class GeoService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calcule la distance en kilomètres entre deux points GPS.
     */
    public double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Parse "latitude,longitude" → double[]{lat, lon}.
     * Retourne null si le format est invalide.
     */
    public double[] parseCoords(String coordsStr) {
        if (coordsStr == null || coordsStr.isBlank()) return null;
        String[] parts = coordsStr.split(",");
        if (parts.length != 2) return null;
        try {
            return new double[]{Double.parseDouble(parts[0].trim()),
                                Double.parseDouble(parts[1].trim())};
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
