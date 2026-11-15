/**
 * Build-time NASA panorama pipeline.
 *
 * Sources (all official NASA):
 *  - NASA Image and Video Library API  https://images-api.nasa.gov
 *      → documented rover 360° panoramas (surface rounds)
 *  - NASA Mars Trek WMTS               https://trek.nasa.gov/tiles/Mars/EQ
 *      → Viking MDIM 2.1 global colour mosaic (orbital rounds + flat map)
 *      → MGS MOLA global colour shaded relief (flat map alt layer)
 *
 * The browser cannot reliably hot-link images-assets.nasa.gov (CORS headers are
 * inconsistent), so this script resolves the official API metadata, downloads
 * the source assets once, and writes same-origin, game-sized derivatives into
 * public/panoramas/nasa plus a typed manifest.
 *
 * Run:  node scripts/build-nasa-panoramas.mjs
 * Requires ImageMagick 7 (`magick`) on PATH.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = path.join(ROOT, '.cache', 'nasa-panoramas')
const OUT = path.join(ROOT, 'public', 'panoramas', 'nasa')
const TEXTURES = path.join(ROOT, 'public', 'models', 'mars', 'textures')
const GENERATED = path.join(ROOT, 'src', 'data', 'nasaPanoramas.generated.ts')

const FORCE = process.argv.includes('--force')
const SKIP_ORBITAL = process.argv.includes('--skip-orbital')

mkdirSync(CACHE, { recursive: true })
mkdirSync(OUT, { recursive: true })

const NASA_IMAGES_API = 'https://images-api.nasa.gov/search'
const TREK = 'https://trek.nasa.gov/tiles/Mars/EQ'

const VIKING_LAYER = 'Mars_Viking_MDIM21_ClrMosaic_global_232m'
const MOLA_LAYER = 'Mars_MGS_MOLA_ClrShade_merge_global_463m'

// ---------------------------------------------------------------- info cards ---
//
// Official NASA still imagery used by the globe info cards (QuickFactCard).
// These are NOT the 360° panoramas used in singleplayer; they are standalone
// spacecraft photographs that give the cards a real, attributed look.
const CARDS = [
  { poiId: 'olympus-mons', nasaId: 'PIA02982', credit: 'NASA/JPL/USGS', captured: '2000-11-04', note: 'Color mosaic of Olympus Mons from Viking 1 Orbiter' },
  { poiId: 'valles-marineris', nasaId: 'PIA06926', credit: 'NASA/JPL-Caltech', captured: '2004-10-08', note: 'Valles Marineris Mosaic' },
  { poiId: 'planum-boreum', nasaId: 'PIA02800', credit: 'NASA/JPL/MSSS', captured: '2000-05-22', note: 'The Martian North Polar Cap in Summer, MGS MOC' },
  { poiId: 'hellas-planitia', nasaId: 'PIA14431', credit: 'NASA/JPL/UA', captured: '2012-03-28', note: 'Floor of Hellas Basin, HiRISE' },
  { poiId: 'tharsis-montes', nasaId: 'PIA00408', credit: 'NASA/JPL/USGS', captured: '1998-06-08', note: 'Tharsis region, Viking Orbiter' },
  { poiId: 'utopia-planitia', nasaId: 'PIA13485', credit: 'NASA/JPL-Caltech/ASU', captured: '2017-01-09', note: 'Eroded scallops in Utopia Planitia, HiRISE' },
  { poiId: 'elysium-planitia', nasaId: 'PIA22829', credit: 'NASA/JPL-Caltech', captured: '2018-11-26', note: "InSight's First Image from Mars" },
  { poiId: 'planum-australe', nasaId: 'PIA03743', credit: 'NASA/JPL/ASU', captured: '2002-12-07', note: 'Mars South Polar Cap in Summer, Odyssey' },
  { poiId: 'noctis-labyrinthus', nasaId: 'PIA13656', credit: 'NASA/JPL/ASU', captured: '2010-12-09', note: 'Noctis Canyon, Mars Odyssey' },
  { poiId: 'cydonia', nasaId: 'PIA01141', credit: 'NASA/JPL', captured: '1998-04-02', note: 'Geologic Face on Mars formation, Viking 1' },
  { poiId: 'argyre-planitia', nasaId: 'PIA08049', credit: 'NASA/JPL/ASU', captured: '2006-04-07', note: 'Argyre impact basin rim, Odyssey' },
  { poiId: 'alba-mons', nasaId: 'PIA00409', credit: 'NASA/JPL/USGS', captured: '1998-06-08', note: 'Alba Patera, Viking Orbiter' },
  { poiId: 'medusae-fossae', nasaId: 'PIA21264', credit: 'NASA/JPL/UA', captured: '2017-01-25', note: 'Blade-like yardangs in Medusae Fossae, HiRISE' },
  { poiId: 'kasei-valles', nasaId: 'PIA23845', credit: 'NASA/JPL/ASU', captured: '2020-04-24', note: 'Kasei Valles, Mars Odyssey' },
]

// ---------------------------------------------------------------- surface ---

/**
 * Ground-truth landing regions. Surface panoramas are assigned to the region the
 * rover/lander was operating in when the mosaic was captured. At whole-planet
 * scale this places every guess inside the correct ~100 km bullseye region while
 * staying honest about how precisely NASA documents each frame.
 */
