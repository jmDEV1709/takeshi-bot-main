import { getContent } from "./index.js";
import {
  getAntiDeleteStatus,
  isActiveGroupRestriction,
} from "./database.js";

const messageStore = new Map();
const MAX_STORED_MESSAGES = 5000;

function messageKey(message) {
  const key = message?.key;
  return key?.remoteJid && key?.id ? `${key.remoteJid}:${key.id}` : null;
}

export function rememberMessage(message) {
  const key = messageKey(message);
  if (!key || !message?.message) return;

  messageStore.set(key, JSON.parse(JSON.stringify(message)));

  if (messageStore.size > MAX_STORED_MESSAGES) {
    messageStore.delete(messageStore.keys().next().value);
  }
}

export function getRememberedMessage(key) {
  const id = key?.remoteJid && key?.id ? `${key.remoteJid}:${key.id}` : null;
  return id ? messageStore.get(id) : null;
}

export function isAntiDeleteEnabled(groupId) {
  return (
    getAntiDeleteStatus(groupId) ||
    isActiveGroupRestriction(groupId, "anti-delete")
  );
}

export function getMessageText(message) {
  const content = message?.message;
  return (
    content?.conversation ||
    content?.extendedTextMessage?.text ||
    content?.imageMessage?.caption ||
    content?.videoMessage?.caption ||
    content?.documentMessage?.caption ||
    ""
  );
}
