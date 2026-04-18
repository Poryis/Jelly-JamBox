// Song library for rhythm game - fun, engaging, NOT kiddy nursery rhymes
// Each song has notes, a display name, and a category
// Speed is controlled by difficulty setting, not note count

export const SONG_LIBRARY = [
  // Classic & Fun
  {
    id: 'ode_to_joy',
    name: 'Ode to Joy',
    category: 'Classic',
    notes: ['E','E','F','G','G','F','E','D','C','C','D','E','E','D','D',
            'E','E','F','G','G','F','E','D','C','C','D','E','D','C','C']
  },
  {
    id: 'when_saints',
    name: 'When the Saints',
    category: 'Classic',
    notes: ['C','E','F','G','C','E','F','G','C','E','F','G','E','C','E','D',
            'E','E','D','C','C','E','G','G','F','E','F','G','E','C','D','C']
  },
  {
    id: 'amazing_grace',
    name: 'Amazing Grace',
    category: 'Classic',
    notes: ['C','E','G','E','G','E','C','A','G','E','D','C',
            'C','E','G','E','G','E','C','E','D','C',
            'E','G','E','D','C','E','D','C']
  },
  // Video Game Vibes
  {
    id: 'mario_theme',
    name: 'Super Jump Theme',
    category: 'Game',
    notes: ['E','E','E','C','E','G','G','C','G','E','A','B','A',
            'G','E','G','A','F','G','E','C','D','B']
  },
  {
    id: 'tetris_theme',
    name: 'Block Drop',
    category: 'Game',
    notes: ['E','B','C','D','C','B','A','A','C','E','D','C','B',
            'C','D','E','C','A','A','D','F','A','G','F','E','C','E','D','C','B']
  },
  {
    id: 'zelda_lullaby',
    name: 'Hero\'s Lullaby',
    category: 'Game',
    notes: ['B','D','A','B','D','A','B','D','A','G','A','B','D','A','G','E','D']
  },
  // Original Grooves
  {
    id: 'jelly_groove',
    name: 'Jelly Groove',
    category: 'Original',
    notes: ['C','E','G','E','C','D','F','A','F','D','E','G','B','G','E',
            'G','E','C','F','D','B','D','F','A','G','E','C']
  },
  {
    id: 'ocean_wave',
    name: 'Ocean Wave',
    category: 'Original',
    notes: ['C','D','E','F','G','A','G','F','E','D','C','D','E','F','G',
            'High C','G','F','E','D','C','E','G','E','C']
  },
  {
    id: 'bell_bounce',
    name: 'Bell Bounce',
    category: 'Original',
    notes: ['C','G','E','G','C','A','F','A','C','B','G','B','C',
            'G','E','C','F','A','F','D','G','B','G','E','High C']
  },
  {
    id: 'funky_fish',
    name: 'Funky Fish',
    category: 'Original',
    notes: ['G','G','A','G','F','E','G','G','A','G','F','E','C','D','E','F',
            'G','A','G','F','E','D','C','D','E','D','C']
  }
];

// Speed settings (ms per note) - lower = faster
export const SPEED_SETTINGS = {
  chill: { label: 'Chill', ms: 900, fallSpeed: 3500, color: '#4CD964' },
  normal: { label: 'Normal', ms: 600, fallSpeed: 2500, color: '#FFCC00' },
  turbo: { label: 'Turbo', ms: 350, fallSpeed: 1500, color: '#FF3B30' }
};

// Group songs by category
export function getSongsByCategory() {
  const categories = {};
  SONG_LIBRARY.forEach(song => {
    if (!categories[song.category]) {
      categories[song.category] = [];
    }
    categories[song.category].push(song);
  });
  return categories;
}
