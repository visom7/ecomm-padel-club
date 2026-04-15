package com.ecommpadel.club.repository;

import com.ecommpadel.club.model.Matchday;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MatchdayRepository extends MongoRepository<Matchday, String> {
    List<Matchday> findByStatusIn(List<Matchday.Status> statuses);
    List<Matchday> findByStatus(Matchday.Status status);
    List<Matchday> findByCompetition(String competition);
}