const SITES = {
  jezero: {
    name: 'Jezero Crater',
    lat: 18.4447,
    lon: 77.4508,
    clue: 'A dry river delta fans across the horizon beyond layered mudstones — an ancient lakebed that is being sampled today.',
    highlight: 'Ancient lake delta · Perseverance',
    pds: 'Jezero Crater',
  },
  gale: {
    name: 'Gale Crater',
    lat: -4.5895,
    lon: 137.4417,
    clue: 'Layered foothills climb toward a 5-km mountain standing in the middle of a 154-km crater.',
    highlight: 'Mount Sharp · Curiosity',
    pds: 'Gale Crater',
  },
  meridiani: {
    name: 'Meridiani Planum',
    lat: -1.9462,
    lon: -5.5266,
    clue: 'Flat, dark hematite-rich plains dotted with small craters and bright slabs of bedrock.',
    highlight: 'Hematite plains · Opportunity',
    pds: 'Meridiani Planum',
  },
  gusev: {
    name: 'Gusev Crater',
    lat: -14.5684,
    lon: 175.4729,
    clue: 'A wide, dusty basin ringed by distant hills, with volcanic rocks and sulfate-rich soil.',
    highlight: 'Columbia Hills · Spirit',
    pds: 'Gusev Crater',
  },
  ares: {
    name: 'Ares Vallis',
    lat: 19.13,
    lon: -33.22,
    clue: 'A rocky flood plain littered with rounded boulders at the mouth of an ancient outflow channel.',
    highlight: 'Outflow channel · Pathfinder',
    pds: 'Ares Vallis',
  },
  chryse: {
    name: 'Chryse Planitia',
    lat: 22.27,
    lon: -49.97,
    clue: 'A vast northern lowland under a pale butterscotch sky, strewn with rocks and fine dust.',
    highlight: 'Northern lowlands · Viking 1',
    pds: 'Chryse Planitia',
  },
  phoenix: {
    name: 'Vastitas Borealis',
    lat: 68.22,
    lon: -125.75,
    clue: 'Polygonal ground and ice-cemented soil on a plain close to the north polar cap.',
    highlight: 'Polar plains · Phoenix',
    pds: 'Vastitas Borealis',
  },
}

/**
 * Official NASA/JPL surface panoramas (rover + lander only — no orbital views).
 * Every entry is a ground-level mosaic from the NASA Image and Video Library.
 * `label` names the feature the rover was parked at when the mosaic was taken.
 */
