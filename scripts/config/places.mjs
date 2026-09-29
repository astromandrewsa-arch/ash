// The 100 covered areas (CLAUDE.md §6). Homes places list their clusters; each cluster becomes one
// area record. Home counts and average TIVs are set so every bundle matches the §15 table exactly
// (policies and TIV) and the Austin and Oklahoma group totals match §6.
//
// `at` pins a cluster centroid (used where a dated fire must reach it); otherwise clusters are
// placed 1–3 km out from the named centroid, never on the downtown. `density` is homes per hectare.

export const BUNDLES = {
  'austin-lake': { name: 'Austin Lake', short: 'AL' },
  'austin-north': { name: 'Austin North', short: 'AN' },
  'hill-country-west': { name: 'Hill Country West', short: 'HCW' },
  'lost-pines': { name: 'Lost Pines', short: 'LP' },
  'cross-timbers': { name: 'Cross Timbers', short: 'CT' },
  'panhandle-north': { name: 'Panhandle North', short: 'PN' },
  'permian-rolling-plains': { name: 'Permian and Rolling Plains', short: 'PRP' },
  'oklahoma-central': { name: 'Oklahoma Central', short: 'OKC' },
  'osage-rangeland': { name: 'Osage rangeland (farm)', short: 'OSG' },
}

const h = (year, name, acres, homesLost, cause, structures = null) => ({ year, name, acres, homesLost, cause, ...(structures ? { structures } : {}) })

// Public fire records, checked against Texas A&M Forest Service, Oklahoma OEM, FEMA, NWS, NPS and
// InciWeb reports (29 Sep 2026). `homesLost` is null where only a structure count is published.
// Areas list the recorded fires in their region; sites with no public record list none.
const F = {
  bastrop2011: h(2011, 'Bastrop County Complex', 32400, 1660, 'Wind-snapped pines on power lines'),
  hiddenPines2015: h(2015, 'Hidden Pines Fire', 4582, 64, 'Equipment (towed shredder)'),
  steiner2011: h(2011, 'Steiner Ranch Fire', 125, 23, 'Power lines arcing on RM 620'),
  pedernales2011: h(2011, 'Pedernales Bend Fire', 6400, null, 'Power lines touching in wind', 65),
  pk2011: h(2011, 'Possum Kingdom Complex', 126734, 168, 'Lightning'),
  eastAmarillo2006: h(2006, 'East Amarillo Complex', 907245, null, 'Downed power lines', 89),
  doubleDiamond2014: h(2014, 'Double Diamond Fire', 2202, 225, 'Not published'),
  windyDeuce2024: h(2024, 'Windy Deuce Fire', 144045, 50, 'Power line on an oil-pad pole'),
  smokehouse2024: h(2024, 'Smokehouse Creek Fire', 1058482, null, 'Decayed utility pole', 500),
  grapeVine2024: h(2024, 'Grape Vine Creek Fire', 34882, 1, 'Broken power pole'),
  perryton2017: h(2017, 'Perryton Fire', 318056, 2, 'Power line shorted in wind'),
  eastland2022: h(2022, 'Eastland Complex', 54513, 86, 'Suspected power lines'),
  kidd2022: h(2022, 'Kidd Fire, Eastland Complex', 54513, 86, 'Suspected power lines'),
  crabapple2025: h(2025, 'Crabapple Fire', 9858, 9, 'Undetermined roadside start'),
  crossPlains2005: h(2005, 'Cross Plains Fire', 6835, 116, 'Presumed discarded cigarette'),
  outbreak2009: h(2009, '9 April outbreak, Texas', 147924, 111, 'Wind-driven outbreak'),
  stillwater2025: h(2025, 'Stillwater fires, 14 March outbreak', 7639, 202, 'Wind-driven outbreak'),
  road33_2025: h(2025, '33 Road Fire', 31245, 49, 'Not published', 160),
  mannford2012: h(2012, 'Creek County (Mannford) Fire', 58500, 376, 'Discarded cigarette'),
  noble2012: h(2012, 'Noble–Slaughterville Fire', 7900, null, 'Arson'),
  starbuck2017: h(2017, 'Starbuck Fire (OK–KS)', 662687, 26, 'Power lines arcing in wind'),
  rhea2018: h(2018, 'Rhea Fire', 286196, 50, 'Not published'),
}

