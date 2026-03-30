// ─────────────────────────────────────────────────────────────────────────────
// scent-quotes.ts
// 500+ modular words & phrases for generating unique persona quotes.
// Assembly: pick deterministically from pools using a hash of the user's
// unique product ID set — so the same collection always generates the same quote.
// ─────────────────────────────────────────────────────────────────────────────

export type QuoteInput = {
  timeline: Array<{ productId: string; tier: string; productTitle: string }>
  perfumeMap: Record<string, {
    top_notes?: string | null
    middle_notes?: string | null
    base_notes?: string | null
    longevity?: string | null
    sillage?: string | null
    occasions?: string | null
  }>
  tierCounts: Record<string, number>
}

// ── Hash helpers ─────────────────────────────────────────────────────────────

function hash32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
    h >>>= 0
  }
  return h
}

function pickFrom<T>(arr: T[], seed: number, salt = 0): T {
  return arr[Math.abs(hash32(String(seed + salt))) % arr.length]
}

// ── Pool 1 · Openers (42 entries) ────────────────────────────────────────────

const OPENERS: string[] = [
  "A collector of quiet intensity,",
  "Drawn to what lingers long after the room has cleared,",
  "Somewhere between instinct and ritual,",
  "Never choosing a scent carelessly —",
  "Your wrists remember every bottle you've ever worn,",
  "Not chasing applause, but recognition —",
  "There is a language your skin speaks that words rarely catch,",
  "What you wear says more than what you say,",
  "Every fragrance is a decision about who you'll be today,",
  "To know your perfume is to know your soul,",
  "The invisible architecture of your presence,",
  "You don't follow trends — you trace them back to their origins,",
  "A nose trained by curiosity and desire,",
  "Between the aldehydes and the absolutes, between the familiar and the strange,",
  "Scent memory is the oldest memory — and yours runs deep,",
  "You don't just wear fragrance; you inhabit it,",
  "In the grammar of scent, every choice is a sentence,",
  "Unafraid of complexity and unimpressed by simplicity,",
  "The olfactory map of a life well-lived,",
  "You arrive before you arrive,",
  "There are people who wear perfume and people who are perfume,",
  "Walking through a world that rarely notices what it smells,",
  "To the uninitiated, a bottle. To you, an entire world.",
  "Your scent speaks the truths you keep private,",
  "Some collect art. Some collect silence. You collect moments bottled in glass,",
  "Beneath the surface of every day, a current of fragrance,",
  "The sophistication of restraint, the romance of excess — you know both,",
  "An archive of atmospheres worn against the skin,",
  "Deliberate, layered, unhurried,",
  "Fragrance is the ink with which you write yourself into every room,",
  "Rare things speak to rare people,",
  "In a world of noise, you choose the articulate whisper,",
  "You've learned that beauty isn't always obvious — sometimes it hides in the dry-down,",
  "What the eye can't see, the nose is always finding,",
  "You wear time differently than most,",
  "Not every scent is for everyone. Yours never has been.",
  "To the bold belongs the beautiful; to the patient, the profound,",
  "Every morning you make a choice most people don't even know is available,",
  "A devotee of the invisible arts,",
  "Others see a bottle. You see a story with an opening, a heart, and a close,",
  "Quietly radical in your choices,",
  "Before the first word, there is a scent,",
]

// ── Pool 2 · Tier Phrases (30 per tier = 90 + 15 mixed = 105 entries) ────────

