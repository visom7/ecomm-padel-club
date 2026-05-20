package com.ecommpadel.club.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "matchdays")
public class Matchday {

    @Id
    private String id;
    private String title;
    private Status status = Status.OPEN;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;
    private String venue;
    private String competition;
    private String round;
    private String rivalTeam;
    private LocalDateTime createdAt = LocalDateTime.now();
    private List<PlayerResponse> registrations = new ArrayList<>();
    private MatchResult matchResult;

    public enum Status { OPEN, CLOSED, LIVE, PLAYED }

    public Matchday() {}

    public long countAvailable() {
        return registrations.stream()
                .filter(r -> PlayerResponse.Availability.AVAILABLE.equals(r.getAvailability()))
                .count();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<PlayerResponse> getRegistrations() { return registrations; }
    public void setRegistrations(List<PlayerResponse> registrations) { this.registrations = registrations; }

    public MatchResult getMatchResult() { return matchResult; }
    public void setMatchResult(MatchResult matchResult) { this.matchResult = matchResult; }
}
