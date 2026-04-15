package com.ecommpadel.club.repository;

import com.ecommpadel.club.model.Competition;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CompetitionRepository extends MongoRepository<Competition, String> {
}
