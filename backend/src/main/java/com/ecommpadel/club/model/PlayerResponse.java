package com.ecommpadel.club.model;

public class PlayerResponse {

    private String playerId;
    private String name;
    private Availability availability;

    public enum Availability { AVAILABLE, UNAVAILABLE }

    public PlayerResponse() {}

    public PlayerResponse(String playerId, String name, Availability availability) {
        this.playerId = playerId;
        this.name = name;
        this.availability = availability;
    }

    public String getPlayerId() { return playerId; }
    public void setPlayerId(String playerId) { this.playerId = playerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }
}
