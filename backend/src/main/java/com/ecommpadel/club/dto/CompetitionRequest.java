package com.ecommpadel.club.dto;

import java.util.ArrayList;
import java.util.List;

public class CompetitionRequest {

    private String name;
    private String color;
    private boolean active = true;
    private List<String> excludedPlayerIds = new ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<String> getExcludedPlayerIds() { return excludedPlayerIds; }
    public void setExcludedPlayerIds(List<String> excludedPlayerIds) { this.excludedPlayerIds = excludedPlayerIds; }
}
