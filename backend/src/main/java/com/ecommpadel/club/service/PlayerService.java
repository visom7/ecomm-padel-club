package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.PlayerStatsDto;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.model.MatchResult;
import com.ecommpadel.club.model.Player;
import com.ecommpadel.club.model.PlayerResponse;
import com.ecommpadel.club.repository.MatchdayRepository;
import com.ecommpadel.club.repository.PlayerRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlayerService {

    private static final Logger log = LoggerFactory.getLogger(PlayerService.class);

    private final PlayerRepository playerRepository;
    private final MatchdayRepository matchdayRepository;

    public PlayerService(PlayerRepository playerRepository, MatchdayRepository matchdayRepository) {
        this.playerRepository = playerRepository;
        this.matchdayRepository = matchdayRepository;
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

    public List<PlayerStatsDto> getGlobalStats() {
        List<Matchday> allMatchdays = matchdayRepository.findAll();

        Map<String, int[]> statsMap = new LinkedHashMap<>();
        Map<String, String> playerNames = new LinkedHashMap<>();

        for (Matchday matchday : allMatchdays) {
            // apuntados
            for (PlayerResponse reg : matchday.getRegistrations()) {
                if (PlayerResponse.Availability.AVAILABLE.equals(reg.getAvailability())) {
                    String pid = reg.getPlayerId();
                    statsMap.computeIfAbsent(pid, k -> new int[4]);
                    playerNames.put(pid, reg.getName());
                    statsMap.get(pid)[0]++;
                }
            }

            // jugados / ganados / perdidos
            if (Matchday.Status.PLAYED.equals(matchday.getStatus()) && matchday.getMatchResult() != null) {
                MatchResult result = matchday.getMatchResult();
                MatchResult.Outcome outcome = result.getOutcome();
                List<String> finalPlayers = result.getFinalPlayers();
                if (finalPlayers != null) {
                    for (String playerName : finalPlayers) {
                        String pid = findPlayerIdByName(playerName, matchday.getRegistrations());
                        if (pid == null) {
                            pid = "name:" + playerName;
                        }
                        playerNames.putIfAbsent(pid, playerName);
                        statsMap.computeIfAbsent(pid, k -> new int[4]);
                        statsMap.get(pid)[1]++;
                        if (outcome == MatchResult.Outcome.WIN)  statsMap.get(pid)[2]++;
                        else if (outcome == MatchResult.Outcome.LOSS) statsMap.get(pid)[3]++;
                    }
                }
            }
        }

        List<PlayerStatsDto> result = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : statsMap.entrySet()) {
            int[] s = entry.getValue();
            String pid = entry.getKey();
            String name = playerNames.getOrDefault(pid, pid);
            result.add(new PlayerStatsDto(pid, name, s[0], s[1], s[2], s[3]));
        }
        result.sort(Comparator.comparingInt(PlayerStatsDto::getJugados).reversed());
        return result;
    }

    private String findPlayerIdByName(String name, List<PlayerResponse> registrations) {
        return registrations.stream()
                .filter(r -> name.equals(r.getName()))
                .map(PlayerResponse::getPlayerId)
                .findFirst()
                .orElse(null);
    }
}
