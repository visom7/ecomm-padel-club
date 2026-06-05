package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.CompetitionRequest;
import com.ecommpadel.club.dto.CompetitionStatsResponse;
import com.ecommpadel.club.dto.PlayerStatsDto;
import com.ecommpadel.club.model.Competition;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.model.MatchResult;
import com.ecommpadel.club.model.PlayerResponse;
import com.ecommpadel.club.repository.CompetitionRepository;
import com.ecommpadel.club.repository.MatchdayRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CompetitionService {

    private static final Logger log = LoggerFactory.getLogger(CompetitionService.class);

    private final CompetitionRepository competitionRepository;
    private final MatchdayRepository matchdayRepository;

    public CompetitionService(CompetitionRepository competitionRepository, MatchdayRepository matchdayRepository) {
        this.competitionRepository = competitionRepository;
        this.matchdayRepository = matchdayRepository;
    }

    public List<Competition> findAll() {
        return competitionRepository.findAll();
    }

    public Competition findById(String id) {
        return competitionRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Competition not found: {}", id);
                    return new NoSuchElementException("Competition not found: " + id);
                });
    }

    public Competition create(CompetitionRequest request) {
        Competition competition = new Competition();
        applyRequest(competition, request);
        Competition saved = competitionRepository.save(competition);
        log.info("Competition created: id={}, name={}", saved.getId(), saved.getName());
        return saved;
    }

    public Competition update(String id, CompetitionRequest request) {
        Competition competition = findById(id);
        applyRequest(competition, request);
        Competition saved = competitionRepository.save(competition);
        log.info("Competition updated: id={}", id);
        return saved;
    }

    public void delete(String id) {
        findById(id);
        competitionRepository.deleteById(id);
        log.info("Competition deleted: id={}", id);
    }

    public CompetitionStatsResponse getStats(String competitionId) {
        Competition competition = findById(competitionId);
        List<Matchday> matchdays = matchdayRepository.findByCompetition(competitionId);

        Set<String> excluded = new HashSet<>(
                competition.getExcludedPlayerIds() != null
                        ? competition.getExcludedPlayerIds()
                        : new ArrayList<>());

        // Accumulate stats per player: playerId -> [apuntados, jugados, ganados, perdidos, name]
        Map<String, int[]> statsMap = new LinkedHashMap<>();
        Map<String, String> playerNames = new LinkedHashMap<>();

        int totalWins = 0, totalLosses = 0, totalDraws = 0;

        for (Matchday matchday : matchdays) {
            // Count registrations (apuntados = AVAILABLE)
            for (PlayerResponse reg : matchday.getRegistrations()) {
                if (PlayerResponse.Availability.AVAILABLE.equals(reg.getAvailability())) {
                    String pid = reg.getPlayerId();
                    if (excluded.contains(pid)) continue;
                    statsMap.computeIfAbsent(pid, k -> new int[4]);
                    playerNames.put(pid, reg.getName());
                    statsMap.get(pid)[0]++; // apuntados
                }
            }

            // Count played/won/lost
            if (Matchday.Status.PLAYED.equals(matchday.getStatus()) && matchday.getMatchResult() != null) {
                MatchResult result = matchday.getMatchResult();
                MatchResult.Outcome outcome = result.getOutcome();

                // Walkovers don't count: no totals, no per-player stats
                if (outcome == MatchResult.Outcome.WO) continue;

                if (outcome == MatchResult.Outcome.WIN) totalWins++;
                else if (outcome == MatchResult.Outcome.LOSS) totalLosses++;
                else if (outcome == MatchResult.Outcome.DRAW) totalDraws++;

                List<String> finalPlayers = result.getFinalPlayers();
                if (finalPlayers != null) {
                    for (String playerName : finalPlayers) {
                        String resolvedId = findPlayerIdByName(playerName, matchday.getRegistrations());
                        if (resolvedId != null && excluded.contains(resolvedId)) continue;
                        String pid = resolvedId;
                        if (pid == null) {
                            pid = "name:" + playerName;
                        }
                        // Always store the name so we never show a raw ID
                        playerNames.putIfAbsent(pid, playerName);
                        statsMap.computeIfAbsent(pid, k -> new int[4]);
                        statsMap.get(pid)[1]++; // jugados
                        if (outcome == MatchResult.Outcome.WIN) statsMap.get(pid)[2]++; // ganados
                        else if (outcome == MatchResult.Outcome.LOSS) statsMap.get(pid)[3]++; // perdidos
                    }
                }
            }
        }

        List<PlayerStatsDto> players = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : statsMap.entrySet()) {
            int[] s = entry.getValue();
            String pid = entry.getKey();
            String name = playerNames.getOrDefault(pid, pid);
            players.add(new PlayerStatsDto(pid, name, s[0], s[1], s[2], s[3]));
        }
        players.sort(Comparator.comparingInt(PlayerStatsDto::getJugados).reversed());

        return new CompetitionStatsResponse(competition, players, totalWins, totalLosses, totalDraws);
    }

    private String findPlayerIdByName(String name, List<PlayerResponse> registrations) {
        return registrations.stream()
                .filter(r -> name.equals(r.getName()))
                .map(PlayerResponse::getPlayerId)
                .findFirst()
                .orElse(null);
    }

    private void applyRequest(Competition competition, CompetitionRequest request) {
        competition.setName(request.getName());
        competition.setColor(request.getColor());
        competition.setActive(request.isActive());
        competition.setExcludedPlayerIds(
                request.getExcludedPlayerIds() != null
                        ? request.getExcludedPlayerIds()
                        : new ArrayList<>());
    }
}
