# =========================
# Stage 1 : Build (construction de l’application)
# =========================

# Utilisation d’une image Maven avec Java 17 (Alpine = légère)
FROM maven:3.9-eclipse-temurin-17-alpine AS build

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie uniquement du fichier pom.xml pour profiter du cache Docker
# (les dépendances ne seront pas re-téléchargées si pom.xml ne change pas)
COPY pom.xml .

# Copie du code source de l’application
COPY src ./src

# Compilation du projet et génération du fichier .jar
# -DskipTests : ignore les tests pour accélérer le build
# -B : mode batch (non interactif, utile pour Docker)
RUN mvn package -DskipTests -B


# =========================
# Stage 2 : Run (exécution de l’application)
# =========================

# Image légère contenant uniquement le runtime Java 17 (pas Maven)
FROM eclipse-temurin:17-jre-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copie du fichier .jar généré depuis l’étape de build
COPY --from=build /app/target/gmpp-backend.jar app.jar

# Exposition du port utilisé par l’application Spring Boot
EXPOSE 8080

# Commande de lancement de l’application au démarrage du conteneur
ENTRYPOINT ["java", "-jar", "/app/app.jar"]