const SURFACE = [
  // ---- Jezero Crater (Perseverance) -------------------------------------
  {
    id: 'jezero-crater',
    nasaId: 'PIA26369',
    site: 'jezero',
    label: 'Bright Angel',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2024-06-12',
    note: 'Perseverance Mastcam-Z · Sol 1178',
  },
  {
    id: 'perseverance-first-pan',
    nasaId: 'PIA24264',
    site: 'jezero',
    label: 'First Mastcam-Z panorama',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2021-02-24',
    note: 'Perseverance Mastcam-Z · Sol 3',
  },
  {
    id: 'perseverance-navcams',
    nasaId: 'PIA24422',
    site: 'jezero',
    label: 'Landing site navcams',
    credit: 'NASA/JPL-Caltech',
    captured: '2021-02-22',
    note: 'Perseverance Navcams · Sol 2',
  },
  {
    id: 'perseverance-van-zyl',
    nasaId: 'PIA24663',
    site: 'jezero',
    label: 'Van Zyl Overlook',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2021-06-09',
    note: 'Perseverance Mastcam-Z · Ingenuity flight campaign',
  },
  {
    id: 'perseverance-jezero-delta',
    nasaId: 'PIA24921',
    site: 'jezero',
    label: 'Jezero delta front',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2022-09-14',
    note: 'Perseverance Mastcam-Z · 1,118-frame delta mosaic',
  },
  {
    id: 'perseverance-airey-hill',
    nasaId: 'PIA26080',
    site: 'jezero',
    label: 'Airey Hill',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2023-12-12',
    note: 'Perseverance Mastcam-Z · solar conjunction',
  },
  {
    id: 'perseverance-rio-chiquito',
    nasaId: 'PIA26474',
    site: 'jezero',
    label: 'Rio Chiquito',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2024-12-12',
    note: 'Perseverance Mastcam-Z · Sol 1337',
  },
  {
    id: 'perseverance-pico-turquino',
    nasaId: 'PIA26473',
    site: 'jezero',
    label: 'Pico Turquino Hills',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2024-12-12',
    note: 'Perseverance Mastcam-Z · crater rim',
  },
  {
    id: 'perseverance-office',
    nasaId: 'PIA24765',
    site: 'jezero',
    label: 'Rover workspace',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2021-08-02',
    note: "Perseverance Mastcam-Z · 'Office on Mars'",
  },
  {
    id: 'perseverance-citadelle',
    nasaId: 'PIA24833',
    site: 'jezero',
    label: 'Citadelle / Rochette',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2021-09-10',
    note: 'Perseverance Mastcam-Z · first cored rock',
  },
  {
    id: 'perseverance-sample-depot',
    nasaId: 'PIA25406',
    site: 'jezero',
    label: 'Sample depot plain',
    credit: 'NASA/JPL-Caltech/ASU/MSSS',
    captured: '2022-07-11',
    note: 'Perseverance Navcams · sample-return site survey',
  },

  // ---- Gale Crater (Curiosity) ------------------------------------------
  {
    id: 'gale-crater',
    nasaId: 'PIA25407',
    site: 'gale',
    label: 'Avanavero drill site',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2022-06-20',
    note: 'Curiosity Mastcam · Sol 3509',
  },
  {
    id: 'curiosity-inside-gale',
    nasaId: 'PIA16026',
    site: 'gale',
    label: 'Inside Gale Crater',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2012-08-09',
    note: 'Curiosity Mastcam · Sol 2',
  },
  {
    id: 'curiosity-all-around',
    nasaId: 'PIA16074',
    site: 'gale',
    label: 'All around the rover',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2012-08-17',
    note: 'Curiosity Mastcam · Bradbury Landing',
  },
  {
    id: 'curiosity-landing-site',
    nasaId: 'PIA16101',
    site: 'gale',
    label: 'Landing site panorama',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2012-08-27',
    note: 'Curiosity Mastcam · Mount Sharp on the horizon',
  },
  {
    id: 'curiosity-dingo-gap',
    nasaId: 'PIA17763',
    site: 'gale',
    label: 'Dingo Gap',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2014-01-29',
    note: 'Curiosity Mastcam · Sol 519',
  },
  {
    id: 'curiosity-kimberley',
    nasaId: 'PIA18069',
    site: 'gale',
    label: 'The Kimberley',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2014-03-24',
    note: 'Curiosity Mastcam · sandstone waypoint',
  },
  {
    id: 'curiosity-hidden-valley',
    nasaId: 'PIA18409',
    site: 'gale',
    label: 'Hidden Valley',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2014-08-01',
    note: 'Curiosity Mastcam · Sol 705',
  },
  {
    id: 'curiosity-marias-pass',
    nasaId: 'PIA20266',
    site: 'gale',
    label: 'Marias Pass',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2015-12-17',
    note: 'Curiosity Navcams · Sol 992',
  },
  {
    id: 'curiosity-naukluft',
    nasaId: 'PIA20332',
    site: 'gale',
    label: 'Naukluft Plateau',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2016-04-27',
    note: 'Curiosity Mastcam · Sol 1303',
  },
  {
    id: 'curiosity-namib-dune',
    nasaId: 'PIA20284',
    site: 'gale',
    label: 'Namib Dune',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2016-01-04',
    note: 'Curiosity Mastcam · Bagnold Dune Field',
  },
  {
    id: 'curiosity-bagnold',
    nasaId: 'PIA21268',
    site: 'gale',
    label: 'Linear dune ripples',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2017-02-27',
    note: 'Curiosity Navcams · Sol 1601',
  },
  {
    id: 'curiosity-sol-1000',
    nasaId: 'PIA19679',
    site: 'gale',
    label: 'Sol 1000 viewpoint',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2015-07-01',
    note: 'Curiosity Navcams · below Marias Pass',
  },
  {
    id: 'curiosity-murray-buttes',
    nasaId: 'PIA20840',
    site: 'gale',
    label: 'Murray Buttes',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2016-10-03',
    note: 'Curiosity Mastcam · Sol 1451',
  },
  {
    id: 'curiosity-murray-entrance',
    nasaId: 'PIA20765',
    site: 'gale',
    label: 'Murray Buttes entrance',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2016-08-19',
    note: 'Curiosity Mastcam · Sol 1421',
  },
  {
    id: 'curiosity-vera-rubin',
    nasaId: 'PIA22545',
    site: 'gale',
    label: 'Vera Rubin Ridge',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2018-09-06',
    note: 'Curiosity Mastcam · Sol 2137',
  },
  {
    id: 'curiosity-rock-hall',
    nasaId: 'PIA23042',
    site: 'gale',
    label: 'Rock Hall',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2019-02-08',
    note: 'Curiosity Mastcam · Sol 2265',
  },
  {
    id: 'curiosity-teal-ridge',
    nasaId: 'PIA23346',
    site: 'gale',
    label: 'Teal Ridge',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2019-08-05',
    note: 'Curiosity Mastcam · Sol 2440',
  },
  {
    id: 'curiosity-mont-mercou-approach',
    nasaId: 'PIA24269',
    site: 'gale',
    label: 'Mont Mercou approach',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2021-03-30',
    note: 'Curiosity Mastcam · Sol 3048',
  },
  {
    id: 'curiosity-mont-mercou-top',
    nasaId: 'PIA24626',
    site: 'gale',
    label: 'Atop Mont Mercou',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2021-05-10',
    note: 'Curiosity Mastcam · Sol 3090',
  },
  {
    id: 'curiosity-paraitepuy',
    nasaId: 'PIA25413',
    site: 'gale',
    label: 'Paraitepuy Pass',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2022-10-19',
    note: 'Curiosity Mastcam · Sol 3563',
  },
  {
    id: 'curiosity-greenheugh',
    nasaId: 'PIA25176',
    site: 'gale',
    label: 'Greenheugh pediment',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2022-04-07',
    note: 'Curiosity Mastcam · gator-back rocks',
  },
  {
    id: 'curiosity-marker-band',
    nasaId: 'PIA25732',
    site: 'gale',
    label: 'Marker Band Valley',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2023-02-08',
    note: 'Curiosity Mastcam · Sol 3684',
  },
  {
    id: 'curiosity-gediz-arrival',
    nasaId: 'PIA26246',
    site: 'gale',
    label: 'Gediz Vallis arrival',
    credit: 'NASA/JPL-Caltech',
    captured: '2024-03-29',
    note: 'Curiosity Navcams · Sol 4086',
  },
  {
    id: 'curiosity-sequoia',
    nasaId: 'PIA26047',
    site: 'gale',
    label: 'Sequoia drill site',
    credit: 'NASA/JPL-Caltech',
    captured: '2023-11-06',
    note: 'Curiosity Navcams · Sol 3984',
  },
  {
    id: 'curiosity-challenging-slope',
    nasaId: 'PIA26012',
    site: 'gale',
    label: 'Steep slope',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2023-08-03',
    note: 'Curiosity Mastcam · Sol 3871',
  },
  {
    id: 'curiosity-gediz-ridge',
    nasaId: 'PIA26019',
    site: 'gale',
    label: 'Gediz Vallis Ridge',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2023-09-18',
    note: 'Curiosity Mastcam · Sol 3923',
  },
  {
    id: 'curiosity-gediz-channel',
    nasaId: 'PIA26363',
    site: 'gale',
    label: 'Gediz Vallis channel',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2024-07-18',
    note: 'Curiosity Mastcam · Sol 4220',
  },
  {
    id: 'curiosity-boxwork',
    nasaId: 'PIA26559',
    site: 'gale',
    label: 'Boxwork patterns',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2025-06-23',
    note: 'Curiosity Mastcam · Sol 4451',
  },
  {
    id: 'curiosity-ubajara',
    nasaId: 'PIA26554',
    site: 'gale',
    label: 'Ubajara sample site',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2025-04-17',
    note: 'Curiosity Mastcam · Sol 3815',
  },
  {
    id: 'curiosity-yellowknife',
    nasaId: 'PIA16701',
    site: 'gale',
    label: 'Yellowknife Bay',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2013-01-15',
    note: 'Curiosity Mastcam · Sol 165',
  },
  {
    id: 'curiosity-spaghetti',
    nasaId: 'PIA23971',
    site: 'gale',
    label: 'Western Butte',
    credit: 'NASA/JPL-Caltech/MSSS',
    captured: '2020-08-03',
    note: 'Curiosity Mastcam · Greenheugh pediment',
  },

  // ---- Meridiani Planum (Opportunity) -----------------------------------
  {
    id: 'meridiani-planum',
    nasaId: 'PIA07216',
    site: 'meridiani',
    label: 'Rub al Khali',
    credit: 'NASA/JPL/Cornell',
    captured: '2005-07-28',
    note: 'Opportunity Pancam · rippled sand',
  },
  {
    id: 'victoria-crater',
    nasaId: 'PIA10213',
    site: 'meridiani',
    label: 'Victoria Crater rim',
    credit: 'NASA/JPL-Caltech/Cornell University',
    captured: '2008-01-03',
    note: 'Opportunity Pancam · Duck Bay',
  },
  {
    id: 'opportunity-santorini',
    nasaId: 'PIA11754',
    site: 'meridiani',
    label: 'Santorini',
    credit: 'NASA/JPL/Cornell',
    captured: '2009-01-09',
    note: 'Opportunity Pancam · full-circle',
  },
  {
    id: 'opportunity-whitewater',
    nasaId: 'PIA16556',
    site: 'meridiani',
    label: 'Whitewater Lake',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2012-12-19',
    note: 'Opportunity Pancam · Sol 3071',
  },
  {
    id: 'opportunity-matijevic',
    nasaId: 'PIA16558',
    site: 'meridiani',
    label: 'Matijevic Hill',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2012-12-19',
    note: 'Opportunity Pancam · Sol 3105',
  },
  {
    id: 'opportunity-endeavour-rim',
    nasaId: 'PIA18098',
    site: 'meridiani',
    label: 'Endeavour rim',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2014-05-19',
    note: 'Opportunity Navcams · fresh wheel tracks',
  },
  {
    id: 'opportunity-cambridge-bay',
    nasaId: 'PIA13372',
    site: 'meridiani',
    label: 'Cambridge Bay',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2010-09-07',
    note: 'Opportunity Pancam · outcrop survey',
  },
  {
    id: 'opportunity-greeley',
    nasaId: 'PIA15689',
    site: 'meridiani',
    label: 'Greeley Haven',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2012-07-05',
    note: 'Opportunity Pancam · winter campaign (false colour)',
  },
  {
    id: 'opportunity-cape-tribulation',
    nasaId: 'PIA19109',
    site: 'meridiani',
    label: 'Cape Tribulation',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2015-01-22',
    note: 'Opportunity Pancam · high viewpoint',
  },
  {
    id: 'opportunity-marathon-valley',
    nasaId: 'PIA20749',
    site: 'meridiani',
    label: 'Marathon Valley',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2016-06-14',
    note: 'Opportunity Pancam · Sol 4347–4375',
  },
  {
    id: 'opportunity-wharton-ridge',
    nasaId: 'PIA20849',
    site: 'meridiani',
    label: 'Wharton Ridge',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2016-10-07',
    note: 'Opportunity Pancam · Endeavour floor beyond',
  },
  {
    id: 'opportunity-perseverance-valley',
    nasaId: 'PIA22074',
    site: 'meridiani',
    label: 'Perseverance Valley',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2017-12-06',
    note: 'Opportunity Pancam · descent tracks',
  },
  {
    id: 'opportunity-erebus-rim',
    nasaId: 'PIA03270',
    site: 'meridiani',
    label: 'Erebus Rim',
    credit: 'NASA/JPL/Cornell',
    captured: '2006-01-03',
    note: 'Opportunity Pancam · Sols 652–663',
  },
  {
    id: 'opportunity-olympia',
    nasaId: 'PIA03621',
    site: 'meridiani',
    label: 'Olympia',
    credit: 'NASA/JPL/Cornell',
    captured: '2005-12-05',
    note: 'Opportunity Pancam · dune field',
  },
  {
    id: 'opportunity-payson',
    nasaId: 'PIA02696',
    site: 'meridiani',
    label: 'Payson',
    credit: 'NASA/JPL/Cornell',
    captured: '2006-03-07',
    note: 'Opportunity Pancam · outcrop panorama',
  },

  // ---- Gusev Crater (Spirit) --------------------------------------------
  {
    id: 'gusev-crater',
    nasaId: 'PIA11746',
    site: 'gusev',
    label: 'Bonestell panorama',
    credit: 'NASA/JPL/Cornell University',
    captured: '2009-01-05',
    note: 'Spirit Pancam · full-circle from Low Ridge',
  },
  {
    id: 'spirit-mcmurdo',
    nasaId: 'PIA16440',
    site: 'gusev',
    label: 'McMurdo panorama',
    credit: 'NASA/JPL-Caltech/Cornell',
    captured: '2012-11-09',
    note: 'Spirit Pancam · Winter Haven',
  },
  {
    id: 'spirit-winter-haven',
    nasaId: 'PIA01907',
    site: 'gusev',
    label: 'Winter Haven',
    credit: 'NASA/JPL/Cornell',
    captured: '2006-10-25',
    note: 'Spirit Pancam · Low Ridge winter campaign',
  },
  {
    id: 'spirit-lookout',
    nasaId: 'PIA07882',
    site: 'gusev',
    label: 'Larry\u2019s Lookout',
    credit: 'NASA/JPL/Cornell',
    captured: '2005-04-29',
    note: 'Spirit Pancam · Sols 410–413',
  },
  {
    id: 'spirit-west-valley',
    nasaId: 'PIA10216',
    site: 'gusev',
    label: 'West Valley',
    credit: 'NASA/JPL/Cornell',
    captured: '2008-01-03',
    note: 'Spirit Pancam · Columbia Hills',
  },

  // ---- Ares Vallis (Mars Pathfinder) ------------------------------------
  {
    id: 'ares-vallis',
    nasaId: 'PIA01466',
    site: 'ares',
    label: 'Gallery Pan',
    credit: 'NASA/JPL',
    captured: '1999-03-19',
    note: 'Pathfinder IMP · improved 360° colour panorama',
  },
  // ---- Chryse Planitia (Viking 1) ---------------------------------------
  {
    id: 'viking-1-first-pan',
    nasaId: 'PIA00383',
    site: 'chryse',
    label: 'First panorama from Mars',
    credit: 'NASA/JPL',
    captured: '1976-07-20',
    note: 'Viking 1 lander camera · first surface panorama',
  },

  // ---- Vastitas Borealis (Phoenix) --------------------------------------
  {
    id: 'phoenix-full-circle',
    nasaId: 'PIA11734',
    site: 'phoenix',
    label: 'Full-circle landing site',
    credit: 'NASA/JPL-Caltech/University of Arizona',
    captured: '2008-12-21',
    note: 'Phoenix Surface Stereo Imager · 400+ frames',
  },
  {
    id: 'phoenix-true-color',
    nasaId: 'PIA11007',
    site: 'phoenix',
    label: 'Polygon ground',
    credit: 'NASA/JPL-Caltech/University of Arizona',
    captured: '2008-08-04',
    note: 'Phoenix Surface Stereo Imager · true colour',
  },
  {
    id: 'phoenix-deck',
    nasaId: 'PIA13804',
    site: 'phoenix',
    label: 'Lander deck',
    credit: 'NASA/JPL-Caltech/University of Arizona',
    captured: '2011-03-10',
    note: 'Phoenix Surface Stereo Imager · landing site and deck',
  },
]

