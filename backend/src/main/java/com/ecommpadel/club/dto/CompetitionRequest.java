package com.ecommpadel.club.dto;

public class CompetitionRequest {

    private String name;
    private String color;
    private boolean active = true;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