export const HOME_PLACES = [
  // ---------------- Austin outskirts (24,000 homes) ----------------
  {
    key: 'STR', name: 'Steiner Ranch', centroid: [30.381, -97.886], county: 'Travis County', group: 'austin', bundle: 'austin-lake', density: 2.4, lakeBonus: 0.35,
    clusters: [
      { homes: 1500, avgTiv: 650000, at: [30.3825, -97.8895] },
      { homes: 1300, avgTiv: 436000, at: [30.3715, -97.8305] },
    ],
    hook: '2011 Labor Day: 23 homes lost; a power-line arc on RM 620 and one road in and out.',
    history: [F.steiner2011],
  },
  {
    key: 'LKW', name: 'Lakeway', centroid: [30.365, -97.976], county: 'Travis County', group: 'austin', bundle: 'austin-lake', density: 2.6,
    clusters: [{ homes: 1550, avgTiv: 470000 }, { homes: 1450, avgTiv: 450000 }],
    hook: 'Between the 2011 Pedernales Bend and Steiner Ranch fires on Lake Travis.',
    history: [F.pedernales2011, F.steiner2011],
  },
  {
    key: 'BEE', name: 'Bee Cave', centroid: [30.307, -97.965], county: 'Travis County', group: 'austin', bundle: 'austin-lake', density: 2.4,
    clusters: [{ homes: 1700, avgTiv: 420000 }],
    hook: 'Balcones juniper edge; the 2011 Pedernales Bend fire burned 6,400 ac up the lake to the north-west.',
    history: [F.pedernales2011],
  },
  {
    key: 'WLH', name: 'West Lake Hills', centroid: [30.292, -97.808], county: 'Travis County', group: 'austin', bundle: 'austin-lake', density: 1.6,
    clusters: [{ homes: 1000, avgTiv: 1200000 }],
    hook: 'Average home price $1.2M on juniper-oak canyon slopes above Lake Austin.',
    history: [F.steiner2011],
  },
  {
    key: 'JES', name: 'Jester Estates', centroid: [30.4, -97.8], county: 'Travis County', group: 'austin', bundle: 'austin-lake', density: 2.2,
    clusters: [{ homes: 1300, avgTiv: 590000 }],
    hook: 'Borders the Bull Creek preserve: continuous juniper canopy up to the back fences.',
    history: [F.steiner2011],
  },
  {
    key: 'JON', name: 'Jonestown', centroid: [30.481, -97.929], county: 'Travis County', group: 'austin', bundle: 'austin-north', density: 3.0,
    clusters: [{ homes: 2600, avgTiv: 450000 }],
    hook: 'North-shore Lake Travis breaks, across the lake from the 2011 Steiner Ranch fire.',
    history: [F.steiner2011, F.pedernales2011],
  },
  {
    key: 'LGV', name: 'Lago Vista', centroid: [30.467, -98.0], county: 'Travis County', group: 'austin', bundle: 'austin-north', density: 3.0,
    clusters: [{ homes: 2900, avgTiv: 500000 }],
    hook: 'Juniper breaks run to the shoreline; watched after the 2011 Labor Day fires across the lake.',
    history: [F.pedernales2011],
  },
  {
    key: 'CDP', name: 'Cedar Park west edge', centroid: [30.507, -97.83], county: 'Williamson County', group: 'austin', bundle: 'austin-north', density: 3.6,
    clusters: [{ homes: 3300, avgTiv: 520000 }],
    hook: 'Western edge meets the Balcones Canyonlands refuge juniper.',
    history: [F.steiner2011],
  },
  {
    key: 'LEA', name: 'Leander west edge', centroid: [30.579, -97.853], county: 'Williamson County', group: 'austin', bundle: 'austin-north', density: 3.6,
    clusters: [{ homes: 3200, avgTiv: 500000 }],
    hook: 'New subdivisions pushed into cedar brakes west of US-183A.',
    history: [F.steiner2011],
  },
  {
    key: 'SPW', name: 'Spicewood', centroid: [30.476, -98.156], county: 'Burnet County', group: 'austin', bundle: 'hill-country-west', density: 1.4,
    clusters: [{ homes: 700, avgTiv: 470000 }],
    hook: 'Pedernales Bend 2011: 6,400 ac, 65 structures.',
    history: [F.pedernales2011],
  },
  {
    key: 'DRS', name: 'Dripping Springs', centroid: [30.203, -98.085], county: 'Hays County', group: 'austin', bundle: 'hill-country-west', density: 1.5,
    clusters: [{ homes: 800, avgTiv: 450000 }],
    hook: 'Fast-growing ranchettes on the Hays County juniper plateau.',
    history: [F.pedernales2011],
  },
  {
    key: 'WIM', name: 'Wimberley', centroid: [29.981, -98.106], county: 'Hays County', group: 'austin', bundle: 'hill-country-west', density: 1.4,
    clusters: [{ homes: 700, avgTiv: 390000 }],
    hook: 'Cypress Creek hills: oak-juniper woodland with one-lane access roads.',
    history: [F.pedernales2011],
  },

  // ---------------- Texas towns (19,000 homes) ----------------
  {
    key: 'FBG', name: 'Fredericksburg', centroid: [30.264, -98.875], county: 'Gillespie County', group: 'town', bundle: 'hill-country-west', density: 1.8,
    clusters: [
      { homes: 520, avgTiv: 400000, at: [30.2985, -98.8615] },
      { homes: 480, avgTiv: 380000, at: [30.2455, -98.9055] },
      { homes: 500, avgTiv: 390000, at: [30.2625, -98.8335] },
    ],
    hook: 'Crabapple 2025: 9,858 ac, 9 homes.',
    history: [F.crabapple2025],
  },
  {
    key: 'KRV', name: 'Kerrville', centroid: [30.048, -99.141], county: 'Kerr County', group: 'town', bundle: 'hill-country-west', density: 1.8,
    clusters: [{ homes: 520, avgTiv: 340000 }, { homes: 490, avgTiv: 330000 }, { homes: 490, avgTiv: 320000 }],
    hook: 'Kerr County: 50% of structures rated high or extreme wildfire risk.',
    history: [F.crabapple2025],
  },
  {
    key: 'BAS', name: 'Bastrop', centroid: [30.112, -97.318], county: 'Bastrop County', group: 'town', bundle: 'lost-pines', density: 1.6,
    clusters: [
      { homes: 760, avgTiv: 330000, at: [30.0905, -97.2585] },
      { homes: 700, avgTiv: 320000, at: [30.1255, -97.2105] },
      { homes: 720, avgTiv: 300000, at: [30.1425, -97.3435] },
    ],
    hook: '2011 complex: 1,645+ homes, $325M insured; pine fell on power lines.',
    history: [F.bastrop2011, F.hiddenPines2015],
  },
  {
    key: 'SMV', name: 'Smithville', centroid: [30.004, -97.149], county: 'Bastrop County', group: 'town', bundle: 'lost-pines', density: 1.6,
    clusters: [{ homes: 720, avgTiv: 290000, at: [30.0175, -97.1735] }],
    hook: 'Hidden Pines 2015 burned 4,582 ac and 64 homes north-west of town.',
    history: [F.hiddenPines2015, F.bastrop2011],
  },
  {
    key: 'MBF', name: 'Marble Falls', centroid: [30.567, -98.283], county: 'Burnet County', group: 'town', bundle: 'hill-country-west', density: 1.8,
    clusters: [{ homes: 520, avgTiv: 365000 }, { homes: 480, avgTiv: 350000 }],
    hook: 'Highland Lakes granite hills; the 2011 Pedernales Bend fire burned 6,400 ac at Spicewood, 15 km south-east.',
    history: [F.pedernales2011],
  },
  {
    key: 'PKL', name: 'Graford / Possum Kingdom', centroid: [32.867, -98.433], county: 'Palo Pinto County', group: 'town', bundle: 'cross-timbers', density: 1.1, lakeBonus: 0.45,
    clusters: [
      { homes: 200, avgTiv: 420000, at: null },
      { homes: 200, avgTiv: 400000, at: null },
      { homes: 200, avgTiv: 380000, at: null },
    ],
    hook: 'PK Complex 2011: 126,734 ac, 168 homes, lightning.',
    history: [F.pk2011],
  },
  {
    key: 'AMA', name: 'Amarillo south edge', centroid: [35.199, -101.845], county: 'Randall County', group: 'town', bundle: 'panhandle-north', density: 2.2,
    clusters: [{ homes: 380, avgTiv: 400000 }, { homes: 360, avgTiv: 390000 }, { homes: 350, avgTiv: 380000 }],
    hook: 'East Amarillo Complex 2006: 907,245 ac and 12 lives across the Panhandle.',
    history: [F.eastAmarillo2006],
  },
  {
    key: 'CYN', name: 'Canyon', centroid: [34.991, -101.919], county: 'Randall County', group: 'town', bundle: 'panhandle-north', density: 2.0,
    clusters: [{ homes: 330, avgTiv: 345000 }, { homes: 320, avgTiv: 335000 }],
    hook: 'Palo Duro Canyon rim: juniper breaks drop 250 m below the grassland edge.',
    history: [F.eastAmarillo2006],
  },
  {
    key: 'FRI', name: 'Fritch', centroid: [35.643, -101.596], county: 'Hutchinson County', group: 'town', bundle: 'panhandle-north', density: 1.4,
    clusters: [{ homes: 260, avgTiv: 195000 }, { homes: 240, avgTiv: 185000 }],
    hook: 'Windy Deuce 2024: 50+ homes lost in Fritch.',
    history: [F.windyDeuce2024, F.doubleDiamond2014],
  },
  {
    key: 'BRG', name: 'Borger', centroid: [35.659, -101.402], county: 'Hutchinson County', group: 'town', bundle: 'panhandle-north', density: 1.6,
    clusters: [{ homes: 330, avgTiv: 205000 }, { homes: 300, avgTiv: 195000 }],
    hook: 'Between the 2024 Windy Deuce and Smokehouse Creek fires, beside the Phillips 66 refinery.',
    history: [F.windyDeuce2024, F.smokehouse2024],
  },
  {
    key: 'STN', name: 'Stinnett', centroid: [35.823, -101.444], county: 'Hutchinson County', group: 'town', bundle: 'panhandle-north', density: 0.9,
    clusters: [{ homes: 180, avgTiv: 165000, at: [35.8305, -101.4125] }],
    hook: 'Smokehouse Creek 2024 started at a decayed pole just north of town.',
    history: [F.smokehouse2024],
  },
  {
    key: 'CAN', name: 'Canadian', centroid: [35.911, -100.383], county: 'Hemphill County', group: 'town', bundle: 'panhandle-north', density: 1.1,
    clusters: [
      { homes: 220, avgTiv: 175000, at: [35.9005, -100.4115] },
      { homes: 190, avgTiv: 170000, at: [35.8965, -100.3685] },
    ],
    hook: '30+ homes lost to Smokehouse Creek in 2024.',
    history: [F.smokehouse2024, F.perryton2017],
  },
  {
    key: 'PAM', name: 'Pampa', centroid: [35.548, -100.965], county: 'Gray County', group: 'town', bundle: 'panhandle-north', density: 1.6,
    clusters: [{ homes: 330, avgTiv: 215000, at: [35.5745, -100.9785] }, { homes: 310, avgTiv: 205000, at: [35.5335, -100.9335] }],
    hook: 'Grape Vine Creek 2024 burned 34,882 ac south of town; East Amarillo Complex 2006 before it.',
    history: [F.grapeVine2024, F.eastAmarillo2006],
  },
  {
    key: 'WFS', name: 'Wichita Falls west edge', centroid: [33.912, -98.495], county: 'Wichita County', group: 'town', bundle: 'permian-rolling-plains', density: 1.8,
    clusters: [{ homes: 380, avgTiv: 235000 }, { homes: 370, avgTiv: 230000 }, { homes: 350, avgTiv: 225000 }],
    hook: 'Rolling Plains grass: April 2009 outbreak fires ran through Wichita and Clay counties.',
    history: [F.outbreak2009],
  },
  {
    key: 'ABI', name: 'Abilene', centroid: [32.45, -99.75], county: 'Taylor County', group: 'town', bundle: 'permian-rolling-plains', density: 2.0,
    clusters: [{ homes: 510, avgTiv: 265000 }, { homes: 500, avgTiv: 260000 }, { homes: 490, avgTiv: 255000 }],
    hook: 'Callahan Divide mesquite; the 2005 Cross Plains fire destroyed 116 homes 65 km south-east.',
    history: [F.crossPlains2005],
  },
  {
    key: 'EAS', name: 'Eastland', centroid: [32.392, -98.823], county: 'Eastland County', group: 'town', bundle: 'cross-timbers', density: 1.5,
    clusters: [{ homes: 700, avgTiv: 215000 }],
    hook: 'Eastland Complex 2022: 54,000 ac, 86 homes in Carbon, suspected power lines.',
    history: [F.eastland2022],
  },
  {
    key: 'CIS', name: 'Cisco', centroid: [32.379, -98.982], county: 'Eastland County', group: 'town', bundle: 'cross-timbers', density: 1.5,
    clusters: [{ homes: 650, avgTiv: 210000 }],
    hook: 'Eastland Complex 2022 burned north and south of the I-20 corridor.',
    history: [F.eastland2022],
  },
  {
    key: 'CAR', name: 'Carbon', centroid: [32.268, -98.827], county: 'Eastland County', group: 'town', bundle: 'cross-timbers', density: 1.2,
    clusters: [{ homes: 450, avgTiv: 190000, at: [32.2665, -98.8215] }],
    hook: 'Kidd Fire, Eastland Complex 2022: 86 homes lost in Carbon.',
    history: [F.kidd2022],
  },
  {
    key: 'BSP', name: 'Big Spring', centroid: [32.243, -101.475], county: 'Howard County', group: 'town', bundle: 'permian-rolling-plains', density: 1.8,
    clusters: [{ homes: 520, avgTiv: 235000 }, { homes: 480, avgTiv: 225000 }],
    hook: 'Caprock edge above the Delek refinery, with mesquite and oil-field pads to the east.',
    history: [],
  },
  {
    key: 'MID', name: 'Midland edge', centroid: [32.0, -102.1], county: 'Midland County', group: 'town', bundle: 'permian-rolling-plains', density: 2.2,
    clusters: [{ homes: 520, avgTiv: 325000 }, { homes: 500, avgTiv: 320000 }, { homes: 490, avgTiv: 318000 }, { homes: 490, avgTiv: 317000 }],
    hook: 'Mesquite and shortgrass between well pads; the tank farm sits east of town.',
    history: [],
  },

  // ---------------- Oklahoma homes (6,500 homes) ----------------
  {
    key: 'STW', name: 'Stillwater SW', centroid: [36.116, -97.059], county: 'Payne County', group: 'oklahoma', bundle: 'oklahoma-central', density: 2.2, state: 'OK',
    clusters: [
      { homes: 920, avgTiv: 265000, at: [36.1015, -97.1045] },
      { homes: 900, avgTiv: 260000, at: [36.0625, -97.0435] },
      { homes: 880, avgTiv: 255000, at: [36.1355, -97.1015] },
    ],
    hook: 'March 2025: 202 homes lost around Stillwater.',
    history: [F.stillwater2025],
  },
  {
    key: 'GUT', name: 'Guthrie / Logan County', centroid: [35.856, -97.436], county: 'Logan County', group: 'oklahoma', bundle: 'oklahoma-central', density: 1.8, state: 'OK',
    clusters: [{ homes: 660, avgTiv: 235000 }, { homes: 640, avgTiv: 225000 }],
    hook: '33 Road fire: 31,245 ac, 160 structures.',
    history: [F.road33_2025],
  },
  {
    key: 'MAN', name: 'Mannford', centroid: [36.131, -96.334], county: 'Creek County', group: 'oklahoma', bundle: 'oklahoma-central', density: 1.6, state: 'OK',
    clusters: [{ homes: 700, avgTiv: 220000 }],
    hook: 'Keystone Lake shore: the 2012 Creek County fire burned 58,500 ac and 376 homes.',
    history: [F.mannford2012],
  },
  {
    key: 'NOR', name: 'Norman east edge', centroid: [35.221, -97.444], county: 'Cleveland County', group: 'oklahoma', bundle: 'oklahoma-central', density: 2.0, state: 'OK',
    clusters: [{ homes: 1100, avgTiv: 270000 }],
    hook: 'Cross Timbers edge at Lake Thunderbird; the 2012 Noble–Slaughterville fire burned 7,900 ac to the south.',
    history: [F.noble2012],
  },
  {
    key: 'WDW', name: 'Woodward', centroid: [36.424, -99.406], county: 'Woodward County', group: 'oklahoma', bundle: 'oklahoma-central', density: 1.6, state: 'OK',
    clusters: [{ homes: 700, avgTiv: 200000 }],
    hook: 'Northwest Oklahoma grass: the 2017 Starbuck fire burned 662,687 ac; the 2018 Rhea fire 286,196 ac.',
    history: [F.starbuck2017, F.rhea2018],
  },
]

