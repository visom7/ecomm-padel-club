package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.MatchdayRequest;
import com.ecommpadel.club.dto.ResponseRequest;
import com.ecommpadel.club.dto.ResultRequest;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.model.PairResult;
import com.ecommpadel.club.model.PlayerResponse;
import com.ecommpadel.club.repository.MatchdayRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchdayServiceTest {

    @Mock
    private MatchdayRepository matchdayRepository;

    @InjectMocks
    private MatchdayService matchdayService;

    private Matchday openMatchday;

    @BeforeEach
    void setUp() {
        openMatchday = new Matchday();
        openMatchday.setId("matchday-1");
        openMatchday.setTitle("Liga Test");
        openMatchday.setStatus(Matchday.Status.OPEN);
    }

    @Test
    void create_savesNewMatchday() {
        MatchdayRequest request = new MatchdayRequest();
        request.setTitle("Liga Test");
        request.setVenue("Pistas Retiro");

        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        Matchday result = matchdayService.create(request);

        assertThat(result.getTitle()).isEqualTo("Liga Test");
        assertThat(result.getVenue()).isEqualTo("Pistas Retiro");
        assertThat(result.getStatus()).isEqualTo(Matchday.Status.OPEN);
        verify(matchdayRepository).save(any(Matchday.class));
    }

    @Test
    void update_changesFieldsAndSaves() {
        MatchdayRequest request = new MatchdayRequest();
        request.setTitle("Updated Title");
        request.setVenue("New Venue");

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        Matchday result = matchdayService.update("matchday-1", request);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getVenue()).isEqualTo("New Venue");
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(matchdayRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> matchdayService.findById("unknown"))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Matchday not found");
    }

    @Test
    void registerResponse_addsAvailableEntry() {
        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseRequest request = new ResponseRequest();
        request.setPlayerId("player-1");
        request.setName("Ernesto");
        request.setAvailability(PlayerResponse.Availability.AVAILABLE);

        Matchday result = matchdayService.registerResponse("matchday-1", request);

        assertThat(result.getRegistrations()).hasSize(1);
        assertThat(result.getRegistrations().get(0).getAvailability())
                .isEqualTo(PlayerResponse.Availability.AVAILABLE);
    }

    @Test
    void registerResponse_updatesExistingEntry() {
        PlayerResponse existing = new PlayerResponse("player-1", "Ernesto", PlayerResponse.Availability.AVAILABLE);
        openMatchday.getRegistrations().add(existing);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseRequest request = new ResponseRequest();
        request.setPlayerId("player-1");
        request.setName("Ernesto");
        request.setAvailability(PlayerResponse.Availability.UNAVAILABLE);

        Matchday result = matchdayService.registerResponse("matchday-1", request);

        assertThat(result.getRegistrations()).hasSize(1);
        assertThat(result.getRegistrations().get(0).getAvailability())
                .isEqualTo(PlayerResponse.Availability.UNAVAILABLE);
    }

    @Test
    void registerResult_setsStatusToPlayedAndSavesResult() {
        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        ResultRequest request = new ResultRequest();
        request.setFinalPlayers(List.of("Ernesto", "Jorge", "Alex", "Borja"));
        request.setPair1(new PairResult());
        request.setPair2(new PairResult());
        request.setPair3(new PairResult());

        Matchday result = matchdayService.registerResult("matchday-1", request);

        assertThat(result.getStatus()).isEqualTo(Matchday.Status.PLAYED);
        assertThat(result.getMatchResult()).isNotNull();
        assertThat(result.getMatchResult().getFinalPlayers()).contains("Ernesto");
    }

    @Test
    void close_setsStatusToClosed() {
        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        Matchday result = matchdayService.close("matchday-1");

        assertThat(result.getStatus()).isEqualTo(Matchday.Status.CLOSED);
    }

    @Test
    void findActive_returnsOpenAndClosedMatchdays() {
        Matchday closed = new Matchday();
        closed.setStatus(Matchday.Status.CLOSED);

        when(matchdayRepository.findByStatusIn(List.of(Matchday.Status.OPEN, Matchday.Status.CLOSED)))
                .thenReturn(List.of(openMatchday, closed));

        List<Matchday> result = matchdayService.findActive();

        assertThat(result).hasSize(2);
        assertThat(result).noneMatch(m -> m.getStatus() == Matchday.Status.PLAYED);
    }
}
