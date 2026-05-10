# 🚀 GMPP — Gestion de Maintenance Préventive Planifiée

## 📌 Description GitHub

> Application Full Stack de gestion de maintenance préventive industrielle développée avec Spring Boot, React et PostgreSQL. GMPP permet la planification des interventions, le suivi des équipements, la gestion des techniciens et l’analyse des performances de maintenance.

---

# 🏭 GMPP — Gestion de Maintenance Préventive Planifiée

## 📖 À propos du projet

GMPP est une plateforme web Full Stack dédiée à la gestion de la maintenance préventive dans un environnement industriel.

L’objectif principal de cette application est d’aider les entreprises à :

* Planifier les interventions de maintenance
* Suivre l’état des machines industrielles
* Gérer les techniciens et responsables
* Réduire les temps d’arrêt des équipements
* Centraliser les données de maintenance
* Générer des rapports et indicateurs de performance

L’application a été développée dans le cadre d’un projet de transformation digitale industrielle.

---

# ✨ Fonctionnalités principales

## 🔐 Authentification & Sécurité

* Authentification sécurisée avec JWT
* Gestion des rôles et permissions
* Protection des routes API
* Gestion des sessions utilisateurs

---

## 👨‍💼 Administration

* Gestion des utilisateurs
* Création et modification des comptes
* Attribution des rôles
* Gestion des machines industrielles
* Gestion des points de maintenance

---

## 🛠️ Gestion des interventions

* Création des interventions
* Planification automatique des maintenances
* Affectation des techniciens
* Suivi du statut des interventions
* Validation des interventions
* Historique complet des opérations

---

## 📊 Dashboard & KPIs

* Taux de disponibilité des machines
* Suivi des retards
* Statistiques des interventions
* Analyse des coûts de maintenance
* Tableaux et graphiques interactifs

---

## 📅 Calendrier de maintenance

* Vue calendrier des interventions
* Gestion des tâches quotidiennes
* Planification intelligente
* Visualisation des maintenances futures

---

## 📁 Gestion des fichiers

* Upload de photos d’intervention
* Stockage persistant avec Docker Volumes
* Gestion des documents techniques

---

## 📄 Export & Reporting

* Export PDF
* Export CSV
* Export XLSX
* Génération de rapports industriels

---

# 🧱 Architecture du projet

```text
Frontend (React + Vite + MUI)
           ↓
REST API (Spring Boot)
           ↓
PostgreSQL Database
```

---

# ⚙️ Stack Technique

## 🎨 Frontend

* React 18
* Vite
* Material UI (MUI)
* FullCalendar
* Axios
* React Router

## 🔧 Backend

* Spring Boot 3
* Java 17
* Spring Security
* JWT Authentication
* Spring Data JPA
* Maven

## 🗄️ Base de données

* PostgreSQL 15

## 🐳 DevOps & Outils

* Docker
* Docker Compose
* GitHub Actions
* Swagger / OpenAPI

---

# 📂 Structure du projet

```bash
GMPP/
│
├── backend/                # API Spring Boot
├── frontend/               # Application React
├── uploads/                # Fichiers uploadés
├── docker-compose.yml      # Configuration Docker
├── README.md
│
└── .github/workflows/      # CI/CD GitHub Actions
```

---

# 🚀 Installation & Lancement

## 📌 Prérequis

Avant de commencer, assurez-vous d’avoir installé :

* Docker
* Docker Compose

---

## ▶️ Lancer le projet

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/USERNAME/GMPP.git
cd GMPP
```

### 2️⃣ Démarrer les conteneurs

```bash
docker-compose up --build
```

### 3️⃣ Accéder à l’application

Frontend :

```text
http://localhost
```

Backend API :

```text
http://localhost:8080
```

Swagger Documentation :

```text
http://localhost:8080/swagger-ui.html
```

---

# 🔑 Comptes de démonstration

| Rôle           | Email                                               | Mot de passe |
| -------------- | --------------------------------------------------- | ------------ |
| Administrateur | [admin@gmpp.com](mailto:admin@gmpp.com)             | admin123     |
| Responsable    | [responsable@gmpp.com](mailto:responsable@gmpp.com) | resp123      |
| Technicien     | [tech1@gmpp.com](mailto:tech1@gmpp.com)             | tech123      |

---

# 🛡️ Sécurité

* Authentification JWT
* Gestion des accès par rôle
* Validation des requêtes
* Protection des endpoints sensibles

---

# 📈 Améliorations futures

* Notifications en temps réel
* Maintenance prédictive avec IA
* Intégration IoT
* Application mobile
* Tableau de bord avancé
* Gestion multi-sites industriels

---

# 🧪 Tests

Le projet contient des tests d’intégration pour les endpoints critiques utilisant :

* MockMvc
* Spring Boot Test

---

# 🔄 CI/CD

Le projet inclut un workflow GitHub Actions permettant :

* L’automatisation des tests
* La vérification du build
* Le contrôle qualité du projet

---

# 👨‍💻 Auteurs

Projet réalisé dans le cadre d’un projet académique en Transformation Digitale Industrielle.

---

# 📜 Licence

Ce projet est destiné à un usage éducatif et académique.
