import path from 'path';
import { makePrismaSchema } from 'nexus-prisma';

import { prisma } from './generated/prisma-client'
import datamodelInfo from './generated/nexus-prisma';

import * as allTypes from './resolvers'

export default makePrismaSchema({
  types: allTypes,

  prisma: {
    datamodelInfo,
    client: prisma,
  },

  outputs: {
    schema: path.join(__dirname, 'generated', 'schema.graphql'),
    typegen: path.join(__dirname, 'generated', 'nexus.ts'),
  },

  nonNullDefaults: {
    input: true,
    output: true,
  },

  typegenAutoConfig: {
    sources: [
      {
        source: path.join(__dirname, 'types.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
});
