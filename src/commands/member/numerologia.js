import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

const LETTER_VALUES = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const MASTER_NUMBERS = new Set([11, 22, 33]);

function sumDigits(value) {
  return String(value)
    .split("")
    .reduce((sum, digit) => sum + Number(digit), 0);
}

export function reduceNumber(value) {
  let result = value;

  while (result > 9 && !MASTER_NUMBERS.has(result)) {
    result = sumDigits(result);
  }

  return result;
}

function reduceToSingleDigit(value) {
  let result = value;

  while (result > 9) {
    result = sumDigits(result);
  }

  return result;
}

function normalizeName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function sumNameLetters(name, predicate = () => true) {
  return [...normalizeName(name)]
    .filter((letter) => LETTER_VALUES[letter] && predicate(letter))
    .reduce((sum, letter) => sum + LETTER_VALUES[letter], 0);
}

export function calculateNameNumbers(name) {
  const normalizedName = normalizeName(name);
  const expression = sumNameLetters(name);
  const soulUrge = sumNameLetters(name, (letter) => "AEIOU".includes(letter));
  const personality = sumNameLetters(
    name,
    (letter) => !"AEIOU".includes(letter),
  );

  return {
    expression: reduceNumber(expression),
    soulUrge: reduceNumber(soulUrge),
    personality: reduceNumber(personality),
    normalizedName,
  };
}

export function parseBirthDate(value) {
  const match = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(Date.UTC(year, month - 1, day));
  const now = new Date();

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    year < 1 ||
    date > now
  ) {
    return null;
  }

  return { day, month, year };
}

function getBirthDateFromArgs(fullArgs) {
  const dateMatch = fullArgs.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/);

  if (!dateMatch) {
    return null;
  }

  const date = parseBirthDate(dateMatch[0]);
  const name = fullArgs
    .replace(dateMatch[0], "")
    .replace(/\s*[|/\\]\s*/g, " ")
    .trim();

  return { date, name };
}

function describeNumber(number) {
  return {
    1: "iniciativa e liderança",
    2: "cooperação e sensibilidade",
    3: "criatividade e comunicação",
    4: "organização e estabilidade",
    5: "liberdade e mudanças",
    6: "cuidado e responsabilidade",
    7: "introspecção e conhecimento",
    8: "ambição e realização",
    9: "empatia e propósito",
    11: "intuição e inspiração",
    22: "visão prática e grandes construções",
    33: "compaixão e serviço",
  }[number];
}

export function calculateNumerology(name, birthDate, currentYear = new Date().getFullYear()) {
  const nameNumbers = calculateNameNumbers(name);
  const lifePath = reduceToSingleDigit(
    sumDigits(birthDate.day) +
      sumDigits(birthDate.month) +
      sumDigits(birthDate.year),
  );
  const birthday = reduceNumber(birthDate.day);
  const maturity = reduceNumber(lifePath + nameNumbers.expression);
  const personalYear = reduceNumber(
    sumDigits(birthDate.day) +
      sumDigits(birthDate.month) +
      sumDigits(currentYear),
  );

  return {
    ...nameNumbers,
    lifePath,
    birthday,
    maturity,
    personalYear,
  };
}

export default {
  name: "numerologia",
  description: "Gera um mapa numerológico a partir do nome e da data de nascimento",
  commands: ["numerologia", "mapa-numerologico", "mapa"],
  usage: `${PREFIX}numerologia Nome Completo / DD-MM-AAAA`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ fullArgs, sendReply }) => {
    const data = getBirthDateFromArgs(fullArgs);

    if (!data?.name || !data.date) {
      throw new InvalidParameterError(
        `Informe seu nome e sua data de nascimento.\nExemplo: ${PREFIX}numerologia Maria da Silva / 15-08-1990`,
      );
    }

    if (!/^[\p{L}][\p{L}' -]{1,79}$/u.test(data.name)) {
      throw new InvalidParameterError(
        "O nome deve conter apenas letras, espaços, hífen ou apóstrofo.",
      );
    }

    const numbers = calculateNumerology(data.name, data.date);

    await sendReply(`🔮 *Mapa numerológico de ${data.name}*

🎂 *Caminho de vida:* ${numbers.lifePath} — ${describeNumber(numbers.lifePath)}
🌟 *Expressão:* ${numbers.expression} — ${describeNumber(numbers.expression)}
💖 *Alma:* ${numbers.soulUrge} — ${describeNumber(numbers.soulUrge)}
🪞 *Personalidade:* ${numbers.personality} — ${describeNumber(numbers.personality)}
🎁 *Dia de nascimento:* ${numbers.birthday} — ${describeNumber(numbers.birthday)}
🚀 *Maturidade:* ${numbers.maturity} — ${describeNumber(numbers.maturity)}
📅 *Ano pessoal:* ${numbers.personalYear} — ${describeNumber(numbers.personalYear)}

_Leitura simbólica e recreativa; não substitui orientação profissional._`);
  },
};
