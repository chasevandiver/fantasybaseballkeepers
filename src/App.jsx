import { useState, useMemo, useEffect } from "react";

// ============================================================
// VERIFIED DATA — Cross-referenced from:
//   • Fantrax 2025 Draft Results (actual draft rounds)
//   • 2025 Keeper History (service time, franchise tags, orig rounds)
//   • All 12 Team Roster CSVs (confirmed current ownership)
//   • Trade Transaction History (post-draft player movements)
//   • Sheet17 (2026 Draft Pick ownership after trades)
//
// SERVICE TIME RULES (as of 2026):
//   • 3 years total per player: year drafted + 2 additional keeps (unless franchise tagged)
//   • service_left=2 → drafted fresh in 2025, NOT previously kept → 2 keeps remaining → ELIGIBLE
//   • service_left=1 → was kept in 2025 (used a keep year) → last year eligible
//     - If franchise_tag=true already applied → still eligible (ineligible_reason: null)
//     - If ft_eligible=true → can apply FT via toggle to unlock one extra year
//     - After being kept in 2026 via FT → DONE (service_left_2027 = 0)
//   • FT max = 5 total seasons of ownership (draft year + 4 keeps)
//   • Mookie Betts, Julio Rodriguez: FT already applied in prior year, SL=1, still eligible
// ============================================================

