package com.ecommpadel.club.dto;

public class BeerRoundStatsDto {

    private String playerId;
    private String playerName;
    private int total;
    private int paid;
    private int pending;

    public BeerRoundStatsDto(String playerId, String playerName, int total, int paid) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.total = total;
        this.paid = paid;
        this.pending = total - paid;
    }

    public String getPlayerId() { return playerId; }
    public String getPlayerName() { return playerName; }
    public int getTotal() { return total; }
    public int getPaid() { return paid; }
    public int getPending() { return pending; }
}
