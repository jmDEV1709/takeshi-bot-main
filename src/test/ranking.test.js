import assert from "node:assert";
import { describe, it } from "node:test";
import {
  clearRankCooldowns,
  formatRankCooldown,
  getRankCooldownRemaining,
  getRankingParticipants,
  RANK_COOLDOWN_MS,
  shuffleAndPick,
  startRankCooldown,
} from "../utils/ranking.js";

describe("Ranking commands", () => {
  it("uses a 60-second cooldown shared by the group", () => {
    clearRankCooldowns();
    const groupId = "123@g.us";
    const now = 100000;

    startRankCooldown(groupId, now);

    assert.strictEqual(
      getRankCooldownRemaining(groupId, now + RANK_COOLDOWN_MS - 1000),
      1000,
    );
    assert.strictEqual(
      getRankCooldownRemaining(groupId, now + RANK_COOLDOWN_MS),
      0,
    );
  });

  it("formats remaining cooldown in seconds", () => {
    assert.strictEqual(formatRankCooldown(1000), "1s");
    assert.strictEqual(formatRankCooldown(61000), "61s");
  });

  it("removes duplicate and invalid participants", () => {
    const participants = getRankingParticipants([
      { id: "5511999999999@s.whatsapp.net" },
      { id: "5511888888888@s.whatsapp.net" },
      { id: "5511999999999@s.whatsapp.net" },
      {},
    ]);

    assert.strictEqual(participants.length, 2);
  });

  it("picks exactly four unique participants", () => {
    const participants = [
      "1@s.whatsapp.net",
      "2@s.whatsapp.net",
      "3@s.whatsapp.net",
      "4@s.whatsapp.net",
      "5@s.whatsapp.net",
    ];

    const picked = shuffleAndPick(participants, 4, (_min, _max) => 0);
    assert.strictEqual(picked.length, 4);
    assert.strictEqual(new Set(picked).size, 4);
  });
});
