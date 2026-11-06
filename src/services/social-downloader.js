import axios from "axios";
import { tiktokdl } from "@bochilteam/scraper-tiktok";
import { instagramdl } from "@bochilteam/scraper-instagram";
import { twitter } from "@bochilteam/scraper-twitter";

const MAX_VIDEO_SIZE = 64 * 1024 * 1024;
const DOWNLOAD_TIMEOUT = 120000;

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

async function resolveDownloadUrl(url, platform) {
  if (platform === "instagram") {
    const results = await instagramdl(url);
    const video = results.find((item) => item.type === "video");
    if (!video?.url) throw new Error("VIDEO_NOT_FOUND");
    return video.url;
  }

  if (platform === "tiktok") {
    const data = await tiktokdl(url);
    const videoUrl = data?.video?.noWatermark || data?.video?.withWatermark;
    if (!videoUrl) throw new Error("VIDEO_NOT_FOUND");
    return videoUrl;
  }

  const variants = await twitter(url);
  const mp4Variants = variants
    .filter((variant) => String(variant?.content_type || "").includes("video/mp4"))
    .sort((a, b) => Number(b.bitrate || 0) - Number(a.bitrate || 0));
  const candidates = mp4Variants.length ? mp4Variants : variants;
  if (!candidates[0]?.url) throw new Error("VIDEO_NOT_FOUND");
  return candidates[0].url;
}

export async function downloadSocialVideo(url, platform) {
  const validUrl = validateUrl(url, platform);
  const downloadUrl = await resolveDownloadUrl(validUrl, platform);
  const response = await axios({
    method: "get",
    url: downloadUrl,
    responseType: "stream",
    timeout: DOWNLOAD_TIMEOUT,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 300,
  });
  const contentLength = Number(response.headers["content-length"] || 0);

  if (contentLength && contentLength > MAX_VIDEO_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const chunks = [];
  let downloadedBytes = 0;
  for await (const chunk of response.data) {
    downloadedBytes += chunk.length;
    if (downloadedBytes > MAX_VIDEO_SIZE) {
      throw new Error("FILE_TOO_LARGE");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function socialDownloadError(error, platformName) {
  if (error.message === "INVALID_URL") return "O link enviado não é válido.";
  if (error.message === "WRONG_PLATFORM") return `Esse link não pertence ao ${platformName}.`;
  if (error.message === "VIDEO_NOT_FOUND") return `Não encontrei vídeo disponível no ${platformName}.`;
  if (error.message === "FILE_TOO_LARGE") return "O vídeo ultrapassa o limite de 64 MB.";
  if (error.code === "ECONNABORTED") return "O download demorou demais e foi cancelado.";
  return `Não consegui baixar o vídeo do ${platformName}. Tente novamente.`;
}

export { MAX_VIDEO_SIZE };
