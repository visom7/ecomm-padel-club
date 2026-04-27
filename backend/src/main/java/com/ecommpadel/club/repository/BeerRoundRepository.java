package com.ecommpadel.club.repository;

import com.ecommpadel.club.model.BeerRound;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BeerRoundRepository extends MongoRepository<BeerRound, String> {
    List<BeerRound> findByPaidFalseOrderByCreatedAtAsc();
    void deleteByMatchdayIdAndPaidFalse(String matchdayId);
    List<BeerRound> findAllByOrderByCreatedAtDesc();
}
