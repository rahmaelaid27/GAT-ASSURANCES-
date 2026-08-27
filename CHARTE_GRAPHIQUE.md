# Charte graphique GAT Assurances

Version 1.0 - 27 aout 2026

## 1. Identite

GAT Assurances est une plateforme professionnelle de gestion des sinistres automobiles et de coordination des partenaires. L'interface doit inspirer confiance, clarte et efficacite operationnelle.

Principes de design :

- Professionnel : hierarchie visuelle nette et contenus faciles a scanner
- Humain : messages simples, statuts compréhensibles et retours d'action visibles
- Fiable : contrastes lisibles, etats explicites et absence de decoration inutile
- Coherent : memes composants et memes conventions pour tous les roles

## 2. Logo et marque

Le logo GAT est la reference de la marque :

- G : violet GAT
- A : rouge GAT
- T : or GAT
- Mention ASSURANCES : rouge

Regles :

- Conserver une zone de protection autour du logo au moins egale a la hauteur du symbole G.
- Ne pas deformer, incliner ou recolorer le logo.
- Sur fond sombre, utiliser une version claire ou un panneau blanc permettant sa lecture.
- Afficher le logo dans la barre laterale et l'identite GAT dans la barre superieure.

## 3. Palette de couleurs

### Couleurs de marque

| Nom | Hexadecimal | Usage |
| --- | --- | --- |
| Violet GAT | `#6B2D8B` | Couleur principale, liens, focus, navigation active |
| Violet fonce | `#4A1A6B` | Survol, texte de marque, fonds profonds |
| Violet clair | `#9B4DBB` | Accents secondaires et etats actifs legers |
| Rouge GAT | `#E5162A` | Actions critiques, alertes et accent de marque |
| Rouge fonce | `#B5101F` | Survol des actions rouges |
| Or GAT | `#F5A623` | Garage, attention, progression et notation |
| Or fonce | `#D4891A` | Texte ou bouton or sur fond clair |
| Magenta | `#C4187A` | Accent secondaire et variations de la marque |

### Couleurs d'interface

| Nom | Hexadecimal | Usage |
| --- | --- | --- |
| Fond application | `#F8F7FB` | Arriere-plan general |
| Fond secondaire | `#F3F0F8` | Zones secondaires et survol leger |
| Bordure | `#E8E2F0` | Separateurs, champs et cartes |
| Texte principal | `#1A0830` | Titres et informations prioritaires |
| Texte courant | `#374151` | Paragraphes et donnees |
| Texte secondaire | `#6B7280` | Libelles, aides et dates |
| Blanc | `#FFFFFF` | Cartes, champs et surfaces principales |

### Couleurs semantiques

- Succes : `#16A34A` avec fond `#F0FDF4`
- Information : `#2563EB` avec fond `#EFF6FF`
- Attention : `#D4891A` avec fond `#FFFBEB`
- Erreur : `#E5162A` avec fond `#FFF1F2`

Toujours associer une couleur a un libelle, une icone ou un changement d'etat. La couleur seule ne doit pas porter une information critique.

## 4. Typographie

Police principale : **Poppins**.

| Niveau | Graisse | Taille indicative | Usage |
| --- | --- | --- | --- |
| Titre de page | 700 | 24 a 28 px | Nom de l'ecran |
| Titre de section | 600 | 18 a 20 px | Groupes de contenu |
| Sous-titre | 500 | 14 a 16 px | Contexte et descriptions |
| Corps | 400 | 14 px | Donnees et paragraphes |
| Aide | 400 | 12 px | Dates, aides et metadonnees |
| KPI | 700 ou 800 | 30 a 36 px | Valeurs importantes |

Regles :

- Utiliser une seule famille de caracteres dans l'application.
- Garder une hauteur de ligne confortable, environ 1.4 a 1.6 pour le texte courant.
- Eviter les titres tout en majuscules, sauf pour les en-tetes courts de tableaux.
- Ne pas utiliser de texte gris clair sur fond blanc pour une information importante.

## 5. Mise en page

- Barre superieure : hauteur stable de 56 a 64 px.
- Barre laterale : largeur stable de 220 a 240 px sur desktop.
- Contenu : gouttiere de 24 px sur desktop et 16 px sur mobile.
- Grille : utiliser des colonnes de 2 a 4 elements selon la largeur disponible.
- Espacements : privilegier une echelle de 4, 8, 12, 16, 24 et 32 px.
- Cartes : rayon maximum recommande de 12 px, bordure fine et ombre discrete.
- Ne pas imbriquer plusieurs cartes decoratives.
- Les tableaux doivent rester lisibles sur mobile avec defilement horizontal.

