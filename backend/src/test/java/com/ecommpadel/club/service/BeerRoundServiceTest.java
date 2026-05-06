package com.ecommpadel.club.service;

import com.ecommpadel.club.dto.BeerRoundStatsDto;
import com.ecommpadel.club.model.BeerRound;
import com.ecommpadel.club.repository.BeerRoundRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeerRoundServiceTest {

    @Mock
    private BeerRoundRepository beerRoundRepository;

    @InjectMocks
    private BeerRoundService beerRoundService;

    @Test
    void findPending_returnsPendingRounds() {
        BeerRound r1 = new BeerRound("p1", "Ana", "md1", "Jornada 1");
        BeerRound r2 = new BeerRound("p2", "Luis", "md1", "Jornada 1");
        when(beerRoundRepository.findByPaidFalseOrderByCreatedAtAsc()).thenReturn(List.of(r1, r2));

        List<BeerRound> result = beerRoundService.findPending();

        assertThat(result).hasSize(2);
    }

    @Test
    void findAllHistory_returnsAllRounds() {
        BeerRound r1 = new BeerRound("p1", "Ana", "md1", "Jornada 1");
        BeerRound r2 = new BeerRound("p2", "Luis", "md2", "Jornada 2");
        BeerRound r3 = new BeerRound("p3", "Carlos", "md3", "Jornada 3");
        when(beerRoundRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(r3, r2, r1));

        List<BeerRound> result = beerRoundService.findAllHistory();

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getPlayerName()).isEqualTo("Carlos");
    }

    @Test
    void create_returnsSavedBeerRound() {
        BeerRound saved = new BeerRound("p1", "Ana", "md1", "Jornada 1");
        when(beerRoundRepository.save(any(BeerRound.class))).thenReturn(saved);

        BeerRound result = beerRoundService.create("p1", "Ana", "md1", "Jornada 1");

        assertThat(result.getPlayerId()).isEqualTo("p1");
        assertThat(result.getPlayerName()).isEqualTo("Ana");
    }

    @Test
    void markPaid_setsRoundAsPaid() {
        BeerRound round = new BeerRound("p1", "Ana", "md1", "Jornada 1");
        round.setPaid(false);
        when(beerRoundRepository.findById("round1")).thenReturn(Optional.of(round));

        beerRoundService.markPaid("round1");

        ArgumentCaptor<BeerRound> captor = ArgumentCaptor.forClass(BeerRound.class);
        verify(beerRoundRepository).save(captor.capture());
        assertThat(captor.getValue().isPaid()).isTrue();
    }

    @Test
    void markPaid_throwsWhenNotFound() {
        when(beerRoundRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> beerRoundService.markPaid("missing"))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void getStats_aggregatesCorrectly() {
        BeerRound r1 = new BeerRound("p1", "Ana", "md1", "Jornada 1");
        r1.setPaid(true);
        BeerRound r2 = new BeerRound("p1", "Ana", "md2", "Jornada 2");
        r2.setPaid(false);
        when(beerRoundRepository.findAll()).thenReturn(List.of(r1, r2));

        List<BeerRoundStatsDto> result = beerRoundService.getStats();

        assertThat(result).hasSize(1);
        BeerRoundStatsDto dto = result.get(0);
        assertThat(dto.getTotal()).isEqualTo(2);
        assertThat(dto.getPaid()).isEqualTo(1);
        assertThat(dto.getPending()).isEqualTo(1);
    }

    @Test
    void getStats_sortsByPendingDesc() {
        BeerRound rA = new BeerRound("pA", "PlayerA", "md1", "Jornada 1");
        rA.setPaid(true); // 0 pending

        BeerRound rB1 = new BeerRound("pB", "PlayerB", "md1", "Jornada 1");
        rB1.setPaid(false);
        BeerRound rB2 = new BeerRound("pB", "PlayerB", "md2", "Jornada 2");
        rB2.setPaid(false); // 2 pending

        when(beerRoundRepository.findAll()).thenReturn(List.of(rA, rB1, rB2));

        List<BeerRoundStatsDto> result = beerRoundService.getStats();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getPlayerId()).isEqualTo("pB");
    }

    @Test
    void deleteByMatchdayId_delegatesToRepo() {
        beerRoundService.deleteByMatchdayId("md1");

        verify(beerRoundRepository).deleteByMatchdayIdAndPaidFalse("md1");
    }
}
