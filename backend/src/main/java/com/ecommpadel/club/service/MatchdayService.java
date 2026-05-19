package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.MatchdayRequest;
import com.ecommpadel.club.dto.ResponseRequest;
import com.ecommpadel.club.dto.ResultRequest;
import com.ecommpadel.club.model.BeerRound;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.model.MatchResult;
import com.ecommpadel.club.model.PlayerResponse;
import com.ecommpadel.club.repository.MatchdayRepository;
import com.ecommpadel.club.service.BeerRoundService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Service
public class MatchdayService {

    private static final Logger log = LoggerFactory.getLogger(MatchdayService.class);

    private final MatchdayRepository matchdayRepository;
    private final BeerRoundService beerRoundService;

    public MatchdayService(MatchdayRepository matchdayRepository, BeerRoundService beerRoundService) {
        this.matchdayRepository = matchdayRepository;
        this.beerRoundService = beerRoundService;
    }

    public List<Matchday> findActive() {
        List<Matchday> matchdays = matchdayRepository.findByStatusIn(
                List.of(Matchday.Status.OPEN, Matchday.Status.CLOSED, Matchday.Status.LIVE)
        );
        matchdays.forEach(this::sortRegistrations);
        return matchdays;
    }

    public List<Matchday> findPlayed() {
        List<Matchday> matchdays = matchdayRepository.findByStatus(Matchday.Status.PLAYED);
        matchdays.forEach(this::sortRegistrations);
        return matchdays;
    }

    public Matchday findById(String id) {
        Matchday matchday = matchdayRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Matchday not found: {}", id);
                    return new NoSuchElementException("Matchday not found: " + id);
                });
        sortRegistrations(matchday);
        return matchday;
    }

    public Matchday create(MatchdayRequest request) {
        Matchday matchday = new Matchday();
        applyRequest(matchday, request);
        Matchday saved = matchdayRepository.save(matchday);
        log.info("Matchday created: id={}, title={}", saved.getId(), saved.getTitle());
        return saved;
    }

    public Matchday update(String id, MatchdayRequest request) {
        Matchday matchday = findById(id);
        applyRequest(matchday, request);
        Matchday saved = matchdayRepository.save(matchday);
        log.info("Matchday updated: id={}", id);
        return saved;
    }

    public void delete(String id) {
        findById(id);
        beerRoundService.deleteByMatchdayId(id);
        matchdayRepository.deleteById(id);
        log.info("Matchday deleted: id={}", id);
    }

    public Matchday registerResponse(String id, ResponseRequest request) {
        Matchday matchday = findById(id);

        matchday.getRegistrations().removeIf(
                r -> r.getPlayerId().equals(request.getPlayerId())
        );

        PlayerResponse response = new PlayerResponse(
                request.getPlayerId(),
                request.getName(),
                request.getAvailability()
        );
        matchday.getRegistrations().add(response);
        log.info("Player response registered: matchdayId={}, playerId={}, availability={}",
                id, request.getPlayerId(), request.getAvailability());

        Matchday saved = matchdayRepository.save(matchday);
        sortRegistrations(saved);
        return saved;
    }

    public Matchday registerResult(String id, ResultRequest request) {
        Matchday matchday = findById(id);

        MatchResult result = new MatchResult(
                request.getOutcome(),
                request.getFinalPlayers(),
                request.getPair1(),
                request.getPair2(),
                request.getPair3()
        );
        matchday.setMatchResult(result);
        matchday.setStatus(Matchday.Status.PLAYED);
        log.info("Match result registered: matchdayId={}", id);

        // Create beer rounds for players who owe one
        if (request.getBeerRoundPlayers() != null && !request.getBeerRoundPlayers().isEmpty()) {
            // Clean up any existing beer rounds for this matchday before re-registering
            beerRoundService.deleteByMatchdayId(id);
            String title = matchday.getTitle() != null ? matchday.getTitle() : "Partido";
            for (String playerName : request.getBeerRoundPlayers()) {
                String playerId = findPlayerIdByName(playerName, matchday.getRegistrations());
                if (playerId == null) playerId = "name:" + playerName;
                beerRoundService.create(playerId, playerName, id, title);
            }
        } else {
            // If result is re-submitted with no beer round players, remove old ones
            beerRoundService.deleteByMatchdayId(id);
        }

        return matchdayRepository.save(matchday);
    }

    public Matchday close(String id) {
        Matchday matchday = findById(id);
        matchday.setStatus(Matchday.Status.CLOSED);
        log.info("Matchday closed: id={}", id);
        return matchdayRepository.save(matchday);
    }

    public Matchday goLive(String id, ResultRequest request) {
        Matchday matchday = findById(id);

        Matchday.Status current = matchday.getStatus();
        if (current != Matchday.Status.CLOSED && current != Matchday.Status.LIVE) {
            throw new IllegalStateException(
                    "Matchday must be CLOSED or LIVE to go live, was: " + current);
        }

        MatchResult result = new MatchResult(
                request.getOutcome(),
                request.getFinalPlayers(),
                request.getPair1(),
                request.getPair2(),
                request.getPair3()
        );
        matchday.setMatchResult(result);
        matchday.setStatus(Matchday.Status.LIVE);
        log.info("Live snapshot saved: matchdayId={}", id);

        return matchdayRepository.save(matchday);
    }

    private void applyRequest(Matchday matchday, MatchdayRequest request) {
        matchday.setTitle(request.getTitle());
        matchday.setDate(request.getDate());
        matchday.setTime(request.getTime());
        matchday.setVenue(request.getVenue());
        matchday.setCompetition(request.getCompetition());
        matchday.setRound(request.getRound());
    }

    private void sortRegistrations(Matchday matchday) {
        Collator collator = Collator.getInstance(new Locale("es"));
        collator.setStrength(Collator.PRIMARY);
        matchday.getRegistrations().sort((a, b) -> collator.compare(a.getName(), b.getName()));
    }

    private String findPlayerIdByName(String name, List<PlayerResponse> registrations) {
        return registrations.stream()
                .filter(r -> name.equals(r.getName()))
                .map(PlayerResponse::getPlayerId)
                .findFirst()
                .orElse(null);
    }
}