// ---------------------------------------------------------------- orbital ---
// Altitudes chosen so the named feature fits inside the horizon at 2048px.

const ORBITAL = [
  { poiId: 'olympus-mons', name: 'Olympus Mons', lat: 18.65, lon: -133.8, altitudeKm: 420 },
  { poiId: 'valles-marineris', name: 'Valles Marineris', lat: -13.9, lon: -59.2, altitudeKm: 440 },
  { poiId: 'planum-boreum', name: 'Planum Boreum', lat: 85.0, lon: 0.0, altitudeKm: 360 },
  { poiId: 'hellas-planitia', name: 'Hellas Basin', lat: -42.7, lon: 70.0, altitudeKm: 400 },
  { poiId: 'tharsis-montes', name: 'Tharsis Montes', lat: 1.5, lon: -113.0, altitudeKm: 460 },
  { poiId: 'utopia-planitia', name: 'Utopia Planitia', lat: 46.7, lon: 117.5, altitudeKm: 340 },
  { poiId: 'planum-australe', name: 'Planum Australe', lat: -85.0, lon: 0.0, altitudeKm: 360 },
  { poiId: 'noctis-labyrinthus', name: 'Noctis Labyrinthus', lat: -7.0, lon: -100.0, altitudeKm: 320 },
  { poiId: 'cydonia', name: 'Cydonia', lat: 40.75, lon: -9.5, altitudeKm: 300 },
  { poiId: 'argyre-planitia', name: 'Argyre Basin', lat: -49.7, lon: -44.0, altitudeKm: 380 },
  { poiId: 'alba-mons', name: 'Alba Mons', lat: 40.5, lon: -110.0, altitudeKm: 480 },
  { poiId: 'medusae-fossae', name: 'Medusae Fossae', lat: -5.0, lon: -147.0, altitudeKm: 340 },
  { poiId: 'kasei-valles', name: 'Kasei Valles', lat: 24.6, lon: -65.0, altitudeKm: 430 },
  { poiId: 'elysium-planitia', name: 'Elysium Planitia', lat: 4.5, lon: 135.9, altitudeKm: 320 },
]