const TIER_PHRASES: Record<string, string[]> = {
  "crowd-pleaser": [
    "you understand that accessibility is its own art form",
    "your collection speaks of warmth freely given",
    "you know that a scent that turns every head is no small feat",
    "your nose has found the sweet spot between safety and beauty",
    "you've mastered the art of the compliment-worthy fragrance",
    "you wear what works — confidently, without apology",
    "your selections are a masterclass in studied approachability",
    "you've found that universal appeal requires deep intelligence",
    "your wrist speaks a language everyone understands and few can replicate",
    "you know the power of a scent that opens doors and invites smiles",
    "your collection reads like a greatest hits — familiar, beloved, intentional",
    "you've discovered that the crowd-pleaser is the hardest fragrance to perfect",
    "warmth is your signature note — in fragrance and in life",
    "your olfactory life centres on connection and mood elevation",
    "you've found gold in the middle ground between daring and safe",
    "the fragrances you wear make people lean in and ask",
    "your instinct is to delight with every entrance",
    "you understand that sometimes the most beautiful thing is to simply smell wonderful",
    "your collection bridges the world of niche with the world of wearable joy",
    "there's a quiet confidence in choosing what the crowd loves best",
    "your nose is drawn to the well-crafted, the joyful, the thoroughly bloomed",
    "your fragrance choices feel like open arms",
    "you have an uncanny ability to smell the right thing for every room",
    "your skin knows how to make crowd-pleasing feel personal",
    "there is wisdom in your accessibility — nothing here is accidental",
    "you choose fragrances like you choose company — warm, welcoming, remembered",
    "your collection radiates something most perfumers spend careers chasing: pure likability",
    "you find the extraordinary inside the familiar",
    "beauty doesn't need to be painful to be real — and your collection proves it",
    "your fragrance philosophy begins and ends with: does it make people smile?",
  ],
  "intro-to-niche": [
    "you stand at the frontier of the familiar and the fascinatingly strange",
    "your collection straddles the threshold between mainstream beauty and artisan complexity",
    "you've begun the descent into the rabbit hole — and something tells us you won't surface soon",
    "your nose is learning a new language, one note at a time",
    "you collect translators — fragrances that bridge the uninitiated and the obsessed",
    "you're in the most exciting part of the journey: where discovery feels endless",
    "your selections reveal a growing literacy in the language of niche",
    "you've tasted rareness and it agrees with you",
    "your collection sits in the beautiful tension between accessibility and art",
    "the explorer's instinct lives in your choices — always one more layer to find",
    "your olfactory education is well underway and your nose is getting smarter",
    "you've moved past the familiar and are learning to love what unsettles you slightly",
    "your wrist tells the story of a nose that refuses to stop growing",
    "you've discovered the divide between fine fragrance and niche art — and you're crossing it",
    "your collection maps a journey of deepening appreciation",
    "you find yourself drawn to complexity — not for complexity's sake, but for truth's",
    "you've learned that the best fragrances ask something of the wearer",
    "your choices reveal a growing hunger for the unusual",
    "you're building a collection that will mean something in ten years",
    "your nose has developed opinions and your choices reflect them proudly",
    "the middle path between crowd-pleasing and pure art — that's where you live",
    "your collection shows an evolving awareness of what fragrance can actually do",
    "you've moved from 'what's popular' to 'what's interesting' — and that's everything",
    "your selections map a mind that asks why and finds answers in base notes",
    "you're the translator — someone who can walk between two perfume worlds with ease",
    "every new scent you choose deepens the vocabulary of your olfactory life",
    "your collection reflects a person in active, joyful transformation",
    "you've tasted the edge and it tasted like amber and smoke and more",
    "you've developed a connoisseur's eye in a beginner's body — and that's a gift",
    "your collection is evidence of a curious mind and a developing, exacting nose",
  ],
  "polarizing-art": [
    "you do not collect compliments — you collect truths",
    "you've moved beyond wearability into the realm of olfactory art",
    "your collection is a manifesto in glass",
    "you wear what most people are afraid to think about",
    "your olfactory compass points true north: outward, inward, difficult, beautiful",
    "you've crossed the threshold into fragrance as pure expression, pure architecture",
    "your choices are not for everyone — this is precisely the point",
    "you've learned that the greatest fragrances polarize because they say something real",
    "your wrist carries a conversation most people won't know how to answer",
    "you've made peace with being misunderstood — in life and in your perfume cabinet",
    "your collection is a dark room with beautiful things in it",
    "you wear the difficult beauty that lesser noses dismiss and great ones revere",
    "your fragrance choices are an act of defiance dressed in elegance",
    "you've decided that comfort is overrated and depth is everything",
    "your collection speaks to the part of you that wants to be fully known, not universally liked",
    "you've developed a tolerance for the uncomfortable and a hunger for the profound",
    "your olfactory life runs on contrast — the clash between beautiful and strange",
    "you wear what artists make for other artists",
    "your nose has developed the rare ability to find beauty where others find only difficulty",
    "you've built a collection that makes people ask questions you enjoy answering",
    "there is an authority in how you wear the untame, the tarry, the unapologetically dense",
    "you collect the work of perfumers who chose truth over sales",
    "your wrist is a gallery — challenging, layered, always something to say",
    "you've decided that a fragrance worth wearing must first make you feel something",
    "your collection defies the season, the room, the crowd, the occasion — and thrives",
    "you are drawn to what reveals itself slowly and reveals a great deal",
    "your nose operates in a frequency that few people are tuned to",
    "you've found that the most interesting scents are the ones that ask the most of you",
    "your collection tells the story of someone who never stopped going deeper",
    "you wear the ink of the olfactory avant-garde with total conviction",
  ],
  mixed: [
    "your collection refuses categorisation — which is exactly right",
    "your nose moves freely across the spectrum: crowd to connoisseur, accessible to extreme",
    "you collect without dogma, guided only by what moves you",
    "there is no ideology in your cabinet — only curiosity and desire",
    "your collection charts the full range of what fragrance can be",
    "you wear the crowd-pleaser beside the avant-garde and see no contradiction",
    "your olfactory life is evidence of a mind that refuses to specialise",
    "your collection is a study in the beautiful range of human scent-making",
    "the diversity of your choices is its own kind of sophistication",
    "you've found that the best collection is one that surprises even its owner",
    "your nose owes no single tradition any allegiance",
    "you wear the full chord, not a single note",
    "your collection is a bridge — between worlds, between moods, between selves",
    "you find beauty without needing it to fit a category",
    "your olfactory map is continent-sized and still growing at every edge",
  ],
  unknown: [
    "your collection is still forming — and that is its most compelling quality",
    "the blank page of your olfactory life is waiting to be written",
    "there is possibility in every empty shelf",
    "your collection is at its most interesting position: the beginning",
    "what hasn't been chosen yet is as defining as what has been",
  ],
}

