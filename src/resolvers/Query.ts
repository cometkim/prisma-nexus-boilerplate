import { idArg } from 'nexus';
import { prismaObjectType } from 'nexus-prisma';

import { getUserId } from 'utils';
import { User } from './User';

export const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.field('me', {
      type: User,
      resolve(parent, args, ctx) {
        const userId = getUserId(ctx);
        return ctx.prisma.user({ id: userId });
      },
    });

    t.field('user', {
      type: User,
      args: {
        id: idArg({ required: true }),
      },
      resolve(parent, { id }, ctx) {
        return ctx.prisma.user({ id });
      },
    });

    t.list.field('users', {
      type: User,
      resolve(parent, args, ctx) {
        const userId = getUserId(ctx);
        return ctx.prisma.users({
          where: {
            NOT: { id: userId },
          }
        });
      },
    });

    t.prismaFields([
      'post',
      'posts',
    ]);
  },
});
