import { stringArg, idArg, objectType, inputObjectType, arg } from 'nexus';
import { prismaObjectType } from 'nexus-prisma';
import { hash, compare } from 'bcrypt';

import { signToken } from '~/src/utils';
import { User, Post } from '~/src/resolvers';

const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token');
    t.field('user', { type: User });
  },
});

export const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.field('signup', {
      type: AuthPayload,
      args: {
        email: stringArg({ required: true }),
        username: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      async resolve(parent, { email, username, password }, ctx) {
        const passwordDigest = await hash(password, 10);
        const user = await ctx.prisma.createUser({
          username,
          email,
          password: passwordDigest,
        });
        return {
          token: signToken(user.id),
          user,
        };
      },
    });

    t.field('login', {
      type: AuthPayload,
      args: {
        loginId: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      async resolve(parent, { loginId, password }, ctx) {
        const [user] = await ctx.prisma.users({ where: {
          OR: {
            id: loginId,
            email: loginId,
          },
        }});
        if (!user) {
          throw new Error('No user found for username or email');
        }
        if (!compare(password, user.password)) {
          throw new Error('Incorrect password');
        }
        return {
          token: signToken(user.id),
          user,
        };
      },
    });
  },
});
