package com.gat.assurances.service;

import com.gat.assurances.entity.*;
import com.gat.assurances.entity.enums.*;
import com.gat.assurances.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DataSeeder — insère TOUS les comptes de test au premier démarrage.
 *
 * ┌─────────────────┬──────────────────────────┬─────────────┐
 * │ Rôle            │ Email                    │ Mot de passe│
 * ├─────────────────┼──────────────────────────┼─────────────┤
 * │ ADMIN           │ admin@gat.com.tn         │ admin123    │
 * │ MANAGER         │ manager@gat.com.tn       │ manager123  │
 * │ GESTIONNAIRE    │ gestionnaire@gat.com.tn  │ gestion123  │
 * │ CLIENT          │ client@test.com          │ client123   │
 * │ GARAGE          │ garage@gat.com.tn        │ garage123   │
 * │ EXPERT          │ expert@gat.com.tn        │ expert123   │
 * │ REMORQUEUR      │ remorqueur@gat.com.tn    │ remor123    │
 * └─────────────────┴──────────────────────────┴─────────────┘
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository        userRepository;
    private final ClientRepository      clientRepository;
    private final VehiculeRepository    vehiculeRepository;
    private final SinistreRepository    sinistreRepository;
    private final ContratRepository     contratRepository;
    private final GarageRepository      garageRepository;
    private final ExpertRepository      expertRepository;
    private final RemorqueurRepository  remorqueurRepository;
    private final GestionnaireRepository gestionnaireRepository;
    private final PasswordEncoder       passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
                        seedAdditionalPartners();
                        log.info("Base de données déjà initialisée — partenaires supplémentaires vérifiés.");
            return;
        }

        log.info("═══════════════════════════════════════════════");
        log.info("  Initialisation des données GAT Assurances...");
        log.info("═══════════════════════════════════════════════");

        seedAdmin();
        seedManager();
        seedGestionnaire();
        seedClient();
        seedGarage();
        seedExpert();
        seedRemorqueur();

        log.info("═══════════════════════════════════════════════");
        log.info("  ✅ Toutes les données ont été insérées !");
        log.info("  📌 Comptes disponibles :");
        log.info("     ADMIN       → admin@gat.com.tn       / admin123");
        log.info("     MANAGER     → manager@gat.com.tn     / manager123");
        log.info("     GESTIONNAIRE→ gestionnaire@gat.com.tn/ gestion123");
        log.info("     CLIENT      → client@test.com        / client123");
        log.info("     GARAGE      → garage@gat.com.tn      / garage123");
        log.info("     EXPERT      → expert@gat.com.tn      / expert123");
        log.info("     REMORQUEUR  → remorqueur@gat.com.tn  / remor123");
        log.info("═══════════════════════════════════════════════");
    }

    private void seedAdditionalPartners() {
        seedGarageSupplementaire("garage3@gat.com.tn", "Ben Youssef", "Nour", "Garage El Menzah", "El Menzah", "+216 71 555 666", "50000003", 12, 4.6, 36.8450, 10.1650);
        seedGarageSupplementaire("garage4@gat.com.tn", "Kefi", "Yassine", "Auto Service Lac", "Les Berges du Lac", "+216 71 777 999", "50000004", 10, 4.4, 36.8350, 10.2450);
        seedGarageSupplementaire("garage5@gat.com.tn", "Trabelsi", "Sami", "Garage Sfax Centre", "Sfax", "+216 74 888 111", "50000005", 10, 4.6, 34.7406, 10.7603);
        seedGarageSupplementaire("garage6@gat.com.tn", "Masmoudi", "Ines", "Auto Sfax Services", "Sfax", "+216 74 999 222", "50000006", 8, 4.3, 34.7550, 10.7650);
        seedExpertSupplementaire("expert3@gat.com.tn", "Jlassi", "Amel", "+216 22 888 111", "70000003", "Tunis, Ariana, Nabeul", 4.6, 36.8300, 10.2100);
        seedExpertSupplementaire("expert4@gat.com.tn", "Gharbi", "Walid", "+216 22 999 222", "70000004", "Tunis, Sousse, Monastir", 4.5, 35.8300, 10.6400);
        seedRemorqueurSupplementaire("remorqueur3@gat.com.tn", "Brahmi", "Sonia", "+216 99 555 666", "80000003", "La Marsa", 36.8780, 10.3250, 2);
        seedRemorqueurSupplementaire("remorqueur4@gat.com.tn", "Ayari", "Mehdi", "+216 99 777 888", "80000004", "Ben Arous", 36.7500, 10.2300, 2);
    }

    private void seedGarageSupplementaire(String email, String nom, String prenom, String garageNom,
                                           String ville, String telephone, String cin, int capacite,
                                           double note, double latitude, double longitude) {
        if (userRepository.findByEmail(email).isPresent()) return;
        User user = userRepository.save(User.builder().email(email).password(passwordEncoder.encode("garage123"))
                .nom(nom).prenom(prenom).telephone(telephone).cin(cin).role(Role.GARAGE).enabled(true).build());
        garageRepository.save(Garage.builder().nom(garageNom).adresse(ville).ville(ville).codePostal("2000")
                .telephone(telephone).email(email).capaciteMax(capacite).capaciteActuelle(0)
                .specialites("Carrosserie, Mécanique, Diagnostic").statut(StatutGarage.ACTIF).note(note)
                .conventionGat(true).delaiMoyenJours(6.0).latitude(latitude).longitude(longitude).user(user).build());
        log.info("  ✔ Garage supplémentaire créé : {}", email);
    }

    private void seedExpertSupplementaire(String email, String nom, String prenom, String telephone,
                                          String cin, String zone, double note, double latitude, double longitude) {
        if (userRepository.findByEmail(email).isPresent()) return;
        User user = userRepository.save(User.builder().email(email).password(passwordEncoder.encode("expert123"))
                .nom(nom).prenom(prenom).telephone(telephone).cin(cin).role(Role.EXPERT).enabled(true).build());
        expertRepository.save(Expert.builder().nom(nom).prenom(prenom).email(email).telephone(telephone)
                .specialite("VOITURE_PARTICULIERE").zoneIntervention(zone).disponibilite(true)
                .missionsActives(0).capaciteMax(8).note(note).latitude(latitude).longitude(longitude).user(user).build());
        log.info("  ✔ Expert supplémentaire créé : {}", email);
    }

    private void seedRemorqueurSupplementaire(String email, String nom, String prenom, String telephone,
                                              String cin, String localisation, double latitude,
                                              double longitude, int capacite) {
        if (userRepository.findByEmail(email).isPresent()) return;
        User user = userRepository.save(User.builder().email(email).password(passwordEncoder.encode("remor123"))
                .nom(nom).prenom(prenom).telephone(telephone).cin(cin).role(Role.REMORQUEUR).enabled(true).build());
        remorqueurRepository.save(Remorqueur.builder().nom(nom).prenom(prenom).email(email).telephone(telephone)
                .disponibilite(true).localisation(localisation).latitude(latitude).longitude(longitude)
                .rayonIntervention(30).capacite(capacite).user(user).build());
        log.info("  ✔ Remorqueur supplémentaire créé : {}", email);
    }

    // ─── ADMIN ───────────────────────────────────────────────────────────────
    private void seedAdmin() {
        User admin = userRepository.save(User.builder()
                .email("admin@gat.com.tn")
                .password(passwordEncoder.encode("admin123"))
                .nom("Administrateur")
                .prenom("GAT")
                .telephone("+216 71 000 000")
                .cin("00000001")
                .role(Role.ADMIN)
                .enabled(true)
                .build());
        log.info("  ✔ Admin créé : {}", admin.getEmail());
    }

    // ─── MANAGER ─────────────────────────────────────────────────────────────
    private void seedManager() {
        User manager = userRepository.save(User.builder()
                .email("manager@gat.com.tn")
                .password(passwordEncoder.encode("manager123"))
                .nom("Ben Salah")
                .prenom("Karim")
                .telephone("+216 71 100 100")
                .cin("10000001")
                .role(Role.MANAGER)
                .enabled(true)
                .build());
        log.info("  ✔ Manager créé : {}", manager.getEmail());
    }

    // ─── GESTIONNAIRE ─────────────────────────────────────────────────────────
    private void seedGestionnaire() {
        User gUser = userRepository.save(User.builder()
                .email("gestionnaire@gat.com.tn")
                .password(passwordEncoder.encode("gestion123"))
                .nom("Ben Ali")
                .prenom("Sami")
                .telephone("+216 71 111 111")
                .cin("20000001")
                .role(Role.GESTIONNAIRE)
                .enabled(true)
                .build());

        gestionnaireRepository.save(Gestionnaire.builder()
                .user(gUser)
                .matricule("G001")
                .service("Gestion des Sinistres")
                .capaciteMax(50)
                .dossiersActifs(0)
                .actif(true)
                .build());

        log.info("  ✔ Gestionnaire créé : {}", gUser.getEmail());
    }

    // ─── CLIENT ───────────────────────────────────────────────────────────────
    private void seedClient() {
        User clientUser = userRepository.save(User.builder()
                .email("client@test.com")
                .password(passwordEncoder.encode("client123"))
                .nom("Trabelsi")
                .prenom("Mohamed")
                .telephone("+216 22 333 444")
                .cin("30000001")
                .role(Role.CLIENT)
                .enabled(true)
                .build());

        Client client = clientRepository.save(Client.builder()
                .user(clientUser)
                .adresse("15 Rue des Oliviers, Cité Ennasr")
                .ville("Tunis")
                .codePostal("2037")
                .numeroPolice("POL-2026-0001")
                .build());

        // Véhicule 1
        Vehicule v1 = vehiculeRepository.save(Vehicule.builder()
                .marque("Renault")
                .modele("Clio 4")
                .annee(2022)
                .immatriculation("123TU456")
                .couleur("Gris Platine")
                .typeVehicule(TypeVehicule.VOITURE_PARTICULIERE)
                .client(client)
                .build());

        // Véhicule 2
        Vehicule v2 = vehiculeRepository.save(Vehicule.builder()
                .marque("Volkswagen")
                .modele("Golf 7")
                .annee(2021)
                .immatriculation("789TU012")
                .couleur("Blanc")
                .typeVehicule(TypeVehicule.VOITURE_PARTICULIERE)
                .client(client)
                .build());

        // Sinistre de démonstration — on appelle affecter() pour qu'il soit EN_INSTRUCTION
        Sinistre sinistre = sinistreRepository.save(Sinistre.builder()
                .reference("GAT-2026-00001")
                .dateSinistre(LocalDate.now().minusDays(5))
                .dateDeclaration(LocalDate.now().minusDays(5))
                .lieu("Avenue Habib Bourguiba, Tunis")
                .description("Collision arrière à un feu rouge. Dommages au pare-chocs arrière et feux.")
                .gouvernorat("Tunis")
                .localite("Centre Ville")
                .typeSinistre(TypeSinistre.COLLISION)
                .statut(StatutSinistre.DECLARE)
                .client(client)
                .vehicule(v1)
                .build());

        // Affectation auto du gestionnaire
        List<Gestionnaire> disponibles = gestionnaireRepository.findAvailableOrderByLoad();
        if (!disponibles.isEmpty()) {
            Gestionnaire g = disponibles.get(0);
            sinistre.setGestionnaire(g);
            sinistre.setStatut(StatutSinistre.EN_INSTRUCTION);
            sinistreRepository.save(sinistre);
            g.setDossiersActifs(g.getDossiersActifs() != null ? g.getDossiersActifs() + 1 : 1);
            gestionnaireRepository.save(g);
        }

        // Contrats actifs pour les deux véhicules
        contratRepository.save(Contrat.builder()
                .numeroContrat("CTR-2026-0001")
                .vehicule(v1)
                .client(client)
                .typeCouverture("Tous Risques")
                .dateDebut(LocalDate.now().minusYears(1))
                .dateFin(LocalDate.now().plusYears(1))
                .actif(true)
                .build());

        contratRepository.save(Contrat.builder()
                .numeroContrat("CTR-2026-0002")
                .vehicule(v2)
                .client(client)
                .typeCouverture("Tiers Complet")
                .dateDebut(LocalDate.now().minusYears(1))
                .dateFin(LocalDate.now().plusYears(1))
                .actif(true)
                .build());

        log.info("  ✔ Client créé : {} (véhicules: 123TU456, 789TU012)", clientUser.getEmail());
    }

    // ─── GARAGE ───────────────────────────────────────────────────────────────
    private void seedGarage() {
        // User connecté pour le garage
        User garageUser = userRepository.save(User.builder()
                .email("garage@gat.com.tn")
                .password(passwordEncoder.encode("garage123"))
                .nom("Centrale Auto")
                .prenom("Garage")
                .telephone("+216 71 222 333")
                .cin("40000001")
                .role(Role.GARAGE)
                .enabled(true)
                .build());

        garageRepository.save(Garage.builder()
                .nom("Garage Centrale Tunis")
                .adresse("Route de La Marsa, Km 5")
                .ville("Tunis")
                .codePostal("1053")
                .telephone("+216 71 222 333")
                .email("garage@gat.com.tn")
                .capaciteMax(10)
                .capaciteActuelle(2)
                .specialites("Carrosserie, Mécanique, Peinture, Pare-brise")
                .statut(StatutGarage.ACTIF)
                .note(4.5)
                .conventionGat(true)
                .delaiMoyenJours(5.0)
                .latitude(36.8972)
                .longitude(10.1833)
                .user(garageUser)
                .build());

        // Deuxième garage sans user (pour le moteur de recommandation)
        userRepository.save(User.builder()
                .email("garage2@gat.com.tn")
                .password(passwordEncoder.encode("garage123"))
                .nom("Elite Car")
                .prenom("Garage")
                .telephone("+216 71 444 555")
                .cin("40000002")
                .role(Role.GARAGE)
                .enabled(true)
                .build());

        garageRepository.save(Garage.builder()
                .nom("Elite Car Services")
                .adresse("Zone Industrielle Charguia II")
                .ville("Tunis")
                .codePostal("2035")
                .telephone("+216 71 444 555")
                .email("garage2@gat.com.tn")
                .capaciteMax(8)
                .capaciteActuelle(1)
                .specialites("Mécanique générale, Électronique, Diagnostic")
                .statut(StatutGarage.ACTIF)
                .note(4.2)
                .conventionGat(true)
                .delaiMoyenJours(7.0)
                .latitude(36.8400)
                .longitude(10.1900)
                .build());

        log.info("  ✔ Garage créé : {}", garageUser.getEmail());
    }

    // ─── EXPERT ───────────────────────────────────────────────────────────────
    private void seedExpert() {
        User expertUser = userRepository.save(User.builder()
                .email("expert@gat.com.tn")
                .password(passwordEncoder.encode("expert123"))
                .nom("Mansouri")
                .prenom("Tahar")
                .telephone("+216 22 555 666")
                .cin("50000001")
                .role(Role.EXPERT)
                .enabled(true)
                .build());

        expertRepository.save(Expert.builder()
                .nom("Mansouri")
                .prenom("Tahar")
                .email("expert@gat.com.tn")
                .telephone("+216 22 555 666")
                .specialite("VOITURE_PARTICULIERE")
                .zoneIntervention("Tunis, Ariana, Ben Arous, Manouba")
                .disponibilite(true)
                .missionsActives(0)
                .capaciteMax(10)
                .note(4.8)
                .latitude(36.8500)
                .longitude(10.1700)
                .user(expertUser)
                .build());

        // Deuxième expert
        User expertUser2 = userRepository.save(User.builder()
                .email("expert2@gat.com.tn")
                .password(passwordEncoder.encode("expert123"))
                .nom("Sfaxi")
                .prenom("Hichem")
                .telephone("+216 22 777 888")
                .cin("50000002")
                .role(Role.EXPERT)
                .enabled(true)
                .build());

        expertRepository.save(Expert.builder()
                .nom("Sfaxi")
                .prenom("Hichem")
                .email("expert2@gat.com.tn")
                .telephone("+216 22 777 888")
                .specialite("VOITURE_PARTICULIERE")
                .zoneIntervention("Tunis, La Marsa, Carthage")
                .disponibilite(true)
                .missionsActives(0)
                .capaciteMax(8)
                .note(4.3)
                .latitude(36.8900)
                .longitude(10.3200)
                .user(expertUser2)
                .build());

        log.info("  ✔ Expert créé : {}", expertUser.getEmail());
    }

    // ─── REMORQUEUR ───────────────────────────────────────────────────────────
    private void seedRemorqueur() {
        User remUser = userRepository.save(User.builder()
                .email("remorqueur@gat.com.tn")
                .password(passwordEncoder.encode("remor123"))
                .nom("Hammami")
                .prenom("Ali")
                .telephone("+216 99 111 222")
                .cin("60000001")
                .role(Role.REMORQUEUR)
                .enabled(true)
                .build());

        remorqueurRepository.save(Remorqueur.builder()
                .nom("Hammami")
                .prenom("Ali")
                .email("remorqueur@gat.com.tn")
                .telephone("+216 99 111 222")
                .disponibilite(true)
                .localisation("Tunis Centre")
                .latitude(36.8190)
                .longitude(10.1658)
                .rayonIntervention(30)
                .capacite(2)
                .user(remUser)
                .build());

        // Deuxième remorqueur
        User remUser2 = userRepository.save(User.builder()
                .email("remorqueur2@gat.com.tn")
                .password(passwordEncoder.encode("remor123"))
                .nom("Naouri")
                .prenom("Khalil")
                .telephone("+216 99 333 444")
                .cin("60000002")
                .role(Role.REMORQUEUR)
                .enabled(true)
                .build());

        remorqueurRepository.save(Remorqueur.builder()
                .nom("Naouri")
                .prenom("Khalil")
                .email("remorqueur2@gat.com.tn")
                .telephone("+216 99 333 444")
                .disponibilite(true)
                .localisation("Ariana")
                .latitude(36.8600)
                .longitude(10.1950)
                .rayonIntervention(25)
                .capacite(1)
                .user(remUser2)
                .build());

        log.info("  ✔ Remorqueur créé : {}", remUser.getEmail());
    }
}
