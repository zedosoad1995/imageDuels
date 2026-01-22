import { Prisma } from '@prisma/client';
import { prisma } from '../common/helpers/prisma';

const run = async () => {
  await prisma.$executeRaw(Prisma.sql`
    UPDATE collections c
    SET
      num_images = s."numImages",
      num_votes  = s."numVotes"
    FROM (
      SELECT
        c.id,
        COUNT(i.id)::int AS "numImages",
        COALESCE(SUM(i.num_votes), 0)::int AS "numVotes"
      FROM collections c
      LEFT JOIN images i ON i.collection_id = c.id
      GROUP BY c.id
    ) s
    WHERE c.id = s.id;
  `);
};

run();
