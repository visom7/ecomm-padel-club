package com.ecommpadel.club.dto;

import com.ecommpadel.club.model.PlayerResponse;

public class ResponseRequest {

    private String playerId;
    private String name;
    private PlayerResponse.Availability availability;

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public PlayerResponse.Availability getAvailability() { return availability; }
    public void setAvailability(PlayerResponse.Availability availability) { this.availability = availability; }
}
