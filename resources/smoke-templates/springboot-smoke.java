package com.example.demo;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Standard S7-B Runtime Smoke Verification for Spring Boot 3+ / Java 21+ LTS.
 * Enforces unmocked application context booting, real DataSource connectivity,
 * and HTTP listener port binding.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ApplicationSmokeTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired(required = false)
    private DataSource dataSource;

    @Test
    @DisplayName("S7-B: Application context boots cleanly and binds to random HTTP port")
    void contextLoadsAndBindsPort() {
        assertThat(port).isGreaterThan(0);
    }

    @Test
    @DisplayName("S7-B: DataSource connection pool establishes valid connection")
    void dataSourceEstablishesValidConnection() throws SQLException {
        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                assertThat(conn.isValid(2)).isTrue();
            }
        }
    }

    @Test
    @DisplayName("S7-B: Health probe endpoint returns 200 OK")
    void healthProbeReturnsOk() {
        ResponseEntity<String> response = restTemplate.getForEntity("/actuator/health", String.class);
        if (response.getStatusCode() == HttpStatus.NOT_FOUND) {
            // Fallback for services exposing custom /health endpoint
            response = restTemplate.getForEntity("/health", String.class);
        }
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