// ---------------------------------------------------------------- helpers ---

function log(...args) {
  console.log('[nasa-panoramas]', ...args)
}

function magick(args, opts = {}) {
  return execFileSync('magick', args, { maxBuffer: 1024 * 1024 * 300, ...opts })
}

function identify(file) {
  const out = magick(['identify', '-format', '%w %h', file]).toString().trim()
  const [width, height] = out.split(/\s+/).map(Number)
  return { width, height }
}

async function fetchJson(url, { timeout = 15000, retries = 2 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)
      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      if (attempt === retries) throw err
      await sleep(600 * (attempt + 1))
    }
  }
}

async function download(url, file, { timeout = 45000, retries = 3 } = {}) {
  if (existsSync(file) && !FORCE) return file
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buffer = Buffer.from(await res.arrayBuffer())
      writeFileSync(file, buffer)
      return file
    } catch (err) {
      lastError = err
      if (attempt < retries) await sleep(700 * (attempt + 1))
    }
  }
  throw new Error(`Failed to download ${url}: ${lastError?.message ?? lastError}`)
}

async function mapLimit(items, limit, fn) {
  let index = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index++]
      await fn(item)
    }
  })
  await Promise.all(workers)
}

// ------------------------------------------------------- NASA Images API ---

async function resolveNasaImage(nasaId) {
  const json = await fetchJson(`${NASA_IMAGES_API}?nasa_id=${encodeURIComponent(nasaId)}`)
  const item = json?.collection?.items?.find((entry) => entry?.data?.[0]?.nasa_id === nasaId)
    ?? json?.collection?.items?.[0]
  const data = item?.data?.[0]
  if (!data) throw new Error(`NASA Images API returned no metadata for ${nasaId}`)

  const links = (item.links ?? []).map((link) => link.href).filter(Boolean)
  const asset =
    links.find((href) => /~orig\.(jpe?g|png)$/i.test(href)) ??
    links.find((href) => /~large\.(jpe?g|png)$/i.test(href)) ??
    links.find((href) => /\.(jpe?g|png)$/i.test(href)) ??
    `https://images-assets.nasa.gov/image/${nasaId}/${nasaId}~orig.jpg`

  return {
    nasaId,
    title: data.title ?? nasaId,
    description: data.description ?? '',
    credit: data.secondary_creator ?? data.center ?? 'NASA/JPL-Caltech',
    dateCreated: (data.date_created ?? '').slice(0, 10),
    asset,
    sourceApi: `${NASA_IMAGES_API}?nasa_id=${encodeURIComponent(nasaId)}`,
  }
}

