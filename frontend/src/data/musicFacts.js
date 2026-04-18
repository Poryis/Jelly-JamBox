// Music facts for young children (early elementary, ages 5-8).
// Each character has a theme aligned with their personality.
// Keep facts short, surprising, and playful.

export const CHARACTER_FACTS = {
  Finn: {
    topic: 'rhythm',
    color: '#FF3B30',
    facts: [
      "RHYTHM is like your heartbeat — it's the steady beat that makes music move!",
      "Did you know? Your heart beats about 100 times a minute. That's a pretty fast rhythm!",
      "TEMPO is a fancy word for how fast or slow the music is going.",
      "Musicians use a tool called a METRONOME to keep a perfect steady beat — it clicks like a clock!",
      "A beat is the HEARTBEAT of a song. Tap your foot to find it!",
      "When you clap along to music, you're making rhythm with your hands!",
      "Fast songs make us want to dance. Slow songs can help us feel calm and sleepy.",
      "There are LOTS of beats hidden in every song — can you count to 4 over and over with the music?",
      "Marching bands march to a beat of ONE-two-ONE-two, just like left-right-left-right!",
      "Some songs have really TRICKY rhythms that zig-zag — those are called syncopated rhythms!",
    ],
  },
  Chunk: {
    topic: 'drums',
    color: '#9B59B6',
    facts: [
      "DRUMS are one of the oldest instruments in the world — people have been drumming for over 5,000 years!",
      "A drum kit usually has a KICK drum, a SNARE drum, and some shiny CYMBALS.",
      "The BIG drum you kick with your foot is called the bass drum or kick drum — BOOM!",
      "The crispy snap sound you hear in songs? That's usually the SNARE drum!",
      "Cymbals are those big shiny metal plates that go CRASH when you hit them!",
      "Drummers have to use their arms AND legs at the same time — like a one-person band!",
      "Every country has its own kind of drums — djembes from Africa, taiko from Japan, bongos from Cuba!",
      "The hi-hat is two cymbals stacked on top of each other — open them to sizzle, close them to click!",
      "Drumsticks are usually made of wood — hickory, oak, or maple are the most popular!",
      "You don't need a real drum to drum — you can tap a table, a cup, or even your knees!",
    ],
  },
  'Dr. Jellybone': {
    topic: 'theory',
    color: '#4285F4',
    facts: [
      "There are only 7 letter names for musical notes: A, B, C, D, E, F, G. Then they start over!",
      "A SCALE is like a musical staircase — you walk up or down the notes, one at a time.",
      "The word 'MUSIC' comes from the ancient Greek word 'MOUSIKE', which meant the art of the Muses.",
      "DO RE MI FA SOL LA TI DO — this is called solfège, and it's almost 1,000 years old!",
      "A composer named Mozart wrote his first piece of music when he was only 5 years old!",
      "Ludwig van Beethoven kept composing incredible music even after he went completely DEAF!",
      "Musical notes have funny names for their shapes: whole, half, quarter, eighth — just like pizza slices!",
      "A 'STAFF' is the 5 lines where we write music. Notes sit on the lines or between them!",
      "The symbol at the start of music is called a CLEF. The fancy squiggly one is a treble clef!",
      "When musicians say a song is 'in the key of C,' they mean it starts and ends on the note C.",
      "The very first music ever written down was almost 4,000 years ago, in a place called Mesopotamia!",
    ],
  },
  Charlie: {
    topic: 'singing',
    color: '#34A853',
    facts: [
      "Your voice is the very first instrument you were born with!",
      "When you sing, over 100 muscles in your body work together — even ones in your tummy!",
      "Humming is a kind of singing with your mouth closed — try it, it tickles your nose!",
      "Singers warm up their voices like athletes stretch their muscles. Lip trills are a favorite!",
      "A CHOIR is a big group of people singing together in harmony — like a vocal team!",
      "Opera singers can sing SO loudly they don't even need a microphone, even in giant theaters!",
      "Babies can recognize their favorite songs before they're even born, from inside mom's tummy!",
      "Whistling is music made just with your lips and air — no vocal cords needed!",
      "The highest singing voice is called SOPRANO. The lowest is called BASS.",
      "Singing together with friends actually makes your brain release happy chemicals!",
      "Your voice sounds different to YOU than it does to other people — your skull carries the sound inside your head!",
    ],
  },
  Jazzy: {
    topic: 'jazz',
    color: '#FF9500',
    facts: [
      "JAZZ was born in New Orleans, USA, over 100 years ago!",
      "When jazz musicians make up the music as they play, it's called IMPROVISATION — like musical storytelling!",
      "The SAXOPHONE is a very popular jazz instrument — it was invented by a guy named Adolphe Sax.",
      "In jazz, the musicians take turns playing solos — like taking turns telling a story!",
      "Louis Armstrong was a famous jazz trumpeter whose nickname was 'Satchmo'!",
      "SWING is a bouncy rhythm you can feel in jazz music — it makes you want to tap your toes!",
      "Ella Fitzgerald was called the 'First Lady of Song' because she could sing ANY song brilliantly!",
      "A jazz band usually has instruments like piano, drums, bass, saxophone, and trumpet!",
      "SCAT singing is when a singer uses nonsense syllables like 'dooby-doo-wah' instead of words!",
      "Blues music is jazz's cousin — it often sounds sad, but it helps people feel better!",
      "Jazz musicians call cool, surprising notes 'BLUE NOTES' — they're the secret spice of jazz!",
    ],
  },
  'Lou & Stew': {
    topic: 'world',
    color: '#AF52DE',
    facts: [
      "Every country in the world has its own special kinds of music!",
      "In Scotland, people play BAGPIPES — they make a really loud buzzing sound!",
      "In Australia, the DIDGERIDOO is a long wooden tube that makes a deep vibrating hum.",
      "In India, the SITAR has many strings and sounds like a magical dream!",
      "Music with no words can tell a whole story just using the instruments!",
      "In Brazil, SAMBA music is so happy and fast it practically makes you dance!",
      "The PAN FLUTE from South America is made of hollow reeds tied together!",
      "In China, the ERHU has just TWO strings but can sound like a person singing!",
      "In Ireland, fiddle tunes can make you want to jump up and dance a jig!",
      "Music travels across the whole world — a song from one country can inspire musicians far away!",
      "Some instruments are SO big one person can barely carry them — like the double bass or the tuba!",
    ],
  },
};

// Get a random fact for a character, remembering which was shown most recently.
const lastFactIndex = {};
export function getRandomFact(characterName) {
  const entry = CHARACTER_FACTS[characterName];
  if (!entry || !entry.facts || entry.facts.length === 0) return null;
  let idx;
  const prev = lastFactIndex[characterName];
  if (entry.facts.length === 1) {
    idx = 0;
  } else {
    do { idx = Math.floor(Math.random() * entry.facts.length); } while (idx === prev);
  }
  lastFactIndex[characterName] = idx;
  return { text: entry.facts[idx], color: entry.color, topic: entry.topic };
}
