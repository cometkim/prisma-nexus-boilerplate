import { prismaObjectType, makePrismaSchema } from 'nexus-prisma';

const Query = prismaObjectType({
  name: 'Query',
  // Expose all generated `Todo`-queries
  definition(t) {

  },
});

export default Query;
