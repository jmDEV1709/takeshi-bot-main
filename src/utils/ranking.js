import { BOT_LID } from "../config.js";
import { getRandomNumber } from "./index.js";

export const RANK_COOLDOWN_MS = 60 * 1000;

const rankCooldowns = new Map();

export function getRankCooldownRemaining(groupId, now = Date.now()) {
  if (!groupId) return 0;

  const cooldownUntil = rankCooldowns.get(groupId) || 0;
  const remaining = cooldownUntil - now;

  if (remaining <= 0) {
    rankCooldowns.delete(groupId);
    return 0;
  }

  return remaining;
}

export function startRankCooldown(groupId, now = Date.now()) {
  if (groupId) {
    rankCooldowns.set(groupId, now + RANK_COOLDOWN_MS);
  }
}

export function clearRankCooldowns() {
  rankCooldowns.clear();
}

export function formatRankCooldown(remainingMs) {
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000));
  return `${seconds}s`;
}

export function getRankingParticipants(participants, count = 4) {
  const unique = new Map();

  for (const participant of participants || []) {
    const id =
      typeof participant === "string"
        ? participant
        : participant?.id || participant?.jid || "";

    if (!id || id === BOT_LID) continue;
    unique.set(id, id);
  }

  return Array.from(unique.values()).slice(0, count);
}

export function shuffleAndPick(items, count = 4, randomInt = getRandomNumber) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = randomInt(0, index);
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(0, count);
}