// ---------------- Texas utilities (18 areas) and Oklahoma utilities (5 areas) ----------------
// Line routes run through real towns; footprints are sized from the stated capacity.
export const UTILITY_AREAS = [
  {
    key: 'XCEL', name: 'Xcel/SPS Panhandle distribution corridor', state: 'TX', county: 'Hutchinson, Roberts and Hemphill counties', bundle: 'panhandle-north',
    kind: 'line', operator: 'Xcel Energy (SPS)', tiv: 180e6, wmp: 'Filed 4 Aug 2026',
    route: [[35.823, -101.444], [35.829, -101.395], [35.836, -101.34], [35.838, -101.285], [35.845, -101.235], [35.875, -101.17], [35.93, -101.11], [35.99, -101.05], [36.06, -100.99], [36.105, -100.93], [36.108, -100.8], [36.105, -100.65], [36.1, -100.52], [36.06, -100.45], [36.0, -100.415], [35.95, -100.395], [35.911, -100.389]],
    history: 'A decayed pole on this system ignited Smokehouse Creek, 26 Feb 2024.',
    hook: 'Decayed pole ignited Smokehouse Creek 2024; WMP filed 4 Aug 2026.',
    fireHistory: [F.smokehouse2024],
  },
  {
    key: 'PEC', name: 'Pedernales EC Hill Country feeder', state: 'TX', county: 'Travis, Burnet and Gillespie counties', bundle: 'hill-country-west',
    kind: 'line', operator: 'Pedernales Electric Cooperative', tiv: 120e6, wmp: 'Not filed',
    route: [[30.365, -97.976], [30.42, -98.07], [30.49, -98.16], [30.567, -98.283], [30.53, -98.42], [30.47, -98.56], [30.4, -98.68], [30.345, -98.79], [30.318, -98.84], [30.3, -98.872]],
    history: 'Travis County investigators found PEC lines touching in wind started the 2011 Pedernales Bend fire.',
    hook: 'PEC lines touching in wind started the 2011 Pedernales Bend fire.',
    fireHistory: [F.pedernales2011],
  },
  {
    key: 'ONCOR', name: 'Oncor Eastland feeder', state: 'TX', county: 'Eastland County', bundle: 'cross-timbers',
    kind: 'line', operator: 'Oncor', tiv: 80e6, wmp: 'Filed 4 Aug 2026',
    route: [[32.392, -98.823], [32.388, -98.88], [32.382, -98.94], [32.379, -98.982], [32.35, -98.975], [32.31, -98.955], [32.275, -98.935], [32.252, -98.91], [32.257, -98.87], [32.268, -98.827], [32.255, -98.78], [32.238, -98.73], [32.225, -98.69], [32.214, -98.67]],
    history: 'Power lines are the suspected cause of the 2022 Eastland Complex (officially under investigation); PSPS is a last resort.',
    hook: 'Power lines are the suspected cause of the 2022 Eastland Complex; PSPS a "last resort".',
    fireHistory: [F.eastland2022],
  },
  {
    key: 'LCRA', name: 'LCRA transmission, west Travis', state: 'TX', county: 'Travis County', bundle: 'austin-lake',
    kind: 'line', operator: 'LCRA Transmission Services', tiv: 150e6, wmp: 'Approved',
    route: [[30.29, -98.1], [30.31, -98.06], [30.34, -98.03], [30.36, -97.98], [30.38, -97.93], [30.4, -97.89], [30.42, -97.85], [30.44, -97.81], [30.47, -97.78]],
    history: 'Transmission right-of-way through Balcones juniper; no ignition on public record.',
    hook: 'Transmission right-of-way through Balcones juniper west of Austin.',
    fireHistory: [F.steiner2011],
  },
  { key: 'P66', name: 'Phillips 66 Borger refinery', state: 'TX', county: 'Hutchinson County', bundle: 'panhandle-north', kind: 'refinery', operator: 'Phillips 66', tiv: 2330e6, wmp: 'n/a', center: [35.66, -101.4], acres: 6000, capacity: '157 kbpd', history: 'Grass to the fence line; the 2024 Windy Deuce fire burned around Fritch, 20 km west.', hook: '157 kbpd on a 6,000 ac footprint; grass to the fence line.', fireHistory: [F.windyDeuce2024] },
  { key: 'VAL', name: 'Valero McKee refinery', state: 'TX', county: 'Moore County', bundle: 'panhandle-north', kind: 'refinery', operator: 'Valero', tiv: 2000e6, wmp: 'n/a', center: [36.02, -101.82], acres: 2500, capacity: '200 kbpd', history: 'Open shortgrass on three sides of the fence.', hook: '200 kbpd; shortgrass on three sides of the fence.', fireHistory: [F.eastAmarillo2006] },
  { key: 'DEL', name: 'Delek Big Spring refinery', state: 'TX', county: 'Howard County', bundle: 'permian-rolling-plains', kind: 'refinery', operator: 'Delek US', tiv: 900e6, wmp: 'n/a', center: [32.24, -101.48], acres: 1100, capacity: '73 kbpd', history: 'Sits under the Caprock escarpment with mesquite pasture to the east.', hook: '73 kbpd under the Caprock, mesquite to the east.', fireHistory: [] },
  {
    key: 'BASIN', name: 'Basin pipeline segment', state: 'TX', county: 'Mitchell, Nolan, Taylor, Jones, Throckmorton, Archer and Wichita counties', bundle: 'permian-rolling-plains',
    kind: 'pipeline', operator: 'Plains All American', tiv: 450e6, wmp: 'n/a',
    route: [[32.396, -100.862], [32.43, -100.72], [32.47, -100.58], [32.55, -100.4], [32.68, -100.12], [32.85, -99.8], [33.05, -99.5], [33.3, -99.15], [33.55, -98.85], [33.75, -98.65], [33.912, -98.495]],
    stations: 4,
    segmentKm: 180,
    history: 'Crude trunk line; pump stations sit on caliche pads in mesquite pasture.',
    hook: 'Crude trunk line with pump stations on caliche pads.',
    fireHistory: [],
  },
  {
    key: 'PEXP', name: 'Permian Express segment', state: 'TX', county: 'Midland, Howard and Mitchell counties', bundle: 'permian-rolling-plains',
    kind: 'pipeline', operator: 'Energy Transfer', tiv: 300e6, wmp: 'n/a',
    route: [[32.0, -102.1], [32.06, -101.9], [32.14, -101.7], [32.22, -101.5], [32.29, -101.3], [32.34, -101.1], [32.37, -100.98], [32.396, -100.862]],
    stations: 3,
    history: 'Right-of-way through mesquite pasture past the Delek refinery.',
    hook: 'Right-of-way through mesquite pasture past Big Spring.',
    fireHistory: [],
  },
  { key: 'MTF', name: 'Midland tank farm', state: 'TX', county: 'Midland County', bundle: 'permian-rolling-plains', kind: 'tankfarm', operator: 'Midstream consortium', tiv: 350e6, wmp: 'n/a', center: [32.0, -102.06], acres: 700, capacity: '~20 MMbbl', history: 'Tank bunds kept clear; grass and mesquite beyond the berms.', hook: '~20 MMbbl behind berms in open grass.', fireHistory: [] },
  { key: 'ROS', name: 'Roscoe wind farm', state: 'TX', county: 'Nolan, Mitchell and Scurry counties', bundle: 'permian-rolling-plains', kind: 'wind', operator: 'Roscoe Wind Council', tiv: 900e6, wmp: 'n/a', center: [32.264, -100.344], acres: 100000, turbines: 627, capacity: '627 turbines, 782 MW', history: 'Turbine pads and gravel roads through cotton and pasture; no fire on public record.', hook: '627 turbines on 100,000 ac of cotton and pasture.', fireHistory: [] },
  { key: 'WLD', name: 'Wildorado wind farm', state: 'TX', county: 'Oldham and Potter counties', bundle: 'panhandle-north', kind: 'wind', operator: 'Wildorado Wind', tiv: 250e6, wmp: 'n/a', center: [35.294, -102.309], acres: 22000, turbines: 70, capacity: '161 MW', history: 'Shortgrass prairie between turbine pads; county road access only.', hook: '161 MW in shortgrass prairie.', fireHistory: [] },
  { key: 'SUBF', name: 'Fredericksburg substation', state: 'TX', county: 'Gillespie County', bundle: 'hill-country-west', kind: 'substation', operator: 'Pedernales Electric Cooperative', tiv: 40e6, wmp: 'Not filed', center: [30.284, -98.852], history: 'Feeds the Hill Country feeder; oak-juniper up to the fence.', hook: 'Feeds the Hill Country feeder; brush to the fence.', fireHistory: [F.crabapple2025] },
  { key: 'SUBP', name: 'Pampa substation', state: 'TX', county: 'Gray County', bundle: 'panhandle-north', kind: 'substation', operator: 'Xcel Energy (SPS)', tiv: 40e6, wmp: 'Filed 4 Aug 2026', center: [35.57, -100.955], history: 'Grassland substation on the SPS network north of Pampa.', hook: 'Grassland substation north of Pampa.', fireHistory: [F.grapeVine2024] },
  { key: 'SPB', name: 'Bluebonnet EC spur, Bastrop', state: 'TX', county: 'Bastrop County', bundle: 'lost-pines', kind: 'line', operator: 'Bluebonnet Electric Cooperative', tiv: 20e6, wmp: 'Not filed', route: [[30.112, -97.318], [30.12, -97.28], [30.132, -97.25], [30.142, -97.22], [30.15, -97.19]], history: 'Loblolly pine within falling distance of the conductor, as in 2011.', hook: 'Pine within falling distance of the line, as in 2011.', fireHistory: [F.bastrop2011] },
  { key: 'SPWM', name: 'PEC spur, Wimberley', state: 'TX', county: 'Hays County', bundle: 'hill-country-west', kind: 'line', operator: 'Pedernales Electric Cooperative', tiv: 20e6, wmp: 'Not filed', route: [[29.998, -98.08], [29.99, -98.1], [29.981, -98.12], [29.97, -98.145]], history: 'Spur through the Cypress Creek oak-juniper hills.', hook: 'Spur through the Cypress Creek oak-juniper hills.', fireHistory: [] },
  { key: 'SPSW', name: 'PEC spur, Spicewood', state: 'TX', county: 'Burnet County', bundle: 'hill-country-west', kind: 'line', operator: 'Pedernales Electric Cooperative', tiv: 20e6, wmp: 'Not filed', route: [[30.476, -98.2], [30.466, -98.17], [30.457, -98.14], [30.45, -98.11]], history: 'Serves the Pedernales Bend 2011 burn scar.', hook: 'Serves the Pedernales Bend 2011 burn scar.', fireHistory: [F.pedernales2011] },
  { key: 'GSEC', name: 'Golden Spread co-op line, Canyon', state: 'TX', county: 'Randall County', bundle: 'panhandle-north', kind: 'line', operator: 'Golden Spread Electric Cooperative', tiv: 50e6, wmp: 'Not filed', route: [[35.05, -101.99], [35.02, -101.95], [34.99, -101.91], [34.96, -101.86], [34.93, -101.8]], history: 'Crosses the Palo Duro rim breaks south-east of Canyon.', hook: 'Crosses the Palo Duro rim breaks.', fireHistory: [F.eastAmarillo2006] },

  // Oklahoma
  {
    key: 'OGEL', name: 'OG&E Logan County feeder', state: 'OK', county: 'Logan and Payne counties', bundle: 'oklahoma-central',
    kind: 'line', operator: 'OG&E', tiv: 100e6, wmp: 'Filed 4 Aug 2026',
    route: [[35.856, -97.436], [35.9, -97.39], [35.95, -97.33], [35.985, -97.285], [36.0, -97.255], [36.001, -97.215], [36.0, -97.175], [36.001, -97.135], [36.03, -97.118], [36.06, -97.11], [36.09, -97.105], [36.116, -97.075]],
    history: 'Feeder through Logan County grass and Cross Timbers; the 2025 33 Road fire burned 31,245 ac in Logan and Payne counties.',
    hook: 'Logan County feeder through the country the 2025 33 Road fire burned.',
    fireHistory: [F.road33_2025],
  },
  { key: 'PSO', name: 'PSO Creek County feeder', state: 'OK', county: 'Creek County', bundle: 'oklahoma-central', kind: 'line', operator: 'Public Service Company of Oklahoma', tiv: 80e6, wmp: 'Not filed', route: [[36.131, -96.334], [36.1, -96.28], [36.07, -96.2], [36.03, -96.13], [36.0, -96.06]], history: 'Runs through the 2012 Mannford burn scar.', hook: 'Through the 2012 Mannford burn scar.', fireHistory: [F.mannford2012] },
  { key: 'WFEC', name: 'WFEC transmission near Anadarko', state: 'OK', county: 'Caddo County', bundle: 'oklahoma-central', kind: 'line', operator: 'Western Farmers Electric Cooperative', tiv: 100e6, wmp: 'Approved', route: [[35.2, -98.5], [35.12, -98.35], [35.07, -98.24], [35.02, -98.1], [34.98, -97.97]], history: 'Mixed-grass prairie right-of-way; no ignition on public record.', hook: 'Mixed-grass prairie right-of-way in Caddo County.', fireHistory: [] },
  { key: 'CUSH', name: 'Cushing tank farm', state: 'OK', county: 'Payne County', bundle: 'oklahoma-central', kind: 'tankfarm', operator: 'Cushing hub operators', tiv: 2700e6, wmp: 'n/a', center: [35.98, -96.761], acres: 5800, capacity: '~91 MMbbl', history: 'The largest crude storage hub on earth, ringed by tallgrass and Cross Timbers.', hook: '~91 MMbbl: the largest crude hub on earth.', fireHistory: [F.stillwater2025] },
  { key: 'SUBO', name: 'OG&E substation, Stillwater', state: 'OK', county: 'Payne County', bundle: 'oklahoma-central', kind: 'substation', operator: 'OG&E', tiv: 20e6, wmp: 'Filed 4 Aug 2026', center: [36.083, -97.1], history: 'Serves the south-west Stillwater subdivisions.', hook: 'Serves the south-west Stillwater subdivisions.', fireHistory: [F.stillwater2025] },
]

