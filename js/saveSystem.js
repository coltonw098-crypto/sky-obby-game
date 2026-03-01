const SAVE_KEY = 'sky_tower_escape_save_v1';

const defaultSave = {
  highestStage: 1,
  totalDeaths: 0,
  bestTime: null,
  selectedAvatar: 'boy',
  lastCheckpoint: 1,
};

export function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    return { ...defaultSave, ...parsed };
  } catch {
    return { ...defaultSave };
  }
}

export function saveProgress(patch) {
  const current = loadSave();
  const next = { ...current, ...patch };
  localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  return next;
}

export function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  return { ...defaultSave };
}