async function buildSurfacePanorama(entry) {
  const site = SITES[entry.site]
  if (!site) throw new Error(`${entry.id}: unknown site "${entry.site}"`)

  const outFile = path.join(OUT, `${entry.id}.jpg`)
  const thumbFile = path.join(OUT, `${entry.id}-thumb.jpg`)

  const meta = await resolveNasaImage(entry.nasaId)
  const ext = path.extname(new URL(meta.asset).pathname) || '.jpg'
  const raw = path.join(CACHE, `${entry.nasaId}${ext}`)
  await download(meta.asset, raw)
  log(`${entry.id}: ${meta.title}`)

  if (FORCE || !existsSync(outFile)) {
    // 3600px wide keeps the equirect sharp at 100° hfov without shipping the
    // multi-hundred-megapixel originals some PIA releases provide.
    magick([raw, '-auto-orient', '-resize', '3600x>', '-strip', '-sampling-factor', '4:2:0', '-quality', '80', outFile])
  }
  if (FORCE || !existsSync(thumbFile)) {
    magick([outFile, '-resize', '1000x>', '-strip', '-sampling-factor', '4:2:0', '-quality', '78', thumbFile])
  }

  const { width, height } = identify(outFile)
  const vaov = (height / width) * 360

  return {
    poiId: entry.id,
    kind: 'surface',
    src: `/panoramas/nasa/${entry.id}.jpg`,
    thumb: `/panoramas/nasa/${entry.id}-thumb.jpg`,
    title: meta.title,
    credit: entry.credit || meta.credit,
    nasaId: entry.nasaId,
    sourceApi: meta.sourceApi,
    sourceAsset: meta.asset,
    captured: entry.captured || meta.dateCreated,
    note: entry.note,
    haov: 360,
    vaov: Math.round(vaov * 100) / 100,
    horizonPitch: 0,
    initialPitch: 0,
    initialYaw: 0,
    initialHfov: 100,
    // Singleplayer round data -------------------------------------------------
    siteId: entry.site,
    siteName: site.name,
    locationLabel: entry.label,
    name: entry.label ? `${entry.label} — ${site.name}` : site.name,
    lat: site.lat,
    lon: site.lon,
    clue: site.clue,
    highlight: site.highlight,
    pdsKeywords: site.pds,
    generator: 'NASA Image and Video Library API → same-origin derivative',
  }
}

// ---------------------------------------------------------- card images ---
async function buildCardImage(entry) {
  const outFile = path.join(OUT, 'cards', `${entry.poiId}.jpg`)

  const meta = await resolveNasaImage(entry.nasaId)
  const ext = path.extname(new URL(meta.asset).pathname) || '.jpg'
  const raw = path.join(CACHE, `card-${entry.nasaId}${ext}`)
  await download(meta.asset, raw)
  log(`card ${entry.poiId}: ${meta.title}`)

  if (FORCE || !existsSync(outFile)) {
    mkdirSync(path.dirname(outFile), { recursive: true })
    // Build a 16:9 cinematic frame: blurred cover background + contained source.
    const bg = path.join(CACHE, `card-${entry.poiId}-bg.jpg`)
    const fg = path.join(CACHE, `card-${entry.poiId}-fg.png`)
    magick([raw, '-auto-orient', '-resize', '1200x675^', '-gravity', 'center', '-extent', '1200x675', '-blur', '0x24', '-brightness-contrast', '-18x-8', '-quality', '82', bg])
    magick([raw, '-auto-orient', '-resize', '1200x675', '-gravity', 'center', '-extent', '1200x675', '-background', 'none', '-quality', '86', fg])
    magick([bg, fg, '-compose', 'over', '-composite', '-strip', '-quality', '84', outFile])
  }

  return {
    poiId: entry.poiId,
    src: `/panoramas/nasa/cards/${entry.poiId}.jpg`,
    title: meta.title,
    credit: entry.credit || meta.credit,
    nasaId: entry.nasaId,
    sourceApi: meta.sourceApi,
    sourceAsset: meta.asset,
    captured: entry.captured || meta.dateCreated,
    note: entry.note,
    generator: 'NASA Image and Video Library API → same-origin derivative (card frame)',
  }
}

// ------------------------------------------------------ Mars Trek mosaic ---

async function buildGlobalMosaic({ layer, zoom, file }) {
  const cols = 2 ** (zoom + 1)
  const rows = 2 ** zoom
  const dir = path.join(CACHE, `${layer.split('_')[0]}-z${zoom}`)
  mkdirSync(dir, { recursive: true })

  const tasks = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) tasks.push({ row, col })
  }

  let completed = 0
  await mapLimit(tasks, 10, async ({ row, col }) => {
    const tileFile = path.join(dir, `${row}_${col}.jpg`)
    const url = `${TREK}/${layer}/1.0.0/default/default028mm/${zoom}/${row}/${col}.jpg`
    await download(url, tileFile)
    completed++
    if (completed % 64 === 0 || completed === tasks.length) {
      log(`  ${layer.split('_')[0]} z${zoom}: ${completed}/${tasks.length} tiles`)
    }
  })

  const rowFiles = []
  for (let row = 0; row < rows; row++) {
    const rowFile = path.join(dir, `row_${row}.jpg`)
    if (FORCE || !existsSync(rowFile)) {
      const files = []
      for (let col = 0; col < cols; col++) files.push(path.join(dir, `${row}_${col}.jpg`))
      magick([...files, '+append', rowFile])
    }
    rowFiles.push(rowFile)
  }

  if (FORCE || !existsSync(file)) {
    magick([...rowFiles, '-append', '-strip', '-quality', '90', file])
  }
  log(`mosaic ready: ${path.basename(file)} (${identify(file).width}x${identify(file).height})`)
  return { file, cols, rows }
}

function buildMapHalves(globalFile, prefix, { halfSize = 2048, quality = 86 } = {}) {
  const { width, height } = identify(globalFile)
  const halfWidth = Math.floor(width / 2)
  const west = path.join(TEXTURES, `${prefix}_west.jpg`)
  const east = path.join(TEXTURES, `${prefix}_east.jpg`)

  // The repo ships tiny placeholder textures, so a plain "file exists" check is
  // not enough — rebuild whenever the current file is not the requested size.
  const needsWrite = (file) => {
    if (FORCE || !existsSync(file)) return true
    const dims = identify(file)
    return dims.width !== halfSize || dims.height !== halfSize
  }

  if (needsWrite(west)) {
    magick([globalFile, '-crop', `${halfWidth}x${height}+0+0`, '+repage', '-resize', `${halfSize}x${halfSize}!`, '-strip', '-quality', String(quality), west])
  }
  if (needsWrite(east)) {
    magick([globalFile, '-crop', `${halfWidth}x${height}+${halfWidth}+0`, '+repage', '-resize', `${halfSize}x${halfSize}!`, '-strip', '-quality', String(quality), east])
  }
  log(`map halves updated: ${prefix}_west.jpg / ${prefix}_east.jpg @ ${halfSize}px`)
}

