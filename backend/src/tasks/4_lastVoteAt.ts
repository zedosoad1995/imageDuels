import { Prisma } from '@prisma/client';
import { prisma } from '../common/helpers/prisma';

const run = async () => {
  await prisma.$executeRaw(Prisma.sql`
    UPDATE images
    SET last_vote_at = NOW()
    WHERE num_votes > 0;
  `);
};

run();