// ── Pool 3 · Note-family phrases (20 per family = 120 entries) ───────────────

const NOTE_FAMILY_PHRASES: Record<string, string[]> = {
  floral: [
    "your collection blooms in the language of petals and pollen",
    "you've discovered that flowers have dialects — and you're learning them all",
    "there's a garden at the heart of your scent story",
    "you're drawn to the natural world translated into wearable beauty",
    "your nose is fluent in roses, jasmine, iris, ylang — the floral lexicon complete",
    "you wear living things distilled into lasting form",
    "the floral tradition runs through your choices like a green stem through history",
    "your favourite notes come from places where things grow toward the light",
    "you understand that flowers are complexity in disguise — and you love the disguise",
    "your collection is a greenhouse of the olfactory imagination",
    "you've learned that a single jasmine absolute carries more literature than most novels",
    "the green, the white, the rose — your nose knows them intimately",
    "your wrist carries the memory of every flower that ever made you stop and breathe",
    "you wear gardens closed against the rain",
    "petals pressed in time — that's what lives in your collection",
    "your collection sings in floral frequencies that evolve through the day",
    "you've mapped the floral spectrum from pale neroli to deep tuberose",
    "your nose follows flowers the way bees do — purposefully, completely",
    "the living world of petal and bloom informs your every choice",
    "your collection is a love letter to everything that grew and bloomed and became scent",
  ],
  woody: [
    "your collection smells of forests and foundations",
    "you're drawn to the deep, resinous memory of old wood and ancient earth",
    "your nose lives in the forest floor, the cedar chest, the aged sandalwood",
    "there's a groundedness in your choices — literally rooted in the aromatic",
    "your collection speaks the slow language of trees",
    "you find beauty in the architectural — in the cedars and sandalwoods that scaffold a fragrance",
    "your wrist carries the memory of forests you may never have visited but somehow know",
    "you wear the woody accord like second skin — comfortable, lasting, yours",
    "your collection reaches down before it reaches out",
    "the aromatic tradition — vetiver, patchouli, sandalwood, cedar — lives in your choices",
    "you've discovered that the most enduring things always have wood in them",
    "your nose is most at home where the aldehydes end and the base notes begin",
    "you wear the dark heart of the forest with entirely comfortable authority",
    "your collection has the quality of old libraries and well-worn paths",
    "you find the exotic in roots and bark and resin — the world below ground",
    "your choices tell the story of someone who values depth over display",
    "you wear the earth's oldest perfumes without apology",
    "your olfactory life is rooted — deeply, beautifully, without apology",
    "the woody family has given your collection its foundation and its soul",
    "you've learned that nothing lasts longer than the base — in fragrance and in character",
  ],
  citrus: [
    "your collection crackles with bergamot electricity and lemon clarity",
    "you wear the morning in every spray — bright, clean, alive",
    "your nose is drawn to the luminous top of the pyramid",
    "you understand the discipline of the citrus accord — it fades first and must be perfect",
    "there's an alertness in your choices — a preference for the crisp over the murky",
    "your collection has the quality of cut grapefruit and morning light",
    "you find elegance in the transparent — in what gleams rather than smoulders",
    "your wrist carries the first act of a great fragrance most people never fully appreciate",
    "you wear freshness as a philosophy, not a choice",
    "bergamot cities and neroli mornings — your collection lives in golden hours",
    "you've learned that the brightest notes are made of the most complex materials",
    "your olfactory life starts at sunrise — and your collection proves it",
    "the citrus tradition runs through your choices like a river through a city",
    "you find clarity beautiful — in a note, in a person, in a day",
    "your collection smells like the beginning of things that turn out well",
    "you wear the top notes with the reverence they deserve",
    "your nose gravitates to the light — to the sparkling, the sharp, the clean",
    "your collection has the quality of a newly peeled orange in winter",
    "you understand that freshness is rare and fleeting — which makes you prize it",
    "your olfactory choices are a study in luminosity",
  ],
  oriental: [
    "your collection burns slowly, like incense in a quiet room",
    "you're drawn to the ancient — amber roads, oud trails, resin incense",
    "your nose speaks the deep language of the Orient: amber, oud, labdanum, smoke",
    "you collect warmth in its most concentrated form",
    "your wrist carries the memory of bazaars and dusk and things that linger for days",
    "you wear centuries of tradition without knowing you remember them",
    "your collection is the dark side of the fragrance spectrum — and you are entirely at home there",
    "there's a density in your choices that rewards patience and proximity",
    "you've discovered that oud is autobiography — it tells more about you than you intended",
    "your olfactory life runs on amber electricity and dark musks",
    "the orientals have given your collection its depth, its gravity, its earned authority",
    "you wear the slow burn — the resinous, the warm, the night-dwelling",
    "your collection smells like a room where significant things are about to happen",
    "you find beauty in the dark — in the heavy, the labdanum-laden, the smoky absolute",
    "your nose has always been drawn to the ancient trade routes — gold and spice and fire",
    "you wear the night in every spray",
    "your collection is built for the long evening, the late-arriving dusk",
    "you've learned that real depth requires darkness — in notes and in people",
    "your olfactory choices tell the story of someone who prefers warmth to light",
    "you wear the world's oldest perfuming tradition with contemporary conviction",
  ],
  aquatic: [
    "your collection breathes like open water",
    "you're drawn to the impossible smell of the sea translated into crystal and salt",
    "your nose lives near the horizon — marine, clean, endlessly open",
    "there's freedom in your choices: wind, salt, the place where rivers meet the sea",
    "your collection has the quality of morning fog over water",
    "you wear the breath of oceans most people only visit",
    "your olfactory life is clean and open — like a window left wide in spring",
    "you find truth in the transparent — in the notes that describe air itself",
    "your wrist carries the memory of rain on warm stone, and rivers in August",
    "the aquatics have given your collection its atmosphere: luminous, breathing, uncontained",
    "you've discovered that fresh doesn't mean simple — it means extremely difficult to perfect",
    "your collection smells like the world just washed clean",
    "you wear the elements — literally",
    "your nose gravitates to the openness of water and wind",
    "your choices reflect a character that prefers space to enclosure",
    "your collection is the olfactory equivalent of a cleared sky",
    "you wear clarity as an aesthetic stance, and it suits you entirely",
    "marine notes tell your story — wide, deep, unhurried",
    "your olfactory life has the quality of early morning at a coast no one else has found yet",
    "you've found the scent of pure air — and that turns out to be very complex indeed",
  ],
  gourmand: [
    "your collection edits the kitchen into something wearable and strange",
    "you wear sweetness as a weapon — unexpected, intoxicating, unapologetic",
    "your nose finds beauty where other noses find only appetite",
    "there's a warmth in your choices that's skin-close and inviting",
    "your collection translates pleasure into portable form",
    "you've discovered that the best vanilla is never simply sweet — it's profound",
    "your olfactory choices are comforting and disarming in equal measure",
    "you wear the memory of warmth — caramel, tonka, honey, amber at close range",
    "your collection smells of moments when everything was warm and nothing was required",
    "the gourmand tradition gave fragrance its most human quality — and you embrace it",
    "you find beauty in what nourishes: in vanilla, in amber, in the soft base",
    "your wrist carries warmth as a deliberate aesthetic position",
    "you've learned that sweetness is the most underestimated note in the olfactory palette",
    "your collection radiates the quiet confidence of someone completely comfortable in their warmth",
    "you wear what other noses find too forward — and the result is always memorable",
    "your olfactory life is sensory and immediate — designed for maximum proximity",
    "you collect the warmth of every good evening that ever ended too soon",
    "your collection has an honesty to it — it doesn't pretend to be anything but pleasure",
    "you've chosen warmth over distance, and your collection celebrates that choice",
    "your nose operates in the frequency of comfort and the aesthetic of closeness",
  ],
}

