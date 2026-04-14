package com.ecommpadel.club.model;

public class SetScore {

    private int gamesHome;
    private int gamesAway;

    public SetScore() {}

    public SetScore(int gamesHome, int gamesAway) {
        this.gamesHome = gamesHome;
        this.gamesAway = gamesAway;
    }

    public int getGamesHome() { return gamesHome; }
    public void setGamesHome(int gamesHome) { this.gamesHome = gamesHome; }

    public int getGamesAway() { return gamesAway; }
    public void setGamesAway(int gamesAway) { this.gamesAway = gamesAway; }
}
