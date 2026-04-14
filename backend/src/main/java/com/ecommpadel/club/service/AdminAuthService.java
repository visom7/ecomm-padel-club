package com.ecommpadel.club.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);

    @Value("${app.admin-pin}")
    private String adminPin;

    public boolean validatePin(String pin) {
        boolean valid = adminPin != null && adminPin.equals(pin);
        if (!valid) {
            log.warn("Invalid admin PIN attempt");
        }
        return valid;
    }
}
