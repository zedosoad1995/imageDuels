import { PrismaClient as SqliteClient } from '@prisma/client-sqlite';
import { PrismaClient as PgClient } from '@prisma/client';

const sqlite = new SqliteClient();
const pg = new PgClient();

async function migrateUsers() {
  const users = await sqlite.user.findMany();
  await pg.user.createMany({
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      googleId: u.googleId,
      role: u.role,
      canSeeNSFW: u.canSeeNSFW,
      isProfileCompleted: u.isProfileCompleted,
      createdAt: u.createdAt,
    })),
    skipDuplicates: true,
  });
  console.log(`Migrated ${users.length} users`);
}

async function migrateCollections() {
  const collections = await sqlite.collection.findMany();
  await pg.collection.createMany({
    data: collections.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      question: c.question,
      mode: c.mode,
      isNSFW: c.isNSFW,
      isLive: c.isLive,
      ownerId: c.ownerId,
      createdAt: c.createdAt,
    })),
    skipDuplicates: true,
  });
  console.log(`Migrated ${collections.length} collections`);
}

async function migrateImages() {
  const images = await sqlite.image.findMany();
  await pg.image.createMany({
    data: images.map((img) => ({
      id: img.id,
      filepath: img.filepath,
      rating: img.rating,
      ratingDeviation: img.ratingDeviation,
      volatility: img.volatility,
      numVotes: img.numVotes,
      height: img.height,
      width: img.width,
      version: img.version,
      collectionId: img.collectionId,
      createdAt: img.createdAt,
    })),
    skipDuplicates: true,
  });
  console.log(`Migrated ${images.length} images`);
}

async function migrateDuels() {
  const duels = await sqlite.duel.findMany();
  await pg.duel.createMany({
    data: duels.map((d) => ({
      id: d.id,
      image1Id: d.image1Id,
      image2Id: d.image2Id,
      voterId: d.voterId,
      outcome: d.outcome,
      createdAt: d.createdAt,
    })),
    skipDuplicates: true,
  });
  console.log(`Migrated ${duels.length} duels`);
}

async function main() {
  // Order matters for foreign keys:
  await migrateUsers();
  await migrateCollections();
  await migrateImages();
  await migrateDuels();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await pg.$disconnect();
  });
