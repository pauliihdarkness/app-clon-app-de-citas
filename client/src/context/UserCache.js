import localforage from "localforage";

const memory = new Map();
const STORE_KEY = "userCache_v1";

export async function getUserCached(uid) {
  if (memory.has(uid)) return memory.get(uid);
  const blob = await localforage.getItem(STORE_KEY);
  if (blob && blob[uid]) {
    memory.set(uid, blob[uid]);
    return blob[uid];
  }
  return null;
}

export async function setUserCached(uid, data) {
  memory.set(uid, data);
  const blob = (await localforage.getItem(STORE_KEY)) || {};
  blob[uid] = data;
  await localforage.setItem(STORE_KEY, blob);
}

export function hasUser(uid) { return memory.has(uid); }
