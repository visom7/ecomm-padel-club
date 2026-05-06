# ecomm-padel-club — Backend

Spring Boot 3.4.4 · Java 25 · MongoDB

## Requirements

- Java 25
- Maven 3.x
- Docker (required for integration tests via Testcontainers)

## Run the application

```bash
mvn spring-boot:run
```

Available environment variables:

| Variable | Default |
|----------|---------|
| `MONGO_URI` | `mongodb://localhost:27017/padel` |
| `PORT` | `8080` |
| `ADMIN_PIN` | `changeme` |
| `CORS_ORIGIN` | `http://localhost:5173` |

## Tests

### Unit and integration tests

```bash
mvn test
```

Includes:
- Service unit tests (Mockito)
- Controller integration tests (Testcontainers + REST Assured)
- Architecture tests (ArchUnit)

### Mutation testing (PiTest)

```bash
mvn pitest:mutationCoverage -P mutation-testing
```

Report generated at `target/pit-reports/index.html`.

Mutates service classes only (`service.*`) and validates them against unit tests. Integration tests are not executed.
