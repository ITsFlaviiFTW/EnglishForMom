export type CourseLevelPreview = {
  id: string;
  level: string;
  title: string;
  description: string;
  topics: readonly string[];
  available: boolean;
};

export const courseOutline: readonly CourseLevelPreview[] = [
  {
    id: 'my-home',
    level: 'Nivelul 1',
    title: 'Casa mea',
    description: 'Cuvinte și expresii utile pentru fiecare cameră din casă.',
    topics: ['Bucătărie', 'Baie', 'Dormitor', 'Sufragerie', 'Rufe', 'Curățenie'],
    available: true,
  },
  {
    id: 'everyday-actions',
    level: 'Nivelul 2',
    title: 'Acțiuni de zi cu zi',
    description: 'Verbe frecvente și propoziții practice.',
    topics: ['Verbe esențiale I'],
    available: true,
  },
  {
    id: 'sentence-patterns',
    level: 'Nivelul 3',
    title: 'Propoziții de bază',
    description: 'Modele simple pentru întrebări și conversații.',
    topics: ['Eu sunt…', 'Eu vreau…', 'Poți să…?'],
    available: false,
  },
];
