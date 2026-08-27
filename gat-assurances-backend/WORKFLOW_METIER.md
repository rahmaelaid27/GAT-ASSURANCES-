# WORKFLOW MÉTIER COMPLET — GAT Assurances
## Plateforme Intelligente de Gestion des Partenaires Automobile

**Stack :** Spring Boot 3 • Angular 20 • Tailwind CSS • MySQL • JWT

---

## 1. ACTEURS ET RÔLES

| Acteur | Rôle | Périmètre |
|---|---|---|
| **CLIENT** | Assure son véhicule, déclare les sinistres | Ses données uniquement |
| **GESTIONNAIRE** | Instruit les dossiers, coordonne les partenaires | Dossiers qui lui sont affectés |
| **GARAGE** | Répare les véhicules | Ses missions uniquement |
| **EXPERT** | Évalue les dommages, rédige le rapport | Ses expertises uniquement |
| **REMORQUEUR** | Achemine les véhicules | Ses interventions uniquement |
| **MANAGER** | Pilote la performance globale | Lecture seule globale (KPI) |
| **ADMINISTRATEUR** | Gère les utilisateurs, rôles, config système | Pas d'accès aux données métier |

---

## 2. ÉTATS D'UN DOSSIER SINISTRE


```
DECLARE ──▶ EN_INSTRUCTION ──▶ INCOMPLET ──▶ [Client complète] ──┐
                │                                                  │
                ▼                                                  │
         GARAGE_AFFECTE ◀──────────────────────────────────────────┘
                │
                ▼
         EXPERT_AFFECTE
                │
                ├──▶ REMORQUAGE_EN_COURS (si véhicule immobilisé)
                │
                ▼
          EN_EXPERTISE
                │
                ▼
          EN_REPARATION
                │
                ▼
     EN_ATTENTE_VALIDATION
                │
          ┌─────┴─────┐
          ▼           ▼
       APPROUVE     REFUSE
          │
          ▼
        CLOTURE (lecture seule + archivage)
```

### Enum StatutSinistre (complet)
- `DECLARE` — dossier créé par le client
- `EN_INSTRUCTION` — affecté à un gestionnaire
- `INCOMPLET` — documents manquants demandés
- `GARAGE_AFFECTE` — client a choisi son garage
- `EXPERT_AFFECTE` — expert auto-assigné par le système
- `REMORQUAGE_EN_COURS` — demande de remorquage active
- `EN_EXPERTISE` — expert a planifié et réalise l'expertise
- `EN_REPARATION` — garage en cours de réparation
- `EN_ATTENTE_VALIDATION` — réparations terminées, gestionnaire doit valider
- `APPROUVE` — gestionnaire approuve le dossier
- `CLOTURE` — dossier archivé définitivement
- `REFUSE` — dossier rejeté


---

## 3. FLUX MÉTIER ÉTAPE PAR ÉTAPE

### ÉTAPE 1 — Authentification & Routage JWT

```
POST /api/auth/login  { email, password }
→ Vérifie credentials, génère JWT (24h) + RefreshToken (7j)
→ JWT Payload : { sub, role, userId, nom, prenom }
→ Angular lit le rôle et redirige :

  ROLE_CLIENT       → /client/dashboard
  ROLE_GESTIONNAIRE → /gestionnaire/dashboard
  ROLE_GARAGE       → /garage/dashboard
  ROLE_EXPERT       → /expert/dashboard
  ROLE_REMORQUEUR   → /remorqueur/dashboard
  ROLE_MANAGER      → /manager/dashboard
  ROLE_ADMIN        → /admin/dashboard
```

### ÉTAPE 2 — Déclaration d'un Sinistre (CLIENT)

```
1. GET /api/vehicules/client/{clientId}
   → Dropdown immatriculations du client

2. OnChange(immatriculation) → GET /api/vehicules/by-immat/{immat}
   → Auto-remplissage : marque, modèle, année, n° police, contrat

3. POST /api/sinistres
   Body: { immatriculation, dateSinistre, gouvernorat, localite,
           typeSinistre, description, photos[], documents[] }
   → Référence auto : GAT-{YYYY}-{seq5}
   → Statut : DECLARE
   → Notification → Client : "Dossier créé"

4. Système auto-affecte un gestionnaire (Round-Robin pondéré)
   → Statut : EN_INSTRUCTION
   → Notification → Gestionnaire : "Nouveau dossier"
```


### ÉTAPE 3 — Instruction par le Gestionnaire

```
Gestionnaire consulte le dossier et décide :

  [VALIDER]    → PUT /api/sinistres/{id}/statut?statut=GARAGE_AFFECTE
                 → Déclenche moteur recommandation garages

  [INCOMPLET]  → PUT /api/sinistres/{id}/statut?statut=INCOMPLET
                 → Motif obligatoire via forum
                 → Notification → Client

  [REFUSER]    → PUT /api/sinistres/{id}/statut?statut=REFUSE
                 → Motif obligatoire
                 → Notification → Client
```

### ÉTAPE 4 — Recommandation Intelligente de Garages (SYSTÈME)