const KEEPER_DATA = {
  "Andrew": {
    teamName: "Thick Jung Buns",
    players: [
      { player: "Francisco Lindor",  round_2025: 1,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Freddie Freeman",   round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Marcus Semien",     round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brenton Doyle",     round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Raisel Iglesias",   round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Max Muncy",         round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jose Berrios",      round_2025: 6,  keeper_cost: 5,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Jack Flaherty",     round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brandon Nimmo",     round_2025: 8,  keeper_cost: 7,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Spencer Steer",     round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Roki Sasaki",       round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brice Turang",      round_2025: 10, keeper_cost: 9,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Willy Adames",      round_2025: 13, keeper_cost: 12, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Carlos Rodon",      round_2025: 13, keeper_cost: 12, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Kyle Finnegan",     round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kerry Carpenter",   round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kodai Senga",       round_2025: 21, keeper_cost: 20, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Matt Wallner",      round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Devin Williams",    round_2025: 22, keeper_cost: 21, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Kumar Rocker",      round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jacob deGrom",      round_2025: 27, keeper_cost: 26, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Josh Jung",         round_2025: 16, keeper_cost: 15, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Brandon": {
    teamName: "Pete and the boys",
    players: [
      { player: "Mookie Betts",        round_2025: 1,  keeper_cost: 1,  service_left: 1, franchise_tag: true,  ft_eligible: false, ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Trea Turner",         round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Framber Valdez",      round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jazz Chisholm Jr.",   round_2025: 5,  keeper_cost: 4,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Pete Crow-Armstrong", round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jake Burger",         round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Marcell Ozuna",       round_2025: 10, keeper_cost: 9,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Maikel Garcia",       round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nathan Eovaldi",      round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Chris Bassitt",       round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Martinez",       round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Lourdes Gurriel Jr.", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jose Caballero",      round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nolan Schanuel",      round_2025: 25, keeper_cost: 24, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Zack Littell",        round_2025: 28, keeper_cost: 27, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tyler Glasnow",       round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available (traded to Kenny)" },
    ]
  },
  "Chase": {
    teamName: "YorDaddy",
    players: [
      { player: "Spencer Strider",  round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Randy Arozarena", round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jhoan Duran",     round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryan Woo",       round_2025: 10, keeper_cost: 9,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jeff Hoffman",    round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Arraez",     round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Eugenio Suarez",  round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Rhys Hoskins",    round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brandon Woodruff",round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jordan Westburg", round_2025: 23, keeper_cost: 22, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Shane Bieber",    round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jose Altuve",     round_2025: 9,  keeper_cost: 8,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Bryce Harper",    round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Yordan Alvarez",  round_2025: 4,  keeper_cost: 3,  service_left: 1, franchise_tag: true,  ft_eligible: false, ft_maxed: true,  was_keeper_2025: true,  ineligible_reason: "Franchise tag maxed (5 seasons: 2021–2025)" },
    ]
  },
  "Eric": {
    teamName: "Eric's Rum",
    players: [
      { player: "Juan Soto",          round_2025: 1,  keeper_cost: 1,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Austin Riley",       round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Castillo",      round_2025: 3,  keeper_cost: 2,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Ozzie Albies",       round_2025: 4,  keeper_cost: 3,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "CJ Abrams",          round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Logan Webb",         round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ian Happ",           round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Christian Yelich",   round_2025: 8,  keeper_cost: 7,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan Walker",        round_2025: 10, keeper_cost: 9,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Garcia Jr.",    round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jurickson Profar",   round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luke Weaver",        round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Toglia",     round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan Pepiot",        round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Pivetta",       round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Paul Goldschmidt",   round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Wacha",      round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Victor Robles",      round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Colt Keith",         round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Griffin Jax",        round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan McMahon",       round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Shea Langeliers",    round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tyler Stephenson",   round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jesus Sanchez",      round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jordan Walker",      round_2025: 28, keeper_cost: 27, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Masataka Yoshida",   round_2025: 10, keeper_cost: 9,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Hunter Brown",       round_2025: 15, keeper_cost: 14, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Faz": {
    teamName: "Castellanos' Interruptions",
    players: [
      { player: "Matt Olson",       round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Blake Snell",      round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Pablo Lopez",      round_2025: 4,  keeper_cost: 3,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryan Reynolds",   round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Adolis Garcia",    round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tanner Bibee",     round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Anthony Volpe",    round_2025: 8,  keeper_cost: 7,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Shane McClanahan", round_2025: 8,  keeper_cost: 7,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "William Contreras",round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Taylor Ward",      round_2025: 10, keeper_cost: 9,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jason Foley",      round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yainer Diaz",      round_2025: 13, keeper_cost: 12, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Tommy Edman",      round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Alec Burleson",    round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Seth Lugo",        round_2025: 20, keeper_cost: 19, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Jeffrey Springs",  round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Busch",    round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yu Darvish",       round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jo Adell",         round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ketel Marte",      round_2025: 13, keeper_cost: 12, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Pete Fairbanks",   round_2025: 19, keeper_cost: 18, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Dylan Cease",      round_2025: 24, keeper_cost: 23, service_left: 1, franchise_tag: true,  ft_eligible: false, ft_maxed: true,  was_keeper_2025: true,  ineligible_reason: "Franchise tag maxed (5 seasons: 2021–2025)" },
    ]
  },
  "Kelt": {
    teamName: "Sonny Side Up",
    players: [
      { player: "Jackson Merrill",    round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Fernando Tatis Jr.", round_2025: 2,  keeper_cost: 1,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Gunnar Henderson",   round_2025: 4,  keeper_cost: 3,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Michael King",       round_2025: 4,  keeper_cost: 3,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Aaron Nola",         round_2025: 4,  keeper_cost: 3,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yoshinobu Yamamoto", round_2025: 4,  keeper_cost: 3,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Joe Ryan",           round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bo Bichette",        round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jarren Duran",       round_2025: 10, keeper_cost: 9,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Will Smith",         round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Salvador Perez",     round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Matt Shaw",          round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yandy Diaz",         round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kenley Jansen",      round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jameson Taillon",    round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Carlos Estevez",     round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Sonny Gray",         round_2025: 17, keeper_cost: 16, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Kenny": {
    teamName: "That One Guy",
    players: [
      { player: "Aaron Judge",        round_2025: 1,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Manny Machado",      round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Corey Seager",       round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Hunter Greene",      round_2025: 4,  keeper_cost: 3,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryce Miller",       round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Matt McLain",        round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cody Bellinger",     round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Freddy Peralta",     round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Xander Bogaerts",    round_2025: 8,  keeper_cost: 7,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Castellanos",   round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Steven Kwan",        round_2025: 10, keeper_cost: 9,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kevin Gausman",      round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cristopher Sanchez", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Gleyber Torres",     round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nolan Arenado",      round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cedric Mullins",     round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cal Raleigh",        round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nathaniel Lowe",     round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Merrill Kelly",      round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Robert Suarez",      round_2025: 28, keeper_cost: 27, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Tyler Glasnow",      round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Knetzer": {
    teamName: "Knetzy the Jet Rodriguez",
    players: [
      { player: "Vladimir Guerrero Jr.", round_2025: 1,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Rafael Devers",         round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Junior Caminero",       round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Julio Rodriguez",       round_2025: 9,  keeper_cost: 8,  service_left: 1, franchise_tag: true,  ft_eligible: false, ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Jackson Holliday",      round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Heliot Ramos",          round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Paul Skenes",           round_2025: 17, keeper_cost: 16, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Nico Hoerner",          round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Roman Anthony",         round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Max Scherzer",          round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Aroldis Chapman",       round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Clay Holmes",           round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Gerrit Cole",           round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jose Quintana",         round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Matthew Boyd",          round_2025: 28, keeper_cost: 27, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Riley Greene",          round_2025: 12, keeper_cost: 11, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Landon": {
    teamName: "Et Tu Ippei? Redux",
    players: [
      { player: "James Wood",        round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Mike Trout",        round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Logan Gilbert",     round_2025: 5,  keeper_cost: 4,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Teoscar Hernandez", round_2025: 8,  keeper_cost: 7,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Mark Vientos",      round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ezequiel Tovar",    round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Isaac Paredes",     round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Yusei Kikuchi",     round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Andres Gimenez",    round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Shane Baz",         round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "MacKenzie Gore",    round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Lodolo",       round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryson Stott",      round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Trevor Story",      round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jake Cronenworth",  round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Lucas Erceg",       round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jesus Luzardo",     round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "TJ Friedl",         round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brayan Bello",      round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Andrew Painter",    round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Eduardo Rodriguez", round_2025: 25, keeper_cost: 24, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Charlie Morton",    round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Corbin Carroll",    round_2025: 3,  keeper_cost: 2,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Andres Munoz",      round_2025: 16, keeper_cost: 15, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Shohei Ohtani",     round_2025: 1,  keeper_cost: 1,  service_left: 1, franchise_tag: true,  ft_eligible: false, ft_maxed: true,  was_keeper_2025: true,  ineligible_reason: "Franchise tag maxed (5 seasons: 2021–2025)" },
    ]
  },
  "Max": {
    teamName: "Legalize PEDs",
    players: [
      { player: "Jose Ramirez",      round_2025: 1,  keeper_cost: 1,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Kyle Tucker",       round_2025: 1,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kyle Schwarber",    round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Oneil Cruz",        round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tarik Skubal",      round_2025: 3,  keeper_cost: 2,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Brandon Lowe",      round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Christian Walker",  round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Edwin Diaz",        round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Zac Gallen",        round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Wyatt Langford",    round_2025: 8,  keeper_cost: 7,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "George Kirby",      round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Chris Sale",        round_2025: 12, keeper_cost: 11, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Vinnie Pasquantino",round_2025: 14, keeper_cost: 13, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Xavier Edwards",    round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Alec Bohm",         round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Byron Buxton",      round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tanner Scott",      round_2025: 16, keeper_cost: 15, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Brady Singer",      round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Gavin Williams",    round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Eury Perez",        round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Seiya Suzuki",      round_2025: 14, keeper_cost: 13, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Sam W": {
    teamName: "Team samweidig",
    players: [
      { player: "Ronald Acuna Jr.", round_2025: 1,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Pete Alonso",      round_2025: 2,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Josh Naylor",      round_2025: 3,  keeper_cost: 2,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Zach Eflin",       round_2025: 5,  keeper_cost: 4,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Felix Bautista",   round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Max Fried",        round_2025: 6,  keeper_cost: 5,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Alex Bregman",     round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Dansby Swanson",   round_2025: 8,  keeper_cost: 7,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jeremy Pena",      round_2025: 9,  keeper_cost: 8,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Carlos Correa",    round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Grayson Rodriguez",round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "George Springer",  round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Giancarlo Stanton",round_2025: 14, keeper_cost: 13, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Jorge Soler",      round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Taj Bradley",      round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bowden Francis",   round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brent Rooker",     round_2025: 19, keeper_cost: 18, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Ranger Suarez",    round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Rengifo",     round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brendan Donovan",  round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Reese Olson",      round_2025: 22, keeper_cost: 21, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Kirby Yates",      round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Drew Rasmussen",   round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
    ]
  },
  "Will": {
    teamName: "Honey Nut Chourios",
    players: [
      { player: "Garrett Crochet",  round_2025: 1,  keeper_cost: 1,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Harris II",round_2025: 4,  keeper_cost: 3,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Lawrence Butler",  round_2025: 5,  keeper_cost: 4,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cole Ragans",      round_2025: 6,  keeper_cost: 5,  service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Matt Chapman",     round_2025: 7,  keeper_cost: 6,  service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jackson Chourio",  round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Shota Imanaga",    round_2025: 12, keeper_cost: 11, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Sandy Alcantara",  round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "David Bednar",     round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Royce Lewis",      round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Trevor Megill",    round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kristian Campbell",round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Dylan Crews",      round_2025: 22, keeper_cost: 21, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: null },
      { player: "Bubba Chandler",   round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ceddanne Rafaela", round_2025: 25, keeper_cost: 24, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Justin Verlander", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan Weathers",    round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Elly De La Cruz",  round_2025: 23, keeper_cost: 22, service_left: 1, franchise_tag: false, ft_eligible: true,  ft_maxed: false, was_keeper_2025: true,  ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Bobby Witt Jr.",   round_2025: 23, keeper_cost: 22, service_left: 1, franchise_tag: true,  ft_eligible: false, ft_maxed: true,  was_keeper_2025: true,  ineligible_reason: "Franchise tag maxed (5 seasons: 2021–2025)" },
    ]
  },
};

const MISSING_PICKS_2026 = {
  "Legalize PEDs":               [1, 4, 5, 6, 8, 9, 16],
  "That One Guy":                [3, 4, 9, 13],
  "Sonny Side Up":               [5],
  "YorDaddy":                    [5, 7, 10],
};

const EXTRA_PICKS_2026 = {
  "Castellanos' Interruptions":  [{ round: 1, from: "Legalize PEDs" }, { round: 6, from: "Legalize PEDs" }],
  "Knetzy the Jet Rodriguez":    [{ round: 3, from: "That One Guy" }, { round: 5, from: "Sonny Side Up" }, { round: 5, from: "YorDaddy" }, { round: 9, from: "Legalize PEDs" }],
  "Pete and the boys":           [{ round: 7, from: "YorDaddy" }, { round: 8, from: "Legalize PEDs" }, { round: 9, from: "That One Guy" }, { round: 10, from: "YorDaddy" }, { round: 13, from: "That One Guy" }],
  "Thick Jung Buns":             [{ round: 4, from: "That One Guy" }, { round: 4, from: "Legalize PEDs" }, { round: 5, from: "Legalize PEDs" }, { round: 16, from: "Legalize PEDs" }],
};

const MAX_KEEPERS = 6;
const OWNER_COLORS = {
  "Brandon": "#ef4444", "Faz": "#f97316", "Kelt": "#eab308",
  "Eric": "#22c55e", "Landon": "#14b8a6", "Will": "#3b82f6",
  "Max": "#8b5cf6", "Andrew": "#ec4899", "Knetzer": "#f59e0b",
  "Sam W": "#10b981", "Kenny": "#06b6d4", "Chase": "#6366f1"
};
const OWNER_ORDER = ["Andrew", "Brandon", "Chase", "Eric", "Faz", "Kelt", "Kenny", "Knetzer", "Landon", "Max", "Sam W", "Will"];

// ─── helpers ────────────────────────────────────────────────
function isEligibleForOwner(p, _ownerKey, ft) {
  if (p.ineligible_reason === null) return true;
  if (p.ft_eligible && ft.has(p.player)) return true;
  return false;
}

// Compute what a player's row looks like for the 2027 keeper sheet
// given whether they were kept in 2026 and whether FT was applied.
function nextYearRow(p, owner, ownerKey, kept, ftApplied) {
  const usingFT = ftApplied || (p.franchise_tag && p.ineligible_reason === null);
  // service_left_2027:
  //   kept + sl=2, no FT → sl=1 (last year next year)
  //   kept + sl=2, FT    → sl=2 (FT gave an extra season; stays at 2 if Mookie-style, but generally same rule)
  //   kept + sl=1 via FT → sl=0 (FT consumed, done after 2026)
  //   not kept → goes to draft, not in keeper sheet
  const sl_2027 = p.service_left === 2 ? 1 : 0; // used their year
  const ft_used_total = usingFT; // whether FT was ever applied
  const keeper_cost_2027 = p.keeper_cost; // stays same round cost for next year
  const ft_eligible_2027 = sl_2027 === 1 && !ft_used_total; // can FT next year if 1yr left and haven't yet
  return {
    owner, ownerKey,
    teamName: KEEPER_DATA[ownerKey].teamName,
    player: p.player,
    orig_round: p.round_2025,
    keeper_cost_2027,
    service_left_2027: sl_2027,
    franchise_tag_used: usingFT,
    ft_eligible_2027,
    was_keeper_2026: true,
  };
}

const roundStyle = (r) => {
  if (r <= 3)  return { background: "#78350f", color: "#fbbf24", border: "1px solid #92400e" };
  if (r <= 8)  return { background: "#14532d", color: "#4ade80", border: "1px solid #166534" };
  if (r <= 15) return { background: "#0c4a6e", color: "#38bdf8", border: "1px solid #075985" };
  return         { background: "#1e293b",  color: "#94a3b8", border: "1px solid #334155" };
};

const slBadge = (sl, usingFT) => {
  if (usingFT && sl <= 1) return { label: "FT · Last yr", bg: "#581c87", color: "#e9d5ff", border: "1px solid #7c3aed" };
  if (sl >= 2) return { label: "2 yrs left",  bg: "#14532d", color: "#4ade80", border: "1px solid #166534" };
  return        { label: "Last yr",   bg: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b" };
};

// ─── component ──────────────────────────────────────────────
export default function KeeperManager() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    // Viewport meta
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1.0, viewport-fit=cover";
    // Global CSS
    if (!document.getElementById("keeper-global-style")) {
      const s = document.createElement("style");
      s.id = "keeper-global-style";
      s.textContent = `html,body{background:#0a0a0f!important;margin:0;overscroll-behavior:none;-webkit-tap-highlight-color:transparent;}*{touch-action:manipulation;box-sizing:border-box;}`;
      document.head.appendChild(s);
    }
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [selectedOwner, setSelectedOwner] = useState("Brandon");
  const [selections, setSelections] = useState(() => {
    const init = {}; Object.keys(KEEPER_DATA).forEach(o => { init[o] = new Set(); }); return init;
  });
  const [franchiseTags, setFranchiseTags] = useState(() => {
    const init = {}; Object.keys(KEEPER_DATA).forEach(o => { init[o] = new Set(); }); return init;
  });
  const [viewMode, setViewMode] = useState("team");
  const [nextYearCopied, setNextYearCopied] = useState(false);

  const ownerData    = KEEPER_DATA[selectedOwner];
  const ownerColor   = OWNER_COLORS[selectedOwner];
  const currentSel   = selections[selectedOwner];
  const currentFT    = franchiseTags[selectedOwner];
  const missingPicks = MISSING_PICKS_2026[ownerData.teamName] || [];

  const eligiblePlayers   = ownerData.players.filter(p => isEligibleForOwner(p, selectedOwner, currentFT));
  const ineligiblePlayers = ownerData.players.filter(p => !isEligibleForOwner(p, selectedOwner, currentFT));
  const selectedPlayers   = eligiblePlayers.filter(p => currentSel.has(p.player));

  const roundCounts = {};
  selectedPlayers.forEach(p => { roundCounts[p.keeper_cost] = (roundCounts[p.keeper_cost] || 0) + 1; });
  const conflictRounds = new Set(Object.entries(roundCounts).filter(([, v]) => v > 1).map(([k]) => parseInt(k)));

  const toggleKeeper = (playerName) => {
    const p = ownerData.players.find(x => x.player === playerName);
    if (!isEligibleForOwner(p, selectedOwner, currentFT)) return;
    const newSel = { ...selections };
    const set = new Set(newSel[selectedOwner]);
    if (set.has(playerName)) { set.delete(playerName); }
    else { if (set.size >= MAX_KEEPERS) return; set.add(playerName); }
    newSel[selectedOwner] = set;
    setSelections(newSel);
  };

  const toggleFranchiseTag = (playerName, e) => {
    e.stopPropagation();
    const newFT = { ...franchiseTags };
    const set = new Set(newFT[selectedOwner]);
    if (set.has(playerName)) {
      set.delete(playerName);
      const newSel = { ...selections };
      const selSet = new Set(newSel[selectedOwner]);
      selSet.delete(playerName);
      newSel[selectedOwner] = selSet;
      setSelections(newSel);
    } else { set.add(playerName); }
    newFT[selectedOwner] = set;
    setFranchiseTags(newFT);
  };

  // All keepers across league
  const leagueKeepers = useMemo(() => {
    const result = [];
    Object.entries(KEEPER_DATA).forEach(([ownerKey, data]) => {
      const sel = selections[ownerKey];
      const ft  = franchiseTags[ownerKey];
      data.players.filter(p => sel.has(p.player) && isEligibleForOwner(p, ownerKey, ft)).forEach(p => {
        result.push({ ...p, ownerKey, owner: ownerKey, teamName: data.teamName, usingFT: p.franchise_tag || ft.has(p.player) });
      });
    });
    return result.sort((a, b) => a.keeper_cost - b.keeper_cost);
  }, [selections, franchiseTags]);

  // 2027 data: what each kept player looks like next year
  const nextYearData = useMemo(() => {
    const rows = [];
    Object.entries(KEEPER_DATA).forEach(([ownerKey, data]) => {
      const sel = selections[ownerKey];
      const ft  = franchiseTags[ownerKey];
      data.players.filter(p => sel.has(p.player) && isEligibleForOwner(p, ownerKey, ft)).forEach(p => {
        rows.push(nextYearRow(p, data.teamName, ownerKey, true, ft.has(p.player)));
      });
    });
    return rows.sort((a, b) => a.ownerKey.localeCompare(b.ownerKey) || a.orig_round - b.orig_round);
  }, [selections, franchiseTags]);

  // ── nav ──
  const navItems = isMobile
    ? [["team","🏟 Team"],["summary","📋 Summary"],["league","🗂 League"],["picks","🎯 Picks"],["next","⏭ 2027"]]
    : [["team","🏟 Team View"],["summary","📋 Summary"],["league","🗂 League View"],["picks","🎯 Draft Picks"],["next","⏭ 2027 Data"]];

  // ── copy next-year JSON ──
  const copyNextYear = () => {
    const json = JSON.stringify(nextYearData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setNextYearCopied(true);
      setTimeout(() => setNextYearCopied(false), 2000);
    });
  };

  const SL_TAG = ({ p, ftOn }) => {
    const usingFT = ftOn || (p.franchise_tag && p.ineligible_reason === null);
    // After being kept in 2026:
    const sl_after = p.service_left === 2 ? 1 : 0;
    const badge = slBadge(p.service_left, usingFT);
    return (
      <div style={{
        padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
        background: badge.bg, color: badge.color, border: badge.border,
        whiteSpace: "nowrap", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.3,
      }}>
        <span>{badge.label}</span>
        {sl_after !== undefined && <span style={{ opacity: 0.7, fontSize: 9 }}>→ {sl_after === 0 ? "Done" : "1 yr '27"}</span>}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif", background: "#0a0a0f", minHeight: "100dvh", color: "#e2e8f0" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", borderBottom: "1px solid #1e3a5f", padding: isMobile ? "14px 14px" : "20px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 3 }}>Pete Rose's Fantasy League</div>
              <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", margin: 0 }}>⚾ 2026 KEEPER MANAGER</h1>
              <div style={{ fontSize: 10, color: "#22c55e", marginTop: 3 }}>✓ Verified · FT max = 5 seasons · SL=1 expired after 2025</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
              {navItems.map(([mode, label]) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  flex: isMobile ? 1 : "none",
                  padding: isMobile ? "8px 4px" : "8px 16px",
                  borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: isMobile ? 11 : 12, fontWeight: 700,
                  background: viewMode === mode ? "#3b82f6" : "#1e293b",
                  color: viewMode === mode ? "#fff" : "#94a3b8",
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TEAM VIEW
      ══════════════════════════════════════════════════════ */}
      {viewMode === "team" && (
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px",
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 20
        }}>

          {/* ── OWNER SELECTOR — big & obvious for everyone ── */}
          <div>
            <div style={{
              background: `linear-gradient(135deg, ${ownerColor}2a, ${ownerColor}0d)`,
              border: `2px solid ${ownerColor}`,
              borderRadius: 14,
              padding: "16px",
              position: isMobile ? "sticky" : "static",
              top: 0,
              zIndex: 20,
              marginBottom: 12,
            }}>
              {/* Label */}
              <div style={{
                fontSize: 11, fontWeight: 900, letterSpacing: "0.18em",
                color: ownerColor, textTransform: "uppercase", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ fontSize: 18 }}>👇</span> SELECT YOUR TEAM
              </div>

              {/* The dropdown */}
              <select
                value={selectedOwner}
                onChange={e => setSelectedOwner(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "#0d1117",
                  color: ownerColor,
                  border: `2px solid ${ownerColor}`,
                  fontSize: isMobile ? 17 : 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  appearance: "auto",
                  WebkitAppearance: "auto",
                  lineHeight: 1.3,
                }}
              >
                {OWNER_ORDER.map(o => {
                  const sel = selections[o];
                  const kept = sel.size;
                  const status = kept === 0 ? "no picks yet" : kept === MAX_KEEPERS ? "FULL" : `${kept}/${MAX_KEEPERS} kept`;
                  return (
                    <option key={o} value={o}>
                      {o} — {KEEPER_DATA[o].teamName}  [{status}]
                    </option>
                  );
                })}
              </select>

              {/* Active team info strip */}
              <div style={{
                marginTop: 10, padding: "10px 12px", borderRadius: 8,
                background: `${ownerColor}15`, border: `1px solid ${ownerColor}44`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: ownerColor }}>{selectedOwner}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{ownerData.teamName}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: 22, fontWeight: 900,
                    color: currentSel.size >= MAX_KEEPERS ? "#ef4444" : ownerColor,
                  }}>{currentSel.size}/{MAX_KEEPERS}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.1em" }}>KEEPERS</div>
                </div>
              </div>
            </div>

            {/* Desktop: full clickable list below */}
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {OWNER_ORDER.map(owner => {
                  const data = KEEPER_DATA[owner];
                  const sel = selections[owner];
                  const color = OWNER_COLORS[owner];
                  const isActive = selectedOwner === owner;
                  return (
                    <button key={owner} onClick={() => setSelectedOwner(owner)} style={{
                      padding: "9px 12px", borderRadius: 8,
                      border: isActive ? `2px solid ${color}` : "1px solid #1e293b",
                      cursor: "pointer", textAlign: "left",
                      background: isActive ? `${color}22` : "#111827",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? color : "#94a3b8" }}>{owner}</div>
                          <div style={{ fontSize: 10, color: isActive ? `${color}88` : "#4b5563", marginTop: 1 }}>{data.teamName}</div>
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                          background: sel.size > 0 ? `${color}22` : "#1e293b",
                          color: sel.size > 0 ? color : "#4b5563",
                          border: `1px solid ${sel.size > 0 ? color + "44" : "#1e293b"}`
                        }}>{sel.size}/{MAX_KEEPERS}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main panel */}
          <div>
            {/* Header card */}
            <div style={{ background: "#111827", border: `1px solid ${ownerColor}44`, borderRadius: 12, padding: "16px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase" }}>{ownerData.teamName}</div>
                  <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: ownerColor, marginTop: 3 }}>{selectedOwner}</div>
                  {missingPicks.length > 0 && (
                    <div style={{ fontSize: 10, color: "#f97316", marginTop: 3 }}>🚫 Traded away: R{missingPicks.join(", R")}</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {[
                    [currentSel.size >= MAX_KEEPERS ? "#ef4444" : ownerColor, currentSel.size, "KEPT"],
                    ["#94a3b8", MAX_KEEPERS, "MAX"],
                    ["#94a3b8", eligiblePlayers.length, "ELIGIBLE"],
                  ].map(([clr, val, lbl]) => (
                    <div key={lbl} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: clr }}>{val}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.1em" }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected summary */}
              {currentSel.size > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
                    Keepers → Picks Forfeited
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedPlayers.map(p => {
                      const hasConflict = conflictRounds.has(p.keeper_cost);
                      const hasMissing  = missingPicks.includes(p.keeper_cost);
                      const usingFT     = p.franchise_tag || currentFT.has(p.player);
                      const hasIssue    = hasConflict || hasMissing;
                      return (
                        <div key={p.player} style={{
                          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: hasIssue ? "#7f1d1d" : usingFT ? "#1e1b4b" : "#1e3a5f",
                          border: `1px solid ${hasIssue ? "#ef444466" : usingFT ? "#818cf866" : ownerColor + "44"}`,
                          color: hasIssue ? "#fca5a5" : usingFT ? "#a5b4fc" : "#93c5fd",
                          display: "flex", alignItems: "center", gap: 5
                        }}>
                          {hasConflict && "⚠️"}{hasMissing && !hasConflict && "🚫"}{usingFT && "⭐"}
                          {p.player} <span style={{ opacity: 0.6 }}>→ R{p.keeper_cost}</span>
                        </div>
                      );
                    })}
                  </div>
                  {conflictRounds.size > 0 && (
                    <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "#7f1d1d22", border: "1px solid #ef444444", color: "#fca5a5", fontSize: 11 }}>
                      ⚠️ <strong>Denman Rule:</strong> Multiple keepers forfeiting R{[...conflictRounds].join(", R")} — only one per round.
                    </div>
                  )}
                  {selectedPlayers.some(p => missingPicks.includes(p.keeper_cost)) && (
                    <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 6, background: "#7c2d1222", border: "1px solid #f9731644", color: "#fdba74", fontSize: 11 }}>
                      🚫 <strong>Traded pick conflict:</strong> R{selectedPlayers.filter(p => missingPicks.includes(p.keeper_cost)).map(p => p.keeper_cost).join(", R")} no longer owned.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, fontSize: 10, color: "#94a3b8", alignItems: "center" }}>
              <span>⭐ Franchise tagged</span><span>🔁 Was 2025 keeper</span><span>🚫 Pick traded</span>
              {[["#78350f","#fbbf24","R1–3"],["#14532d","#4ade80","R4–8"],["#0c4a6e","#38bdf8","R9–15"],["#1e293b","#94a3b8","R16+"]].map(([bg,c,l])=>(
                <span key={l} style={{background:bg,padding:"1px 6px",borderRadius:3,color:c}}>{l}</span>
              ))}
            </div>

            {/* ── ELIGIBLE PLAYERS ── */}
            <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#22c55e", textTransform: "uppercase", marginBottom: 6 }}>
              ✓ Eligible ({eligiblePlayers.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 18 }}>
              {eligiblePlayers.map(p => {
                const isSelected  = currentSel.has(p.player);
                const isDisabled  = !isSelected && currentSel.size >= MAX_KEEPERS;
                const hasConflict = isSelected && conflictRounds.has(p.keeper_cost);
                const hasMissing  = missingPicks.includes(p.keeper_cost);
                const usingFT     = p.franchise_tag || (p.ft_eligible && currentFT.has(p.player));

                if (isMobile) {
                  return (
                    <div key={p.player} onClick={() => !isDisabled && toggleKeeper(p.player)} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 10px", borderRadius: 8,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      border: hasConflict ? "1px solid #ef444444" : isSelected ? `1px solid ${ownerColor}66` : "1px solid #1e293b",
                      background: hasConflict ? "#7f1d1d22" : isSelected ? `${ownerColor}14` : isDisabled ? "#0d1117" : "#111827",
                      opacity: isDisabled ? 0.4 : 1,
                    }}>
                      {/* round badge left */}
                      <div style={{ width: 46, flexShrink: 0, padding: "4px 0", borderRadius: 6, fontSize: 12, fontWeight: 800, textAlign: "center", ...roundStyle(p.keeper_cost) }}>
                        R{p.keeper_cost}{hasMissing ? "🚫" : ""}
                      </div>
                      {/* name + subtitle */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "#f1f5f9" : "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.player}{usingFT ? " ⭐" : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          Drafted R{p.round_2025}{p.was_keeper_2025 ? " 🔁" : ""}
                        </div>
                      </div>
                      {/* SL badge */}
                      <SL_TAG p={p} ftOn={usingFT} />
                      {/* checkbox right */}
                      <div style={{
                        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${isSelected ? ownerColor : "#334155"}`,
                        background: isSelected ? ownerColor : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {isSelected && <span style={{ color: "#fff", fontSize: 13 }}>✓</span>}
                      </div>
                    </div>
                  );
                }

                // Desktop row
                return (
                  <div key={p.player} onClick={() => !isDisabled && toggleKeeper(p.player)} style={{
                    padding: "10px 14px", borderRadius: 8,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    border: hasConflict ? "1px solid #ef444444" : isSelected ? `1px solid ${ownerColor}66` : "1px solid #1e293b",
                    background: hasConflict ? "#7f1d1d22" : isSelected ? `${ownerColor}14` : isDisabled ? "#0d1117" : "#111827",
                    opacity: isDisabled ? 0.4 : 1,
                    display: "flex", alignItems: "center", gap: 12
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${isSelected ? ownerColor : "#334155"}`,
                      background: isSelected ? ownerColor : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#f1f5f9" : "#94a3b8" }}>{p.player}</span>
                      <span style={{ marginLeft: 8, fontSize: 11 }}>{usingFT && "⭐"}{p.was_keeper_2025 && " 🔁"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Drafted R{p.round_2025}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>→</div>
                    <div style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, minWidth: 90, textAlign: "center", ...roundStyle(p.keeper_cost) }}>
                      Forfeit R{p.keeper_cost}{hasMissing ? " 🚫" : ""}
                    </div>
                    <SL_TAG p={p} ftOn={usingFT} />
                  </div>
                );
              })}
            </div>

            {/* ── FRANCHISE TAG ELIGIBLE ── */}
            {ineligiblePlayers.some(p => p.ft_eligible) && (
              <>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#d8b4fe", textTransform: "uppercase", marginBottom: 6 }}>
                  ⭐ Franchise Tag Available — toggle to unlock
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 18 }}>
                  {ineligiblePlayers.filter(p => p.ft_eligible).map(p => {
                    const ftOn      = currentFT.has(p.player);
                    const isSelected = currentSel.has(p.player);
                    const hasMissing = missingPicks.includes(p.keeper_cost);

                    return (
                      <div key={p.player} style={{
                        padding: isMobile ? "10px 10px" : "10px 14px", borderRadius: 8,
                        cursor: ftOn ? "pointer" : "default",
                        border: ftOn && isSelected ? "1px solid #a855f766" : ftOn ? "1px solid #7c3aed" : "1px solid #581c87",
                        background: ftOn && isSelected ? "#1e1b4b" : ftOn ? "#1a0a38" : "#130720",
                        display: "flex", alignItems: "center", gap: isMobile ? 10 : 12,
                      }}
                        onClick={() => { if (ftOn) { const disabled = !isSelected && currentSel.size >= MAX_KEEPERS; if (!disabled) toggleKeeper(p.player); } }}
                      >
                        {/* toggle switch */}
                        <div onClick={(e) => toggleFranchiseTag(p.player, e)} style={{
                          width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0,
                          background: ftOn ? "#9333ea" : "#312e81",
                          border: `2px solid ${ftOn ? "#9333ea" : "#4338ca"}`,
                          display: "flex", alignItems: "center",
                          padding: "0 3px",
                          justifyContent: ftOn ? "flex-end" : "flex-start",
                          transition: "all 0.15s",
                        }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: ftOn ? "#fff" : "#a5b4fc" }} />
                        </div>
                        {/* checkbox (active when FT on) */}
                        {ftOn && (
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                            border: `2px solid ${isSelected ? "#a855f7" : "#4c1d95"}`,
                            background: isSelected ? "#a855f7" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSelected && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                          </div>
                        )}
                        {/* name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 600, color: ftOn ? "#e9d5ff" : "#a78bfa" }}>
                            {p.player} <span style={{ fontSize: 10, color: ftOn ? "#c084fc" : "#7c3aed" }}>⭐ FT</span>
                            {p.was_keeper_2025 && <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 4 }}>🔁</span>}
                          </div>
                          {isMobile && <div style={{ fontSize: 11, color: "#7c3aed" }}>Drafted R{p.round_2025}{!ftOn ? " — toggle to activate" : ""}</div>}
                          {!isMobile && !ftOn && <div style={{ fontSize: 10, color: "#7c3aed" }}>Toggle to activate franchise tag</div>}
                        </div>
                        {!isMobile && <div style={{ fontSize: 11, color: "#6d28d9" }}>Drafted R{p.round_2025}</div>}
                        {!isMobile && <div style={{ fontSize: 11, color: "#6d28d9" }}>→</div>}
                        <div style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, minWidth: isMobile ? 46 : 90, textAlign: "center", opacity: ftOn ? 1 : 0.4, ...roundStyle(p.keeper_cost) }}>
                          {isMobile ? `R${p.keeper_cost}` : `Forfeit R${p.keeper_cost}`}{hasMissing ? " 🚫" : ""}
                        </div>
                        {/* SL badge — shows FT last yr */}
                        <div style={{
                          padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                          background: "#581c87", color: "#e9d5ff", border: "1px solid #7c3aed",
                          whiteSpace: "nowrap", textAlign: "center", opacity: ftOn ? 1 : 0.5,
                          lineHeight: 1.3,
                        }}>
                          <div>FT · Last yr</div>
                          <div style={{ fontSize: 9, opacity: 0.7 }}>→ Done '27</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── INELIGIBLE ── */}
            {ineligiblePlayers.filter(p => !p.ft_eligible).length > 0 && (
              <>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "#f87171", textTransform: "uppercase", marginBottom: 6 }}>
                  ✗ Ineligible ({ineligiblePlayers.filter(p => !p.ft_eligible).length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {ineligiblePlayers.filter(p => !p.ft_eligible).map(p => (
                    <div key={p.player} style={{
                      padding: isMobile ? "8px 10px" : "8px 14px", borderRadius: 8,
                      border: "1px solid #7f1d1d", background: "#1c0707",
                      display: "flex", alignItems: "center", gap: isMobile ? 8 : 12
                    }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: "#450a0a", border: "1px solid #7f1d1d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#fca5a5", fontSize: 11 }}>✗</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, color: "#fca5a5", textDecoration: "line-through" }}>{p.player}</span>
                        {p.ft_maxed && <span style={{ marginLeft: 6, fontSize: 10, color: "#dc2626" }}>⭐MAX</span>}
                        {p.was_keeper_2025 && <span style={{ marginLeft: 4, fontSize: 10, color: "#94a3b8" }}>🔁</span>}
                        {isMobile && <div style={{ fontSize: 10, color: "#f87171", fontStyle: "italic", marginTop: 1 }}>{p.ineligible_reason}</div>}
                      </div>
                      {!isMobile && <div style={{ fontSize: 10, color: "#f87171", fontStyle: "italic", maxWidth: 280, textAlign: "right" }}>{p.ineligible_reason}</div>}
                      <div style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: "#450a0a", color: "#fca5a5", border: "1px solid #7f1d1d", whiteSpace: "nowrap" }}>
                        R{p.keeper_cost}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SUMMARY VIEW
      ══════════════════════════════════════════════════════ */}
      {viewMode === "summary" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 14 }}>Keeper Selections by Team</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px,1fr))", gap: 14 }}>
            {OWNER_ORDER.map(owner => {
              const data = KEEPER_DATA[owner];
              const sel  = selections[owner];
              const ft   = franchiseTags[owner];
              const color = OWNER_COLORS[owner];
              const kept  = data.players.filter(p => sel.has(p.player) && isEligibleForOwner(p, owner, ft));
              const missing = MISSING_PICKS_2026[data.teamName] || [];
              const rc = {}; kept.forEach(p => { rc[p.keeper_cost] = (rc[p.keeper_cost] || 0) + 1; });
              const conflicts = new Set(Object.entries(rc).filter(([,v]) => v > 1).map(([k]) => parseInt(k)));
              const inelig = data.players.filter(p => !isEligibleForOwner(p, owner, ft));
              return (
                <div key={owner} style={{ background: "#111827", border: `1px solid ${color}33`, borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color }}>{owner}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{data.teamName}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${color}22`, color, border: `1px solid ${color}44` }}>
                      {kept.length}/{MAX_KEEPERS}
                    </div>
                  </div>
                  {kept.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#4b5563", fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>No keepers selected</div>
                  ) : kept.sort((a,b)=>a.keeper_cost-b.keeper_cost).map(p => {
                    const usingFT   = p.franchise_tag || ft.has(p.player);
                    const hasMissing = missing.includes(p.keeper_cost);
                    const hasConflict = conflicts.has(p.keeper_cost);
                    const hasIssue = hasMissing || hasConflict;
                    const sl_after = p.service_left === 2 ? 1 : 0;
                    return (
                      <div key={p.player} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                        padding: "5px 8px", borderRadius: 6, marginBottom: 3,
                        background: hasIssue ? "#7f1d1d22" : "#0d1117",
                        border: `1px solid ${hasIssue ? "#ef444433" : "#1e293b"}`,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: hasIssue ? "#fca5a5" : "#94a3b8" }}>
                            {p.player}
                            {usingFT && <span style={{ marginLeft: 4, fontSize: 10, color: "#a855f7" }}>⭐FT</span>}
                            {p.was_keeper_2025 && <span style={{ marginLeft: 4, fontSize: 10, color: "#94a3b8" }}>🔁</span>}
                            {hasConflict && <span style={{ marginLeft: 4, fontSize: 10 }}>⚠️dup</span>}
                            {hasMissing && <span style={{ marginLeft: 4, fontSize: 10 }}>🚫traded</span>}
                          </div>
                          <div style={{ fontSize: 10, color: sl_after === 0 ? "#f87171" : "#94a3b8" }}>
                            {sl_after === 0 ? "Done after 2026" : "1 yr left for 2027"}
                          </div>
                        </div>
                        <div style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800, ...roundStyle(p.keeper_cost) }}>R{p.keeper_cost}</div>
                      </div>
                    );
                  })}
                  {inelig.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1e293b" }}>
                      <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#f87171", textTransform: "uppercase", marginBottom: 3 }}>Ineligible ({inelig.length})</div>
                      {inelig.map(p => (
                        <div key={p.player} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", padding: "1px 0" }}>
                          <span style={{ textDecoration: "line-through" }}>{p.player}</span>
                          <span style={{ color: "#9ca3af", fontStyle: "italic", maxWidth: 180, textAlign: "right" }}>
                            {p.ft_maxed ? "FT maxed" : p.ft_eligible ? "expired (FT avail)" : p.ineligible_reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {missing.length > 0 && <div style={{ marginTop: 6, fontSize: 10, color: "#f97316" }}>🚫 Traded: R{missing.join(", R")}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          LEAGUE VIEW
      ══════════════════════════════════════════════════════ */}
      {viewMode === "league" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>All League Keepers — by pick cost</div>
          {leagueKeepers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚾</div>
              <div>No keepers selected. Switch to Team View to make selections.</div>
            </div>
          ) : leagueKeepers.map((p, i) => {
            const color = OWNER_COLORS[p.owner];
            const missing = MISSING_PICKS_2026[p.teamName] || [];
            const hasMissing = missing.includes(p.keeper_cost);
            const sl_after = p.service_left === 2 ? 1 : 0;
            return (
              <div key={i} style={{
                padding: isMobile ? "9px 10px" : "10px 16px", borderRadius: 8, marginBottom: 3,
                background: "#111827", border: `1px solid ${hasMissing ? "#f9731644" : "#1e293b"}`,
                display: "flex", alignItems: "center", gap: isMobile ? 8 : 14,
              }}>
                <div style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, minWidth: isMobile ? 46 : 90, textAlign: "center", ...roundStyle(p.keeper_cost) }}>
                  R{p.keeper_cost}{hasMissing ? "🚫" : ""}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.player}
                    {p.usingFT && <span style={{ marginLeft: 6, fontSize: 10, color: "#a855f7" }}>⭐FT</span>}
                    {p.was_keeper_2025 && <span style={{ marginLeft: 6, fontSize: 10, color: "#94a3b8" }}>🔁</span>}
                  </div>
                  {isMobile && <div style={{ fontSize: 10, color }}>{ p.owner}</div>}
                  <div style={{ fontSize: 10, color: sl_after === 0 ? "#f87171" : "#94a3b8" }}>
                    {sl_after === 0 ? "Done after 2026" : "1 yr left for 2027"}
                  </div>
                </div>
                {!isMobile && <div style={{ fontSize: 11, color, fontWeight: 700 }}>{p.owner}</div>}
                {!isMobile && <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.teamName}</div>}
                {!isMobile && <div style={{ fontSize: 10, color: "#94a3b8" }}>drafted R{p.round_2025}</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          DRAFT PICKS VIEW
      ══════════════════════════════════════════════════════ */}
      {viewMode === "picks" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 14 }}>2026 Draft Pick Inventory</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
            {OWNER_ORDER.map(owner => {
              const data = KEEPER_DATA[owner];
              const color = OWNER_COLORS[owner];
              const missingRounds = MISSING_PICKS_2026[data.teamName] || [];
              const extraPicks    = EXTRA_PICKS_2026[data.teamName]   || [];
              const ownRounds     = Array.from({length:28},(_,i)=>i+1).filter(r=>!missingRounds.includes(r));
              return (
                <div key={owner} style={{ background: "#111827", border: `1px solid ${color}33`, borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color, marginBottom: 2 }}>{owner}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 10 }}>{data.teamName}</div>
                  {missingRounds.length > 0 && <div style={{ fontSize: 10, color: "#f97316", marginBottom: 6 }}>🚫 Traded away: R{missingRounds.join(", R")}</div>}
                  {extraPicks.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      {extraPicks.map((ep,i)=><div key={i} style={{fontSize:10,color:"#f59e0b"}}>➕ R{ep.round} from {ep.from}</div>)}
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {ownRounds.map(r=><div key={r} style={{padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,...roundStyle(r)}}>R{r}</div>)}
                    {extraPicks.map((ep,i)=><div key={`ex-${i}`} style={{padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:700,background:"#78350f",color:"#fbbf24",border:"1px solid #f59e0b"}}>R{ep.round}*</div>)}
                  </div>
                  <div style={{ fontSize: 9, color: "#4b5563", marginTop: 6 }}>* = acquired pick</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          2027 DATA VIEW
      ══════════════════════════════════════════════════════ */}
      {viewMode === "next" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase" }}>2027 Keeper Eligibility Preview</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Based on current selections — shows what each kept player looks like heading into next year's draft
              </div>
            </div>
            <button onClick={copyNextYear} style={{
              padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
              background: nextYearCopied ? "#22c55e" : "#3b82f6", color: "#fff",
              fontSize: 12, fontWeight: 700,
            }}>
              {nextYearCopied ? "✓ Copied!" : "📋 Copy JSON"}
            </button>
          </div>

          {nextYearData.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏭</div>
              <div>No keepers selected yet. Select keepers in Team View first.</div>
            </div>
          ) : (
            <>
              {/* Group by owner */}
              {OWNER_ORDER.map(ownerKey => {
                const rows = nextYearData.filter(r => r.ownerKey === ownerKey);
                if (rows.length === 0) return null;
                const color = OWNER_COLORS[ownerKey];
                return (
                  <div key={ownerKey} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color, marginBottom: 8 }}>
                      {ownerKey} <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>— {rows[0].teamName}</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #1e293b" }}>
                            {["Player","Orig Round","Keeper Cost '27","Service Left '27","FT Used","FT Eligible '27","Note"].map(h => (
                              <th key={h} style={{ textAlign: "left", padding: "4px 10px", fontSize: 10, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r, i) => {
                            const note = r.service_left_2027 === 0
                              ? "❌ Done — cannot keep in 2027"
                              : r.service_left_2027 === 1 && r.ft_eligible_2027
                              ? "⭐ FT available for 2027"
                              : r.service_left_2027 === 1
                              ? "🏷 Last year in 2027"
                              : "✓ Eligible";
                            const rowBg = i % 2 === 0 ? "#0d1117" : "#111827";
                            return (
                              <tr key={r.player} style={{ background: rowBg }}>
                                <td style={{ padding: "6px 10px", color: "#f1f5f9", fontWeight: 600 }}>
                                  {r.player}
                                  {r.franchise_tag_used && <span style={{ marginLeft: 6, fontSize: 10, color: "#a855f7" }}>⭐FT</span>}
                                </td>
                                <td style={{ padding: "6px 10px", color: "#94a3b8" }}>R{r.orig_round}</td>
                                <td style={{ padding: "6px 10px" }}>
                                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, ...roundStyle(r.keeper_cost_2027) }}>
                                    R{r.keeper_cost_2027}
                                  </span>
                                </td>
                                <td style={{ padding: "6px 10px" }}>
                                  <span style={{
                                    padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                                    background: r.service_left_2027 === 0 ? "#7f1d1d" : "#14532d",
                                    color: r.service_left_2027 === 0 ? "#fca5a5" : "#4ade80",
                                    border: `1px solid ${r.service_left_2027 === 0 ? "#991b1b" : "#166534"}`,
                                  }}>
                                    {r.service_left_2027} yr
                                  </span>
                                </td>
                                <td style={{ padding: "6px 10px", color: r.franchise_tag_used ? "#a855f7" : "#4b5563" }}>
                                  {r.franchise_tag_used ? "Yes ⭐" : "No"}
                                </td>
                                <td style={{ padding: "6px 10px", color: r.ft_eligible_2027 ? "#a855f7" : "#4b5563" }}>
                                  {r.ft_eligible_2027 ? "Yes ⭐" : "—"}
                                </td>
                                <td style={{ padding: "6px 10px", fontSize: 11, color: r.service_left_2027 === 0 ? "#f87171" : r.ft_eligible_2027 ? "#c084fc" : "#94a3b8" }}>
                                  {note}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* Raw JSON for copy/paste into next year's sheet */}
              <div style={{ marginTop: 24, background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
                  Raw JSON — paste into next year's KEEPER_DATA to pre-populate service times
                </div>
                <pre style={{ fontSize: 10, color: "#4ade80", overflowX: "auto", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {JSON.stringify(nextYearData, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
