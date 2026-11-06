import axios from "axios";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tiktokdl } from "@bochilteam/scraper-tiktok";
import { instagramdl } from "@bochilteam/scraper-instagram";
import { twitter } from "@bochilteam/scraper-twitter";
import { TEMP_DIR } from "../config.js";
import { getRandomName } from "../utils/index.js";

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

async function resolveScraperUrl(url, platform) {
  if (platform === "instagram") {
    const results = await instagramdl(url);
    const video = Array.isArray(results)
      ? results.find((item) => item?.type === "video" && item.url)
      : null;
    if (video?.url) return video.url;
  } else if (platform === "tiktok") {
    const data = await tiktokdl(url);
    const videoUrl = data?.video?.noWatermark || data?.video?.withWatermark;
    if (videoUrl) return videoUrl;
  } else {
    const variants = await twitter(url);
    const videos = variants
      .filter((variant) => variant?.url)
      .filter((variant) =>
        String(variant.content_type || "").includes("video/mp4"),
      )
      .sort((a, b) => Number(b.bitrate || 0) - Number(a.bitrate || 0));
    if (videos[0]?.url) return videos[0].url;
  }

  throw new Error("VIDEO_NOT_FOUND");
}

async function findCookiesFile() {
  const candidates = [
    process.env.YTDLP_COOKIES_FILE,
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

async function downloadWithYtDlp(url) {
  const outputBase = path.resolve(TEMP_DIR, getRandomName());
  const args = [
    "--no-playlist",
    "--no-warnings",
    "--no-progress",
    "-f",
    "best[ext=mp4]/best",
    "-o",
    `${outputBase}.%(ext)s`,
    url,
  ];
  const cookiesFile = await findCookiesFile();
  if (cookiesFile) {
    const writableCookieFile = `${outputBase}.cookies.txt`;
    await fs.promises.copyFile(cookiesFile, writableCookieFile);
    args.unshift("--cookies", writableCookieFile);
  }

  try {
    await execFileAsync(process.env.YTDLP_PATH || "yt-dlp", args, {
      timeout: DOWNLOAD_TIMEOUT,
      maxBuffer: 1024 * 1024,
    });

    const files = (await fs.promises.readdir(TEMP_DIR)).filter((file) =>
      file.startsWith(`${path.basename(outputBase)}.`),
    );
    if (!files.length) throw new Error("VIDEO_NOT_FOUND");
    return await fs.promises.readFile(path.join(TEMP_DIR, files[0]));
  } catch (error) {
    const details = `${error.message || ""}\n${error.stderr || ""}`;
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
        .filter((file) => file.startsWith(`${path.basename(outputBase)}.`))
        .map((file) =>
          fs.promises.unlink(path.join(TEMP_DIR, file)).catch(() => {}),
        ),
    );
  }
}

export async function downloadSocialVideo(url, platform) {
  const validUrl = validateUrl(url, platform);
  await fs.promises.mkdir(TEMP_DIR, { recursive: true });

  let downloadUrl;
  try {
    downloadUrl = await resolveScraperUrl(validUrl, platform);
  } catch {
    downloadUrl = null;
  }

  if (!downloadUrl) return downloadWithYtDlp(validUrl);

  const response = await axios({
    method: "get",
    url: downloadUrl,
    responseType: "arraybuffer",
    timeout: DOWNLOAD_TIMEOUT,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  return Buffer.from(response.data);
}

export function socialDownloadError(error, platformName) {
  if (error.message === "INVALID_URL") return "O link enviado não é válido.";
  if (error.message === "WRONG_PLATFORM") return `Esse link não pertence ao ${platformName}.`;
  if (error.message === "VIDEO_NOT_FOUND") return `Não encontrei vídeo disponível no ${platformName}.`;
  if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
    return "O download demorou demais e foi cancelado.";
  }
  return `Não consegui baixar o vídeo do ${platformName}. Tente novamente.`;
}
