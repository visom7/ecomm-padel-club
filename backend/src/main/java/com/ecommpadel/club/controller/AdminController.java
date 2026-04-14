package com.ecommpadel.club.controller;

import com.ecommpadel.club.service.AdminAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;

    public AdminController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping("/verify-pin")
    public ResponseEntity<Void> verifyPin(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        if (adminAuthService.validatePin(pin)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
