package com.ecommpadel.club.model;

import java.util.List;

public class MatchResult {

    public enum Outcome { WIN, LOSS, DRAW }

    private Outcome outcome;
    private List<String> finalPlayers;
    private PairResult pair1;
    private PairResult pair2;
    private PairResult pair3;

    public MatchResult() {}

    public MatchResult(Outcome outcome, List<String> finalPlayers, PairResult pair1, PairResult pair2, PairResult pair3) {
        this.outcome = outcome;
        this.finalPlayers = finalPlayers;
        this.pair1 = pair1;
        this.pair2 = pair2;
        this.pair3 = pair3;
    }

    public Outcome getOutcome() { return outcome; }
    public void setOutcome(Outcome outcome) { this.outcome = outcome; }

    public List<String> getFinalPlayers() { return finalPlayers; }
    public void setFinalPlayers(List<String> finalPlayers) { this.finalPlayers = finalPlayers; }

    public PairResult getPair1() { return pair1; }
    public void setPair1(PairResult pair1) { this.pair1 = pair1; }

    public PairResult getPair2() { return pair2; }
    public void setPair2(PairResult pair2) { this.pair2 = pair2; }

    public PairResult getPair3() { return pair3; }
    public void setPair3(PairResult pair3) { this.pair3 = pair3; }
}
