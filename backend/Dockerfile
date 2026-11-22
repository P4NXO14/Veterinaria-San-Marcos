FROM maven:3.9-eclipse-temurin-17 AS compilacion

ARG SERVICE
WORKDIR /app

COPY backend/${SERVICE}/pom.xml ./pom.xml
COPY backend/${SERVICE}/src ./src

RUN mvn -B -ntp -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=compilacion /app/target/*.jar app.jar

ENTRYPOINT ["java","-jar","app.jar"]