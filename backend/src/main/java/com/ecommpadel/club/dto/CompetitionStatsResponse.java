package com.ecommpadel.club.dto;

import com.ecommpadel.club.model.Competition;

import java.util.List;

public class CompetitionStatsResponse {

    private Competition competition;
    private List<PlayerStatsDto> players;
    private int totalWins;
    private int totalLosses;
    private int totalDraws;

    public CompetitionStatsResponse(Competition competition, List<PlayerStatsDto> players,
                                    int totalWins, int totalLosses, int totalDraws) {
        this.competition = competition;
        this.players = players;
        this.totalWins = totalWins;
        this.totalLosses = totalLosses;
        this.totalDraws = totalDraws;
    }

    public Competition getCompetition() { return competition; }
    public List<PlayerStatsDto> getPlayers() { return players; }
    public int getTotalWins() { return totalWins; }
    public int getTotalLosses() { return totalLosses; }
    public int getTotalDraws() { return totalDraws; }
}
