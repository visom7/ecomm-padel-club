package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.BeerRoundStatsDto;
import com.ecommpadel.club.model.BeerRound;
import com.ecommpadel.club.repository.BeerRoundRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class BeerRoundService {

    private static final Logger log = LoggerFactory.getLogger(BeerRoundService.class);

    private final BeerRoundRepository beerRoundRepository;

    public BeerRoundService(BeerRoundRepository beerRoundRepository) {
        this.beerRoundRepository = beerRoundRepository;
    }

    public List<BeerRound> findPending() {
        return beerRoundRepository.findByPaidFalseOrderByCreatedAtAsc();
    }

    public BeerRound create(String playerId, String playerName, String matchdayId, String matchdayTitle) {
        BeerRound round = new BeerRound(playerId, playerName, matchdayId, matchdayTitle);
        BeerRound saved = beerRoundRepository.save(round);
        log.info("BeerRound created: playerId={}, matchdayId={}", playerId, matchdayId);
        return saved;
    }

    public void markPaid(String id) {
        BeerRound round = beerRoundRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("BeerRound not found: " + id));
        round.setPaid(true);
        round.setPaidAt(LocalDateTime.now());
        beerRoundRepository.save(round);
        log.info("BeerRound marked as paid: id={}, player={}", id, round.getPlayerName());
    }

    public List<BeerRoundStatsDto> getStats() {
        List<BeerRound> all = beerRoundRepository.findAll();
        Map<String, int[]> statsMap = new LinkedHashMap<>();
        Map<String, String> names = new LinkedHashMap<>();

        for (BeerRound b : all) {
            String pid = b.getPlayerId();
            statsMap.computeIfAbsent(pid, k -> new int[2]);
            names.put(pid, b.getPlayerName());
            statsMap.get(pid)[0]++; // total
            if (b.isPaid()) statsMap.get(pid)[1]++; // paid
        }

        List<BeerRoundStatsDto> result = new ArrayList<>();
        for (Map.Entry<String, int[]> entry : statsMap.entrySet()) {
            String pid = entry.getKey();
            int[] s = entry.getValue();
            result.add(new BeerRoundStatsDto(pid, names.get(pid), s[0], s[1]));
        }
        result.sort(Comparator.comparingInt(BeerRoundStatsDto::getPending).reversed()
                .thenComparing(BeerRoundStatsDto::getPlayerName));
        return result;
    }

    public void deleteByMatchdayId(String matchdayId) {
        beerRoundRepository.deleteByMatchdayIdAndPaidFalse(matchdayId);
    }
}
