import { useState, useMemo } from "react";

// ============================================================
// VERIFIED DATA — Cross-referenced from:
//   • Fantrax 2025 Draft Results (actual draft rounds)
//   • 2025 Keeper History (service time, franchise tags, orig rounds)
//   • All 12 Team Roster CSVs (confirmed current ownership)
//   • Trade Transaction History (post-draft player movements)
//   • Sheet17 (2026 Draft Pick ownership after trades)
// Key fixes vs previous version:
//   • Corbin Carroll: LAST year eligible (SL=1), costs R2 not R1
//   • Bobby Witt Jr.: orig round=23, keeper cost=R22, FT, LAST yr (was using draft slot R21)
//   • Tyler Glasnow: now on Kenny (That One Guy), not Brandon
//   • Jose Ramirez: now on Max (Legalize PEDs), traded from Faz in Aug 2025
//   • Yainer Diaz: on Faz (traded from Kenny's keeper to Faz)
//   • Yordan Alvarez: keeper cost R3 (orig R4), not R2
//   • All "Traded Away" players removed from their old teams
// ============================================================

const KEEPER_DATA = {
  "Andrew": {
    teamName: "Thick Jung Buns",
    players: [
      { player: "Francisco Lindor", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Freddie Freeman", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Marcus Semien", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Brenton Doyle", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Raisel Iglesias", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Max Muncy", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jose Berrios", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Jack Flaherty", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Brandon Nimmo", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Spencer Steer", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Roki Sasaki", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Brice Turang", round_2025: 10, keeper_cost_round_2026: 9, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Willy Adames", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Carlos Rodon", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Josh Jung", round_2025: 16, keeper_cost_round_2026: 15, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Kyle Finnegan", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Kerry Carpenter", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Kodai Senga", round_2025: 21, keeper_cost_round_2026: 20, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Matt Wallner", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Devin Williams", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Kumar Rocker", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jacob deGrom", round_2025: 27, keeper_cost_round_2026: 26, service_left: 2, franchise_tag: false, was_keeper_2025: true },
    ]
  },
  "Brandon": {
    teamName: "Pete and the boys",
    players: [
      { player: "Mookie Betts", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: true, was_keeper_2025: true },
      { player: "Trea Turner", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Framber Valdez", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jazz Chisholm Jr.", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Pete Crow-Armstrong", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jake Burger", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Marcell Ozuna", round_2025: 10, keeper_cost_round_2026: 9, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Maikel Garcia", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Nathan Eovaldi", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Chris Bassitt", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Nick Martinez", round_2025: 18, keeper_cost_round_2026: 17, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Lourdes Gurriel Jr.", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jose Caballero", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Nolan Schanuel", round_2025: 25, keeper_cost_round_2026: 24, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Zack Littell", round_2025: 28, keeper_cost_round_2026: 27, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Chase": {
    teamName: "YorDaddy",
    players: [
      { player: "Yordan Alvarez", round_2025: 4, keeper_cost_round_2026: 3, service_left: 1, franchise_tag: true, was_keeper_2025: true },
      { player: "Spencer Strider", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Randy Arozarena", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jhoan Duran", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jose Altuve", round_2025: 9, keeper_cost_round_2026: 8, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Bryan Woo", round_2025: 10, keeper_cost_round_2026: 9, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Bryce Harper", round_2025: 11, keeper_cost_round_2026: 10, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Jeff Hoffman", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Luis Arraez", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Eugenio Suarez", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Rhys Hoskins", round_2025: 18, keeper_cost_round_2026: 17, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Brandon Woodruff", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jordan Westburg", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Shane Bieber", round_2025: 26, keeper_cost_round_2026: 25, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Eric": {
    teamName: "Eric's Rum",
    players: [
      { player: "Juan Soto", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Austin Riley", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Luis Castillo", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Ozzie Albies", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "CJ Abrams", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Logan Webb", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Ian Happ", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Christian Yelich", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Masataka Yoshida", round_2025: 10, keeper_cost_round_2026: 9, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Ryan Walker", round_2025: 10, keeper_cost_round_2026: 9, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Luis Garcia Jr.", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jurickson Profar", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Luke Weaver", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Michael Toglia", round_2025: 15, keeper_cost_round_2026: 14, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Hunter Brown", round_2025: 15, keeper_cost_round_2026: 14, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Ryan Pepiot", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Nick Pivetta", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Paul Goldschmidt", round_2025: 18, keeper_cost_round_2026: 17, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Michael Wacha", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Victor Robles", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Colt Keith", round_2025: 21, keeper_cost_round_2026: 20, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Griffin Jax", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Ryan McMahon", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Shea Langeliers", round_2025: 24, keeper_cost_round_2026: 23, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Tyler Stephenson", round_2025: 26, keeper_cost_round_2026: 25, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jesus Sanchez", round_2025: 27, keeper_cost_round_2026: 26, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jordan Walker", round_2025: 28, keeper_cost_round_2026: 27, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Faz": {
    teamName: "Castellanos' Interruptions",
    players: [
      { player: "Matt Olson", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Blake Snell", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Pablo Lopez", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Bryan Reynolds", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Adolis Garcia", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Tanner Bibee", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Anthony Volpe", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Shane McClanahan", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "William Contreras", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Taylor Ward", round_2025: 10, keeper_cost_round_2026: 9, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jason Foley", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Ketel Marte", round_2025: 13, keeper_cost_round_2026: 12, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Yainer Diaz", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Tommy Edman", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Alec Burleson", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Pete Fairbanks", round_2025: 19, keeper_cost_round_2026: 18, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Seth Lugo", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Jeffrey Springs", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Michael Busch", round_2025: 21, keeper_cost_round_2026: 20, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Dylan Cease", round_2025: 24, keeper_cost_round_2026: 23, service_left: 1, franchise_tag: true, was_keeper_2025: true },
      { player: "Yu Darvish", round_2025: 24, keeper_cost_round_2026: 23, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jo Adell", round_2025: 27, keeper_cost_round_2026: 26, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Kelt": {
    teamName: "Sonny Side Up",
    players: [
      { player: "Jackson Merrill", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Fernando Tatis Jr.", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Gunnar Henderson", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Michael King", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Aaron Nola", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Yoshinobu Yamamoto", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Joe Ryan", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Bo Bichette", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jarren Duran", round_2025: 10, keeper_cost_round_2026: 9, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Will Smith", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Salvador Perez", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Matt Shaw", round_2025: 15, keeper_cost_round_2026: 14, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Yandy Diaz", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Sonny Gray", round_2025: 17, keeper_cost_round_2026: 16, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Kenley Jansen", round_2025: 26, keeper_cost_round_2026: 25, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jameson Taillon", round_2025: 26, keeper_cost_round_2026: 25, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Carlos Estevez", round_2025: 27, keeper_cost_round_2026: 26, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Kenny": {
    teamName: "That One Guy",
    players: [
      { player: "Aaron Judge", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Manny Machado", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Corey Seager", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Hunter Greene", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Bryce Miller", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Matt McLain", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Cody Bellinger", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Freddy Peralta", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Xander Bogaerts", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Nick Castellanos", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Steven Kwan", round_2025: 10, keeper_cost_round_2026: 9, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Kevin Gausman", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Tyler Glasnow", round_2025: 11, keeper_cost_round_2026: 10, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Cristopher Sanchez", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Gleyber Torres", round_2025: 15, keeper_cost_round_2026: 14, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Nolan Arenado", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Cedric Mullins", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Cal Raleigh", round_2025: 18, keeper_cost_round_2026: 17, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Nathaniel Lowe", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Merrill Kelly", round_2025: 24, keeper_cost_round_2026: 23, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Robert Suarez", round_2025: 28, keeper_cost_round_2026: 27, service_left: 2, franchise_tag: false, was_keeper_2025: true },
    ]
  },
  "Knetzer": {
    teamName: "Knetzy the Jet Rodriguez",
    players: [
      { player: "Vladimir Guerrero Jr.", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Rafael Devers", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Junior Caminero", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Julio Rodriguez", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: true, was_keeper_2025: true },
      { player: "Jackson Holliday", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Riley Greene", round_2025: 12, keeper_cost_round_2026: 11, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Heliot Ramos", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Paul Skenes", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Nico Hoerner", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Roman Anthony", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Max Scherzer", round_2025: 21, keeper_cost_round_2026: 20, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Aroldis Chapman", round_2025: 21, keeper_cost_round_2026: 20, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Clay Holmes", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Gerrit Cole", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jose Quintana", round_2025: 26, keeper_cost_round_2026: 25, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Matthew Boyd", round_2025: 28, keeper_cost_round_2026: 27, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Landon": {
    teamName: "Et Tu Ippei? Redux",
    players: [
      { player: "Shohei Ohtani", round_2025: 1, keeper_cost_round_2026: 1, service_left: 1, franchise_tag: true, was_keeper_2025: true },
      { player: "Corbin Carroll", round_2025: 3, keeper_cost_round_2026: 2, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "James Wood", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Mike Trout", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Logan Gilbert", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Teoscar Hernandez", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Mark Vientos", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Ezequiel Tovar", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Isaac Paredes", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Yusei Kikuchi", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Andres Gimenez", round_2025: 13, keeper_cost_round_2026: 12, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Shane Baz", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "MacKenzie Gore", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Andres Munoz", round_2025: 16, keeper_cost_round_2026: 15, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Nick Lodolo", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Bryson Stott", round_2025: 18, keeper_cost_round_2026: 17, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Trevor Story", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jake Cronenworth", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Lucas Erceg", round_2025: 21, keeper_cost_round_2026: 20, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jesus Luzardo", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "TJ Friedl", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Brayan Bello", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Andrew Painter", round_2025: 24, keeper_cost_round_2026: 23, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Eduardo Rodriguez", round_2025: 25, keeper_cost_round_2026: 24, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Charlie Morton", round_2025: 26, keeper_cost_round_2026: 25, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Max": {
    teamName: "Legalize PEDs",
    players: [
      { player: "Jose Ramirez", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Kyle Tucker", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Kyle Schwarber", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Oneil Cruz", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Tarik Skubal", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Brandon Lowe", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Christian Walker", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Edwin Diaz", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Zac Gallen", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Wyatt Langford", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "George Kirby", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Chris Sale", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Vinnie Pasquantino", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Xavier Edwards", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Seiya Suzuki", round_2025: 14, keeper_cost_round_2026: 13, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Alec Bohm", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Byron Buxton", round_2025: 15, keeper_cost_round_2026: 14, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Tanner Scott", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Brady Singer", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Gavin Williams", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Eury Perez", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Sam W": {
    teamName: "Team samweidig",
    players: [
      { player: "Ronald Acuna Jr.", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Pete Alonso", round_2025: 2, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Josh Naylor", round_2025: 3, keeper_cost_round_2026: 2, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Zach Eflin", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Felix Bautista", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Max Fried", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Alex Bregman", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Dansby Swanson", round_2025: 8, keeper_cost_round_2026: 7, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jeremy Pena", round_2025: 9, keeper_cost_round_2026: 8, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Carlos Correa", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Grayson Rodriguez", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "George Springer", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Giancarlo Stanton", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Jorge Soler", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Taj Bradley", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Bowden Francis", round_2025: 17, keeper_cost_round_2026: 16, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Brent Rooker", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Ranger Suarez", round_2025: 19, keeper_cost_round_2026: 18, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Luis Rengifo", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Brendan Donovan", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Reese Olson", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Kirby Yates", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Drew Rasmussen", round_2025: 24, keeper_cost_round_2026: 23, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
  "Will": {
    teamName: "Honey Nut Chourios",
    players: [
      { player: "Garrett Crochet", round_2025: 1, keeper_cost_round_2026: 1, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Michael Harris II", round_2025: 4, keeper_cost_round_2026: 3, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Lawrence Butler", round_2025: 5, keeper_cost_round_2026: 4, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Cole Ragans", round_2025: 6, keeper_cost_round_2026: 5, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Matt Chapman", round_2025: 7, keeper_cost_round_2026: 6, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Jackson Chourio", round_2025: 11, keeper_cost_round_2026: 10, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Shota Imanaga", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Sandy Alcantara", round_2025: 12, keeper_cost_round_2026: 11, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "David Bednar", round_2025: 14, keeper_cost_round_2026: 13, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Royce Lewis", round_2025: 16, keeper_cost_round_2026: 15, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Trevor Megill", round_2025: 18, keeper_cost_round_2026: 17, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Kristian Campbell", round_2025: 20, keeper_cost_round_2026: 19, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Dylan Crews", round_2025: 22, keeper_cost_round_2026: 21, service_left: 2, franchise_tag: false, was_keeper_2025: true },
      { player: "Elly De La Cruz", round_2025: 23, keeper_cost_round_2026: 22, service_left: 1, franchise_tag: false, was_keeper_2025: true },
      { player: "Bobby Witt Jr.", round_2025: 23, keeper_cost_round_2026: 22, service_left: 1, franchise_tag: true, was_keeper_2025: true },
      { player: "Bubba Chandler", round_2025: 23, keeper_cost_round_2026: 22, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Ceddanne Rafaela", round_2025: 25, keeper_cost_round_2026: 24, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Justin Verlander", round_2025: 26, keeper_cost_round_2026: 25, service_left: 2, franchise_tag: false, was_keeper_2025: false },
      { player: "Ryan Weathers", round_2025: 27, keeper_cost_round_2026: 26, service_left: 2, franchise_tag: false, was_keeper_2025: false },
    ]
  },
};

// 2026 Draft Pick Ownership — from Sheet17
// Picks traded AWAY from each team
const MISSING_PICKS_2026 = {
  "Legalize PEDs": [1, 4, 5, 6, 8, 9, 16],
  "That One Guy": [3, 4, 9, 13],
  "Sonny Side Up": [5],
  "YorDaddy": [5, 7, 10],
};

// Extra picks each team acquired (beyond their own)
const EXTRA_PICKS_2026 = {
  "Castellanos' Interruptions": [
    { round: 1, from: "Legalize PEDs" },
    { round: 6, from: "Legalize PEDs" },
  ],
  "Knetzy the Jet Rodriguez": [
    { round: 3, from: "That One Guy" },
    { round: 5, from: "Sonny Side Up" },
    { round: 5, from: "YorDaddy" },
    { round: 9, from: "Legalize PEDs" },
  ],
  "Pete and the boys": [
    { round: 7, from: "YorDaddy" },
    { round: 8, from: "Legalize PEDs" },
    { round: 9, from: "That One Guy" },
    { round: 10, from: "YorDaddy" },
    { round: 13, from: "That One Guy" },
  ],
  "Thick Jung Buns": [
    { round: 4, from: "That One Guy" },
    { round: 4, from: "Legalize PEDs" },
    { round: 5, from: "Legalize PEDs" },
    { round: 16, from: "Legalize PEDs" },
  ],
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
  const [selections, setSelections] = useState(() => {
    const init = {};
    Object.keys(KEEPER_DATA).forEach(owner => { init[owner] = new Set(); });
    return init;
  });
  const [viewMode, setViewMode] = useState("team");
  const [searchQuery, setSearchQuery] = useState("");

  const ownerData = KEEPER_DATA[selectedOwner];
  const ownerColor = OWNER_COLORS[selectedOwner];
  const currentSelections = selections[selectedOwner];

  const toggleKeeper = (playerName) => {
    const newSelections = { ...selections };
    const set = new Set(newSelections[selectedOwner]);
    if (set.has(playerName)) {
      set.delete(playerName);
    } else {
      if (set.size >= MAX_KEEPERS) return;
      set.add(playerName);
    }
    newSelections[selectedOwner] = set;
    setSelections(newSelections);
  };

  const selectedPlayers = ownerData.players.filter(p => currentSelections.has(p.player));
  const roundCounts = {};
  selectedPlayers.forEach(p => {
    const r = p.keeper_cost_round_2026;
    roundCounts[r] = (roundCounts[r] || 0) + 1;
  });
  const conflictRounds = new Set(Object.entries(roundCounts).filter(([,v]) => v > 1).map(([k]) => parseInt(k)));
  const missingPicks = MISSING_PICKS_2026[ownerData.teamName] || [];

  const leagueKeepers = useMemo(() => {
    const result = [];
    Object.entries(KEEPER_DATA).forEach(([owner, data]) => {
      const sel = selections[owner];
      data.players.filter(p => sel.has(p.player)).forEach(p => {
        result.push({ ...p, owner, teamName: data.teamName });
      });
    });
    return result.sort((a, b) => a.keeper_cost_round_2026 - b.keeper_cost_round_2026);
  }, [selections]);

  const filteredLeague = leagueKeepers.filter(p =>
    p.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roundStyle = (r) => {
    if (r <= 3) return { background: "#78350f", color: "#fbbf24", border: "1px solid #92400e" };
    if (r <= 8) return { background: "#14532d", color: "#4ade80", border: "1px solid #166534" };
    if (r <= 15) return { background: "#0c4a6e", color: "#38bdf8", border: "1px solid #075985" };
    return { background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" };
  };

  return (
    <div style={{ fontFamily: "'Courier New', monospace", background: "#0a0a0f", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", borderBottom: "1px solid #1e3a5f", padding: "20px 24px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Pete Rose's Fantasy League</div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em", margin: 0 }}>⚾ 2026 KEEPER MANAGER</h1>
              <div style={{ fontSize: 10, color: "#22c55e", marginTop: 3 }}>✓ Verified against: Draft results · Roster CSVs · Trade history · Keeper history · Sheet17</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["team","Team View"],["league","League View"],["picks","Draft Picks"]].map(([mode, label]) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{
                  padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background: viewMode === mode ? "#3b82f6" : "#1e293b", color: viewMode === mode ? "#fff" : "#94a3b8",
                }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TEAM VIEW */}
      {viewMode === "team" && (
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 16px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Owners</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {OWNER_ORDER.map(owner => {
                const data = KEEPER_DATA[owner];
                const sel = selections[owner];
                const color = OWNER_COLORS[owner];
                const isActive = selectedOwner === owner;
                return (
                  <button key={owner} onClick={() => setSelectedOwner(owner)} style={{
                    padding: "10px 14px", borderRadius: 8, border: isActive ? `1px solid ${color}` : "1px solid #1e293b",
                    cursor: "pointer", textAlign: "left", background: isActive ? `${color}18` : "#111827"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? color : "#94a3b8" }}>{owner}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{data.teamName}</div>
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

          <div>
            <div style={{ background: "#111827", border: `1px solid ${ownerColor}44`, borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#475569", textTransform: "uppercase" }}>{ownerData.teamName}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: ownerColor, marginTop: 4 }}>{selectedOwner}</div>
                  {missingPicks.length > 0 && (
                    <div style={{ fontSize: 10, color: "#f97316", marginTop: 4 }}>
                      🚫 Picks traded away: R{missingPicks.join(", R")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: currentSelections.size >= MAX_KEEPERS ? "#ef4444" : ownerColor }}>{currentSelections.size}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>SELECTED</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#475569" }}>{MAX_KEEPERS}</div>
                    <div style={{ fontSize: 10, color: "#475569" }}>MAX</div>
                  </div>
                </div>
              </div>

              {currentSelections.size > 0 && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>Selected Keepers → Picks Forfeited</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selectedPlayers.map(p => {
                      const hasConflict = conflictRounds.has(p.keeper_cost_round_2026);
                      const hasMissing = missingPicks.includes(p.keeper_cost_round_2026);
                      const hasIssue = hasConflict || hasMissing;
                      return (
                        <div key={p.player} style={{
                          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: hasIssue ? "#7f1d1d" : "#1e3a5f",
                          border: `1px solid ${hasIssue ? "#ef444466" : ownerColor + "44"}`,
                          color: hasIssue ? "#fca5a5" : "#93c5fd",
                          display: "flex", alignItems: "center", gap: 6
                        }}>
                          {hasConflict && <span>⚠️</span>}{hasMissing && !hasConflict && <span>🚫</span>}
                          <span>{p.player}</span>
                          <span style={{ opacity: 0.6 }}>→ R{p.keeper_cost_round_2026}</span>
                        </div>
                      );
                    })}
                  </div>
                  {conflictRounds.size > 0 && (
                    <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "#7f1d1d22", border: "1px solid #ef444444", color: "#fca5a5", fontSize: 11 }}>
                      ⚠️ <strong>Denman Memorial Rule:</strong> Multiple keepers forfeiting R{[...conflictRounds].join(", R")} — only one allowed per round.
                    </div>
                  )}
                  {selectedPlayers.some(p => missingPicks.includes(p.keeper_cost_round_2026)) && (
                    <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: "#7c2d1222", border: "1px solid #f9731644", color: "#fdba74", fontSize: 11 }}>
                      🚫 <strong>Traded pick conflict:</strong> {selectedOwner} no longer owns R{selectedPlayers.filter(p => missingPicks.includes(p.keeper_cost_round_2026)).map(p => p.keeper_cost_round_2026).join(", R")} — cannot use as keeper cost.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12, fontSize: 10, color: "#475569" }}>
              <span>🏷️ Last year eligible</span>
              <span>⭐ Franchise tag player</span>
              <span>🔁 Was a 2025 keeper</span>
              <span>🚫 Pick was traded away</span>
              <span style={{ background: "#78350f", padding: "1px 6px", borderRadius: 3, color: "#fbbf24" }}>R1-3</span>
              <span style={{ background: "#14532d", padding: "1px 6px", borderRadius: 3, color: "#4ade80" }}>R4-8</span>
              <span style={{ background: "#0c4a6e", padding: "1px 6px", borderRadius: 3, color: "#38bdf8" }}>R9-15</span>
              <span style={{ background: "#1e293b", padding: "1px 6px", borderRadius: 3, color: "#94a3b8" }}>R16+</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {ownerData.players.map(p => {
                const isSelected = currentSelections.has(p.player);
                const isDisabled = !isSelected && currentSelections.size >= MAX_KEEPERS;
                const hasConflict = isSelected && conflictRounds.has(p.keeper_cost_round_2026);
                const hasMissing = missingPicks.includes(p.keeper_cost_round_2026);
                const isLastYear = p.service_left <= 1;
                return (
                  <div key={p.player} onClick={() => !isDisabled && toggleKeeper(p.player)} style={{
                    padding: "10px 14px", borderRadius: 8, cursor: isDisabled ? "not-allowed" : "pointer",
                    border: hasConflict ? "1px solid #ef444444" : isSelected ? `1px solid ${ownerColor}66` : "1px solid #1e293b",
                    background: hasConflict ? "#7f1d1d22" : isSelected ? `${ownerColor}14` : isDisabled ? "#0d1117" : "#111827",
                    opacity: isDisabled ? 0.4 : 1,
                    display: "flex", alignItems: "center", gap: 12
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, border: `2px solid ${isSelected ? ownerColor : "#334155"}`,
                      background: isSelected ? ownerColor : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {isSelected && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#f1f5f9" : "#94a3b8" }}>{p.player}</span>
                      <span style={{ marginLeft: 8, fontSize: 11 }}>
                        {isLastYear && "🏷️"}{p.franchise_tag && " ⭐"}{p.was_keeper_2025 && " 🔁"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", minWidth: 65, textAlign: "right" }}>Drafted R{p.round_2025}</div>
                    <div style={{ fontSize: 11, color: "#334155" }}>→</div>
                    <div style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, minWidth: 90, textAlign: "center", ...roundStyle(p.keeper_cost_round_2026) }}>
                      Forfeit R{p.keeper_cost_round_2026}{hasMissing ? " 🚫" : ""}
                    </div>
                    <div style={{
                      padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, minWidth: 50, textAlign: "center",
                      background: isLastYear ? "#7f1d1d22" : "#1e293b",
                      color: isLastYear ? "#fca5a5" : "#475569",
                      border: `1px solid ${isLastYear ? "#ef444433" : "#1e293b"}`
                    }}>{p.service_left}yr left</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LEAGUE VIEW */}
      {viewMode === "league" && (
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginBottom: 20 }}>
            {OWNER_ORDER.map(owner => {
              const data = KEEPER_DATA[owner];
              const sel = selections[owner];
              const color = OWNER_COLORS[owner];
              return (
                <div key={owner} onClick={() => { setViewMode("team"); setSelectedOwner(owner); }} style={{
                  padding: "12px 14px", borderRadius: 10, border: `1px solid ${color}33`, background: "#111827", cursor: "pointer"
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color }}>{owner}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{data.teamName}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: sel.size >= MAX_KEEPERS ? "#ef4444" : sel.size > 0 ? color : "#334155", marginTop: 6 }}>
                    {sel.size}<span style={{ fontSize: 12, color: "#334155" }}>/{MAX_KEEPERS}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginBottom: 16 }}>
            <input type="text" placeholder="Search players, owners, teams..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} style={{
                width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #1e293b",
                background: "#111827", color: "#e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit"
              }} />
          </div>
          {leagueKeepers.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#334155" }}>No keepers selected yet. Switch to Team View to select keepers.</div>
          ) : (
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#475569", textTransform: "uppercase", marginBottom: 12 }}>
                All Confirmed Keepers — {leagueKeepers.length} Total
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {filteredLeague.map((p, i) => {
                  const color = OWNER_COLORS[p.owner];
                  return (
                    <div key={i} style={{
                      padding: "10px 14px", borderRadius: 8, border: `1px solid ${color}33`,
                      background: "#111827", display: "flex", alignItems: "center", gap: 12
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <div style={{ minWidth: 80, fontSize: 11, fontWeight: 700, color }}>{p.owner}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                        {p.player}
                        {p.franchise_tag && <span style={{ marginLeft: 6, fontSize: 10, color: "#fbbf24" }}>⭐ FT</span>}
                        {p.was_keeper_2025 && <span style={{ marginLeft: 6, fontSize: 10, color: "#94a3b8" }}>🔁</span>}
                        {p.service_left <= 1 && <span style={{ marginLeft: 6, fontSize: 10, color: "#fca5a5" }}>🏷️ LAST YR</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#475569" }}>Rd {p.round_2025}</div>
                      <div style={{ fontSize: 11, color: "#334155" }}>→</div>
                      <div style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, ...roundStyle(p.keeper_cost_round_2026) }}>
                        Forfeit R{p.keeper_cost_round_2026}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PICKS VIEW */}
      {viewMode === "picks" && (
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>2026 Draft Pick Ownership — Sheet17</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Each team's current draft pick inventory. <span style={{color:"#fb923c"}}>Orange picks</span> were acquired via trade (original owner shown). 🚫 picks were traded away.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
            {OWNER_ORDER.map(owner => {
              const data = KEEPER_DATA[owner];
              const teamName = data.teamName;
              const missing = MISSING_PICKS_2026[teamName] || [];
              const extras = EXTRA_PICKS_2026[teamName] || [];
              const color = OWNER_COLORS[owner];

              const picks = [];
              for (let r = 1; r <= 28; r++) {
                if (!missing.includes(r)) {
                  const extra = extras.find(e => e.round === r);
                  picks.push({ round: r, fromTeam: extra ? extra.from : null });
                }
              }
              // Add extra picks at rounds not in base 1-28
              extras.forEach(e => {
                if (!picks.find(p => p.round === e.round && p.fromTeam === e.from)) {
                  // Only if round would otherwise be missing
                }
              });
              picks.sort((a, b) => a.round - b.round);

              return (
                <div key={owner} style={{ background: "#111827", border: `1px solid ${color}33`, borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontWeight: 800, color, fontSize: 14 }}>{owner}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: missing.length > 0 ? 6 : 10 }}>{teamName}</div>
                  {missing.length > 0 && (
                    <div style={{ fontSize: 10, color: "#f97316", marginBottom: 8 }}>🚫 Traded away: R{missing.join(", R")}</div>
                  )}
                  {extras.length > 0 && (
                    <div style={{ fontSize: 10, color: "#fb923c", marginBottom: 8 }}>
                      ➕ Acquired: {extras.map(e => `R${e.round} (from ${e.from.split("'")[0].split(" ")[0]})`).join(", ")}
                    </div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {picks.map((p, i) => (
                      <div key={i} style={{
                        padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                        background: p.fromTeam ? "#7c3a00" : "#1e293b",
                        color: p.fromTeam ? "#fb923c" : "#64748b",
                        border: `1px solid ${p.fromTeam ? "#c2410c44" : "#334155"}`
                      }}>
                        R{p.round}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
