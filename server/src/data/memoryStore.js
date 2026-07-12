import crypto from "node:crypto";
import { seed } from "./seed.js";

const state = {
  ...seed,
};

function getCollection(name) {
  if (!state[name]) {
    state[name] = [];
  }
  return state[name];
}

function matchesSearch(record, search, searchable = []) {
  if (!search) return true;
  const needle = search.toLowerCase();
  return searchable.some((field) =>
    String(record[field] || "")
      .toLowerCase()
      .includes(needle),
  );
}

function matchesFilters(record, filters = {}) {
  return Object.entries(filters).every(([key, value]) => {
    if (!value || value === "All") return true;
    if (Array.isArray(value?.$in)) {
      return value.$in.map(String).includes(String(record[key]));
    }
    return String(record[key]) === String(value);
  });
}

export function listMemory(collectionName, options = {}) {
  const {
    page = 1,
    limit = 20,
    search = "",
    searchable = [],
    sort = "-createdAt",
    filters = {},
  } = options;
  const collection = getCollection(collectionName);
  const filtered = collection.filter(
    (record) =>
      matchesSearch(record, search, searchable) &&
      matchesFilters(record, filters),
  );
  const direction = sort.startsWith("-") ? -1 : 1;
  const sortKey = sort.replace("-", "");
  const sorted = [...filtered].sort((a, b) => {
    if (a[sortKey] > b[sortKey]) return direction;
    if (a[sortKey] < b[sortKey]) return -direction;
    return 0;
  });
  const numericPage = Number(page);
  const numericLimit = Number(limit);
  const start = (numericPage - 1) * numericLimit;
  return {
    records: sorted.slice(start, start + numericLimit),
    meta: {
      page: numericPage,
      limit: numericLimit,
      total: filtered.length,
      pages: Math.max(1, Math.ceil(filtered.length / numericLimit)),
    },
  };
}

export function getMemory(collectionName, id) {
  return (
    getCollection(collectionName).find(
      (record) => record.id === id || record._id === id,
    ) || null
  );
}

export function createMemory(collectionName, payload, actorId) {
  const now = new Date().toISOString();
  const record = {
    id: `${collectionName.slice(0, -1)}_${crypto.randomUUID().slice(0, 8)}`,
    ...payload,
    createdBy: actorId,
    updatedBy: actorId,
    createdAt: now,
    updatedAt: now,
  };
  getCollection(collectionName).unshift(record);
  return record;
}

export function updateMemory(collectionName, id, payload, actorId) {
  const collection = getCollection(collectionName);
  const index = collection.findIndex(
    (record) => record.id === id || record._id === id,
  );
  if (index === -1) return null;
  collection[index] = {
    ...collection[index],
    ...payload,
    updatedBy: actorId,
    updatedAt: new Date().toISOString(),
  };
  return collection[index];
}

export function removeMemory(collectionName, id) {
  const collection = getCollection(collectionName);
  const index = collection.findIndex(
    (record) => record.id === id || record._id === id,
  );
  if (index === -1) return null;
  const [record] = collection.splice(index, 1);
  return record;
}

export function findOneMemory(collectionName, predicate) {
  return getCollection(collectionName).find(predicate) || null;
}

export function findUserByEmail(email) {
  return (
    getCollection("users").find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    ) || null
  );
}

export function memoryState() {
  return state;
}
