# Guide d'Installation et de Lancement - Plateforme IDS

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Installation du Backend](#installation-du-backend)
4. [Installation du Frontend](#installation-du-frontend)
5. [Configuration](#configuration)
6. [Lancement de l'application](#lancement-de-lapplication)
7. [Vérification de l'installation](#vérification-de-linstallation)
8. [Comptes par défaut](#comptes-par-défaut)
9. [Dépannage](#dépannage)

---

## Vue d'ensemble

**Plateforme IDS** est une application web full-stack pour la gestion des demandes internes comprenant :

- **Backend** : Spring Boot 3.4.2 avec Java 21, Spring Security (JWT), JPA/Hibernate
- **Frontend** : React 18 + Vite + TypeScript + Tailwind CSS + Shadcn UI
- **Base de données** : PostgreSQL (ou H2 en mémoire pour le développement)

### Fonctionnalités principales

- Gestion des Fiches Descriptives de Mission (FDM)
- Gestion des Bons Pour
- Gestion des Rapports Financiers de Mission (RFDM)
- Gestion des Demandes d'Achat (DDA)
- Système de validation multi-niveaux avec notifications par email

---

## Prérequis

### Logiciels requis

#### Pour le Backend

- **Java Development Kit (JDK) 21** ou supérieur

  - Téléchargement : [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) ou [OpenJDK](https://adoptium.net/)
  - Vérifier l'installation : `java -version`

- **Maven 3.8+** (inclus via Maven Wrapper dans le projet)

  - Vérifier l'installation : `./mvnw -version` (Linux/Mac) ou `mvnw.cmd -version` (Windows)

- **PostgreSQL 14+** (optionnel - H2 peut être utilisé pour le développement)
  - Téléchargement : [PostgreSQL](https://www.postgresql.org/download/)
  - Ou installer via Docker : `docker run --name postgres-plateforme -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

#### Pour le Frontend

- **Node.js 18+** et **npm 9+**
  - Téléchargement : [Node.js](https://nodejs.org/)
  - Vérifier l'installation : `node -v` et `npm -v`

#### Outils recommandés

- **Git** pour cloner le repository
- **IDE** : IntelliJ IDEA (backend), VS Code (frontend)
- **Postman** ou **cURL** pour tester les APIs

---

## Installation du Backend

### Étape 1 : Naviguer vers le répertoire backend

```bash
cd backend
```

### Étape 2 : Configuration de la base de données

#### Option A : Utiliser PostgreSQL (Recommandé pour la production)

1. **Créer la base de données**

```sql
CREATE DATABASE plateforme_ids;
```

2. **Copier le fichier de configuration exemple**

```bash
# Sur Linux/Mac
cp .env.example .env

# Sur Windows
copy .env.example .env
```

3. **Éditer le fichier `.env`** avec vos informations :

```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/plateforme_ids
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=votre_mot_de_passe

MAIL_HOST=mail.idstechnologie.com
MAIL_PORT=465
MAIL_USERNAME=votre_email@idstechnologie.com
MAIL_PASSWORD=votre_mot_de_passe_email

JWT_SECRET_KEY=votre_cle_secrete_jwt
JWT_EXPIRATION=86400000

APP_BASE_URL=http://localhost:9091/
SERVER_PORT=9091

SPRING_PROFILES_ACTIVE=dev
```

4. **Modifier `application.properties`** pour utiliser PostgreSQL :

Dans `backend/src/main/resources/application.properties`, décommentez les lignes PostgreSQL :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/plateforme_ids
spring.datasource.username=postgres
spring.datasource.password=votre_mot_de_passe
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

#### Option B : Utiliser H2 (Pour développement rapide)

Modifier `application.properties` pour activer H2 :

```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL;
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=create
spring.h2.console.enabled=true
```

### Étape 3 : Configuration JWT

Générer une clé secrète JWT :

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Copier la clé générée dans `application.properties` :

```properties
app.jwt.secret=VOTRE_CLE_GENEREE_ICI
app.jwt.expiration=32400000
```

### Étape 4 : Configuration Email (Optionnel)

Pour activer les notifications par email, configurer dans `application.properties` :

```properties
spring.mail.host=mail.idstechnologie.com
spring.mail.port=465
spring.mail.username=votre_email@idstechnologie.com
spring.mail.password=votre_mot_de_passe
spring.mail.smtp.ssl.enable=true
spring.mail.smtp.auth=true
```

### Étape 5 : Installer les dépendances et compiler

```bash
# Linux/Mac
./mvnw clean install

# Windows
mvnw.cmd clean install
```

---

## Installation du Frontend

### Étape 1 : Naviguer vers le répertoire frontend

```bash
cd frontend
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

### Étape 3 : Configuration de l'API

Le frontend est configuré pour se connecter à l'API backend sur `http://localhost:9091/api`.

Si vous utilisez un autre port, modifier le fichier `frontend/src/api/axios.ts` :

```typescript
const axiosInstance = axios.create({
  baseURL: "http://localhost:VOTRE_PORT/api",
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## Configuration

### Structure de la base de données

Le backend initialise automatiquement :

- Les tables nécessaires (via Hibernate DDL auto)
- Les utilisateurs par défaut (via `DefaultUsersInitializer`)
- Les types de processus requis : `FDM`, `BONPOUR`, `RFDM`, `DDA`

### Données initiales importantes

**IMPORTANT** : Assurez-vous que les codes de processus suivants existent dans la table `type_processus` :

- `FDM` - Fiche Descriptive de Mission
- `BONPOUR` - Bon Pour
- `RFDM` - Rapport Financier de Mission
- `DDA` - Demande d'Achat

Ces codes sont nécessaires pour le bon fonctionnement du système de validation.

---

## Lancement de l'application

### Méthode 1 : Lancement séparé (Recommandé pour le développement)

#### Terminal 1 : Lancer le Backend

```bash
cd backend

# Linux/Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

Le backend sera accessible sur : **http://localhost:9091**

#### Terminal 2 : Lancer le Frontend

```bash
cd frontend
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173** (ou un autre port si 5173 est occupé)

### Méthode 2 : Build production

#### Backend

```bash
cd backend

# Linux/Mac
./mvnw clean package -DskipTests

# Windows
mvnw.cmd clean package -DskipTests
```

Puis exécuter :

```bash
java -jar target/plateforme-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
cd frontend
npm run build
```

Les fichiers de production seront dans `frontend/build/`

Pour servir les fichiers statiques, utiliser un serveur web (nginx, Apache, ou `npx serve build`).

---

## Vérification de l'installation

### Backend

1. **Vérifier que le serveur est lancé** :

```bash
curl http://localhost:9091/api/health
```

2. **Consulter la console H2** (si H2 est activé) :

   - URL : http://localhost:9091/h2-console
   - JDBC URL : `jdbc:h2:mem:testdb`
   - Username : `sa`
   - Password : (laisser vide)

3. **Tester l'authentification** :

```bash
curl -X POST http://localhost:9091/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@plateforme.com","password":"admin123"}'
```

### Frontend

1. Ouvrir le navigateur sur http://localhost:5173
2. Vous devriez voir la page de connexion
3. Connexion avec les comptes par défaut (voir section ci-dessous)

### Tests automatisés

#### Backend

```bash
cd backend
./mvnw test
```

#### Frontend

```bash
cd frontend
npm run test
```

---

## Comptes par défaut

Le système crée automatiquement les comptes suivants au démarrage (via `DefaultUsersInitializer`) :

| Email                | Mot de passe | Rôle  |
| -------------------- | ------------ | ----- |
| admin@plateforme.com | admin123     | ADMIN |
| user@plateforme.com  | puser123     | USER  |

**IMPORTANT** : Changez ces mots de passe en production !

---

## Dépannage

### Problème : Erreur "release version 21 not supported"

**Cause** : Votre JDK est inférieur à la version 21.

**Solution** :

1. Installer JDK 21 : https://adoptium.net/
2. Configurer JAVA_HOME :

   ```bash
   # Linux/Mac
   export JAVA_HOME=/path/to/jdk-21
   export PATH=$JAVA_HOME/bin:$PATH

   # Windows
   set JAVA_HOME=C:\path\to\jdk-21
   set PATH=%JAVA_HOME%\bin;%PATH%
   ```

### Problème : Le frontend ne se connecte pas au backend

**Vérifications** :

1. Le backend est bien lancé sur le port 9091
2. Vérifier l'URL dans `frontend/src/api/axios.ts`
3. Désactiver les bloqueurs de CORS dans le navigateur ou configurer CORS dans le backend

### Problème : Erreur de connexion à PostgreSQL

**Solutions** :

1. Vérifier que PostgreSQL est lancé : `sudo systemctl status postgresql`
2. Vérifier les credentials dans `application.properties`
3. Vérifier que la base de données existe : `psql -U postgres -c "\l"`
4. Créer la base si nécessaire : `createdb plateforme_ids`

### Problème : npm install échoue

**Solutions** :

1. Nettoyer le cache npm : `npm cache clean --force`
2. Supprimer node_modules et package-lock.json :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Utiliser une version compatible de Node.js (18+)

### Problème : Les emails ne sont pas envoyés

**Vérifications** :

1. Configuration SMTP correcte dans `application.properties`
2. Firewall/antivirus ne bloque pas le port 465/587
3. Credentials email valides
4. Activer "Application moins sécurisée" si Gmail

### Problème : Erreur 401 Unauthorized

**Solutions** :

1. Vérifier que le token JWT est stocké dans localStorage
2. Se reconnecter pour obtenir un nouveau token
3. Vérifier que la clé JWT est la même entre le backend et les tokens générés

---

## Architecture des APIs

Le backend expose les endpoints suivants :

### Authentification

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Informations utilisateur connecté

### FDM (Fiches Descriptives de Mission)

- `GET /api/fdms` - Liste des FDM
- `POST /api/fdms` - Créer une FDM
- `GET /api/fdms/{id}` - Détails d'une FDM
- `PUT /api/fdms/{id}` - Modifier une FDM
- `DELETE /api/fdms/{id}` - Supprimer une FDM
- `POST /api/fdms/{id}/valider` - Valider une FDM
- `POST /api/fdms/{id}/rejeter` - Rejeter une FDM

### Bons Pour

- `GET /api/bonpours` - Liste des bons pour
- `POST /api/bonpours` - Créer un bon pour
- `GET /api/bonpours/{id}` - Détails d'un bon pour
- Actions de validation similaires aux FDM

### RFDM (Rapports Financiers)

- `GET /api/rfdms` - Liste des RFDM
- `POST /api/rfdms` - Créer un RFDM
- Endpoints similaires aux FDM

### DDA (Demandes d'Achat)

- `GET /api/ddas` - Liste des DDA
- `POST /api/ddas` - Créer une DDA
- Endpoints similaires aux FDM

---

## Ressources supplémentaires

### Documentation du projet

- [README.md](README.md) - Vue d'ensemble du projet
- [PLAN_NAVIGATION_DETAILLE.md](PLAN_NAVIGATION_DETAILLE.md) - Architecture et navigation
- [GUIDE_TEST_FDM_DEAC.md](GUIDE_TEST_FDM_DEAC.md) - Guide de test
- [TODO_PROCHAINES_ETAPES.md](TODO_PROCHAINES_ETAPES.md) - Roadmap

### Technologies utilisées

#### Backend

- Spring Boot 3.4.2
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL / H2
- Lombok
- JavaMail

#### Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn UI
- Axios
- React Hook Form
- React Router
- Recharts

---

## Support

Pour toute question ou problème :

1. Consulter la section [Dépannage](#dépannage)
2. Vérifier les logs dans la console
3. Contacter l'équipe de développement IDS Technologie

---

**Version du document** : 1.0
**Dernière mise à jour** : 12 décembre 2024
