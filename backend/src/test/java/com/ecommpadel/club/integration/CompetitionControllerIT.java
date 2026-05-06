package com.ecommpadel.club.integration;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

class CompetitionControllerIT extends AbstractIntegrationTest {

    private static final String VALID_PIN = "test";
    private static final String INVALID_PIN = "wrong";

    private String createCompetition() {
        return given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "name", "Liga Test",
                "color", "#ff0000",
                "active", true
            ))
        .when()
            .post("/api/competitions")
        .then()
            .statusCode(201)
            .extract().path("id");
    }

    @Test
    void listCompetitions_returns200() {
        given()
        .when()
            .get("/api/competitions")
        .then()
            .statusCode(200);
    }

    @Test
    void createCompetition_returns201_withValidPin() {
        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "name", "Liga Test",
                "color", "#ff0000",
                "active", true
            ))
        .when()
            .post("/api/competitions")
        .then()
            .statusCode(201)
            .body("id", notNullValue())
            .body("name", equalTo("Liga Test"));
    }

    @Test
    void createCompetition_returns401_withInvalidPin() {
        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", INVALID_PIN)
            .body(Map.of(
                "name", "Liga Test",
                "color", "#ff0000",
                "active", true
            ))
        .when()
            .post("/api/competitions")
        .then()
            .statusCode(401);
    }

    @Test
    void updateCompetition_returns200_withValidPin() {
        String id = createCompetition();

        given()
            .contentType(ContentType.JSON)
            .header("X-Admin-Pin", VALID_PIN)
            .body(Map.of(
                "name", "Liga Actualizada",
                "color", "#00ff00",
                "active", true
            ))
        .when()
            .put("/api/competitions/{id}", id)
        .then()
            .statusCode(200)
            .body("name", equalTo("Liga Actualizada"));
    }

    @Test
    void getStats_returns200_whenCompetitionExists() {
        String id = createCompetition();

        given()
        .when()
            .get("/api/competitions/{id}/stats", id)
        .then()
            .statusCode(200);
    }

    @Test
    void deleteCompetition_returns204_withValidPin() {
        String id = createCompetition();

        given()
            .header("X-Admin-Pin", VALID_PIN)
        .when()
            .delete("/api/competitions/{id}", id)
        .then()
            .statusCode(204);
    }

    @Test
    void deleteCompetition_returns404_whenNotFound() {
        given()
            .header("X-Admin-Pin", VALID_PIN)
        .when()
            .delete("/api/competitions/nonexistent")
        .then()
            .statusCode(404);
    }
}
