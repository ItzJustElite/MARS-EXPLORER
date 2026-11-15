const KEY = 'mars-explorer:progress'

export interface StoredProgress {
  bestScore: number
  bestRank: string
  gamesPlayed: number
  lastLearnersIndex: number
  dailyChallengeDate: string | null
  dailyChallengeScore: number | null
}

const DEFAULT: StoredProgress = {
  bestScore: 0,
  bestRank: '',
  gamesPlayed: 0,
  lastLearnersIndex: 0,
  dailyChallengeDate: null,
  dailyChallengeScore: null,
}

export function loadProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<StoredProgress>
    return { ...DEFAULT, ...parsed }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveProgress(p: StoredProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // ignore quota / privacy errors
  }
}

export function updateBestScore(score: number, rank: string): StoredProgress {
  const p = loadProgress()
  p.gamesPlayed += 1
  if (score > p.bestScore) {
    p.bestScore = score
    p.bestRank = rank
  }
  saveProgress(p)
  return p
}

export function setLearnersIndex(i: number) {
  const p = loadProgress()
  p.lastLearnersIndex = i
  saveProgress(p)
}

export function setDailyChallenge(date: string, score: number) {
  const p = loadProgress()
  p.dailyChallengeDate = date
  p.dailyChallengeScore = score
  saveProgress(p)
}