```
GET /api/garages/recommandations?sinistreId={id}

Score /100 par garage :
  Poids 20% : Distance (Haversine depuis localisation sinistre)
  Poids 20% : Disponibilité (capaciteMax - capaciteActuelle > 0)
  Poids 20% : Note moyenne clients (étoiles)
  Poids 15% : Délai moyen réparation (jours)
  Poids 10% : Convention GAT (booléen)
  Poids 10% : Spécialité (match type véhicule)
  Poids  5% : Performances historiques

Retour : liste triée par score + carte + infos détaillées
Client choisit → POST /api/sinistres/{id}/affecter-garage/{garageId}
→ Statut : GARAGE_AFFECTE
→ Notification → Garage + Client
→ Déclenche affectation automatique expert
```


### ÉTAPE 5 — Affectation Automatique de l'Expert (SYSTÈME)

```
Déclenchée automatiquement après sélection du garage.
Critères (le client n'intervient PAS) :
  1. disponible = true
  2. spécialité MATCH type véhicule du sinistre
  3. missionsActives < capaciteMax
  4. ORDER BY distance(expert, garage) ASC, note DESC

→ Mission créée : TypeMission=EXPERTISE, Statut=EN_ATTENTE
→ Sinistre statut : EXPERT_AFFECTE
→ Notification → Expert + Gestionnaire + Client
```

### ÉTAPE 6 — Intervention du Garage

```
Mission reçue (statut EN_ATTENTE) :

  [ACCEPTER] → PUT /api/missions/{id}/accepter
               → StatutMission : EN_COURS
               → StatutSinistre : EN_REPARATION
               → Notification → Gestionnaire + Client

  [REFUSER]  → PUT /api/missions/{id}/refuser  (motif obligatoire)
               → Système cherche autre garage → retour Étape 4

Après acceptation :
  POST /api/missions/{id}/devis          → Notification Gestionnaire
  POST /api/missions/{id}/photos         → upload photos
  POST /api/missions/{id}/avancement     → maj progression
  POST /api/missions/{id}/facture        → dépôt facture finale
  Statuts d'avancement garage :
    EN_DIAGNOSTIC | EN_COMMANDE_PIECES | EN_REPARATION | REPARATION_TERMINEE
```


### ÉTAPE 7 — Intervention de l'Expert

```
Expert consulte ses missions : GET /api/missions/mes-missions

  PUT /api/missions/{id}/planifier  { datePrevue, heurePrevue }
    → Notification → Garage + Gestionnaire

  PUT /api/missions/{id}/confirmer-arrivee
    → StatutSinistre : EN_EXPERTISE

  POST /api/rapports
    Body: { missionId, constats, evaluationCout, conclusion,
            photos[], signatureNumerique }
    → StatutRapport : DEPOSE
    → StatutSinistre : EN_ATTENTE_VALIDATION
    → Notification → Gestionnaire + Client + Garage

Restrictions expert :
  - Voit UNIQUEMENT ses missions
  - Ne peut PAS modifier données sinistre
  - Ne peut PAS voir les données financières
```

### ÉTAPE 8 — Remorquage (si nécessaire)

```
Gestionnaire crée : POST /api/remorquages
  { sinistreId, localisationDepart, localisationDestination }
  → Notification → TOUS les remorqueurs disponibles dans rayon 30km

Premier remorqueur accepte :
  PUT /api/remorquages/{id}/accepter
  → StatutSinistre : REMORQUAGE_EN_COURS
  → Autres remorqueurs perdent la mission

Suivi :
  EN_ROUTE → ARRIVE_SUR_PLACE → VEHICULE_CHARGE → EN_TRANSIT → LIVRE
  Chaque étape → photo obligatoire + notification Gestionnaire + Client
```


### ÉTAPE 9 — Forum Collaboratif par Dossier

```
Participants autorisés (vérification côté API) :
  • Client propriétaire | Gestionnaire assigné
  • Garage affecté | Expert affecté
  • Remorqueur (si mission active)

API :
  GET  /api/sinistres/{id}/commentaires        → liste messages
  POST /api/sinistres/{id}/commentaires        → nouveau message
  PUT  /api/commentaires/{id}                  → modifier SON message
  DELETE /api/commentaires/{id}               → supprimer SON message

Structure message :
  { id, contenu, auteur{nom,role,photo}, pieceJointe,
    reponses[], createdAt, updatedAt }

Règles :
  - Modifier/supprimer uniquement ses propres messages
  - Gestionnaire peut modérer tout message
  - Pièces jointes : PDF, JPG, PNG (max 10 Mo)
  - Chaque message → Notification → tous participants du forum
```

### ÉTAPE 10 — Validation et Clôture

```
Gestionnaire vérifie checklist :
  ✓ Rapport d'expertise déposé et signé
  ✓ Devis garage validé
  ✓ Facture finale déposée
  ✓ Photos avant/après disponibles

Décisions :
  [APPROUVER] → PUT /api/sinistres/{id}/approuver
                → Statut : APPROUVE
                → Notification → Client + Garage + Expert

  [COMPLÉMENT]→ Statut reste EN_ATTENTE_VALIDATION
                → Message forum + notification

  [CLÔTURER]  → PUT /api/sinistres/{id}/cloturer
                → Statut : CLOTURE
                → Archivage auto tous documents
                → Dossier lecture seule
                → Notification → Client : "Dossier clôturé"
```


