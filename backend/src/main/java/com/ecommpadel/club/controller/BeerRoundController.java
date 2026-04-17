package com.ecommpadel.club.controller;

import com.ecommpadel.club.dto.BeerRoundStatsDto;
import com.ecommpadel.club.model.BeerRound;
import com.ecommpadel.club.service.AdminAuthService;
import com.ecommpadel.club.service.BeerRoundService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/beer-rounds")
public class BeerRoundController {

    private static final String HEADER_PIN = "X-Admin-Pin";

    private final BeerRoundService beerRoundService;
    private final AdminAuthService adminAuthService;

    public BeerRoundController(BeerRoundService beerRoundService, AdminAuthService adminAuthService) {
        this.beerRoundService = beerRoundService;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping
    public List<BeerRound> listPending() {
        return beerRoundService.findPending();
    }

    @GetMapping("/stats")
    public List<BeerRoundStatsDto> stats() {
        return beerRoundService.getStats();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> markPaid(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id) {
        requireAdmin(pin);
        try {
            beerRoundService.markPaid(id);
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