// ── Pool 4 · Journey metaphors (50 entries) ──────────────────────────────────

const JOURNEY_METAPHORS: string[] = [
  "This is a map of the invisible.",
  "The constellation doesn't lie.",
  "What you choose to wear is what you choose to remember.",
  "Every note is a decision about who you are today.",
  "The collection is the autobiography that never needs editing.",
  "Maps made of fragrance are the most honest kind.",
  "Your history is written in base notes.",
  "The trail you leave always tells the truth.",
  "Nobody forgets a great scent — least of all the one who wore it.",
  "A collection this considered doesn't happen by accident.",
  "The invisible thread that connects every bottle you've owned.",
  "Scent memory is the only memory that bypasses reason entirely.",
  "Every fragrance decision is a small act of autobiography.",
  "The constellation grows with every new bottle — and every new chapter.",
  "You're building something here. You may not have named it yet.",
  "The collection reflects the person. Always.",
  "An evolving portrait rendered in molecule and memory.",
  "What you collect, you become adjacent to.",
  "The map is not the territory — but it points toward it perfectly.",
  "Fragrance is the medium. Identity is the message.",
  "Your choices here are your clearest choices.",
  "The trail of scent you've left through the years is a kind of literature.",
  "Olfactory autobiography is the truest kind — the nose doesn't edit.",
  "There is pattern in what you've chosen. And the pattern is you.",
  "The chemistry between skin and scent is a collaboration decades in the making.",
  "Your constellation will keep growing — there are always more stars.",
  "The collection reveals what the mirror cannot.",
  "What a person smells tells you who they want to be.",
  "The history of who you've been is in every bottle you've ever emptied.",
  "Your nose has always known things your mind is still learning.",
  "Fragrance is the only art form that enters the body completely uninvited.",
  "The collection is the practice. There is no end point.",
  "What you wear speaks before you've said a word.",
  "The most honest portrait you'll ever have made is this one.",
  "Every scent choice is a theory about beauty, tested daily.",
  "The olfactory self is the most private and the most projected.",
  "Your nose is an instrument tuned over years of curious attention.",
  "The collection doesn't have to be finished to be meaningful.",
  "Beauty that evaporates is still beauty — maybe more.",
  "Your wrist is the exhibition. Every day is a new opening.",
  "What you leave on a room after you've gone says more than you realise.",
  "The constellation shifts with every new star — but the centre holds.",
  "Your olfactory life is longer and more specific than you know.",
  "Every empty bottle is a completed sentence.",
  "The notes you return to are the ones that are yours.",
  "You are always, in some way, the sum of every fragrance you've ever worn.",
  "Your collection curates you as much as you curate it.",
  "The pattern is clear to everyone who knows how to look.",
  "Every great collection begins with a single instinctive choice.",
  "The nose knows first. The rest of you catches up eventually.",
]

