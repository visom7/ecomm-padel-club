package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.MatchdayRequest;
import com.ecommpadel.club.dto.ResponseRequest;
import com.ecommpadel.club.dto.ResultRequest;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.model.MatchResult;
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

    @Mock
    private BeerRoundService beerRoundService;

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
        request.setRivalTeam("Padel Club Rivas");

        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        Matchday result = matchdayService.create(request);

        assertThat(result.getTitle()).isEqualTo("Liga Test");
        assertThat(result.getVenue()).isEqualTo("Pistas Retiro");
        assertThat(result.getRivalTeam()).isEqualTo("Padel Club Rivas");
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
    void registerResult_walkoverPersistsEmptyPlayersAndSkipsBeerRounds() {
        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        ResultRequest request = new ResultRequest();
        request.setOutcome(MatchResult.Outcome.WO);
        // Even if the client sends data, walkover must ignore it
        request.setFinalPlayers(List.of("Ernesto", "Jorge"));
        request.setBeerRoundPlayers(List.of("Ernesto"));
        request.setPair1(new PairResult());

        Matchday result = matchdayService.registerResult("matchday-1", request);

        assertThat(result.getStatus()).isEqualTo(Matchday.Status.PLAYED);
        assertThat(result.getMatchResult()).isNotNull();
        assertThat(result.getMatchResult().getOutcome()).isEqualTo(MatchResult.Outcome.WO);
        assertThat(result.getMatchResult().getFinalPlayers()).isEmpty();
        assertThat(result.getMatchResult().getPair1()).isNull();
        assertThat(result.getMatchResult().getPair2()).isNull();
        assertThat(result.getMatchResult().getPair3()).isNull();
        verify(beerRoundService).deleteByMatchdayId("matchday-1");
        verify(beerRoundService, never()).create(any(), any(), any(), any());
    }

    @Test
    void close_setsStatusToClosed() {
        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        Matchday result = matchdayService.close("matchday-1");

        assertThat(result.getStatus()).isEqualTo(Matchday.Status.CLOSED);
    }

    @Test
    void reopen_setsStatusBackToOpen() {
        Matchday closed = new Matchday();
        closed.setId("matchday-1");
        closed.setStatus(Matchday.Status.CLOSED);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(closed));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        Matchday result = matchdayService.reopen("matchday-1");

        assertThat(result.getStatus()).isEqualTo(Matchday.Status.OPEN);
    }

    @Test
    void reopen_rejectsWhenStatusIsOpen() {
        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));

        assertThatThrownBy(() -> matchdayService.reopen("matchday-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CLOSED");
    }

    @Test
    void reopen_rejectsWhenStatusIsLive() {
        Matchday live = new Matchday();
        live.setId("matchday-1");
        live.setStatus(Matchday.Status.LIVE);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(live));

        assertThatThrownBy(() -> matchdayService.reopen("matchday-1"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void reopen_rejectsWhenStatusIsPlayed() {
        Matchday played = new Matchday();
        played.setId("matchday-1");
        played.setStatus(Matchday.Status.PLAYED);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(played));

        assertThatThrownBy(() -> matchdayService.reopen("matchday-1"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void findActive_returnsOpenClosedAndLiveMatchdays() {
        Matchday closed = new Matchday();
        closed.setStatus(Matchday.Status.CLOSED);
        Matchday live = new Matchday();
        live.setStatus(Matchday.Status.LIVE);

        when(matchdayRepository.findByStatusIn(
                List.of(Matchday.Status.OPEN, Matchday.Status.CLOSED, Matchday.Status.LIVE)))
                .thenReturn(List.of(openMatchday, closed, live));

        List<Matchday> result = matchdayService.findActive();

        assertThat(result).hasSize(3);
        assertThat(result).noneMatch(m -> m.getStatus() == Matchday.Status.PLAYED);
    }

    @Test
    void goLive_setsStatusToLiveAndPersistsPartialResult() {
        Matchday closed = new Matchday();
        closed.setId("matchday-1");
        closed.setStatus(Matchday.Status.CLOSED);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(closed));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        ResultRequest request = new ResultRequest();
        request.setFinalPlayers(List.of("Ana", "Beto", "Cris", "Dani", "Eli", "Fer"));
        request.setPair1(new PairResult());
        request.setPair2(new PairResult());
        request.setPair3(new PairResult());

        Matchday result = matchdayService.goLive("matchday-1", request);

        assertThat(result.getStatus()).isEqualTo(Matchday.Status.LIVE);
        assertThat(result.getMatchResult()).isNotNull();
        assertThat(result.getMatchResult().getOutcome()).isNull();
        assertThat(result.getMatchResult().getFinalPlayers()).hasSize(6);
        verifyNoInteractions(beerRoundService);
    }

    @Test
    void goLive_acceptsTransitionFromLiveToLive() {
        Matchday live = new Matchday();
        live.setId("matchday-1");
        live.setStatus(Matchday.Status.LIVE);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(live));
        when(matchdayRepository.save(any(Matchday.class))).thenAnswer(inv -> inv.getArgument(0));

        ResultRequest request = new ResultRequest();
        request.setPair1(new PairResult());
        request.setPair2(new PairResult());
        request.setPair3(new PairResult());

        Matchday result = matchdayService.goLive("matchday-1", request);

        assertThat(result.getStatus()).isEqualTo(Matchday.Status.LIVE);
    }

    @Test
    void goLive_rejectsWhenStatusIsOpen() {
        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(openMatchday));

        ResultRequest request = new ResultRequest();
        request.setPair1(new PairResult());
        request.setPair2(new PairResult());
        request.setPair3(new PairResult());

        assertThatThrownBy(() -> matchdayService.goLive("matchday-1", request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CLOSED or LIVE");
    }

    @Test
    void goLive_rejectsWalkoverOutcome() {
        Matchday closed = new Matchday();
        closed.setId("matchday-1");
        closed.setStatus(Matchday.Status.CLOSED);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(closed));

        ResultRequest request = new ResultRequest();
        request.setOutcome(MatchResult.Outcome.WO);

        assertThatThrownBy(() -> matchdayService.goLive("matchday-1", request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("WO");
    }

    @Test
    void goLive_rejectsWhenStatusIsPlayed() {
        Matchday played = new Matchday();
        played.setId("matchday-1");
        played.setStatus(Matchday.Status.PLAYED);

        when(matchdayRepository.findById("matchday-1")).thenReturn(Optional.of(played));

        ResultRequest request = new ResultRequest();
        request.setPair1(new PairResult());
        request.setPair2(new PairResult());
        request.setPair3(new PairResult());

        assertThatThrownBy(() -> matchdayService.goLive("matchday-1", request))
                .isInstanceOf(IllegalStateException.class);
    }
}
