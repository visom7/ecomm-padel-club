package com.ecommpadel.club.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalTime;

public class MatchdayRequest {

    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;

    private String venue;
    private String competition;
    private String round;
    private String rivalTeam;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getCompetition() { return competition; }
    public void setCompetition(String competition) { this.competition = competition; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public String getRivalTeam() { return rivalTeam; }
    public void setRivalTeam(String rivalTeam) { this.rivalTeam = rivalTeam; }
}