// ── Pool 5 · Closers (40 entries) ────────────────────────────────────────────

const CLOSERS: string[] = [
  "Still becoming.",
  "The constellation grows.",
  "The chapter isn't closed.",
  "There are more bottles to open.",
  "This is where the map is. You decide where it leads.",
  "The collection continues.",
  "More stars to place.",
  "The best bottle is always the next one.",
  "What you smell tomorrow will surprise you — and that is exactly right.",
  "The olfactory journey is one of the few that gets better the longer it runs.",
  "Your next discovery is already waiting.",
  "The map expands with imagination.",
  "The constellation has more room than you think.",
  "Every day is an opening note.",
  "Something remarkable is always next.",
  "The trail continues.",
  "Follow the drydown.",
  "The collection answers to no one but you.",
  "There is always another note to learn.",
  "Stay curious.",
  "The nose never stops learning.",
  "Keep exploring.",
  "More of this. Always.",
  "Let the collection grow in its own direction.",
  "Let the nose lead.",
  "The best is still under development.",
  "The olfactory education never graduates.",
  "You've only just begun.",
  "This is prologue.",
  "The story continues.",
  "Your wrist is ready for what comes next.",
  "The empty shelf is the most interesting one.",
  "Another chapter. Another layer. Always.",
  "The spiral continues outward.",
  "Your constellation expands with every instinct honoured.",
  "There are ingredients you haven't met yet that were made for you.",
  "Somewhere a perfumer is making the next thing your nose is looking for.",
  "The greatest scent you'll ever wear hasn't reached you yet.",
  "The arc of your olfactory life bends toward revelation.",
  "One more bottle, one more star, one more version of yourself.",
]

