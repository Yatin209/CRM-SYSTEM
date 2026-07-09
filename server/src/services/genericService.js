import mongoose from "mongoose";
import { isMongoReady } from "../config/db.js";
import { createMemory, getMemory, listMemory, removeMemory, updateMemory } from "../data/memoryStore.js";

const allowedFilters = ["status", "category", "priority", "industry", "type", "owner", "assignee", "read", "user"];

function normalize(record) {
  if (!record) return null;
  const value = typeof record.toObject === "function" ? record.toObject() : { ...record };
  delete value.password;
  delete value.passwordHash;
  return {
    ...value,
    id: value.id || value._id?.toString()
  };
}

function auditPatch(actorId, create = false) {
  if (!actorId || !mongoose.Types.ObjectId.isValid(actorId)) return {};
  return create ? { createdBy: actorId, updatedBy: actorId } : { updatedBy: actorId };
}

function buildFilters(params) {
  return allowedFilters.reduce((filters, key) => {
    if (params[key] !== undefined && params[key] !== "" && params[key] !== "All") {
      filters[key] = params[key];
    }
    return filters;
  }, {});
}

function buildMongoQuery(params, searchable) {
  const query = buildFilters(params);
  if (params.search && searchable.length) {
    query.$or = searchable.map((field) => ({ [field]: { $regex: params.search, $options: "i" } }));
  }
  return query;
}

export function createGenericService({ collectionName, Model, searchable = [] }) {
  return {
    async list(params = {}) {
      const page = Math.max(Number(params.page || 1), 1);
      const limit = Math.min(Math.max(Number(params.limit || 20), 1), 100);
      const sort = params.sort || "-createdAt";

      if (isMongoReady()) {
        const query = buildMongoQuery(params, searchable);
        const [records, total] = await Promise.all([
          Model.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit),
          Model.countDocuments(query)
        ]);
        return {
          records: records.map(normalize),
          meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) }
        };
      }

      const memoryResult = listMemory(collectionName, {
        page,
        limit,
        search: params.search || params.q || "",
        searchable,
        sort,
        filters: buildFilters(params)
      });
      return {
        ...memoryResult,
        records: memoryResult.records.map(normalize)
      };
    },

    async getById(id) {
      if (isMongoReady()) {
        return normalize(await Model.findById(id));
      }
      return normalize(getMemory(collectionName, id));
    },

    async create(payload, actorId) {
      if (isMongoReady()) {
        return normalize(await Model.create({ ...payload, ...auditPatch(actorId, true) }));
      }
      return normalize(createMemory(collectionName, payload, actorId));
    },

    async update(id, payload, actorId) {
      if (isMongoReady()) {
        return normalize(await Model.findByIdAndUpdate(id, { ...payload, ...auditPatch(actorId) }, { new: true, runValidators: true }));
      }
      return normalize(updateMemory(collectionName, id, payload, actorId));
    },

    async remove(id) {
      if (isMongoReady()) {
        return normalize(await Model.findByIdAndDelete(id));
      }
      return normalize(removeMemory(collectionName, id));
    }
  };
}
