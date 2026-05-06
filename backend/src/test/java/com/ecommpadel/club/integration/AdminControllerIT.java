package com.ecommpadel.club.integration;

import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;

class AdminControllerIT extends AbstractIntegrationTest {

    @Test
    void verifyPin_returnsNoContent_whenPinIsValid() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("pin", "test"))
        .when()
            .post("/api/admin/verify-pin")
        .then()
            .statusCode(204);
    }

    @Test
    void verifyPin_returnsUnauthorized_whenPinIsInvalid() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("pin", "wrong"))
        .when()
            .post("/api/admin/verify-pin")
        .then()
            .statusCode(401);
    }
}
