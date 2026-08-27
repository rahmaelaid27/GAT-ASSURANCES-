# GAT Assurances

Plateforme web de gestion des sinistres automobiles et de coordination des partenaires de GAT Assurances.

L'application centralise la declaration des sinistres, le suivi des dossiers, l'affectation des garages et des experts, les interventions de remorquage, les rapports, les notifications et les echanges dans un forum securise.

## Fonctionnalites

- Authentification JWT et routage selon le role
- Gestion des clients, contrats, vehicules et sinistres
- Instruction des dossiers par les gestionnaires
- Affectation des garages et gestion des missions
- Expertises, rapports et interventions de remorquage
- Notifications, evaluations, archives et audits
- Forum collaboratif par dossier
- Tableaux de bord adaptes a chaque profil

## Roles utilisateurs

| Role | Responsabilite |
| --- | --- |
| Client | Gerer ses vehicules et declarer ses sinistres |
| Gestionnaire | Instruire et coordonner les dossiers |
| Garage | Realiser les missions de reparation |
| Expert | Evaluer les dommages et produire les rapports |
| Remorqueur | Transporter les vehicules |
| Manager | Consulter les indicateurs globaux |
| Administrateur | Administrer les utilisateurs et la configuration |

## Technologies

- **Frontend :** Angular 18, TypeScript, RxJS, Tailwind CSS, SweetAlert2
- **Backend :** Java 17, Spring Boot 3.2, Spring MVC, Spring Data JPA, Spring Security
- **Base de donnees :** MySQL 8 et Hibernate
- **Securite :** JWT
- **API :** REST avec documentation OpenAPI / Swagger

## Architecture

```text
Angular 18  -- HTTP/JSON + JWT -->  API REST Spring Boot 3.2  -->  MySQL
```

## Installation

Prerequis : Java 17+, Maven 3.9+, Node.js 18.19+, npm et MySQL 8+.

### Base de donnees

```sql
CREATE DATABASE gat_assurances CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Le script d'initialisation est disponible dans `gat-assurances-backend/src/main/resources/db/init.sql`.
Adapter les valeurs de connexion dans `gat-assurances-backend/src/main/resources/application.properties`.

### Backend

```powershell
cd gat-assurances-backend
mvn clean install
mvn spring-boot:run
```

API : `http://localhost:8081/api`

Swagger : `http://localhost:8081/api/swagger-ui.html`

### Frontend

```powershell
cd gat-assurances-frontend
npm install
npm start
```

Application : `http://localhost:4200`

L'URL de l'API est configuree dans `src/environments/environment.ts`.

## Commandes utiles

Dans `gat-assurances-frontend` :

```powershell
npm start
npm run build
npm test
npm run lint
```

Dans `gat-assurances-backend` :

```powershell
mvn test
mvn clean package
```

## Workflow principal

1. Le client declare un sinistre.
2. Le gestionnaire instruit le dossier.
3. Un garage est recommande puis affecte.
4. Une mission d'expertise ou de reparation est creee.
5. Les partenaires echangent via le forum et mettent a jour la mission.
6. Le gestionnaire valide la reparation, puis le dossier peut etre cloture et archive.

Le workflow detaille est documente dans [WORKFLOW_METIER.md](gat-assurances-backend/WORKFLOW_METIER.md).

La charte graphique et les regles d'interface sont disponibles dans [CHARTE_GRAPHIQUE.md](CHARTE_GRAPHIQUE.md).

## Structure du depot

```text
.
|-- gat-assurances-backend/   API Spring Boot et acces MySQL
|-- gat-assurances-frontend/  Interface Angular
|-- .github/                  Configuration GitHub
`-- README.md
```

## Git

Branche principale : `main`

Depot distant : https://github.com/rahmaelaid27/GAT-ASSURANCES-.git

```powershell
git pull origin main
git add .
git commit -m "Decrire la modification"
git push origin main
```

## Securite

Ne pas commiter de mots de passe, de secrets JWT ou de donnees reelles. Les valeurs de configuration locales doivent etre remplacees par des secrets geres par l'environnement avant tout deploiement.