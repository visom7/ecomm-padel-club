package com.ecommpadel.club.service;

import com.ecommpadel.club.model.Player;
import com.ecommpadel.club.repository.PlayerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {

    @Mock
    private PlayerRepository playerRepository;

    @InjectMocks
    private PlayerService playerService;

    @Test
    void isAdmin_returnsTrueForAdminRole() {
        Player admin = new Player("1", "Ernesto", Player.Role.ADMIN);
        when(playerRepository.findByName("Ernesto")).thenReturn(Optional.of(admin));

        assertThat(playerService.isAdmin("Ernesto")).isTrue();
    }

    @Test
    void isAdmin_returnsFalseForPlayerRole() {
        Player player = new Player("2", "Alex", Player.Role.PLAYER);
        when(playerRepository.findByName("Alex")).thenReturn(Optional.of(player));

        assertThat(playerService.isAdmin("Alex")).isFalse();
    }

    @Test
    void isAdmin_returnsFalseWhenPlayerNotFound() {
        when(playerRepository.findByName("Unknown")).thenReturn(Optional.empty());

        assertThat(playerService.isAdmin("Unknown")).isFalse();
    }

    @Test
    void seedPlayers_skipsWhenPlayersAlreadyExist() {
        when(playerRepository.count()).thenReturn(14L);

        playerService.seedPlayers();

        verify(playerRepository, never()).saveAll(any());
    }

    @Test
    void seedPlayers_savesAllPlayersWhenEmpty() {
        when(playerRepository.count()).thenReturn(0L);
        when(playerRepository.saveAll(any())).thenReturn(null);

        playerService.seedPlayers();

        verify(playerRepository).saveAll(argThat(list ->
                ((java.util.List<?>) list).size() == 14
        ));
    }

    @Test
    void findByName_returnsPlayerWhenFound() {
        Player player = new Player("3", "Jorge", Player.Role.ADMIN);
        when(playerRepository.findByName("Jorge")).thenReturn(Optional.of(player));

        Optional<Player> result = playerService.findByName("Jorge");

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Jorge");
    }
}
