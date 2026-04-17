package com.ecommpadel.club.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "beer_rounds")
public class BeerRound {

    @Id
    private String id;
    private String playerId;
    private String playerName;
    private String matchdayId;
    private String matchdayTitle;
    private LocalDateTime createdAt = LocalDateTime.now();
    private boolean paid = false;
    private LocalDateTime paidAt;

    public BeerRound() {}

    public BeerRound(String playerId, String playerName, String matchdayId, String matchdayTitle) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.matchdayId = matchdayId;
        this.matchdayTitle = matchdayTitle;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public String getMatchdayId() { return matchdayId; }
    public void setMatchdayId(String matchdayId) { this.matchdayId = matchdayId; }

    public String getMatchdayTitle() { return matchdayTitle; }
    public void setMatchdayTitle(String matchdayTitle) { this.matchdayTitle = matchdayTitle; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
