export interface WordItem {
  word: string;
  definition: string;
  tags: Array<string>;
  id: number;
  isMarked: boolean;
}

export interface WordsContextType {
  words: WordItem[];
  setWords: React.Dispatch<React.SetStateAction<WordItem[]>>;
  displayedWords: WordItem[];
  setDisplayedWords: React.Dispatch<React.SetStateAction<WordItem[]>>;
  activeWho: number;
  setActiveWho: React.Dispatch<React.SetStateAction<number>>;
  startTime: number;
  setStartTime: React.Dispatch<React.SetStateAction<number>>;
  endTime: number;
  setEndTime: React.Dispatch<React.SetStateAction<number>>;
  interval: number;
  setInterval: React.Dispatch<React.SetStateAction<number>>;
  isOnline: boolean | null;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean | null>>;
}
