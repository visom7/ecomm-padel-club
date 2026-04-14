package com.ecommpadel.club.service;

import com.ecommpadel.club.model.Player;
import com.ecommpadel.club.repository.PlayerRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

    private static final Logger log = LoggerFactory.getLogger(PlayerService.class);

    private final PlayerRepository playerRepository;

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    @PostConstruct
    public void seedPlayers() {
        if (playerRepository.count() > 0) {
            log.debug("Players already seeded, skipping");
            return;
        }
        List<Player> players = List.of(
                new Player(null, "Jorge",     Player.Role.ADMIN),
                new Player(null, "Alfonso",   Player.Role.ADMIN),
                new Player(null, "Ernesto",   Player.Role.ADMIN),
                new Player(null, "Carmen",    Player.Role.ADMIN),
                new Player(null, "Alex B",    Player.Role.PLAYER),
                new Player(null, "Jose",      Player.Role.PLAYER),
                new Player(null, "Borja",     Player.Role.PLAYER),
                new Player(null, "Emilio",    Player.Role.PLAYER),
                new Player(null, "Rubén",     Player.Role.PLAYER),
                new Player(null, "Marco",     Player.Role.PLAYER),
                new Player(null, "Alex",      Player.Role.PLAYER),
                new Player(null, "Victor",    Player.Role.PLAYER),
                new Player(null, "Blas",      Player.Role.PLAYER),
                new Player(null, "Christian", Player.Role.PLAYER)
        );
        playerRepository.saveAll(players);
        log.info("Players seeded: {} players inserted", players.size());
    }

    public List<Player> findAll() {
        log.debug("Fetching all players");
        return playerRepository.findAll();
    }

    public Optional<Player> findByName(String name) {
        log.debug("Looking up player by name: {}", name);
        return playerRepository.findByName(name);
    }

    public boolean isAdmin(String name) {
        return playerRepository.findByName(name)
                .map(p -> Player.Role.ADMIN.equals(p.getRole()))
                .orElse(false);
    }
}