// ── Pool 6 · Mood adjectives (60 entries) ────────────────────────────────────

export const MOOD_ADJECTIVES: string[] = [
  "luminous", "smoky", "velvety", "crystalline", "molten", "weathered",
  "spectral", "saturated", "translucent", "austere", "gilded", "mercurial",
  "deliberate", "nocturnal", "solar", "tidal", "carbonised", "lambent",
  "resinous", "spare", "dense", "lacquered", "feverish", "cool",
  "halved", "tender", "leathered", "wintry", "sepulchral", "vivid",
  "muted", "ceremonial", "feral", "domestic", "oceanic", "terrestrial",
  "phosphorescent", "amber-lit", "frost-bright", "ink-dark", "copper-warm",
  "silver-pale", "raw", "finished", "architectural", "breathing",
  "ancient", "contemporary", "borrowed", "invented", "inherited",
  "deeply personal", "universally felt", "carefully calibrated",
  "instinctively chosen", "deliberately strange", "beautifully difficult",
]

// ── Pool 7 · Note descriptor adjectives (70 entries) ─────────────────────────

export const NOTE_ADJECTIVES: string[] = [
  "warm", "cool", "dark", "bright", "heavy", "light", "dense", "spare",
  "deep", "surface", "complex", "clean", "dirty", "sweet", "bitter", "sour",
  "salty", "dry", "wet", "powdery", "woody", "green", "white", "golden",
  "smoky", "fresh", "stale", "sharp", "round", "linear", "evolving",
  "static", "surprising", "familiar", "alien", "intimate", "distant",
  "demanding", "easy", "seasonal", "timeless", "historical", "modern",
  "raw", "refined", "quiet", "loud", "singular", "layered", "blended",
  "dissonant", "harmonious", "challenging", "welcoming", "austere",
  "ornate", "sparse", "rich", "lean", "generous", "restrained", "wild",
  "tame", "polarising", "crowd-gathering", "niche-dwelling", "art-grade",
]

// ── Pool 8 · Season & time fragments (30 entries) ────────────────────────────

export const SEASON_FRAGMENTS: string[] = [
  "made for rooms with long evenings",
  "worn best at the hour before dark",
  "built for autumn and its particular light",
  "perfectly calibrated for the winter skin",
  "a summer evening in amber and glass",
  "designed for the golden hour and nothing else",
  "meant for the train journey no one chose",
  "at home in rain-soaked streets at midnight",
  "built for Sunday mornings in no particular city",
  "worn best when you've nowhere to be",
  "a scent that knows what late afternoon tastes like",
  "for the morning commute that turned into something worth remembering",
  "worn at the best versions of every season",
  "for the rooms where light enters at an angle",
  "built for the first cold evening of the year",
  "made for the in-between seasons that have no name",
  "designed for the precise moment before everything changes",
  "for the city at 2am when it stops performing",
  "for every well-dressed morning with nowhere urgent to go",
  "at home in any room that takes its time getting warm",
  "meant for the slow hours after an excellent meal",
  "built for quiet intensity and deliberate presence",
  "for the evening that always ends later than planned",
  "worn by people who experience Tuesday with ceremony",
  "made for arrivals worth remembering",
  "built for the kind of presence that doesn't need to announce itself",
  "at home in libraries, galleries, and rooms with old floors",
  "for people who believe that every ordinary day deserves something remarkable",
  "made for mornings that intend to be good",
  "for the last hour of light, when everything turns golden",
]

