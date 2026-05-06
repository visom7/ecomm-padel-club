package com.ecommpadel.club.integration;

import com.ecommpadel.club.model.BeerRound;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;

class BeerRoundControllerIT extends AbstractIntegrationTest {

    private static final String VALID_PIN = "test";
    private static final String INVALID_PIN = "wrong";

    @Test
    void listPending_returns200() {
        given()
        .when()
            .get("/api/beer-rounds")
        .then()
            .statusCode(200);
    }

    @Test
    void listHistory_returns200() {
        given()
        .when()
            .get("/api/beer-rounds/history")
        .then()
            .statusCode(200);
    }

    @Test
    void getStats_returns200() {
        given()
        .when()
            .get("/api/beer-rounds/stats")
        .then()
            .statusCode(200);
    }

    @Test
    void markPaid_returns204_withValidPin() {
        BeerRound round = new BeerRound("p1", "Ana", "md1", "Jornada 1");
        round.setId("br1");
        BeerRound saved = mongoTemplate.save(round, "beer_rounds");

        given()
            .header("X-Admin-Pin", VALID_PIN)
        .when()
            .delete("/api/beer-rounds/{id}", saved.getId())
        .then()
            .statusCode(204);
    }

    @Test
    void markPaid_returns404_whenNotFound() {
        given()
            .header("X-Admin-Pin", VALID_PIN)
        .when()
            .delete("/api/beer-rounds/nonexistent")
        .then()
            .statusCode(404);
    }

    @Test
    void markPaid_returns401_withInvalidPin() {
        BeerRound round = new BeerRound("p2", "Carlos", "md1", "Jornada 1");
        round.setId("br2");
        mongoTemplate.save(round, "beer_rounds");

        given()
            .header("X-Admin-Pin", INVALID_PIN)
        .when()
            .delete("/api/beer-rounds/br2")
        .then()
            .statusCode(401);
    }
}
