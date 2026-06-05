package com.ecommpadel.club.controller;

import com.ecommpadel.club.dto.MatchdayRequest;
import com.ecommpadel.club.dto.ResponseRequest;
import com.ecommpadel.club.dto.ResultRequest;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.service.AdminAuthService;
import com.ecommpadel.club.service.MatchdayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/matchdays")
public class MatchdayController {

    private static final String HEADER_PIN = "X-Admin-Pin";

    private final MatchdayService matchdayService;
    private final AdminAuthService adminAuthService;

    public MatchdayController(MatchdayService matchdayService, AdminAuthService adminAuthService) {
        this.matchdayService = matchdayService;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping("/active")
    public List<Matchday> listActive() {
        return matchdayService.findActive();
    }

    @GetMapping("/played")
    public List<Matchday> listPlayed() {
        return matchdayService.findPlayed();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Matchday> detail(@PathVariable String id) {
        try {
            return ResponseEntity.ok(matchdayService.findById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Matchday> create(
            @RequestHeader(HEADER_PIN) String pin,
            @RequestBody MatchdayRequest request) {
        requireAdmin(pin);
        return ResponseEntity.status(HttpStatus.CREATED).body(matchdayService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Matchday> update(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id,
            @RequestBody MatchdayRequest request) {
        requireAdmin(pin);
        try {
            return ResponseEntity.ok(matchdayService.update(id, request));
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
            matchdayService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/response")
    public ResponseEntity<Matchday> respond(
            @PathVariable String id,
            @RequestBody ResponseRequest request) {
        try {
            return ResponseEntity.ok(matchdayService.registerResponse(id, request));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @PostMapping("/{id}/result")
    public ResponseEntity<Matchday> result(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id,
            @RequestBody ResultRequest request) {
        requireAdmin(pin);
        try {
            return ResponseEntity.ok(matchdayService.registerResult(id, request));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Matchday> close(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id) {
        requireAdmin(pin);
        try {
            return ResponseEntity.ok(matchdayService.close(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<Matchday> reopen(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id) {
        requireAdmin(pin);
        try {
            return ResponseEntity.ok(matchdayService.reopen(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @PostMapping("/{id}/live")
    public ResponseEntity<Matchday> live(
            @RequestHeader(HEADER_PIN) String pin,
            @PathVariable String id,
            @RequestBody ResultRequest request) {
        requireAdmin(pin);
        try {
            return ResponseEntity.ok(matchdayService.goLive(id, request));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    private void requireAdmin(String pin) {
        if (!adminAuthService.validatePin(pin)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin PIN");
        }
    }
}
