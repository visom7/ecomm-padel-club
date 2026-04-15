package com.ecommpadel.club.controller;

import com.ecommpadel.club.dto.CompetitionRequest;
import com.ecommpadel.club.dto.CompetitionStatsResponse;
import com.ecommpadel.club.model.Competition;
import com.ecommpadel.club.service.AdminAuthService;
import com.ecommpadel.club.service.CompetitionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {

    private static final String HEADER_PIN = "X-Admin-Pin";

    private final CompetitionService competitionService;
    private final AdminAuthService adminAuthService;

    public CompetitionController(CompetitionService competitionService, AdminAuthService adminAuthService) {
        this.competitionService = competitionService;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping
    public List<Competition> list() {
        return competitionService.findAll();
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<CompetitionStatsResponse> stats(@PathVariable String id) {
        try {
            return ResponseEntity.ok(competitionService.getStats(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Competition> create(
            @RequestHeader(HEADER_PIN) String pin,
            @RequestBody CompetitionRequest request) {
        requireAdmin(pin);
        return ResponseEntity.status(HttpStatus.CREATED).body(competitionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Competition> update(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id,
            @RequestBody CompetitionRequest request) {
        requireAdmin(pin);
        try {
            return ResponseEntity.ok(competitionService.update(id, request));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id) {
        requireAdmin(pin);
        try {
            competitionService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private void requireAdmin(String pin) {
        if (!adminAuthService.validatePin(pin)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin PIN");
        }
    }
}
