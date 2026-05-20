package com.ecommpadel.club.integration;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

class MatchdayControllerIT extends AbstractIntegrationTest {

    private static final String VALID_PIN = "test";
    private static final String INVALID_PIN = "wrong";

    private String createMatchday() {
        return given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "title", "Jornada Test",
                "date", "2026-05-10",
                "time", "18:00",
                "venue", "Pista 1",
                "competition", "comp1",
                "round", "1"
            ))
        .when()
            .post("/api/matchdays")
        .then()
            .statusCode(201)
            .extract().path("id");
    }

    @Test
    void createMatchday_returns201_withValidPin() {
        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "title", "Jornada Test",
                "date", "2026-05-10",
                "time", "18:00",
                "venue", "Pista 1",
                "competition", "comp1",
                "round", "1"
            ))
        .when()
            .post("/api/matchdays")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("title", equalTo("Jornada Test"));
    }

    @Test
    void createMatchday_returns401_withInvalidPin() {
        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", INVALID_PIN)
            .body(Map.of(
                "title", "Jornada Test",
                "date", "2026-05-10",
                "time", "18:00",
                "venue", "Pista 1",
                "competition", "comp1",
                "round", "1"
            ))
        .when()
            .post("/api/matchdays")
        .then()
            .statusCode(401);
    }

    @Test
    void listActive_returns200() {
        given()
        .when()
            .get("/api/matchdays/active")
        .then()
            .statusCode(200);
    }

    @Test
    void getMatchdayById_returns200_whenExists() {
        String id = createMatchday();

        given()
        .when()
            .get("/api/matchdays/{id}", id)
        .then()
            .statusCode(200)
            .body("id", equalTo(id));
    }

    @Test
    void getMatchdayById_returns404_whenNotExists() {
        given()
        .when()
            .get("/api/matchdays/nonexistent")
        .then()
            .statusCode(404);
    }

    @Test
    void updateMatchday_returns200_withValidPin() {
        String id = createMatchday();

        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "title", "Jornada Actualizada",
                "date", "2026-05-11",
                "time", "19:00",
                "venue", "Pista 2",
                "competition", "comp1",
                "round", "2"
            ))
        .when()
            .put("/api/matchdays/{id}", id)
        .then()
            .statusCode(200)
            .body("title", equalTo("Jornada Actualizada"));
    }

    @Test
    void registerResponse_returns200() {
        String id = createMatchday();

        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "playerId", "p1",
                "name", "Ana",
                "availability", "AVAILABLE"
            ))
        .when()
            .post("/api/matchdays/{id}/response", id)
        .then()
            .statusCode(200);
    }

    @Test
    void closeMatchday_returns200_withValidPin() {
        String id = createMatchday();

        given()
            .header("X-Admin-Pin", VALID_PIN)
        .when()
            .post("/api/matchdays/{id}/close", id)
        .then()
            .statusCode(200)
            .body("status", equalTo("CLOSED"));
    }

    @Test
    void registerResult_returns200_withValidPin() {
        String id = createMatchday();

        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "outcome", "WIN",
                "finalPlayers", new String[]{"Ana"}
            ))
        .when()
            .post("/api/matchdays/{id}/result", id)
        .then()
            .statusCode(200);
    }

    @Test
    void registerResult_walkover_returns200() {
        String id = createMatchday();

        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "outcome", "WO",
                "finalPlayers", new String[]{}
            ))
        .when()
            .post("/api/matchdays/{id}/result", id)
        .then()
            .statusCode(200)
            .body("status", equalTo("PLAYED"))
            .body("matchResult.outcome", equalTo("WO"));
    }

    @Test
    void createMatchday_persistsRivalTeam() {
        String id = given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "title", "Liga con rival",
                "date", "2026-05-12",
                "time", "20:00",
                "venue", "Pista 1",
                "competition", "comp1",
                "round", "3",
                "rivalTeam", "Padel Club Rivas"
            ))
        .when()
            .post("/api/matchdays")
        .then()
            .statusCode(201)
            .body("rivalTeam", equalTo("Padel Club Rivas"))
            .extract().path("id");

        given()
        .when()
            .get("/api/matchdays/{id}", id)
        .then()
            .statusCode(200)
            .body("rivalTeam", equalTo("Padel Club Rivas"));
    }

    @Test
    void deleteMatchday_returns204_withValidPin() {
        String id = createMatchday();

        given()
            .header("X-Admin-Pin", VALID_PIN)
        .when()
            .delete("/api/matchdays/{id}", id)
        .then()
            .statusCode(204);
    }
}
