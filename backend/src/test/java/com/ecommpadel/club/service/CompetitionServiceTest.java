package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.CompetitionRequest;
import com.ecommpadel.club.dto.CompetitionStatsResponse;
import com.ecommpadel.club.model.Competition;
import com.ecommpadel.club.model.Matchday;
import com.ecommpadel.club.model.MatchResult;
import com.ecommpadel.club.model.PlayerResponse;
import com.ecommpadel.club.repository.CompetitionRepository;
import com.ecommpadel.club.repository.MatchdayRepository;
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
class CompetitionServiceTest {

    @Mock
    private CompetitionRepository competitionRepository;

    @Mock
    private MatchdayRepository matchdayRepository;

    @InjectMocks
    private CompetitionService competitionService;

    @Test
    void findAll_returnsList() {
        Competition c1 = new Competition();
        c1.setId("c1");
        Competition c2 = new Competition();
        c2.setId("c2");

        when(competitionRepository.findAll()).thenReturn(List.of(c1, c2));

        List<Competition> result = competitionService.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    void findById_returnsCompetition() {
        Competition competition = new Competition();
        competition.setId("c1");

        when(competitionRepository.findById("c1")).thenReturn(Optional.of(competition));

        Competition result = competitionService.findById("c1");

        assertThat(result.getId()).isEqualTo("c1");
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(competitionRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> competitionService.findById("unknown"))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Competition not found");
    }

    @Test
    void create_appliesRequestAndReturns() {
        CompetitionRequest request = new CompetitionRequest();
        request.setName("Liga A");
        request.setColor("#f00");
        request.setActive(true);

        when(competitionRepository.save(any(Competition.class))).thenAnswer(inv -> inv.getArgument(0));

        Competition result = competitionService.create(request);

        assertThat(result.getName()).isEqualTo("Liga A");
        assertThat(result.getColor()).isEqualTo("#f00");
        assertThat(result.isActive()).isTrue();
    }

    @Test
    void update_appliesRequestAndReturns() {
        Competition existing = new Competition();
        existing.setId("c1");
        existing.setName("Liga Antigua");
        existing.setColor("#000");
        existing.setActive(false);

        CompetitionRequest request = new CompetitionRequest();
        request.setName("Liga Nueva");
        request.setColor("#0f0");
        request.setActive(true);

        when(competitionRepository.findById("c1")).thenReturn(Optional.of(existing));
        when(competitionRepository.save(any(Competition.class))).thenAnswer(inv -> inv.getArgument(0));

        Competition result = competitionService.update("c1", request);

        assertThat(result.getName()).isEqualTo("Liga Nueva");
        assertThat(result.getColor()).isEqualTo("#0f0");
        assertThat(result.isActive()).isTrue();
    }

    @Test
    void delete_throwsWhenNotFound() {
        when(competitionRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> competitionService.delete("unknown"))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Competition not found");
    }

    @Test
    void delete_callsDeleteWhenFound() {
        Competition competition = new Competition();
        competition.setId("c1");

        when(competitionRepository.findById("c1")).thenReturn(Optional.of(competition));

        assertThatCode(() -> competitionService.delete("c1")).doesNotThrowAnyException();

        verify(competitionRepository).deleteById("c1");
    }

    @Test
    void getStats_countsRegistrationsAndOutcomes() {
        Competition competition = new Competition();
        competition.setId("comp1");
        competition.setName("Liga Test");

        PlayerResponse registration = new PlayerResponse("p1", "Ana", PlayerResponse.Availability.AVAILABLE);

        MatchResult matchResult = new MatchResult();
        matchResult.setOutcome(MatchResult.Outcome.WIN);
        matchResult.setFinalPlayers(List.of("Ana"));

        Matchday matchday = new Matchday();
        matchday.setStatus(Matchday.Status.PLAYED);
        matchday.setMatchResult(matchResult);
        matchday.setRegistrations(List.of(registration));

        when(competitionRepository.findById("comp1")).thenReturn(Optional.of(competition));
        when(matchdayRepository.findByCompetition("comp1")).thenReturn(List.of(matchday));

        CompetitionStatsResponse response = competitionService.getStats("comp1");

        assertThat(response.getTotalWins()).isEqualTo(1);
        assertThat(response.getTotalLosses()).isEqualTo(0);
        assertThat(response.getTotalDraws()).isEqualTo(0);
        assertThat(response.getPlayers()).hasSize(1);
        assertThat(response.getPlayers().get(0).getJugados()).isEqualTo(1);
        assertThat(response.getPlayers().get(0).getGanados()).isEqualTo(1);
        assertThat(response.getPlayers().get(0).getApuntados()).isEqualTo(1);
    }

    @Test
    void getStats_walkoverDoesNotCountTowardsTotalsOrPlayerStats() {
        Competition competition = new Competition();
        competition.setId("comp1");
        competition.setName("Liga Test");

        PlayerResponse registration = new PlayerResponse("p1", "Ana", PlayerResponse.Availability.AVAILABLE);

        // A real win for Ana
        MatchResult win = new MatchResult();
        win.setOutcome(MatchResult.Outcome.WIN);
        win.setFinalPlayers(List.of("Ana"));
        Matchday winMatchday = new Matchday();
        winMatchday.setStatus(Matchday.Status.PLAYED);
        winMatchday.setMatchResult(win);
        winMatchday.setRegistrations(List.of(registration));

        // A walkover where Ana is registered but didn't play
        MatchResult walkover = new MatchResult();
        walkover.setOutcome(MatchResult.Outcome.WO);
        walkover.setFinalPlayers(List.of());
        Matchday woMatchday = new Matchday();
        woMatchday.setStatus(Matchday.Status.PLAYED);
        woMatchday.setMatchResult(walkover);
        woMatchday.setRegistrations(List.of(registration));

        when(competitionRepository.findById("comp1")).thenReturn(Optional.of(competition));
        when(matchdayRepository.findByCompetition("comp1")).thenReturn(List.of(winMatchday, woMatchday));

        CompetitionStatsResponse response = competitionService.getStats("comp1");

        assertThat(response.getTotalWins()).isEqualTo(1);
        assertThat(response.getTotalLosses()).isEqualTo(0);
        assertThat(response.getTotalDraws()).isEqualTo(0);
        // Ana is apuntada in both matchdays, but only jugados once (the WO doesn't count)
        assertThat(response.getPlayers()).hasSize(1);
        assertThat(response.getPlayers().get(0).getApuntados()).isEqualTo(2);
        assertThat(response.getPlayers().get(0).getJugados()).isEqualTo(1);
        assertThat(response.getPlayers().get(0).getGanados()).isEqualTo(1);
        assertThat(response.getPlayers().get(0).getPerdidos()).isEqualTo(0);
    }
}
