import assert from "node:assert";
import { describe, it } from "node:test";
import { generatePenisData } from "../commands/member/funny/penis.js";

describe("Comando penis", () => {
  it("divide o total de usos entre sexo e uso com a mão", () => {
    const randomInt = (min, max) => {
      if (min === 1 && max === 35) return 35;
      if (min === 1 && max === 12) return 12;
      if (min === 0 && max === 69) return 69;
      if (min === 0 && max === 100) return 50;
      if (min === 0 && max === 3) return 3;
      return max;
    };

    const data = generatePenisData(randomInt);

    assert.strictEqual(data.length, 35);
    assert.strictEqual(data.width, 12);
    assert.strictEqual(data.used, 69);
    assert.strictEqual(data.transou + data.transouComAMao, data.used);
  });

  it("mantém os limites definidos para os dados aleatórios", () => {
    const data = generatePenisData();

    assert.ok(data.length >= 1 && data.length <= 35);
    assert.ok(data.width >= 1 && data.width <= 12);
    assert.ok(data.used >= 0 && data.used <= 69);
    assert.ok(data.transou >= 0 && data.transou <= data.used);
    assert.ok(data.transouComAMao >= 0);
  });
});
