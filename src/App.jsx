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
//   • service_left=2 → Drafted 2025 or kept with years remaining → ELIGIBLE
//   • service_left=1 → Used last year in 2025 → INELIGIBLE unless franchise tagged
//   • franchise_tag eligible → drafted 2023, kept 2024+2025 (3 total seasons) → CAN franchise tag for 2026
//   • franchise_tag MAXED → drafted 2021, owned 5 total seasons → CANNOT franchise tag
//   • FT max = 5 total seasons of ownership
// ============================================================

const KEEPER_DATA = {
  "Andrew": {
    teamName: "Thick Jung Buns",
    players: [
      // ELIGIBLE (service_left=2)
      { player: "Francisco Lindor", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Freddie Freeman", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Marcus Semien", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brenton Doyle", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Raisel Iglesias", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Max Muncy", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jose Berrios", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Jack Flaherty", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brandon Nimmo", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Spencer Steer", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Roki Sasaki", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brice Turang", round_2025: 10, keeper_cost: 9, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Willy Adames", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Carlos Rodon", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Kyle Finnegan", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kerry Carpenter", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kodai Senga", round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Matt Wallner", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Devin Williams", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Kumar Rocker", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jacob deGrom", round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      // INELIGIBLE (service_left=1, no franchise tag option)
      { player: "Josh Jung", round_2025: 16, keeper_cost: 15, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired (last kept 2025)" },
    ]
  },
  "Brandon": {
    teamName: "Pete and the boys",
    players: [
      { player: "Mookie Betts", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: true, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Trea Turner", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Framber Valdez", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jazz Chisholm Jr.", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Pete Crow-Armstrong", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jake Burger", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Marcell Ozuna", round_2025: 10, keeper_cost: 9, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Maikel Garcia", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nathan Eovaldi", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Chris Bassitt", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Martinez", round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Lourdes Gurriel Jr.", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jose Caballero", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nolan Schanuel", round_2025: 25, keeper_cost: 24, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Zack Littell", round_2025: 28, keeper_cost: 27, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE
      { player: "Tyler Glasnow", round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired (last kept 2025) — traded to Kenny" },
    ]
  },
  "Chase": {
    teamName: "YorDaddy",
    players: [
      { player: "Spencer Strider", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Randy Arozarena", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jhoan Duran", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryan Woo", round_2025: 10, keeper_cost: 9, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jeff Hoffman", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Arraez", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Eugenio Suarez", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Rhys Hoskins", round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brandon Woodruff", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jordan Westburg", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Shane Bieber", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE (SL=1, FT eligible via franchise tag option)
      { player: "Jose Altuve", round_2025: 9, keeper_cost: 8, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Bryce Harper", round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      // INELIGIBLE (FT MAXED — 5 seasons total)
      { player: "Yordan Alvarez", round_2025: 4, keeper_cost: 3, service_left: 1, franchise_tag: true, ft_eligible: false, ft_maxed: true, was_keeper_2025: true, ineligible_reason: "Franchise tag maxed (5 seasons: 2021-2025)" },
    ]
  },
  "Eric": {
    teamName: "Eric's Rum",
    players: [
      { player: "Juan Soto", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Austin Riley", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Castillo", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Ozzie Albies", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "CJ Abrams", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Logan Webb", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ian Happ", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Christian Yelich", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan Walker", round_2025: 10, keeper_cost: 9, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Garcia Jr.", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jurickson Profar", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luke Weaver", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Toglia", round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan Pepiot", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Pivetta", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Paul Goldschmidt", round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Wacha", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Victor Robles", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Colt Keith", round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Griffin Jax", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan McMahon", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Shea Langeliers", round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tyler Stephenson", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jesus Sanchez", round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jordan Walker", round_2025: 28, keeper_cost: 27, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE
      { player: "Masataka Yoshida", round_2025: 10, keeper_cost: 9, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Hunter Brown", round_2025: 15, keeper_cost: 14, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Faz": {
    teamName: "Castellanos' Interruptions",
    players: [
      { player: "Matt Olson", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Blake Snell", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Pablo Lopez", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryan Reynolds", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Adolis Garcia", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tanner Bibee", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Anthony Volpe", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Shane McClanahan", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "William Contreras", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Taylor Ward", round_2025: 10, keeper_cost: 9, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jason Foley", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yainer Diaz", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Tommy Edman", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Alec Burleson", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Seth Lugo", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Jeffrey Springs", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Busch", round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yu Darvish", round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jo Adell", round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE (FT eligible)
      { player: "Ketel Marte", round_2025: 13, keeper_cost: 12, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Pete Fairbanks", round_2025: 19, keeper_cost: 18, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      // INELIGIBLE (FT MAXED)
      { player: "Dylan Cease", round_2025: 24, keeper_cost: 23, service_left: 1, franchise_tag: true, ft_eligible: false, ft_maxed: true, was_keeper_2025: true, ineligible_reason: "Franchise tag maxed (5 seasons: 2021-2025)" },
    ]
  },
  "Kelt": {
    teamName: "Sonny Side Up",
    players: [
      { player: "Jackson Merrill", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Fernando Tatis Jr.", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Gunnar Henderson", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Michael King", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Aaron Nola", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yoshinobu Yamamoto", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Joe Ryan", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bo Bichette", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jarren Duran", round_2025: 10, keeper_cost: 9, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Will Smith", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Salvador Perez", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Matt Shaw", round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Yandy Diaz", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kenley Jansen", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jameson Taillon", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Carlos Estevez", round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE (FT eligible)
      { player: "Sonny Gray", round_2025: 17, keeper_cost: 16, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Kenny": {
    teamName: "That One Guy",
    players: [
      { player: "Aaron Judge", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Manny Machado", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Corey Seager", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Hunter Greene", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryce Miller", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Matt McLain", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cody Bellinger", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Freddy Peralta", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Xander Bogaerts", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Castellanos", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Steven Kwan", round_2025: 10, keeper_cost: 9, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kevin Gausman", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cristopher Sanchez", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Gleyber Torres", round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nolan Arenado", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cedric Mullins", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cal Raleigh", round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nathaniel Lowe", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Merrill Kelly", round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Robert Suarez", round_2025: 28, keeper_cost: 27, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      // INELIGIBLE (FT eligible)
      { player: "Tyler Glasnow", round_2025: 11, keeper_cost: 10, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Knetzer": {
    teamName: "Knetzy the Jet Rodriguez",
    players: [
      { player: "Vladimir Guerrero Jr.", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Rafael Devers", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Junior Caminero", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Julio Rodriguez", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: true, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Jackson Holliday", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Heliot Ramos", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Paul Skenes", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Nico Hoerner", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Roman Anthony", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Max Scherzer", round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Aroldis Chapman", round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Clay Holmes", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Gerrit Cole", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jose Quintana", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Matthew Boyd", round_2025: 28, keeper_cost: 27, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE (FT eligible)
      { player: "Riley Greene", round_2025: 12, keeper_cost: 11, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Landon": {
    teamName: "Et Tu Ippei? Redux",
    players: [
      { player: "James Wood", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Mike Trout", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Logan Gilbert", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Teoscar Hernandez", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Mark Vientos", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ezequiel Tovar", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Isaac Paredes", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Yusei Kikuchi", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Andres Gimenez", round_2025: 13, keeper_cost: 12, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Shane Baz", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "MacKenzie Gore", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Nick Lodolo", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bryson Stott", round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Trevor Story", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jake Cronenworth", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Lucas Erceg", round_2025: 21, keeper_cost: 20, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jesus Luzardo", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "TJ Friedl", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brayan Bello", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Andrew Painter", round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Eduardo Rodriguez", round_2025: 25, keeper_cost: 24, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Charlie Morton", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE (FT eligible)
      { player: "Corbin Carroll", round_2025: 3, keeper_cost: 2, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      { player: "Andres Munoz", round_2025: 16, keeper_cost: 15, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      // INELIGIBLE (FT MAXED)
      { player: "Shohei Ohtani", round_2025: 1, keeper_cost: 1, service_left: 1, franchise_tag: true, ft_eligible: false, ft_maxed: true, was_keeper_2025: true, ineligible_reason: "Franchise tag maxed (5 seasons: 2021-2025)" },
    ]
  },
  "Max": {
    teamName: "Legalize PEDs",
    players: [
      { player: "Jose Ramirez", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Kyle Tucker", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kyle Schwarber", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Oneil Cruz", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tarik Skubal", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Brandon Lowe", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Christian Walker", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Edwin Diaz", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Zac Gallen", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Wyatt Langford", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "George Kirby", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Chris Sale", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Vinnie Pasquantino", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Xavier Edwards", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Alec Bohm", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Byron Buxton", round_2025: 15, keeper_cost: 14, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Tanner Scott", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Brady Singer", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Gavin Williams", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Eury Perez", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE (FT eligible)
      { player: "Seiya Suzuki", round_2025: 14, keeper_cost: 13, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
    ]
  },
  "Sam W": {
    teamName: "Team samweidig",
    players: [
      { player: "Ronald Acuna Jr.", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Pete Alonso", round_2025: 2, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Josh Naylor", round_2025: 3, keeper_cost: 2, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Zach Eflin", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Felix Bautista", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Max Fried", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Alex Bregman", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Dansby Swanson", round_2025: 8, keeper_cost: 7, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jeremy Pena", round_2025: 9, keeper_cost: 8, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Carlos Correa", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Grayson Rodriguez", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "George Springer", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Giancarlo Stanton", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Jorge Soler", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Taj Bradley", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Bowden Francis", round_2025: 17, keeper_cost: 16, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brent Rooker", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Ranger Suarez", round_2025: 19, keeper_cost: 18, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Luis Rengifo", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Brendan Donovan", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Reese Olson", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Kirby Yates", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Drew Rasmussen", round_2025: 24, keeper_cost: 23, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
    ]
  },
  "Will": {
    teamName: "Honey Nut Chourios",
    players: [
      { player: "Garrett Crochet", round_2025: 1, keeper_cost: 1, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Michael Harris II", round_2025: 4, keeper_cost: 3, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Lawrence Butler", round_2025: 5, keeper_cost: 4, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Cole Ragans", round_2025: 6, keeper_cost: 5, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Matt Chapman", round_2025: 7, keeper_cost: 6, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Jackson Chourio", round_2025: 11, keeper_cost: 10, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Shota Imanaga", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Sandy Alcantara", round_2025: 12, keeper_cost: 11, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "David Bednar", round_2025: 14, keeper_cost: 13, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Royce Lewis", round_2025: 16, keeper_cost: 15, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Trevor Megill", round_2025: 18, keeper_cost: 17, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Kristian Campbell", round_2025: 20, keeper_cost: 19, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Dylan Crews", round_2025: 22, keeper_cost: 21, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: true, ineligible_reason: null },
      { player: "Bubba Chandler", round_2025: 23, keeper_cost: 22, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ceddanne Rafaela", round_2025: 25, keeper_cost: 24, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Justin Verlander", round_2025: 26, keeper_cost: 25, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      { player: "Ryan Weathers", round_2025: 27, keeper_cost: 26, service_left: 2, franchise_tag: false, ft_eligible: false, ft_maxed: false, was_keeper_2025: false, ineligible_reason: null },
      // INELIGIBLE (FT eligible)
      { player: "Elly De La Cruz", round_2025: 23, keeper_cost: 22, service_left: 1, franchise_tag: false, ft_eligible: true, ft_maxed: false, was_keeper_2025: true, ineligible_reason: "Service time expired — franchise tag available" },
      // INELIGIBLE (FT MAXED)
      { player: "Bobby Witt Jr.", round_2025: 23, keeper_cost: 22, service_left: 1, franchise_tag: true, ft_eligible: false, ft_maxed: true, was_keeper_2025: true, ineligible_reason: "Franchise tag maxed (5 seasons: 2021-2025)" },
    ]
  },
};

// 2026 Draft Pick Ownership — from Sheet17
const MISSING_PICKS_2026 = {
  "Legalize PEDs": [1, 4, 5, 6, 8, 9, 16],
  "That One Guy": [3, 4, 9, 13],
  "Sonny Side Up": [5],
  "YorDaddy": [5, 7, 10],
};

const EXTRA_PICKS_2026 = {
  "Castellanos' Interruptions": [{ round: 1, from: "Legalize PEDs" }, { round: 6, from: "Legalize PEDs" }],
  "Knetzy the Jet Rodriguez": [{ round: 3, from: "That One Guy" }, { round: 5, from: "Sonny Side Up" }, { round: 5, from: "YorDaddy" }, { round: 9, from: "Legalize PEDs" }],
  "Pete and the boys": [{ round: 7, from: "YorDaddy" }, { round: 8, from: "Legalize PEDs" }, { round: 9, from: "That One Guy" }, { round: 10, from: "YorDaddy" }, { round: 13, from: "That One Guy" }],
  "Thick Jung Buns": [{ round: 4, from: "That One Guy" }, { round: 4, from: "Legalize PEDs" }, { round: 5, from: "Legalize PEDs" }, { round: 16, from: "Legalize PEDs" }],
};

const MAX_KEEPERS = 6;
const OWNER_COLORS = {
  "Brandon": "#ef4444", "Faz": "#f97316", "Kelt": "#eab308",
  "Eric": "#22c55e", "Landon": "#14b8a6", "Will": "#3b82f6",
  "Max": "#8b5cf6", "Andrew": "#ec4899", "Knetzer": "#f59e0b",
  "Sam W": "#10b981", "Kenny": "#06b6d4", "Chase": "#6366f1"
};
const OWNER_ORDER = ["Andrew", "Brandon", "Chase", "Eric", "Faz", "Kelt", "Kenny", "Knetzer", "Landon", "Max", "Sam W", "Will"];

export default function KeeperManager() {
  const [selectedOwner, setSelectedOwner] = useState("Brandon");
  // selections: { owner: Set<playerName> }
  const [selections, setSelections] = useState(() => {
    const init = {};
    Object.keys(KEEPER_DATA).forEach(o => { init[o] = new Set(); });
    return init;
  });
  // franchiseTags: { owner: Set<playerName> } — tracks who has FT toggled on
  const [franchiseTags, setFranchiseTags] = useState(() => {
    const init = {};
    Object.keys(KEEPER_DATA).forEach(o => { init[o] = new Set(); });
    return init;
  });
  const [viewMode, setViewMode] = useState("team");
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    // Force correct mobile viewport
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
    meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';

    // Kill white background on html/body everywhere — including zoom-out
    const styleId = 'keeper-global-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #0a0a0f !important; min-height: 100%; overscroll-behavior: none; }
        body { -webkit-tap-highlight-color: transparent; }
        #root, [data-reactroot] { background: #0a0a0f; }
        button { font-family: inherit; -webkit-appearance: none; appearance: none; touch-action: manipulation; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #111827; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
      `;
      document.head.appendChild(style);
    }

    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const ownerData = KEEPER_DATA[selectedOwner];
  const ownerColor = OWNER_COLORS[selectedOwner];
  const currentSelections = selections[selectedOwner];
  const currentFT = franchiseTags[selectedOwner];
  const missingPicks = MISSING_PICKS_2026[ownerData.teamName] || [];

  // A player is ELIGIBLE if:
  // - ineligible_reason is null AND
  // - (service_left >= 2) OR (ft_eligible && franchise_tag toggled on)
  const isEligible = (p, ownerKey) => {
    if (p.ineligible_reason === null) return true; // already eligible
    if (p.ft_eligible && franchiseTags[ownerKey].has(p.player)) return true; // FT applied
    return false;
  };

  const toggleKeeper = (playerName) => {
    const p = ownerData.players.find(x => x.player === playerName);
    if (!isEligible(p, selectedOwner)) return;
    const newSel = { ...selections };
    const set = new Set(newSel[selectedOwner]);
    if (set.has(playerName)) { set.delete(playerName); }
    else {
      if (set.size >= MAX_KEEPERS) return;
      set.add(playerName);
    }
    newSel[selectedOwner] = set;
    setSelections(newSel);
  };

  const toggleFranchiseTag = (playerName, e) => {
    e.stopPropagation();
    const newFT = { ...franchiseTags };
    const set = new Set(newFT[selectedOwner]);
    if (set.has(playerName)) {
      set.delete(playerName);
      // Also remove from selections if it was selected
      const newSel = { ...selections };
      const selSet = new Set(newSel[selectedOwner]);
      selSet.delete(playerName);
      newSel[selectedOwner] = selSet;
      setSelections(newSel);
    } else {
      set.add(playerName);
    }
    newFT[selectedOwner] = set;
    setFranchiseTags(newFT);
  };

  const eligiblePlayers = ownerData.players.filter(p => isEligible(p, selectedOwner));
  const ineligiblePlayers = ownerData.players.filter(p => !isEligible(p, selectedOwner));

  const selectedPlayers = eligiblePlayers.filter(p => currentSelections.has(p.player));

  const roundCounts = {};
  selectedPlayers.forEach(p => {
    const r = p.keeper_cost;
    roundCounts[r] = (roundCounts[r] || 0) + 1;
  });
  const conflictRounds = new Set(Object.entries(roundCounts).filter(([, v]) => v > 1).map(([k]) => parseInt(k)));

  const leagueKeepers = useMemo(() => {
    const result = [];
    Object.entries(KEEPER_DATA).forEach(([owner, data]) => {
      const sel = selections[owner];
      const ft = franchiseTags[owner];
      data.players.filter(p => sel.has(p.player) && isEligibleForOwner(p, owner, ft)).forEach(p => {
        result.push({ ...p, owner, teamName: data.teamName, usingFT: ft.has(p.player) });
      });
    });
    return result.sort((a, b) => a.keeper_cost - b.keeper_cost);
  }, [selections, franchiseTags]);

  function isEligibleForOwner(p, ownerKey, ft) {
    if (p.ineligible_reason === null) return true;
    if (p.ft_eligible && ft.has(p.player)) return true;
    return false;
  }

  const roundStyle = (r) => {
    if (r <= 3) return { background: "#78350f", color: "#fbbf24", border: "1px solid #92400e" };
    if (r <= 8) return { background: "#14532d", color: "#4ade80", border: "1px solid #166534" };
    if (r <= 15) return { background: "#0c4a6e", color: "#38bdf8", border: "1px solid #075985" };
    return { background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" };
  };

  const NAV_ITEMS = [
    ["team", "🏟", "Team"],
    ["summary", "📋", "Summary"],
    ["league", "🗂", "League"],
    ["picks", "🎯", "Picks"],
  ];

  const btn = (mode, emoji, label) => (
    <button key={mode} onClick={() => setViewMode(mode)} style={{
      padding: isMobile ? "8px 4px" : "8px 18px",
      borderRadius: 6, border: "none", cursor: "pointer",
      fontSize: isMobile ? 11 : 12, fontWeight: 700,
      background: viewMode === mode ? "#3b82f6" : "#1e293b",
      color: viewMode === mode ? "#fff" : "#94a3b8",
      flex: isMobile ? "1 1 0" : "none",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      lineHeight: 1.2,
    }}>
      {isMobile ? <><span style={{ fontSize: 16 }}>{emoji}</span><span>{label}</span></> : `${emoji} ${label} View`}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", background: "#0a0a0f", minHeight: "100dvh", color: "#e2e8f0", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", borderBottom: "1px solid #1e3a5f", padding: isMobile ? "12px 12px 8px" : "20px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {isMobile ? (
            <>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Pete Rose's Fantasy League</div>
                <h1 style={{ fontSize: 18, fontWeight: 900, color: "#f1f5f9", margin: 0 }}>⚾ 2026 Keeper Manager</h1>
              </div>
              <div style={{ display: "flex", gap: 6, width: "100%" }}>
                {NAV_ITEMS.map(([m, e, l]) => btn(m, e, l))}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Pete Rose's Fantasy League</div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", margin: 0 }}>⚾ 2026 KEEPER MANAGER</h1>
                <div style={{ fontSize: 10, color: "#22c55e", marginTop: 3 }}>✓ Verified · SL=1 players are 2025-expired · FT max = 5 seasons total</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {NAV_ITEMS.map(([m, e, l]) => btn(m, e, l))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TEAM VIEW */}
      {viewMode === "team" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? 0 : "24px 16px", display: isMobile ? "block" : "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>

          {/* MOBILE: sticky owner dropdown */}
          {isMobile && (
            <div style={{ background: "#0d1117", borderBottom: "1px solid #1e293b", padding: "10px 12px", position: "sticky", top: 0, zIndex: 10 }}>
              <select
                value={selectedOwner}
                onChange={e => setSelectedOwner(e.target.value)}
                style={{
                  width: "100%", background: "#111827", color: ownerColor,
                  border: `2px solid ${ownerColor}88`, borderRadius: 8,
                  padding: "10px 36px 10px 14px", fontSize: 15, fontWeight: 700,
                  fontFamily: "inherit", appearance: "none", WebkitAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
                  cursor: "pointer",
                }}
              >
                {OWNER_ORDER.map(o => {
                  const s = selections[o];
                  return <option key={o} value={o} style={{ background: "#111827", color: "#e2e8f0" }}>{o} — {KEEPER_DATA[o].teamName} ({s.size}/{MAX_KEEPERS})</option>;
                })}
              </select>
            </div>
          )}

          {/* DESKTOP: sidebar */}
          {!isMobile && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>Owners</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {OWNER_ORDER.map(owner => {
                  const data = KEEPER_DATA[owner];
                  const sel = selections[owner];
                  const ft = franchiseTags[owner];
                  const color = OWNER_COLORS[owner];
                  const isActive = selectedOwner === owner;
                  return (
                    <button key={owner} onClick={() => setSelectedOwner(owner)} style={{
                      padding: "10px 14px", borderRadius: 8,
                      border: isActive ? `1px solid ${color}` : "1px solid #1e293b",
                      cursor: "pointer", textAlign: "left", background: isActive ? `${color}18` : "#111827",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? color : "#94a3b8" }}>{owner}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{data.teamName}</div>
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                          background: sel.size > 0 ? `${color}22` : "#1e293b", color: sel.size > 0 ? color : "#475569",
                          border: `1px solid ${sel.size > 0 ? color + "44" : "#1e293b"}`
                        }}>{sel.size}/{MAX_KEEPERS}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Panel */}
          <div style={{ padding: isMobile ? "10px 12px 32px" : 0 }}>
            {/* Header Card */}
            <div style={{ background: "#111827", border: `1px solid ${ownerColor}44`, borderRadius: 12, padding: isMobile ? "10px 12px" : "18px 22px", marginBottom: isMobile ? 10 : 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  {!isMobile && <div style={{ fontSize: 22, fontWeight: 900, color: ownerColor, marginBottom: 2 }}>{selectedOwner}</div>}
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#94a3b8", textTransform: "uppercase" }}>{ownerData.teamName}</div>
                  {missingPicks.length > 0 && (
                    <div style={{ fontSize: 10, color: "#f97316", marginTop: 3 }}>
                      🚫 Traded: R{missingPicks.join(", R")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: isMobile ? 14 : 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, color: currentSelections.size >= MAX_KEEPERS ? "#ef4444" : ownerColor }}>{currentSelections.size}</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.05em" }}>KEPT</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, color: "#64748b" }}>{MAX_KEEPERS}</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.05em" }}>MAX</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, color: "#64748b" }}>{eligiblePlayers.length}</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.05em" }}>ELIG</div>
                  </div>
                </div>
              </div>

              {/* Selected keeper summary */}
              {currentSelections.size > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Selected Keepers → Picks Forfeited</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedPlayers.map(p => {
                      const hasConflict = conflictRounds.has(p.keeper_cost);
                      const hasMissing = missingPicks.includes(p.keeper_cost);
                      const usingFT = currentFT.has(p.player);
                      const hasIssue = hasConflict || hasMissing;
                      return (
                        <div key={p.player} style={{
                          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: hasIssue ? "#7f1d1d" : usingFT ? "#1e1b4b" : "#1e3a5f",
                          border: `1px solid ${hasIssue ? "#ef444466" : usingFT ? "#818cf866" : ownerColor + "44"}`,
                          color: hasIssue ? "#fca5a5" : usingFT ? "#a5b4fc" : "#93c5fd",
                          display: "flex", alignItems: "center", gap: 6
                        }}>
                          {hasConflict && <span>⚠️</span>}{hasMissing && !hasConflict && <span>🚫</span>}
                          {usingFT && <span>⭐</span>}
                          <span>{p.player}</span>
                          <span style={{ opacity: 0.6 }}>→ R{p.keeper_cost}</span>
                        </div>
                      );
                    })}
                  </div>
                  {conflictRounds.size > 0 && (
                    <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "#7f1d1d22", border: "1px solid #ef444444", color: "#fca5a5", fontSize: 11 }}>
                      ⚠️ <strong>Denman Memorial Rule:</strong> Multiple keepers forfeiting R{[...conflictRounds].join(", R")} — only one per round allowed.
                    </div>
                  )}
                  {selectedPlayers.some(p => missingPicks.includes(p.keeper_cost)) && (
                    <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "#7c2d1222", border: "1px solid #f9731644", color: "#fdba74", fontSize: 11 }}>
                      🚫 <strong>Traded pick conflict:</strong> Cannot use R{selectedPlayers.filter(p => missingPicks.includes(p.keeper_cost)).map(p => p.keeper_cost).join(", R")} — pick was traded away.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: isMobile ? 6 : 10, flexWrap: "wrap", marginBottom: isMobile ? 8 : 12, fontSize: 10, color: "#94a3b8", alignItems: "center" }}>
              {!isMobile && <span>⭐ FT tagged</span>}
              {!isMobile && <span>🔁 2025 keeper</span>}
              {!isMobile && <span>🚫 traded pick</span>}
              <span style={{ background: "#78350f", padding: "2px 7px", borderRadius: 4, color: "#fbbf24", fontWeight: 700 }}>R1–3</span>
              <span style={{ background: "#14532d", padding: "2px 7px", borderRadius: 4, color: "#4ade80", fontWeight: 700 }}>R4–8</span>
              <span style={{ background: "#0c4a6e", padding: "2px 7px", borderRadius: 4, color: "#38bdf8", fontWeight: 700 }}>R9–15</span>
              <span style={{ background: "#1e293b", padding: "2px 7px", borderRadius: 4, color: "#94a3b8", fontWeight: 700 }}>R16+</span>
            </div>

            {/* ELIGIBLE PLAYERS */}
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#22c55e", textTransform: "uppercase", marginBottom: 8 }}>
              ✓ Eligible Keepers ({eligiblePlayers.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 4 : 3, marginBottom: 20 }}>
              {eligiblePlayers.map(p => {
                const isSelected = currentSelections.has(p.player);
                const isDisabled = !isSelected && currentSelections.size >= MAX_KEEPERS;
                const hasConflict = isSelected && conflictRounds.has(p.keeper_cost);
                const hasMissing = missingPicks.includes(p.keeper_cost);
                const usingFT = p.franchise_tag || (p.ft_eligible && currentFT.has(p.player));
                return (
                  <div key={p.player} onClick={() => !isDisabled && toggleKeeper(p.player)} style={{
                    padding: isMobile ? "10px 12px" : "10px 14px", borderRadius: 8,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    border: hasConflict ? "1px solid #ef444444" : isSelected ? `1px solid ${ownerColor}88` : "1px solid #1e293b",
                    background: hasConflict ? "#7f1d1d22" : isSelected ? `${ownerColor}1a` : isDisabled ? "#0d1117" : "#111827",
                    opacity: isDisabled ? 0.35 : 1,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                    {/* Round badge — prominent on left */}
                    <div style={{ ...roundStyle(p.keeper_cost), borderRadius: 8, padding: isMobile ? "6px 0" : "4px 0", minWidth: isMobile ? 46 : 52, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 900, lineHeight: 1 }}>R{p.keeper_cost}</div>
                      {hasMissing && <div style={{ fontSize: 9, marginTop: 2 }}>🚫</div>}
                    </div>
                    {/* Player info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#f1f5f9" : "#cbd5e1", lineHeight: 1.2 }}>
                        {p.player}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        Drafted R{p.round_2025}{usingFT ? " ⭐" : ""}{p.was_keeper_2025 ? " 🔁" : ""}
                      </div>
                    </div>
                    {/* Checkbox */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${isSelected ? ownerColor : "#334155"}`,
                      background: isSelected ? ownerColor : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FRANCHISE TAG ELIGIBLE SECTION */}
            {ineligiblePlayers.some(p => p.ft_eligible) && (
              <>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#d8b4fe", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                  ⭐ Franchise Tag Available
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 4 : 3, marginBottom: 20 }}>
                  {ineligiblePlayers.filter(p => p.ft_eligible).map(p => {
                    const ftOn = currentFT.has(p.player);
                    const isSelected = currentSelections.has(p.player);
                    const hasConflict = isSelected && conflictRounds.has(p.keeper_cost);
                    const hasMissing = missingPicks.includes(p.keeper_cost);
                    return (
                      <div key={p.player} style={{
                        padding: isMobile ? "10px 12px" : "10px 14px", borderRadius: 8,
                        cursor: ftOn ? "pointer" : "default",
                        border: ftOn && isSelected ? "1px solid #a855f7" : ftOn ? "1px solid #7c3aed" : "1px solid #581c87",
                        background: ftOn && isSelected ? "#2e1065" : ftOn ? "#1a0a38" : "#130720",
                        display: "flex", alignItems: "center", gap: 10,
                      }}
                        onClick={() => { if (ftOn) { const disabled = !isSelected && currentSelections.size >= MAX_KEEPERS; if (!disabled) toggleKeeper(p.player); } }}
                      >
                        {/* FT Toggle switch */}
                        <div onClick={(e) => toggleFranchiseTag(p.player, e)} style={{
                          width: 44, height: 26, borderRadius: 13, cursor: "pointer", flexShrink: 0,
                          background: ftOn ? "#9333ea" : "#312e81",
                          border: `2px solid ${ftOn ? "#c084fc" : "#4338ca"}`,
                          display: "flex", alignItems: "center", padding: "0 3px",
                          transition: "all 0.2s",
                          justifyContent: ftOn ? "flex-end" : "flex-start"
                        }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: ftOn ? "#fff" : "#a5b4fc" }} />
                        </div>
                        {/* Round badge */}
                        <div style={{ ...roundStyle(p.keeper_cost), borderRadius: 8, padding: isMobile ? "6px 0" : "4px 0", minWidth: isMobile ? 46 : 52, textAlign: "center", flexShrink: 0, opacity: ftOn ? 1 : 0.5 }}>
                          <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 900, lineHeight: 1 }}>R{p.keeper_cost}</div>
                          {hasMissing && <div style={{ fontSize: 9, marginTop: 2 }}>🚫</div>}
                        </div>
                        {/* Player info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 700, color: ftOn ? "#e9d5ff" : "#a78bfa", lineHeight: 1.2 }}>{p.player}</div>
                          <div style={{ fontSize: 11, marginTop: 2, color: ftOn ? "#c084fc" : "#7c3aed" }}>
                            ⭐ FT · Drafted R{p.round_2025}{p.was_keeper_2025 ? " 🔁" : ""}
                            {!ftOn && <span style={{ color: "#a78bfa" }}> — flip toggle to activate</span>}
                          </div>
                        </div>
                        {/* Checkbox when FT is on */}
                        {ftOn && (
                          <div style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                            border: `2px solid ${isSelected ? "#a855f7" : "#6d28d9"}`,
                            background: isSelected ? "#9333ea" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {isSelected && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* INELIGIBLE SECTION */}
            {ineligiblePlayers.filter(p => !p.ft_eligible).length > 0 && (
              <>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#f87171", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
                  ✗ Ineligible ({ineligiblePlayers.filter(p => !p.ft_eligible).length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 4 : 3 }}>
                  {ineligiblePlayers.filter(p => !p.ft_eligible).map(p => (
                    <div key={p.player} style={{
                      padding: isMobile ? "8px 12px" : "8px 14px", borderRadius: 8,
                      border: "1px solid #7f1d1d",
                      background: "#1c0707",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      {/* Round badge — muted red tint */}
                      <div style={{ background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: isMobile ? "6px 0" : "4px 0", minWidth: isMobile ? 46 : 52, textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 900, color: "#fca5a5", lineHeight: 1 }}>R{p.keeper_cost}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 14 : 13, color: "#fca5a5", textDecoration: "line-through", lineHeight: 1.2 }}>{p.player}</div>
                        <div style={{ fontSize: 11, color: "#f87171", marginTop: 2 }}>
                          {p.ft_maxed ? "⭐ FT maxed (5 seasons)" : p.ineligible_reason?.split("—")[0].trim() || "Service time expired"}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>✗</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SUMMARY VIEW */}
      {viewMode === "summary" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 16 }}>
            Keeper Selections by Team
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {OWNER_ORDER.map(owner => {
              const data = KEEPER_DATA[owner];
              const sel = selections[owner];
              const ft = franchiseTags[owner];
              const color = OWNER_COLORS[owner];
              const kept = data.players.filter(p => sel.has(p.player) && isEligibleForOwner(p, owner, ft));
              const missing = MISSING_PICKS_2026[data.teamName] || [];
              const roundConflicts = {};
              kept.forEach(p => { roundConflicts[p.keeper_cost] = (roundConflicts[p.keeper_cost] || 0) + 1; });
              const conflicts = new Set(Object.entries(roundConflicts).filter(([, v]) => v > 1).map(([k]) => parseInt(k)));

              return (
                <div key={owner} style={{ background: "#111827", border: `1px solid ${color}33`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color }}>{owner}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{data.teamName}</div>
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      background: `${color}22`, color,
                      border: `1px solid ${color}44`
                    }}>{kept.length}/{MAX_KEEPERS}</div>
                  </div>

                  {kept.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>No keepers selected</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {kept.sort((a, b) => a.keeper_cost - b.keeper_cost).map(p => {
                        const hasMissing = missing.includes(p.keeper_cost);
                        const hasConflict = conflicts.has(p.keeper_cost);
                        const usingFT = ft.has(p.player) || p.franchise_tag;
                        const hasIssue = hasMissing || hasConflict;
                        return (
                          <div key={p.player} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                            padding: "5px 8px", borderRadius: 6,
                            background: hasIssue ? "#7f1d1d22" : "#0d1117",
                            border: `1px solid ${hasIssue ? "#ef444433" : "#1e293b"}`
                          }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 12, color: hasIssue ? "#fca5a5" : "#94a3b8" }}>{p.player}</span>
                              {usingFT && <span style={{ marginLeft: 4, fontSize: 10, color: "#a855f7" }}>⭐FT</span>}
                              {p.was_keeper_2025 && <span style={{ marginLeft: 4, fontSize: 10, color: "#94a3b8" }}>🔁</span>}
                              {hasConflict && <span style={{ marginLeft: 4, fontSize: 10 }}>⚠️ dup round</span>}
                              {hasMissing && <span style={{ marginLeft: 4, fontSize: 10 }}>🚫 traded pick</span>}
                            </div>
                            <div style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800, ...roundStyle(p.keeper_cost) }}>
                              R{p.keeper_cost}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Ineligible callout */}
                  {(() => {
                    const ft_applied = ft;
                    const ineligList = data.players.filter(p => !isEligibleForOwner(p, owner, ft_applied));
                    if (ineligList.length === 0) return null;
                    return (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e293b" }}>
                        <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#ef4444", textTransform: "uppercase", marginBottom: 4 }}>Ineligible ({ineligList.length})</div>
                        {ineligList.map(p => (
                          <div key={p.player} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", padding: "2px 0" }}>
                            <span style={{ textDecoration: "line-through" }}>{p.player}</span>
                            <span style={{ color: "#9ca3af", fontStyle: "italic", maxWidth: 180, textAlign: "right" }}>
                              {p.ft_maxed ? "FT maxed" : p.ft_eligible ? "expired (FT avail)" : p.ineligible_reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {missing.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 10, color: "#f97316" }}>
                      🚫 Traded picks: R{missing.join(", R")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEAGUE VIEW */}
      {viewMode === "league" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 16 }}>
            All League Keepers — sorted by pick cost
          </div>
          {leagueKeepers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚾</div>
              <div>No keepers selected yet. Go to Team View to make selections.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {leagueKeepers.map((p, i) => {
                const color = OWNER_COLORS[p.owner];
                const ft = franchiseTags[p.owner];
                const missing = MISSING_PICKS_2026[p.teamName] || [];
                const hasMissing = missing.includes(p.keeper_cost);
                const usingFT = p.franchise_tag || ft.has(p.player);
                return (
                  <div key={i} style={{
                    padding: isMobile ? "8px 10px" : "10px 16px", borderRadius: 8, background: "#111827",
                    border: `1px solid ${hasMissing ? "#f9731644" : "#1e293b"}`,
                    display: "flex", alignItems: "center", gap: isMobile ? 8 : 14
                  }}>
                    <div style={{ padding: "3px 8px", borderRadius: 6, fontSize: isMobile ? 10 : 11, fontWeight: 800, minWidth: isMobile ? 44 : 90, textAlign: "center", ...roundStyle(p.keeper_cost) }}>
                      R{p.keeper_cost}{hasMissing ? " 🚫" : ""}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: "#f1f5f9" }}>{p.player}</span>
                      {usingFT && <span style={{ marginLeft: 6, fontSize: 10, color: "#a855f7" }}>⭐ FT</span>}
                      {p.was_keeper_2025 && <span style={{ marginLeft: 6, fontSize: 10, color: "#94a3b8" }}>🔁</span>}
                    </div>
                    <div style={{ fontSize: isMobile ? 10 : 11, color, fontWeight: 700 }}>{p.owner}</div>
                    {!isMobile && <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.teamName}</div>}
                    {!isMobile && <div style={{ fontSize: 10, color: "#94a3b8" }}>drafted R{p.round_2025}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DRAFT PICKS VIEW */}
      {viewMode === "picks" && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "12px 10px" : "24px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 16 }}>
            2026 Draft Pick Inventory
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: isMobile ? 10 : 16 }}>
            {OWNER_ORDER.map(owner => {
              const data = KEEPER_DATA[owner];
              const color = OWNER_COLORS[owner];
              const missingRounds = MISSING_PICKS_2026[data.teamName] || [];
              const extraPicks = EXTRA_PICKS_2026[data.teamName] || [];
              const ownRounds = Array.from({ length: 28 }, (_, i) => i + 1).filter(r => !missingRounds.includes(r));
              return (
                <div key={owner} style={{ background: "#111827", border: `1px solid ${color}33`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color, marginBottom: 2 }}>{owner}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 12 }}>{data.teamName}</div>
                  {missingRounds.length > 0 && (
                    <div style={{ fontSize: 10, color: "#f97316", marginBottom: 8 }}>🚫 Traded away: R{missingRounds.join(", R")}</div>
                  )}
                  {extraPicks.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      {extraPicks.map((ep, i) => (
                        <div key={i} style={{ fontSize: 10, color: "#f59e0b" }}>➕ R{ep.round} from {ep.from}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {ownRounds.map(r => (
                      <div key={r} style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, ...roundStyle(r) }}>R{r}</div>
                    ))}
                    {extraPicks.map((ep, i) => (
                      <div key={`ex-${i}`} style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#78350f", color: "#fbbf24", border: "1px solid #f59e0b" }}>R{ep.round}*</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 6 }}>* = acquired pick</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