// --------------------------------------------------- orbital projection ----

const MARS_RADIUS_KM = 3396.19
const DEG = Math.PI / 180
const OW = 2048
const OH = 1024

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}

function normalizeLon(lon) {
  return ((lon + 540) % 360) - 180
}

function createSampler(globalFile) {
  const sourceWidth = 4096
  const sourceHeight = 2048
  const rawPath = path.join(CACHE, 'viking-z4-4096.rgb')
  if (FORCE || !existsSync(rawPath)) {
    log('rasterising global mosaic for projection...')
    magick([globalFile, '-resize', `${sourceWidth}x${sourceHeight}!`, '-depth', '8', `rgb:${rawPath}`])
  }
  const src = readFileSync(rawPath)
  if (src.length !== sourceWidth * sourceHeight * 3) {
    throw new Error(`Unexpected raster size ${src.length}`)
  }

  return (lon, lat) => {
    let x = ((lon + 180) / 360) * sourceWidth
    let y = ((90 - lat) / 180) * sourceHeight
    x = ((x % sourceWidth) + sourceWidth) % sourceWidth
    y = clamp(y, 0, sourceHeight - 1.0001)
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = (x0 + 1) % sourceWidth
    const y1 = Math.min(y0 + 1, sourceHeight - 1)
    const fx = x - x0
    const fy = y - y0
    const i00 = (y0 * sourceWidth + x0) * 3
    const i10 = (y0 * sourceWidth + x1) * 3
    const i01 = (y1 * sourceWidth + x0) * 3
    const i11 = (y1 * sourceWidth + x1) * 3
    const w00 = (1 - fx) * (1 - fy)
    const w10 = fx * (1 - fy)
    const w01 = (1 - fx) * fy
    const w11 = fx * fy
    return [
      src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11,
      src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11,
      src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11,
    ]
  }
}

/**
 * Render a true 360° × 180° equirectangular panorama from a virtual camera at
 * `altitudeKm` above the sub-camera point. The lower hemisphere is sampled from
 * NASA's official global mosaic; the upper hemisphere is space with a thin
 * Martian limb. This is an orbital reconnaissance view, not a fake surface shot.
 */
function renderOrbitalPanorama(sampler, { lat, lon, altitudeKm }, outFile) {
  const r = MARS_RADIUS_KM + altitudeKm
  const beta = Math.acos(MARS_RADIUS_KM / r)
  const horizonY = (0.5 + beta / Math.PI) * OH
  const lat0 = lat * DEG
  const lon0 = lon * DEG
  const sinLat0 = Math.sin(lat0)
  const cosLat0 = Math.cos(lat0)

  const haze = [190, 126, 92]
  const spaceTop = [2, 4, 9]
  const spaceHorizon = [16, 20, 31]
  const limb = [212, 148, 110]
  const buffer = Buffer.alloc(OW * OH * 3)

  for (let y = 0; y < OH; y++) {
    const phi = Math.PI / 2 - (y / OH) * Math.PI
    const sinPhi = Math.sin(phi)
    const disc = r * r * sinPhi * sinPhi - (r * r - MARS_RADIUS_KM * MARS_RADIUS_KM)
    const t = disc >= 0 ? -r * sinPhi - Math.sqrt(disc) : -1
    const isSpace = disc < 0 || t <= 0

    for (let x = 0; x < OW; x++) {
      const lambda = ((x - OW / 2) / OW) * Math.PI * 2
      let red
      let green
      let blue

      if (isSpace) {
        const tAbove = clamp(y / Math.max(1, horizonY), 0, 1)
        const base = tAbove < 0.5
          ? [
              spaceTop[0] + (spaceHorizon[0] - spaceTop[0]) * (tAbove / 0.5),
              spaceTop[1] + (spaceHorizon[1] - spaceTop[1]) * (tAbove / 0.5),
              spaceTop[2] + (spaceHorizon[2] - spaceTop[2]) * (tAbove / 0.5),
            ]
          : spaceHorizon
        const glow = Math.max(0, 1 - Math.abs(y - horizonY) / (OH * 0.035))
        red = base[0] + (limb[0] - base[0]) * glow * 0.75
        green = base[1] + (limb[1] - base[1]) * glow * 0.75
        blue = base[2] + (limb[2] - base[2]) * glow * 0.75
      } else {
        const qu = r + t * sinPhi
        const gamma = Math.acos(clamp(qu / MARS_RADIUS_KM, -1, 1))
        const sinGamma = Math.sin(gamma)
        const cosGamma = Math.cos(gamma)
        const sinLambda = Math.sin(lambda)
        const cosLambda = Math.cos(lambda)
        const sinLat = sinLat0 * cosGamma + cosLat0 * sinGamma * cosLambda
        const sampleLat = Math.asin(clamp(sinLat, -1, 1)) / DEG
        const sampleLon = lon0 + Math.atan2(sinLambda * sinGamma * cosLat0, cosGamma - sinLat0 * sinLat) / DEG
        const [sr, sg, sb] = sampler(normalizeLon(sampleLon), clamp(sampleLat, -90, 90))

        const distance = clamp(Math.pow(gamma / beta, 3.2), 0, 1) * 0.72
        const light = 0.82 + 0.18 * Math.cos(lambda - 0.6)
        red = sr * light * (1 - distance) + haze[0] * distance
        green = sg * light * (1 - distance) + haze[1] * distance
        blue = sb * light * (1 - distance) + haze[2] * distance
      }

      const offset = (y * OW + x) * 3
      buffer[offset] = clamp(Math.round(red), 0, 255)
      buffer[offset + 1] = clamp(Math.round(green), 0, 255)
      buffer[offset + 2] = clamp(Math.round(blue), 0, 255)
    }
  }

  const rawPath = path.join(CACHE, `orbital-${path.basename(outFile, '.jpg')}.rgb`)
  writeFileSync(rawPath, buffer)
  magick(['-size', `${OW}x${OH}`, '-depth', '8', `rgb:${rawPath}`, '-strip', '-sampling-factor', '4:2:0', '-quality', '88', outFile])
  rmSync(rawPath, { force: true })
}

