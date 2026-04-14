package com.ecommpadel.club.model;

import java.util.List;

public class PairResult {

    private List<SetScore> sets;

    public PairResult() {}

    public PairResult(List<SetScore> sets) {
        this.sets = sets;
    }

    public List<SetScore> getSets() { return sets; }
    public void setSets(List<SetScore> sets) { this.sets = sets; }
}
