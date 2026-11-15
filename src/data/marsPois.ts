export interface MarsPOI {
  id: string
  name: string
  category: 'volcano' | 'canyon' | 'crater' | 'rover_site' | 'ice_cap' | 'outflow' | 'feature'
  categoryLabel: string
  lat: number // Latitude in degrees: -90 to +90
  lon: number // Longitude in degrees: -180 to +180
  highlightStat: string
  quickFact: string
  clues: [string, string, string] // Progressive clues
  panoramaUrl: string // Path to 360 equirectangular panorama
  pdsKeywords: string // Keywords to query the live NASA PDS API
}

export const MARS_POIS: MarsPOI[] = [
  {
    id: 'jezero-crater',
    name: 'Jezero Crater',
    category: 'rover_site',
    categoryLabel: 'Ancient River Delta',
    lat: 18.38,
    lon: 77.58,
    highlightStat: 'Landing site of the Perseverance Rover & Ingenuity',
    quickFact:
      'Billions of years ago, this 45-km-wide crater was flooded with water and fed by a rushing river delta. Today, NASA’s Perseverance rover is collecting rock core samples here to search for fossils of ancient alien microbes.',
    clues: [
      'I used to be a giant lake fed by an ancient river system billions of years ago.',
      'NASA landed the Perseverance rover and the Ingenuity helicopter here in 2021.',
      'My muddy delta rocks are the prime location for finding fossilized Martian microbes.',
    ],
    panoramaUrl: '/panoramas/jezero.png',
    pdsKeywords: 'perseverance jezero mastcam',
  },
  {
    id: 'gale-crater',
    name: 'Gale Crater',
    category: 'crater',
    categoryLabel: 'Ancient Lake Basin',
    lat: -5.37,
    lon: 137.44,
    highlightStat: 'Home of the Curiosity Rover since 2012',
    quickFact:
      'In the center of this huge impact basin sits Mount Sharp, a mountain of layered mud and sediment rising 5.5 kilometers high that preserves millions of years of Martian climate history.',
    clues: [
      'A 154-km impact crater with a massive 5.5-km mountain rising right in its center.',
      'The nuclear-powered Curiosity rover touched down here using a sky crane in 2012.',
      'Mount Sharp at my center contains clay and sulfate layers from ancient wet climates.',
    ],
    panoramaUrl: '/panoramas/gale.png',
    pdsKeywords: 'curiosity gale mastcam',
  },
  {
    id: 'olympus-mons',
    name: 'Olympus Mons',
    category: 'volcano',
    categoryLabel: 'Colossal Volcano',
    lat: 18.65,
    lon: -133.8,
    highlightStat: 'Nearly 3x taller than Mt. Everest (21.9 km high)',
    quickFact:
      'The biggest volcano in our entire Solar System. It is so enormous that its base covers an area the size of Arizona, and its gentle slopes mean an astronaut walking up it would hardly notice the climb!',
    clues: [
      'I am the tallest mountain and volcano in the entire Solar System.',
      'My base is so wide that it could cover the entire state of Arizona or the country of France.',
      'I rise nearly 22 kilometers into the thin Martian sky, dwarfing Mount Everest.',
    ],
    panoramaUrl: '/panoramas/olympus.png',
    pdsKeywords: 'olympus mons mola',
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris',
    category: 'canyon',
    categoryLabel: 'Grand Canyon of Mars',
    lat: -13.9,
    lon: -59.2,
    highlightStat: 'Over 4,000 km long & 4x deeper than the Grand Canyon',
    quickFact:
      'A colossal rift valley that stretches across a fifth of the entire planet. If it were on Earth, it would span all the way from New York to Los Angeles!',
    clues: [
      'I am a mega-canyon system that cuts horizontally across Mars like a giant scar.',
      'I am 4 times deeper and 10 times longer than Earth’s Grand Canyon.',
      'If you placed me on the United States, I would stretch coast to coast.',
    ],
    panoramaUrl: '/panoramas/valles.png',
    pdsKeywords: 'valles marineris hirise',
  },
  {
    id: 'planum-boreum',
    name: 'Planum Boreum (North Pole)',
    category: 'ice_cap',
    categoryLabel: 'Northern Ice Cap',
    lat: 85.0,
    lon: 0.0,
    highlightStat: '1,000 km wide spiral cap of pure water ice',
    quickFact:
      'Mars’ brilliant northern crown, made mostly of thick water ice carved by howling winds into mesmerizing spiral canyons. In winter, freezing carbon dioxide coats the cap in glistening dry ice snow.',
    clues: [
      'I am located at the very top of the planet, gleaming white against the red desert.',
      'My water ice sheets are carved into stunning spiral pinwheel canyons by polar winds.',
      'During the dark winter, freezing carbon dioxide covers me in a blanket of dry ice.',
    ],
    panoramaUrl: '/panoramas/boreum.png',
    pdsKeywords: 'planum boreum sharad',
  },
  {
    id: 'hellas-planitia',
    name: 'Hellas Basin',
    category: 'crater',
    categoryLabel: 'Giant Impact Basin',
    lat: -42.7,
    lon: 70.0,
    highlightStat: '2,300 km wide & 7 km deep crater',
    quickFact:
      'Created when a rogue asteroid slammed into Mars 4 billion years ago. It is so deep that the air pressure at the bottom is twice the planetary average—sometimes allowing temporary morning ground fog to form.',
    clues: [
      'I am one of the largest asteroid impact scars in the entire Solar System.',
      'I am located in the southern hemisphere and measure over 2,300 kilometers wide.',
      'My floor is so deep that atmospheric pressure here is high enough to trap morning mist.',
    ],
    panoramaUrl: '/panoramas/jezero.png',
    pdsKeywords: 'hellas planitia mola',
  },
  {
    id: 'tharsis-montes',
    name: 'Tharsis Montes',
    category: 'volcano',
    categoryLabel: 'Trio of Giant Volcanoes',
    lat: 1.5,
    lon: -113.0,
    highlightStat: 'Three giant volcanoes in a perfect line',
    quickFact:
      'Three colossal shield volcanoes—Ascraeus, Pavonis, and Arsia—spaced roughly 700 kilometers apart in a neat diagonal line across the Martian equator on a massive volcanic bulge.',
    clues: [
      'We are three massive sister volcanoes standing in a neat diagonal row.',
      'Our summits poke high through the dust storms on the Tharsis volcanic bulge.',
      'Our names are Ascraeus Mons, Pavonis Mons, and Arsia Mons.',
    ],
    panoramaUrl: '/panoramas/olympus.png',
    pdsKeywords: 'tharsis montes themis',
  },
  {
    id: 'meridiani-planum',
    name: 'Meridiani Planum',
    category: 'rover_site',
    categoryLabel: 'The Blueberry Plains',
    lat: -0.2,
    lon: -2.5,
    highlightStat: 'Where Martian "blueberries" were found',
    quickFact:
      'The landing site of the Opportunity rover. Here, Opportunity found thousands of tiny gray hematite spheres nicknamed "blueberries" that proved acidic groundwater once flowed across the plains.',
    clues: [
      'I sit right on the Martian prime meridian and equator.',
      'The Opportunity rover rolled across my plains and discovered tiny round hematite spheres.',
      'My mineral-rich rocks proved that acidic liquid water soaked the ground in the distant past.',
    ],
    panoramaUrl: '/panoramas/gale.png',
    pdsKeywords: 'opportunity meridiani pancam',
  },
  {
    id: 'gusev-crater',
    name: 'Gusev Crater',
    category: 'rover_site',
    categoryLabel: 'Spirit Rover Discovery Site',
    lat: -14.57,
    lon: 175.47,
    highlightStat: 'Site of ancient hydrothermal hot springs',
    quickFact:
      'The landing site of NASA’s twin rover Spirit. While navigating the Columbia Hills inside this crater, Spirit’s jammed wheel churned up pure silica soil—the unmistakable fingerprint of ancient hot springs!',
    clues: [
      'I am a crater the size of Connecticut that was carved out by an ancient river channel.',
      'NASA’s Spirit rover explored my floor and climbed the Columbia Hills.',
      'A stuck rover wheel here accidentally dug up bright white silica left by ancient hot springs.',
    ],
    panoramaUrl: '/panoramas/jezero.png',
    pdsKeywords: 'spirit gusev pancam',
  },
  {
    id: 'utopia-planitia',
    name: 'Utopia Planitia',
    category: 'feature',
    categoryLabel: 'Vast Northern Plains',
    lat: 46.7,
    lon: 117.5,
    highlightStat: 'Holds as much underground ice as Lake Superior',
    quickFact:
      'A sprawling northern plain where China’s Zhurong rover landed in 2021. Satellite radar reveals a massive buried ice sheet beneath its soil holding enough fresh water to fill Lake Superior.',
    clues: [
      'I am an enormous smooth plain in the northern lowlands of Mars.',
      'NASA’s Viking 2 lander visited me in 1976, and China’s Zhurong rover landed here in 2021.',
      'Radar sounders discovered an underground ice sheet under my plains containing huge amounts of water.',
    ],
    panoramaUrl: '/panoramas/boreum.png',
    pdsKeywords: 'utopia planitia sharad',
  },
  {
    id: 'elysium-planitia',
    name: 'Elysium Planitia',
    category: 'rover_site',
    categoryLabel: 'Marsquake Central',
    lat: 4.5,
    lon: 135.9,
    highlightStat: 'Where InSight listened to over 1,300 Marsquakes',
    quickFact:
      'A flat, smooth volcanic plain nicknamed "the parking lot of Mars". NASA’s InSight robotic lander put its ear to the ground here for four years, recording hundreds of rumbling quakes and mapping Mars’ molten core.',
    clues: [
      'I am a remarkably flat volcanic plain near the Martian equator.',
      'The robotic InSight lander placed an ultra-sensitive dome seismometer on my red soil.',
      'Scientists listened to over 1,300 "Marsquakes" here to map the planet’s liquid core.',
    ],
    panoramaUrl: '/panoramas/gale.png',
    pdsKeywords: 'insight elysium seis',
  },
  {
    id: 'planum-australe',
    name: 'Planum Australe (South Pole)',
    category: 'ice_cap',
    categoryLabel: 'Southern Ice Cap',
    lat: -85.0,
    lon: 0.0,
    highlightStat: 'Home of seasonal erupting CO₂ geysers',
    quickFact:
      'The southern polar cap contains thick sheets of frozen carbon dioxide. Every spring, sunlight penetrates the clear ice and boils gas underneath, erupting in dark geysers of sand and dust!',
    clues: [
      'I anchor the extreme southern tip of the Red Planet.',
      'My surface is composed of permanent dry ice that never fully melts in summer.',
      'Spring sunlight causes explosive carbon dioxide geysers to erupt through my frozen crust.',
    ],
    panoramaUrl: '/panoramas/boreum.png',
    pdsKeywords: 'planum australe crism',
  },
  {
    id: 'noctis-labyrinthus',
    name: 'Noctis Labyrinthus',
    category: 'canyon',
    categoryLabel: 'Labyrinth of the Night',
    lat: -7.0,
    lon: -100.0,
    highlightStat: 'Fractured maze of towering canyon corridors',
    quickFact:
      'An astonishing spiderweb maze of valleys, steep chasms, and collapsed canyon blocks located at the western head of Valles Marineris. Morning water-ice clouds frequently drift through its shadowy corridors.',
    clues: [
      'My Latin name translates poetically to "The Labyrinth of the Night".',
      'I look like a chaotic fractured spiderweb of intersecting canyons and valleys.',
      'I connect the giant Tharsis volcanic plateau with the western mouth of Valles Marineris.',
    ],
    panoramaUrl: '/panoramas/valles.png',
    pdsKeywords: 'noctis labyrinthus hirise',
  },
  {
    id: 'cydonia',
    name: 'Cydonia',
    category: 'feature',
    categoryLabel: 'The "Face on Mars" Region',
    lat: 40.75,
    lon: -9.5,
    highlightStat: 'Famous for the optical illusion "Face on Mars"',
    quickFact:
      'A rugged transition zone dotted with rocky mesas and hills. A 1976 photo taken by Viking 1 with low sun angles created shadows resembling a human face, sparking decades of science fiction theories until higher-resolution cameras showed it was a natural hill.',
    clues: [
      'A 1976 orbiter photograph of one of my mesas caused a global sensation.',
      'Tricky sunlight shadows made a natural rocky hill look like a giant human face.',
      'I sit along the boundary where southern highlands meet smooth northern plains.',
    ],
    panoramaUrl: '/panoramas/jezero.png',
    pdsKeywords: 'cydonia viking mro',
  },
  {
    id: 'ares-vallis',
    name: 'Ares Vallis',
    category: 'outflow',
    categoryLabel: 'Cataclysmic Flood Valley',
    lat: 19.33,
    lon: -33.5,
    highlightStat: 'Where the first wheeled Mars rover (Sojourner) landed',
    quickFact:
      'An ancient channel carved by a catastrophic prehistoric flood that washed rocks and boulders of every kind into one spot. On July 4, 1997, the Pathfinder lander and Sojourner rover safely bounced down here on giant airbags.',
    clues: [
      'A colossal flood carved this valley, depositing a treasure trove of different rocks.',
      'On July 4, 1997, NASA’s Mars Pathfinder landed here using giant bouncing airbags.',
      'The microwave-sized Sojourner—humanity’s first wheeled rover on Mars—rolled here.',
    ],
    panoramaUrl: '/panoramas/jezero.png',
    pdsKeywords: 'pathfinder ares vallis imp',
  },
  {
    id: 'argyre-planitia',
    name: 'Argyre Basin',
    category: 'crater',
    categoryLabel: 'Southern Frost Basin',
    lat: -49.7,
    lon: -44.0,
    highlightStat: 'Second-largest impact basin on Mars (800 km across)',
    quickFact:
      'A majestic circular impact basin ringed by rugged mountain peaks that rise 3 kilometers above the crater floor. During winter, bright frost clings to its slopes, giving it a shining silver appearance through telescopes.',
    clues: [
      'I am the second largest impact basin on Mars, framed by rugged mountain ridges.',
      'My name comes from a mythical island of silver in ancient Greek folklore.',
      'During the southern winter, thick white frosts often coat my rim and floor.',
    ],
    panoramaUrl: '/panoramas/boreum.png',
    pdsKeywords: 'argyre basin hrsc',
  },
  {
    id: 'alba-mons',
    name: 'Alba Mons',
    category: 'volcano',
    categoryLabel: 'The Sprawling Volcano',
    lat: 40.5,
    lon: -110.0,
    highlightStat: 'Spans over 1,600 km across the northern hemisphere',
    quickFact:
      'While only 6.8 km high, Alba Mons is the most widespread volcanic structure on Mars. Its gentle lava plains stretch over 1,600 kilometers across, covering a land area larger than the state of Alaska!',
    clues: [
      'I am not the tallest volcano on Mars, but my lava flows cover the widest area.',
      'I span over 1,600 kilometers across, making me wider than the entire state of Alaska.',
      'I sit isolated in the northern plains just north of the Tharsis volcanic region.',
    ],
    panoramaUrl: '/panoramas/olympus.png',
    pdsKeywords: 'alba mons mola',
  },
  {
    id: 'medusae-fossae',
    name: 'Medusae Fossae',
    category: 'feature',
    categoryLabel: 'Mysterious Wind Formations',
    lat: -5.0,
    lon: -147.0,
    highlightStat: 'Massive wind-carved hills that may hide ice',
    quickFact:
      'An enigmatic, soft rock formation easily sculpted by Martian winds into aerodynamic ridges called yardangs. Scientists believe it formed from prehistoric explosive ash eruptions and might contain vast reservoirs of water ice.',
    clues: [
      'Martian howling winds have sculpted my soft rocks into streamlined ridges called yardangs.',
      'I am composed of powdery volcanic ash and dust deposited billions of years ago.',
      'Radar data suggests miles of porous deposits here might be packed with frozen ice.',
    ],
    panoramaUrl: '/panoramas/gale.png',
    pdsKeywords: 'medusae fossae sharad',
  },
  {
    id: 'kasei-valles',
    name: 'Kasei Valles',
    category: 'outflow',
    categoryLabel: 'Mega-Flood Channel',
    lat: 24.6,
    lon: -65.0,
    highlightStat: 'Carved by water flows 100x bigger than the Amazon',
    quickFact:
      'One of the largest outflow channel systems on Mars, stretching nearly 3,000 kilometers long. It was gouged out by torrential release of subterranean water during titanic glacial floods in Mars’ ancient past.',
    clues: [
      'I am an immense flood channel system nearly 3,000 kilometers in length.',
      'Prehistoric floods that roared through me were over 100 times larger than the Amazon River.',
      'I empty northward into the vast Chryse Planitia basin.',
    ],
    panoramaUrl: '/panoramas/valles.png',
    pdsKeywords: 'kasei valles mro',
  },
  {
    id: 'victoria-crater',
    name: 'Victoria Crater',
    category: 'crater',
    categoryLabel: 'Scalloped Impact Rim',
    lat: -2.05,
    lon: -5.5,
    highlightStat: 'Explored by Opportunity rover for nearly 2 years',
    quickFact:
      'An 800-meter-wide impact crater featuring breathtaking cliff alcoves and promontories nicknamed "Duck Bay" and "Cape Verde". Opportunity drove right along its jagged precipice to examine exposed bedrock layers.',
    clues: [
      'An 800-meter-wide crater characterized by scalloped, jagged cliff edges.',
      'The Opportunity rover spent 22 continuous months carefully circumnavigating my rim.',
      'Names like "Cape Verde" and "Duck Bay" were given to my dramatic cliff promontories.',
    ],
    panoramaUrl: '/panoramas/gale.png',
    pdsKeywords: 'opportunity victoria pancam',
  },
]
