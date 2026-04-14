package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.MatchdayRequest;
import com.ecommpadel.club.dto.ResponseRequest;
import com.ecommpadel.club.dto.ResultRequest;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.model.MatchResult;
import com.ecommpadel.club.model.PlayerResponse;
import com.ecommpadel.club.repository.MatchdayRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MatchdayService {

    private final MatchdayRepository matchdayRepository;

    public MatchdayService(MatchdayRepository matchdayRepository) {
        this.matchdayRepository = matchdayRepository;
    }

    public List<Matchday> findActive() {
        return matchdayRepository.findByStatusIn(
                List.of(Matchday.Status.OPEN, Matchday.Status.CLOSED)
        );
    }

    public List<Matchday> findPlayed() {
        return matchdayRepository.findByStatus(Matchday.Status.PLAYED);
    }

    public Matchday findById(String id) {
        return matchdayRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Matchday not found: " + id));
    }

    public Matchday create(MatchdayRequest request) {
        Matchday matchday = new Matchday();
        applyRequest(matchday, request);
        return matchdayRepository.save(matchday);
    }

    public Matchday update(String id, MatchdayRequest request) {
        Matchday matchday = findById(id);
        applyRequest(matchday, request);
        return matchdayRepository.save(matchday);
    }

    public void delete(String id) {
        findById(id);
        matchdayRepository.deleteById(id);
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

        return matchdayRepository.save(matchday);
    }

    public Matchday registerResult(String id, ResultRequest request) {
        Matchday matchday = findById(id);

        MatchResult result = new MatchResult(
                request.getFinalPlayers(),
                request.getPair1(),
                request.getPair2(),
                request.getPair3()
        );
        matchday.setMatchResult(result);
        matchday.setStatus(Matchday.Status.PLAYED);

        return matchdayRepository.save(matchday);
    }

    public Matchday close(String id) {
        Matchday matchday = findById(id);
        matchday.setStatus(Matchday.Status.CLOSED);
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
}
