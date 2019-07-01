import { idArg } from 'nexus';
import { prismaObjectType } from 'nexus-prisma';

import { getUserId } from '~/src/utils';
import { User, Post } from '~/src/resolvers';

// @ts-ignore
// FIXME: see https://github.com/prisma/nexus-prisma/issues/291
export const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.field('me', {
      type: User,
      async resolve(parent, args, ctx) {
        const userId = getUserId(ctx);
        const [user] = await ctx.prisma.users({ where: { id: userId }});
        return user;
      },
    });

    t.field('user', {
      type: User,
      args: {
        id: idArg({ required: true }),
      },
      async resolve(parent, { id }, ctx) {
        const [user] = await ctx.prisma.users({ where: { id }});
        return user;
      },
    });

    t.list.field('users', {
      type: User,
      resolve(parent, args, ctx) {
        const userId = getUserId(ctx);
        return ctx.prisma.users({
          where: {
            NOT: { id: userId },
          },
        });
      },
    });

    t.field('post', {
      type: Post,
      args: {
        id: idArg({ required: true }),
      },
      async resolve(parent, { id }, ctx) {
        const [post] = await ctx.prisma.posts({ where: { id }});
        return post;
      },
    });

    t.prismaFields(['posts']);
  },
});
