/**
 * One-time migration: rewrites existing Activity documents that were created
 * before the "label includes actor name" fix, so old rows also read like
 * "Lead updated by Thakkar Yatin" instead of just "Lead updated".
 *
 * Safe to run multiple times — it skips rows whose label already contains
 * " by " followed by the stored actor name.
 *
 * Run from the server/ folder:
 *   node src/scripts/backfillActivityLabels.js
 */
import mongoose from "mongoose";
import { env } from "../config/env.js";
import Activity from "../models/Activity.js";

async function run() {
  if (!env.mongoUri) {
    console.error("MONGODB_URI is not set — nothing to migrate.");
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);
  console.log("Connected. Scanning activities...");

  const activities = await Activity.find({});
  let updated = 0;

  for (const activity of activities) {
    const actor = activity.actor || "Unknown";
    const alreadyFixed = activity.label.includes(` by ${actor}`);
    if (alreadyFixed) continue;

    // Old labels look like "Lead updated", "Customer created", "Task deleted".
    const match = activity.label.match(/^(.*) (created|updated|deleted)$/i);
    if (!match) continue; // Unrecognized shape — leave it alone rather than guess.

    const [, resourceName, action] = match;
    const actionLabel =
      action.toLowerCase() === "updated"
        ? "updated by"
        : action.toLowerCase() === "created"
          ? "created by"
          : "deleted by";

    activity.label = `${resourceName} ${actionLabel} ${actor}`;
    await activity.save();
    updated += 1;
  }

  console.log(`Done. Updated ${updated} of ${activities.length} activity records.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
