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

    public double[] coordsForGouvernorat(String gouvernorat) {
        if (gouvernorat == null) return null;
        return switch (gouvernorat.trim().toLowerCase()) {
            case "tunis" -> new double[]{36.8065, 10.1815};
            case "sfax" -> new double[]{34.7406, 10.7603};
            case "sousse" -> new double[]{35.8256, 10.63699};
            case "monastir" -> new double[]{35.7643, 10.8113};
            case "nabeul" -> new double[]{36.4513, 10.7357};
            case "bizerte" -> new double[]{37.2744, 9.8739};
            case "ariana" -> new double[]{36.8665, 10.1647};
            case "ben arous" -> new double[]{36.7531, 10.2189};
            case "gabes" -> new double[]{33.8815, 10.0982};
            case "kairouan" -> new double[]{35.6781, 10.0963};
            case "gafsa" -> new double[]{34.4250, 8.7842};
            default -> null;
        };
    }
}
