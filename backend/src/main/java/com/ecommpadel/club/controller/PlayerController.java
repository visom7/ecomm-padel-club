package com.ecommpadel.club.controller;

import com.ecommpadel.club.model.Player;
import com.ecommpadel.club.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public List<Player> list() {
        return playerService.findAll();
    }

    @GetMapping("/search")
    public ResponseEntity<Player> findByName(@RequestParam String name) {
        return playerService.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