// ---------------- Rangeland (8 Texas, 3 Oklahoma) ----------------
export const RANCH_AREAS = [
  { key: 'WAG', name: 'Waggoner Ranch', state: 'TX', county: 'Wilbarger, Wichita, Foard and Knox counties', bundle: 'permian-rolling-plains', center: [34.0, -99.3], acres: 520527, pastures: 60, cattle: 14000, lastBurnYear: 2019, hq: 3, hook: 'The largest ranch under one fence in Texas: 520,527 ac.', notes: 'Mesquite and mixed grass; oil leases on the north pastures.', fireHistory: [F.outbreak2009] },
  { key: '6666', name: 'Four Sixes Ranch', state: 'TX', county: 'King County', bundle: 'permian-rolling-plains', center: [33.626, -100.33], shift: [60, 15000], acres: 350000, pastures: 44, cattle: 9000, lastBurnYear: 2021, hq: 2, axisDeg: 60, hook: '350,000 ac of Rolling Plains grass and mesquite around Guthrie.', notes: 'Horse and cattle operation; prescribed burns on a 5-year rotation.', fireHistory: [] },
  { key: 'DIX', name: 'Dixon Creek (Four Sixes)', state: 'TX', county: 'Hutchinson and Carson counties', bundle: 'panhandle-north', center: [35.5, -101.2], acres: 108000, pastures: 18, cattle: 3600, lastBurnYear: 2020, hq: 1, hook: 'The Four Sixes Panhandle division on the Canadian River breaks.', notes: 'Breaks country with shinnery oak; burned in part by the 2006 complex.', fireHistory: [F.eastAmarillo2006] },
  { key: 'MAT', name: 'Matador Ranch', state: 'TX', county: 'Motley and Cottle counties', bundle: 'permian-rolling-plains', center: [34.014, -100.822], acres: 131000, pastures: 50, hqAt: [[34.012, -100.868], [33.986, -100.902], [34.046, -100.842]], cattle: 9800, herdCenter: [34.0, -100.87], herdShare: 0.65, herdSpreadM: 6500, lastBurnYear: 2018, hq: 3, hook: 'Caprock escarpment, mesquite and shin oak on 131,000 ac.', notes: 'West pastures run up to the Caprock; cotton fields beyond the west fence.', fireHistory: [] },
  { key: 'PIT', name: 'Pitchfork Ranch', state: 'TX', county: 'King and Dickens counties', bundle: 'permian-rolling-plains', center: [33.6, -100.4], shift: [245, 16000], acres: 165000, pastures: 30, cattle: 5000, lastBurnYear: 2022, hq: 1, axisDeg: 150, hook: '165,000 ac on the Wichita River breaks.', notes: 'Adjoins the Four Sixes to the east.', fireHistory: [] },
  { key: 'TT', name: 'Turkey Track Ranch', state: 'TX', county: 'Hutchinson County', bundle: 'panhandle-north', center: [35.805, -101.26], acres: 80000, pastures: 14, cattle: 5200, lastBurnYear: 2023, hq: 1, hook: '80% burned by Smokehouse Creek in 2024.', notes: 'Canadian River breaks east of Stinnett; the Xcel corridor crosses it.', fireHistory: [F.smokehouse2024] },
  { key: 'JA', name: 'JA Ranch', state: 'TX', county: 'Armstrong and Donley counties', bundle: 'panhandle-north', center: [34.817, -101.188], acres: 250000, pastures: 40, cattle: 6000, lastBurnYear: 2017, hq: 2, hook: 'Palo Duro Canyon ranch founded 1877 by Goodnight and Adair.', notes: 'Canyon breaks and shortgrass tableland.', fireHistory: [F.eastAmarillo2006] },
  { key: 'PDC', name: 'Palo Duro Canyon grazing block', state: 'TX', county: 'Randall and Armstrong counties', bundle: 'panhandle-north', center: [34.9, -101.6], acres: 95473, pastures: 16, cattle: 2200, lastBurnYear: 2016, hq: 1, hook: 'Leased grazing on the canyon rim; juniper encroaching the draws.', notes: 'Grazing leases on the canyon rim.', fireHistory: [F.eastAmarillo2006] },
  { key: 'TGP', name: 'Tallgrass Prairie Preserve', state: 'OK', county: 'Osage County', bundle: 'osage-rangeland', center: [36.842, -96.419], acres: 45000, pastures: 12, hqAt: [[36.8065, -96.4445], [36.8095, -96.4135], [36.8005, -96.4585]], cattle: 2600, bison: 2500, lastBurnYear: 2026, hq: 1, patchBurn: true, hook: 'Patch-burned every year: about a third of the preserve burns annually.', notes: 'Bison and leased cattle on a patch-burn rotation.', fireHistory: [h(2026, 'Prescribed patch burns', 15000, 0, 'Prescribed')] },
  { key: 'OSB', name: 'Osage Nation Bluestem Ranch', state: 'OK', county: 'Osage County', bundle: 'osage-rangeland', center: [36.67, -96.33], acres: 43000, pastures: 12, cattle: 2400, bison: 400, lastBurnYear: 2025, hq: 1, hook: 'Bison herd on 43,000 ac of tallgrass bought back by the Osage Nation.', notes: 'Spring burns on a two-year cycle.', fireHistory: [h(2025, 'Prescribed spring burns', 9000, 0, 'Prescribed')] },
  { key: 'OSG', name: 'Osage grazing block', state: 'OK', county: 'Osage County', bundle: 'osage-rangeland', center: [36.75, -96.5], acres: 38000, pastures: 10, cattle: 3000, lastBurnYear: 2025, hq: 1, hook: 'Flint Hills tallgrass leased for summer stocker cattle.', notes: 'Early-spring burns ahead of stocker season.', fireHistory: [] },
]
