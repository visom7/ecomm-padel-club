package com.ecommpadel.club.repository;

import com.ecommpadel.club.model.Player;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PlayerRepository extends MongoRepository<Player, String> {
    Optional<Player> findByName(String name);
    boolean existsByName(String name);
}
