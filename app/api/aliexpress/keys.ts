// Rotate between multiple RapidAPI keys to double the quota
const keys: string[] = [];
let currentIndex = 0;

function getKeys() {
  if (keys.length === 0) {
    if (process.env.RAPIDAPI_KEY) keys.push(process.env.RAPIDAPI_KEY);
    if (process.env.RAPIDAPI_KEY_2) keys.push(process.env.RAPIDAPI_KEY_2);
  }
  return keys;
}

export function getNextApiKey(): string | null {
  const allKeys = getKeys();
  if (allKeys.length === 0) return null;
  const key = allKeys[currentIndex % allKeys.length];
  currentIndex++;
  return key;
}

export function getAllApiKeys(): string[] {
  return getKeys();
}
