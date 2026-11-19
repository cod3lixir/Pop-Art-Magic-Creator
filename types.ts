
export type PopArtMood = 
  | 'Classic Pop Art' 
  | 'Funny/Caricature' 
  | 'Emotional/Dramatic' 
  | 'Retro Comic' 
  | 'Futuristic Pop' 
  | 'Synthwave Glow' 
  | 'Graffiti Urban' 
  | 'Vintage 50s Ad' 
  | 'Manga Noir'
  | 'Anime Inspired'
  | 'Haldi Special'
  | 'Cartoonish Pop Art';

export interface PopArtConfig {
  mood: PopArtMood;
  coupleName?: string;
  customText?: string;
}

export interface TransformationResult {
  imageUrl: string;
  originalUrl: string;
  timestamp: number;
}