---

## 4. TABLEAU DE BORD PAR RÔLE

### CLIENT (/client/dashboard)
- Compteurs : total dossiers / en cours / clôturés / véhicules
- Dossiers en cours avec statut visuel + accès forum
- Notifications récentes
- Historique dossiers clôturés
- Sidebar : Dashboard | Mes Sinistres | Déclarer | Mes Véhicules | Forums | Profil

### GESTIONNAIRE (/gestionnaire/dashboard)
- Compteurs : dossiers actifs / à valider / urgents (>7j) / taux résolution
- Liste prioritaire avec code couleur (rouge/orange/vert)
- Actions rapides : valider, demander complément, affecter garage
- Sidebar : Dashboard | Mes Dossiers | À valider | Urgents | Forums | Stats

### GARAGE (/garage/dashboard)
- Compteurs : missions actives / en cours / nouveaux devis / note moyenne
- Liste missions avec statut + bouton gérer
- Planning du jour (arrivées, visites expert, remises)
- Sidebar : Dashboard | Mes Missions | Devis/Factures | Médiathèque | Planning | Évaluations

### EXPERT (/expert/dashboard)
- Compteurs : expertises ce mois / à planifier / rapports déposés / note
- Calendrier des interventions
- Missions urgentes en attente
- Sidebar : Dashboard | Mes Expertises | Rapports | Calendrier | Forums

### REMORQUEUR (/remorqueur/dashboard)
- Compteurs : missions ce mois / en cours / disponibilité
- Carte interactive avec missions disponibles
- Historique interventions
- Sidebar : Dashboard | Interventions | Carte | Historique

### MANAGER (/manager/dashboard)
- KPI globaux : total sinistres / taux résolution / délai moyen / satisfaction
- Performance garages (tableau comparatif + graphiques)
- Performance experts (note moyenne, délai)
- Évolution mensuelle (graphique courbes)
- Sidebar : Dashboard | Statistiques | Garages | Experts | Rapports | Clients

### ADMINISTRATEUR (/admin/dashboard)
- Gestion utilisateurs (CRUD avec rôles)
- Gestion garages/experts/remorqueurs (CRUD)
- Paramètres système
- Journal d'audit (toutes les actions)
- Archives
- Sidebar : Dashboard | Utilisateurs | Partenaires | Paramètres | Audit | Archives


---

## 5. NOTIFICATIONS AUTOMATIQUES

| Événement | Destinataires |
|---|---|
| Création dossier | Client, Gestionnaire assigné |
| Dossier incomplet | Client |
| Garage sélectionné | Garage, Client |
| Expert affecté | Expert, Gestionnaire, Client |
| Remorquage demandé | Tous remorqueurs disponibles |
| Remorqueur accepté | Gestionnaire, Client, Garage |
| Nouveau message forum | Tous participants du dossier |
| Rapport déposé | Gestionnaire, Client |
| Rapport validé | Expert, Garage |
| Changement de statut | Client + acteurs concernés |
| Dossier clôturé | Client, Gestionnaire, Garage, Expert |

**Position :** Navbar uniquement (badge compteur + dropdown liste)
**Aucune notification dans la Sidebar.**

---

## 6. SÉCURITÉ — MATRICE DES DROITS

| Endpoint | CLIENT | GESTIONNAIRE | GARAGE | EXPERT | REMORQUEUR | MANAGER | ADMIN |
|---|---|---|---|---|---|---|---|
| GET /sinistres | Ses dossiers | Ses dossiers | Ses missions | Ses missions | — | Lecture globale | Tous |
| POST /sinistres | ✓ | ✓ | — | — | — | — | ✓ |
| PUT /sinistres/*/statut | — | ✓ | — | — | — | — | ✓ |
| GET /garages/recommandations | ✓ | ✓ | — | — | — | — | ✓ |
| GET /missions | — | ✓ | Ses missions | Ses missions | — | Lecture | ✓ |
| POST /rapports | — | — | — | ✓ | — | — | ✓ |
| GET /audit-logs | — | — | — | — | — | — | ✓ |
| GET /stats | — | ✓ | — | — | — | ✓ | ✓ |

---

## 7. RÈGLES MÉTIER CRITIQUES

1. Un client ne peut déclarer un sinistre que sur son propre véhicule
2. Le contrat d'assurance doit être actif à la date du sinistre
3. Minimum 1 photo + 1 document justificatif obligatoires
4. L'affectation de l'expert est automatique (le client ne choisit pas)
5. Un dossier CLOTURE ne peut plus être modifié
6. Le garage ne voit jamais les dossiers des autres garages
7. L'expert ne voit que ses expertises assignées
8. Le remorqueur perd la mission dès qu'un autre accepte
9. Le rapport d'expertise est obligatoire avant clôture
10. La facture garage est obligatoire avant validation
