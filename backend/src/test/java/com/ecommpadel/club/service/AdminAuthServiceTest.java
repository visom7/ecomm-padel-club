package com.ecommpadel.club.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class AdminAuthServiceTest {

    @Test
    void validatePin_returnsTrueForCorrectPin() {
        AdminAuthService service = new AdminAuthService();
        ReflectionTestUtils.setField(service, "adminPin", "secret123");

        assertThat(service.validatePin("secret123")).isTrue();
    }

    @Test
    void validatePin_returnsFalseForWrongPin() {
        AdminAuthService service = new AdminAuthService();
        ReflectionTestUtils.setField(service, "adminPin", "secret123");

        assertThat(service.validatePin("wrong")).isFalse();
    }

    @Test
    void validatePin_returnsFalseForNullPin() {
        AdminAuthService service = new AdminAuthService();
        ReflectionTestUtils.setField(service, "adminPin", "secret123");

        assertThat(service.validatePin(null)).isFalse();
    }
}
