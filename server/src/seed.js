import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

const DEMO_PASSWORD = "Nexa@123";

const demoUsers = [
  { name: "Aarav Mehta", email: "admin@nexacrm.com",   role: "Administrator",              region: "Global" },
  { name: "Mira Shah",   email: "manager@nexacrm.com", role: "Manager",                    region: "West India" },
  { name: "Rohan Iyer",  email: "sales@nexacrm.com",   role: "Sales Executive",            region: "Mumbai" },
  { name: "Kavya Nair",  email: "support@nexacrm.com", role: "Customer Support Executive", region: "Bengaluru" },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in server/.env — nothing to seed.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  for (const data of demoUsers) {
    const existing = await User.findOne({ email: data.email });

    if (existing) {
      console.log(`• ${data.email} already exists — resetting password to demo default`);
      existing.password = DEMO_PASSWORD; // virtual setter re-hashes
      existing.status = "Active";
      await existing.save();
      continue;
    }

    const user = new User({
      name: data.name,
      email: data.email,
      role: data.role,
      region: data.region,
      status: "Active",
      
    });
    user.password = DEMO_PASSWORD; // virtual setter -> passwordHash
    await user.save();
    console.log(`✓ Created ${data.email} (${data.role})`);
  }

  console.log("\n🎉 Done. You can now log in with any of:");
  demoUsers.forEach((u) => console.log(`   ${u.email} / ${DEMO_PASSWORD}`));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
