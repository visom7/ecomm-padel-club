package com.ecommpadel.club.integration;

import com.ecommpadel.club.model.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;

class PlayerControllerIT extends AbstractIntegrationTest {

    @BeforeEach
    void insertPlayer() {
        Player player = new Player();
        player.setId("p1");
        player.setName("TestPlayer");
        player.setRole(Player.Role.PLAYER);
        mongoTemplate.save(player, "players");
    }

    @Test
    void listPlayers_returnsOk() {
        given()
        .when()
            .get("/api/players")
        .then()
            .statusCode(200)
            .body("$", hasSize(greaterThanOrEqualTo(1)));
    }

    @Test
    void searchPlayer_returnsPlayer_whenFound() {
        given()
            .queryParam("name", "TestPlayer")
        .when()
            .get("/api/players/search")
        .then()
            .statusCode(200)
            .body("name", is("TestPlayer"));
    }

    @Test
    void searchPlayer_returnsNotFound_whenMissing() {
        given()
            .queryParam("name", "Nadie")
        .when()
            .get("/api/players/search")
        .then()
            .statusCode(404);
    }

    @Test
    void getStats_returnsOk() {
        given()
        .when()
            .get("/api/players/stats")
        .then()
            .statusCode(200);
    }
}
