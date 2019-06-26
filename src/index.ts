require('dotenv').config();

import { Server } from 'net';
import { GraphQLServer } from 'graphql-yoga';

import { prisma } from '~/src/generated/prisma-client';
import schema from '~/src/schema';
import shield from '~/src/middlewares/shield';

const server = new GraphQLServer({
  // @ts-ignore
  schema,
  middlewares: [shield],
  context: req => ({
    ...req,
    prisma,
  }),
});

server
  .start({ port: 4000 })
  .then((server: Server) => {
    console.log(`Server is running on 0.0.0.0:4000`);

    const exit = () => {
      console.log('Exiting server...');
      server.close();
    };
    process.on('SIGINT', exit);
    process.on('SIGTERM', exit);
  });