// ── Pool 9 · Persona words (40 entries) ──────────────────────────────────────

export const PERSONA_WORDS: string[] = [
  "curator", "collector", "explorer", "initiate", "devotee", "practitioner",
  "connoisseur", "aesthete", "archivist", "translator", "witness", "seeker",
  "keeper", "navigator", "interpreter", "cartographer", "architect", "scholar",
  "correspondent", "chronicler", "student", "master", "apprentice", "guide",
  "wanderer", "settler", "pioneer", "discoverer", "artist", "craftsperson",
  "ritualist", "pragmatist", "romantic", "empiricist", "sensualist", "minimalist",
  "maximalist", "classicist", "avant-gardist", "originalist",
]

// ── Note family detection ─────────────────────────────────────────────────────

const NOTE_FAMILY_KEYWORDS: Record<string, string[]> = {
  floral:    ["rose", "jasmine", "lily", "peony", "iris", "violet", "neroli", "tuberose", "magnolia", "ylang", "gardenia", "blossom", "flower", "osmanthus", "mimosa"],
  woody:     ["cedar", "sandalwood", "vetiver", "patchouli", "wood", "oak", "birch", "guaiac", "teak", "pine", "fir", "agarwood", "ebony", "bamboo"],
  citrus:    ["bergamot", "lemon", "citrus", "orange", "grapefruit", "lime", "mandarin", "yuzu", "petitgrain", "tangerine", "pomelo", "aldehy"],
  oriental:  ["oud", "amber", "incense", "resin", "smoke", "labdanum", "benzoin", "myrrh", "frankincense", "musk", "tobacco", "leather", "spice", "saffron", "cardamom"],
  aquatic:   ["aqua", "marine", "sea", "ocean", "rain", "water", "salt", "ozonic", "fresh", "air", "sky", "dew"],
  gourmand:  ["vanilla", "caramel", "honey", "tonka", "praline", "cocoa", "chocolate", "almond", "sugar", "coffee", "cream", "butter", "marzipan"],
}

function detectNoteFamily(notes: string[]): string | null {
  const allNotes = notes.join(" ").toLowerCase()
  const scores: Record<string, number> = {}
  for (const [family, keywords] of Object.entries(NOTE_FAMILY_KEYWORDS)) {
    scores[family] = keywords.filter((kw) => allNotes.includes(kw)).length
  }
  const top = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]
  return top && top[1] > 0 ? top[0] : null
}

// ── Main export: generate a unique persona quote ──────────────────────────────

export function generatePersonaQuote(input: QuoteInput): string {
  const { timeline, perfumeMap, tierCounts } = input

  if (timeline.length === 0) return ""

  // Deterministic seed from sorted product IDs
  const sortedIds = [...timeline.map((e) => e.productId)].sort().join("|")
  const seed = hash32(sortedIds)

  // Determine tier key
  const nonUnknownCounts = Object.entries(tierCounts)
    .filter(([k]) => k !== "unknown")
    .sort(([, a], [, b]) => b - a)

  const dominantTier = nonUnknownCounts[0]?.[0]
  const hasMultipleTiers =
    nonUnknownCounts.filter(([, v]) => v > 0).length >= 2

  const tierKey: string = hasMultipleTiers
    ? "mixed"
    : dominantTier ?? "unknown"

  // Collect notes from all perfumes
  const allNotes = timeline.flatMap((e) => {
    const p = perfumeMap[e.productId]
    if (!p) return []
    return [p.top_notes, p.middle_notes, p.base_notes].filter(
      (n): n is string => typeof n === "string" && n.length > 0
    )
  })

  const detectedFamily = detectNoteFamily(allNotes)

  // Pick fragments
  const opener = pickFrom(OPENERS, seed, 0)
  const tierPhrase = pickFrom(
    TIER_PHRASES[tierKey] ?? TIER_PHRASES.unknown,
    seed,
    1
  )
  const metaphor = pickFrom(JOURNEY_METAPHORS, seed, 2)
  const closer = pickFrom(CLOSERS, seed, 3)

  const notePhrase =
    detectedFamily && NOTE_FAMILY_PHRASES[detectedFamily]
      ? " " + pickFrom(NOTE_FAMILY_PHRASES[detectedFamily], seed, 4) + "."
      : ""

  return `${opener} ${tierPhrase}.${notePhrase} ${metaphor} ${closer}`
}
