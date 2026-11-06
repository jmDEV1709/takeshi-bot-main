import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TEMP_DIR } from "../config.js";
import { getRandomName } from "../utils/index.js";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const DOWNLOAD_TIMEOUT = 120000;
const execFileAsync = promisify(execFile);

function validateUrl(rawUrl, platform) {
  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error("INVALID_URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("INVALID_URL");
  }

  const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
  const allowed =
    platform === "instagram"
      ? host === "instagram.com" || host.endsWith(".instagram.com")
      : platform === "tiktok"
        ? host === "tiktok.com" || host.endsWith(".tiktok.com")
        : ["x.com", "twitter.com", "mobile.twitter.com"].includes(host);

  if (!allowed) {
    throw new Error("WRONG_PLATFORM");
  }

  return parsedUrl.toString();
}

async function findCookiesFile() {
  const candidates = [
    process.env.YTDLP_COOKIES_FILE,
    path.resolve(TEMP_DIR, "..", "..", "cookies", "cookies.txt"),
    path.resolve(TEMP_DIR, "..", "..", "cookies.txt"),
    "/app/cookies/cookies.txt",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const stats = await fs.promises.stat(candidate);
      if (stats.isFile() && stats.size > 0) return candidate;
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
    }
  }

  return null;
}

export async function downloadSocialVideo(url, platform) {
  const validUrl = validateUrl(url, platform);
  await fs.promises.mkdir(TEMP_DIR, { recursive: true });

  const outputBase = path.resolve(TEMP_DIR, getRandomName());
  const args = [
    "--no-playlist",
    "--no-warnings",
    "--no-progress",
    "--max-filesize",
    `${MAX_VIDEO_SIZE}`,
    "-f",
    "best[ext=mp4]/best",
    "-o",
    `${outputBase}.%(ext)s`,
    validUrl,
  ];

  const cookiesFile = await findCookiesFile();
  if (cookiesFile) args.unshift("--cookies", cookiesFile);

  try {
    await execFileAsync(
      process.env.YTDLP_PATH || "yt-dlp",
      args,
      { timeout: DOWNLOAD_TIMEOUT, maxBuffer: 1024 * 1024 },
    );

    const files = (await fs.promises.readdir(TEMP_DIR))
      .filter((file) => file.startsWith(path.basename(outputBase) + "."));

    if (!files.length) throw new Error("VIDEO_NOT_FOUND");

    const outputPath = path.join(TEMP_DIR, files[0]);
    const stats = await fs.promises.stat(outputPath);
    if (stats.size > MAX_VIDEO_SIZE) throw new Error("FILE_TOO_LARGE");

    return await fs.promises.readFile(outputPath);
  } catch (error) {
    const details = `${error.message || ""}\n${error.stderr || ""}`;
    if (/max-filesize|file is larger|exceeds the maximum/i.test(details)) {
      throw new Error("FILE_TOO_LARGE");
    }
    if (/no video|requested format|unable to download|not found/i.test(details)) {
      throw new Error("VIDEO_NOT_FOUND");
    }
    if (error.code === "ETIMEDOUT" || error.killed) {
      throw new Error("DOWNLOAD_TIMEOUT");
    }
    throw error;
  } finally {
    const files = await fs.promises.readdir(TEMP_DIR).catch(() => []);
    await Promise.all(
      files
        .filter((file) => file.startsWith(path.basename(outputBase) + "."))
        .map((file) => fs.promises.unlink(path.join(TEMP_DIR, file)).catch(() => {})),
    );
  }
}

export function socialDownloadError(error, platformName) {
  if (error.message === "INVALID_URL") return "O link enviado não é válido.";
  if (error.message === "WRONG_PLATFORM") return `Esse link não pertence ao ${platformName}.`;
  if (error.message === "VIDEO_NOT_FOUND") return `Não encontrei vídeo disponível no ${platformName}.`;
  if (error.message === "FILE_TOO_LARGE") return "O vídeo ultrapassa o limite de 50 MB.";
  if (error.message === "DOWNLOAD_TIMEOUT") return "O download demorou demais e foi cancelado.";
  if (error.code === "ECONNABORTED") return "O download demorou demais e foi cancelado.";
  return `Não consegui baixar o vídeo do ${platformName}. Tente novamente.`;
}

export { MAX_VIDEO_SIZE };