// ------------------------------------------------------------------ main ---

async function main() {
  log('resolving NASA surface panoramas...')
  const surface = []
  for (const entry of SURFACE) {
    surface.push(await buildSurfacePanorama(entry))
  }

  log('resolving NASA card imagery...')
  const cards = []
  for (const entry of CARDS) {
    cards.push(await buildCardImage(entry))
  }

  let orbital = []
  if (!SKIP_ORBITAL) {
    log('building official NASA Trek global mosaic (Viking MDIM 2.1)...')
    const viking = await buildGlobalMosaic({
      layer: VIKING_LAYER,
      zoom: 4,
      file: path.join(CACHE, 'viking-z4-global.jpg'),
    })
    buildMapHalves(viking.file, 'trek', { halfSize: 2048, quality: 86 })

    log('building official NASA Trek MOLA mosaic (map alt layer)...')
    const mola = await buildGlobalMosaic({
      layer: MOLA_LAYER,
      zoom: 3,
      file: path.join(CACHE, 'mola-z3-global.jpg'),
    })
    buildMapHalves(mola.file, 'mola', { halfSize: 2048, quality: 86 })

    log('rendering orbital reconnaissance panoramas...')
    const sampler = createSampler(viking.file)
    for (const entry of ORBITAL) {
      const outFile = path.join(OUT, `${entry.poiId}.jpg`)
      const thumbFile = path.join(OUT, `${entry.poiId}-thumb.jpg`)
      if (FORCE || !existsSync(outFile)) {
        renderOrbitalPanorama(sampler, entry, outFile)
      }
      if (FORCE || !existsSync(thumbFile)) {
        magick([outFile, '-resize', '1100x>', '-strip', '-quality', '80', thumbFile])
      }
      log(`  ${entry.poiId}: ${entry.altitudeKm} km altitude`)
      orbital.push({
        poiId: entry.poiId,
        kind: 'orbital',
        src: `/panoramas/nasa/${entry.poiId}.jpg`,
        thumb: `/panoramas/nasa/${entry.poiId}-thumb.jpg`,
        title: `${entry.name} — Orbital Reconnaissance`,
        credit: 'NASA/JPL-Caltech/USGS · Mars Trek Viking MDIM 2.1',
        nasaId: null,
        sourceApi: 'https://trek.nasa.gov/tiles/Mars/EQ',
        sourceAsset: `${TREK}/${VIKING_LAYER}/1.0.0/default/default028mm/4/{row}/{col}.jpg`,
        captured: null,
        note: `Virtual 360° view from ${entry.altitudeKm} km above the datum`,
        haov: 360,
        vaov: 180,
        horizonPitch: 0,
        initialPitch: -58,
        initialYaw: 0,
        initialHfov: 110,
        altitudeKm: entry.altitudeKm,
        generator: 'NASA Mars Trek WMTS (Viking MDIM 2.1) → equirectangular projection',
      })
    }
  }

  const sources = Object.fromEntries([...surface, ...orbital].map((entry) => [entry.poiId, entry]))
  const header = `// AUTO-GENERATED by scripts/build-nasa-panoramas.mjs — do not edit by hand.\n// Official NASA imagery. See public/panoramas/README.txt for provenance.\n\n`
  const body = `export type NasaPanoramaKind = 'surface' | 'orbital'

export interface NasaPanoramaSource {
  poiId: string
  kind: NasaPanoramaKind
  src: string
  thumb: string
  title: string
  credit: string
  nasaId: string | null
  sourceApi: string
  sourceAsset: string
  captured: string | null
  note: string
  haov: number
  vaov: number
  horizonPitch: number
  initialPitch: number
  initialYaw: number
  initialHfov: number
  altitudeKm?: number
  /** Surface-only: landing region used for singleplayer guessing. */
  siteId?: string
  siteName?: string
  locationLabel?: string
  name?: string
  lat?: number
  lon?: number
  clue?: string
  highlight?: string
  pdsKeywords?: string
  generator: string
}

export const NASA_PANORAMAS_GENERATED_AT = ${JSON.stringify(new Date().toISOString())}

export interface NasaCardImageSource {
  poiId: string
  src: string
  title: string
  credit: string
  nasaId: string | null
  sourceApi: string
  sourceAsset: string
  captured: string | null
  note: string
  generator: string
}

export const NASA_PANORAMAS: Record<string, NasaPanoramaSource> = ${JSON.stringify(sources, null, 2)}

export const NASA_CARD_IMAGES: Record<string, NasaCardImageSource> = ${JSON.stringify(Object.fromEntries(cards.map((c) => [c.poiId, c])), null, 2)}
`
  writeFileSync(GENERATED, header + body)
  log(`wrote ${path.relative(ROOT, GENERATED)} (${Object.keys(sources).length} sources)`)

  // Provenance file for humans reviewing the repo.
  const lines = [
    'Official NASA 360° imagery used by MARS EXPLORER',
    '================================================',
    '',
    'Surface panoramas are official NASA/JPL rover mosaics resolved through the',
    'NASA Image and Video Library API (https://images-api.nasa.gov) and cached',
    'locally as same-origin derivatives. Orbital panoramas are generated from the',
    'official NASA Mars Trek WMTS global mosaic (Viking MDIM 2.1, ~232 m/px):',
    'https://trek.nasa.gov/tiles/Mars/EQ/',
    '',
    ...Object.values(sources).map(
      (s) =>
        `- ${s.poiId} [${s.kind}] — ${s.title}\n    credit: ${s.credit}\n    nasa: ${s.nasaId ?? 'Mars Trek'}\n    api: ${s.sourceApi}\n    asset: ${s.sourceAsset}`,
    ),
    '',
    'Singleplayer guessing rounds use ONLY the ground-level rover/lander mosaics',
    'above. Orbital reconnaissance panoramas are used exclusively by the globe',
    'exploration view and are never served as guessing rounds.',
  ]
  writeFileSync(path.join(OUT, 'PROVENANCE.txt'), lines.join('\n'))
  log('done')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