## 6. Composants

### Boutons

- Primaire : fond violet GAT, texte blanc.
- Action principale de marque : degrade violet vers rouge uniquement pour les actions majeures.
- Garage : accent or pour les actions liees aux missions.
- Destructif : rouge GAT, avec confirmation pour les suppressions.
- Secondaire : fond blanc, bordure violette ou grise.
- Desactiver visuellement et fonctionnellement un bouton pendant une requete.
- Chaque bouton doit avoir un libelle d'action explicite.

### Cartes KPI

- Libelle court en texte secondaire.
- Valeur grande et contrastee.
- Un accent de bordure ou de couleur suffit.
- Afficher `N/A` lorsqu'aucune donnee n'est disponible, jamais une valeur inventee.
- Les valeurs doivent provenir d'un endpoint et etre rafraichies lorsque les donnees peuvent changer.

### Formulaires

- Label visible au-dessus de chaque champ.
- Placeholder complementaire, jamais utilise comme seul label.
- Bordure `#E8E2F0` au repos.
- Focus violet avec contour visible.
- Erreur proche du champ, en rouge, avec une explication courte.
- Conserver la saisie apres une erreur serveur.

### Navigation

- Element actif : fond violet translucide et texte blanc.
- Icone coherente avec le libelle.
- Les liens de la barre laterale restent identiques pour un role donne.
- Le profil et les notifications sont accessibles depuis la barre superieure.

### Notifications

- Badge rouge pour les notifications non lues.
- Trier les notifications de la plus recente a la plus ancienne.
- Afficher titre, message, date et etat lu/non lu.
- Rafraichir le compteur et la liste periodiquement.
- Une notification doit conduire vers le contexte concerne lorsqu'un identifiant de dossier existe.

### Statuts metier

Utiliser une pastille avec texte :

- En cours : bleu
- En attente : or
- Valide ou termine : vert
- Refuse ou erreur : rouge
- Archive : gris

Les libelles affiches doivent etre humains et en francais, meme si la valeur technique de l'API est en majuscules avec des underscores.

## 7. Variantes par role

| Role | Accent d'interface | Priorite visuelle |
| --- | --- | --- |
| Client | Violet | Suivi du dossier et actions simples |
| Gestionnaire | Rouge | Priorites, urgences et validations |
| Garage | Or | Missions, devis et reparation |
| Expert | Bleu / or | Expertises, rapports et planification |
| Remorqueur | Vert / bleu | Demandes disponibles et progression terrain |
| Manager | Violet | KPI globaux et comparaison |
| Administrateur | Cyan / violet | Administration et controle |

La variation par role reste un accent. La structure, la typographie et les composants restent communs a toute la plateforme.

## 8. Motion et retours d'etat

- Apparition de page : fondu court, 200 a 400 ms.
- Chargement : skeleton ou spinner dans la zone concernee.
- Mise a jour d'un KPI : transition douce, sans deplacement de la page.
- Action reussie : notification non bloquante.
- Erreur : message persistant jusqu'a comprehension ou fermeture.
- Respecter `prefers-reduced-motion` pour les utilisateurs qui le demandent.

## 9. Responsive et accessibilite

- Tester au minimum 1440 px, 1024 px, 768 px et 390 px.
- La barre laterale devient repliable sur petit ecran.
- Aucun texte ne doit depasser de son conteneur.
- Contraste minimal vise : 4.5:1 pour le texte courant.
- Tous les champs et boutons doivent etre utilisables au clavier.
- Les etats de focus doivent rester visibles.
- Les images et icones porteuses d'information ont un texte alternatif.

## 10. Tokens existants

Les tokens principaux sont definis dans `gat-assurances-frontend/src/styles.css` et `gat-assurances-frontend/tailwind.config.js`. Toute nouvelle couleur ou ombre doit etre ajoutee a ces fichiers plutot que definie localement dans plusieurs composants.

Les noms recommandes sont : `gat-violet`, `gat-red`, `gat-gold`, `gat-magenta`, `gat-gray`, `gat-gray-border` et `gat-dark`.

## 11. Checklist avant livraison

- [ ] Le composant utilise les couleurs et la police de la charte.
- [ ] Les etats chargement, vide, erreur et succes sont traites.
- [ ] Les textes restent lisibles sur desktop et mobile.
- [ ] Le focus clavier est visible.
- [ ] Les actions critiques demandent confirmation.
- [ ] Les KPI affichent une source de donnees dynamique.
- [ ] Les notifications sont reliees au bon role et au bon contexte.
- [ ] Aucun secret ou identifiant sensible n'est affiche dans l'interface.
