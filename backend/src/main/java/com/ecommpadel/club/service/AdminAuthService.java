package com.ecommpadel.club.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    @Value("${app.admin-pin}")
    private String adminPin;

    public boolean validatePin(String pin) {
        return adminPin != null && adminPin.equals(pin);
    }
}
