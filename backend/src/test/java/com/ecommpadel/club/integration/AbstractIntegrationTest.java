package com.ecommpadel.club.integration;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.MongoDBContainer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = "app.admin-pin=test")
public abstract class AbstractIntegrationTest {

    // Singleton pattern: container started once for all test classes in the JVM
    static final MongoDBContainer mongo;

    static {
        mongo = new MongoDBContainer("mongo:7");
        mongo.start();
    }

    @DynamicPropertySource
    static void mongoProps(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongo::getReplicaSetUrl);
    }

    @LocalServerPort
    int port;

    @Autowired
    MongoTemplate mongoTemplate;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        mongoTemplate.getDb().drop();
    }
}
