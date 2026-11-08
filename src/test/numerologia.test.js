import assert from "node:assert";
import { describe, it } from "node:test";
import {
  calculateNameNumbers,
  calculateNumerology,
  parseBirthDate,
  reduceNumber,
} from "../commands/member/numerologia.js";

describe("Numerologia", () => {
  it("preserva números mestres ao reduzir", () => {
    assert.strictEqual(reduceNumber(29), 11);
    assert.strictEqual(reduceNumber(22), 22);
    assert.strictEqual(reduceNumber(38), 11);
  });

  it("valida datas reais e rejeita datas inválidas", () => {
    assert.deepStrictEqual(parseBirthDate("15-08-1990"), {
      day: 15,
      month: 8,
      year: 1990,
    });
    assert.strictEqual(parseBirthDate("31/02/1990"), null);
  });

  it("normaliza acentos ao calcular os números do nome", () => {
    assert.deepStrictEqual(calculateNameNumbers("Mariá"), {
      expression: 6,
      soulUrge: 11,
      personality: 4,
      normalizedName: "MARIA",
    });
  });

  it("calcula o caminho de vida e o ano pessoal", () => {
    const numbers = calculateNumerology(
      "Maria",
      parseBirthDate("15-08-1990"),
      2026,
    );

    assert.strictEqual(numbers.lifePath, 6);
    assert.strictEqual(numbers.personalYear, 6);
  });
});
