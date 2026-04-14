package com.ecommpadel.club.model;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MatchResultTest {

    @Test
    void pairResult_withThreeSets_storesCorrectScores() {
        PairResult pair = new PairResult(List.of(
                new SetScore(6, 3),
                new SetScore(4, 6),
                new SetScore(7, 5)
        ));

        assertThat(pair.getSets()).hasSize(3);
        assertThat(pair.getSets().get(0).getGamesHome()).isEqualTo(6);
        assertThat(pair.getSets().get(2).getGamesAway()).isEqualTo(5);
    }

    @Test
    void matchResult_storesAllThreePairs() {
        PairResult pair1 = new PairResult(List.of(new SetScore(6, 2), new SetScore(6, 3)));
        PairResult pair2 = new PairResult(List.of(new SetScore(4, 6), new SetScore(6, 4), new SetScore(7, 6)));
        PairResult pair3 = new PairResult(List.of(new SetScore(6, 0), new SetScore(6, 1)));

        MatchResult result = new MatchResult(
                null,
                List.of("Ernesto", "Jorge", "Alex", "Borja", "Carmen", "Alfonso"),
                pair1, pair2, pair3
        );

        assertThat(result.getFinalPlayers()).hasSize(6);
        assertThat(result.getPair1().getSets()).hasSize(2);
        assertThat(result.getPair2().getSets()).hasSize(3);
        assertThat(result.getPair3().getSets()).hasSize(2);
    }

    @Test
    void matchday_countAvailable_countsOnlyAvailablePlayers() {
        Matchday matchday = new Matchday();
        matchday.getRegistrations().add(
                new PlayerResponse("1", "Ernesto", PlayerResponse.Availability.AVAILABLE));
        matchday.getRegistrations().add(
                new PlayerResponse("2", "Jorge", PlayerResponse.Availability.AVAILABLE));
        matchday.getRegistrations().add(
                new PlayerResponse("3", "Alex", PlayerResponse.Availability.UNAVAILABLE));

        assertThat(matchday.countAvailable()).isEqualTo(2);
    }

    @Test
    void setScore_storesHomeAndAwayGames() {
        SetScore set = new SetScore(7, 5);

        assertThat(set.getGamesHome()).isEqualTo(7);
        assertThat(set.getGamesAway()).isEqualTo(5);
    }
}
