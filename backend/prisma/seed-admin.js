import dotenv from "dotenv";
import argon2 from "argon2";
import { prisma } from "../src/lib/prisma.js";

dotenv.config();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const avatarUrl = process.env.ADMIN_AVATAR_URL || null;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set");
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  const existing = await prisma.appUser.findUnique({
    where: { email },
  });

  if (existing) {
    const updated = await prisma.appUser.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: "admin",
        avatarUrl,
        emailVerifiedAt: existing.emailVerifiedAt || new Date(),
      },
    });

    console.log("✅ Updated admin:", updated.email);
  } else {
    const created = await prisma.appUser.create({
      data: {
        email,
        passwordHash,
        avatarUrl,
        role: "admin",
        emailVerifiedAt: new Date(),
      },
    });

    console.log("✅ Created admin:", created.email);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
