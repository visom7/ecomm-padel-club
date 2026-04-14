package com.ecommpadel.club.dto;

import com.ecommpadel.club.model.PairResult;

import java.util.List;

public class ResultRequest {

    private List<String> finalPlayers;
    private PairResult pair1;
    private PairResult pair2;
    private PairResult pair3;

    public List<String> getFinalPlayers() { return finalPlayers; }
    public void setFinalPlayers(List<String> finalPlayers) { this.finalPlayers = finalPlayers; }

    public PairResult getPair1() { return pair1; }
    public void setPair1(PairResult pair1) { this.pair1 = pair1; }

    public PairResult getPair2() { return pair2; }
    public void setPair2(PairResult pair2) { this.pair2 = pair2; }

    public PairResult getPair3() { return pair3; }
    public void setPair3(PairResult pair3) { this.pair3 = pair3; }
}
