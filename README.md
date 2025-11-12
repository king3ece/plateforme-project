# plateforme

## Apercu
Plateforme web de gestion des demandes internes (FDM, bons pour, rapports financiers, demandes d achat, etc.) construite sur Spring Boot et React. Le backend applique les workflows de validation (multi-validateurs, emailings) et le frontend offre des formulaires riches, des tableaux de suivi et des ecrans de validation par onglets.

## Fonctionnalites livrees
- **FDM** : flux complet cote backend (`/api/fdms`) avec validations metier, calculs de duree/totaux, envoi d email au validateur suivant. Front : formulaire react-hook-form, onglet “Mes demandes” et “A valider” avec recherche, badges de statut et detail complet.
- **Bon Pour** :
  - Backend (`/api/bonpours`) utilise l utilisateur connecte, calcule le montant total et retourne l objet cree.
  - Front : formulaire, onglet “Bon pour” dans *Mes demandes* + onglet de validation dedie (actions valider/rejeter/a corriger, affichage des lignes, commentaires).
- **Rapport financier de mission (RFDM)** :
  - Nouvelles entites (`RapportFinancierDeMission`, `TraitementRapportFinancierDeMission`), repository, service et controller (`/api/rfdms`).
  - Meme logique de workflow : validations fortes, calcul des depenses, notifications email.
  - Front : formulaire branche sur `RapportFinancierAPI`, onglets de listing/validation avec detail des couts.
- **Demande d achat (DDA)** :
  - Entites (`DemandeDachat`, `LigneDemandeAchat`, `TraitementDemandeDachat`), repository, service et controller (`/api/ddas`).
  - Gestion des lignes, calcul du montant total, workflow complet.
  - Front : formulaire dynamique, onglets “Demandes d achat” (suivi) et “A valider”.
- **Onglets unifies** : la page *Mes demandes* et la page *Validation* affichent maintenant quatre onglets (FDM / Bon pour / RFDM / DDA) partageant la mise en forme (tableaux, cartes, dialogues de detail reutilisant `RequestDetailContent`).
- **APIs front** : nouveaux clients `frontend/src/api/rfdm.ts` et `frontend/src/api/dda.ts` + evolution de `fdm.ts`/`bonpour.ts`.
- **Tests Vitest** :
  - `src/api/__tests__/fdm.test.ts`, `rfdm.test.ts`, `dda.test.ts` pour garantir les endpoints utilises.
  - `src/components/requests/__tests__/FicheDescirptiveDeMissionForm.test.tsx` couvre la logique de formulaire.
- README en ASCII detaille l ensemble des workflows, endpoints et scripts.

## Backend
- Stack : Java 17, Spring Boot, Spring Security (JWT), Hibernate/JPA.
- Lancement local (base H2 en memoire configuree par defaut) :
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```
- Comptes seeds (`DefaulUsersInitializer`) :
  - Admin : `admin@plateforme.com / admin123`
  - Utilisateur : `user@plateforme.com / puser123`
- **Process codes requis** : pensez a creer dans `type_processus` les codes `FDM`, `BONPOUR`, `RFDM`, `DDA` pour que la recuperation des validateurs fonctionne correctement.
- Build Maven : `./mvnw -q -DskipTests package`. (Sur un JDK < 21, Maven leve une erreur “release version 21 not supported”.)

## Frontend
- Stack : React 18 + Vite + TypeScript + Tailwind/Shadcn UI.
- Installation et dev server :
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Build production : `npm run build` (sortie dans `frontend/build`).

## Tests frontend
- Vitest + Testing Library configure via `vite.config.ts` et `src/setupTests.ts`.
- Lancer tous les tests :
  ```bash
  cd frontend
  npm run test -- --run
  ```

## Notes complementaires
- Le front consomme l API via `axiosInstance` (`http://localhost:9090/api`) avec token JWT depuis `localStorage`.
- Les services backend notifient les validateurs par email via la configuration SMTP exposee dans `backend/src/main/resources/application.properties`.
- Les formulaires utilisent `react-hook-form`. Les champs numeriques sont normalises avant l appel API (cf. `MissionForm`, `DemandeAchatForm`), pensez a conserver cette approche pour les prochains formulaires.
