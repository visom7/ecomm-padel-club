package com.ecommpadel.club.dto;

public class PlayerStatsDto {

    private String playerId;
    private String name;
    private int apuntados;
    private int jugados;
    private int ganados;
    private int perdidos;
    private double pctJugados;
    private double pctGanados;

    public PlayerStatsDto(String playerId, String name, int apuntados, int jugados, int ganados, int perdidos) {
        this.playerId = playerId;
        this.name = name;
        this.apuntados = apuntados;
        this.jugados = jugados;
        this.ganados = ganados;
        this.perdidos = perdidos;
        this.pctJugados = apuntados > 0 ? Math.round((jugados * 100.0 / apuntados) * 10.0) / 10.0 : 0;
        this.pctGanados = jugados > 0 ? Math.round((ganados * 100.0 / jugados) * 10.0) / 10.0 : 0;
    }

    public String getPlayerId() { return playerId; }
    public String getName() { return name; }
    public int getApuntados() { return apuntados; }
    public int getJugados() { return jugados; }
    public int getGanados() { return ganados; }
    public int getPerdidos() { return perdidos; }
    public double getPctJugados() { return pctJugados; }
    public double getPctGanados() { return pctGanados; }
}
