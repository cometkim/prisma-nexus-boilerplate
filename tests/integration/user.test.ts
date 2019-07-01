import * as PrismaClient from '~/src/generated/prisma-client'
import shield from '~/src/middlewares/shield';

import {
  createTestEnv,
  deeplyMockInterface,
  DeeplyMocked,
  QueryResult,
} from "~/tests/helpers";
import gql from 'graphql-tag';
import { sign } from 'jsonwebtoken';
import { getAppSecret } from '~/src/utils';

describe('Query', () => {
  // FIXME: Should have automatically inferred return type
  const { prisma: _prisma } = deeplyMockInterface<typeof PrismaClient>('~/src/generated/prisma-client', (orignal, mocked) => ({
    ...orignal,
    prisma: mocked.prisma,
  }));
  const prisma = _prisma as DeeplyMocked<typeof PrismaClient['prisma']>

  it('should returns my user entity on the "me" query', async () => {
    const ME_QUERY = gql`
      query MeQuery {
        me {
          id
          email
          username
        }
      }
    `;
    const me = {
      id: 'MY_ID',
      email: 'MY_EMAIL',
      username: 'ME',
      password: 'MY_PASSWORD',
      createdAt: '0',
      updatedAt: '0'
    };
    prisma.users.mockImplementationOnce((input) => {
      const db = {
        'MY_ID': me,
      } as any;
      return Promise.resolve([db[input!.where!.id!]]);
    });

    const signedJWT = sign({ userId: me.id }, getAppSecret());
    const { client } = createTestEnv({
      headers: {
        authorization: `Bearer ${signedJWT}`,
      },
    });

    const { data } = await client.query({
      query: ME_QUERY,
    }) as QueryResult<'me'>;

    expect(prisma.users).toHaveBeenLastCalledWith({ where: { id: 'MY_ID' } });
    expect(data).toBeTruthy();
    expect(data.me).toEqual({
      id: me.id,
      email: me.email,
      username: me.username,
    });
  });

  it('should returns every users except me on the "users" query', async () => {
    const USERS_QUERY = gql`
      query UsersQuery {
        users {
          id
          email
          username
        }
      }
    `;
    const users = [
      {
        id: 'MY_ID',
        email: 'MY_EMAIL',
        username: 'ME',
        password: 'MY_PASSWORD',
        createdAt: '0',
        updatedAt: '0'
      },
      {
        id: 'OTHER_ID',
        email: 'OTHER_EMAIL',
        username: 'OTHER',
        password: 'OTHER_PASSWORD',
        createdAt: '0',
        updatedAt: '0',
      },
    ];
    const [me, other] = users;

    prisma.users.mockImplementationOnce((input) => {
      const db = [ ...users ];
      const { id } = input!.where!.NOT as PrismaClient.UserWhereInput;
      return Promise.resolve(db.filter(user => user.id !== id));
    });

    const signedJWT = sign({ userId: me.id }, getAppSecret());
    const { client } = createTestEnv({
      headers: {
        authorization: `Bearer ${signedJWT}`,
      },
    });

    const { data } = await client.query({
      query: USERS_QUERY,
    }) as QueryResult<'users'>;

    expect(prisma.users).toHaveBeenLastCalledWith({
      where: { NOT: { id: 'MY_ID' } },
    });

    expect(data).toBeTruthy();
    expect(data.users).toHaveLength(1);
    expect(data.users[0]).toEqual({
      id: other.id,
      email: other.email,
      username: other.username,
    });
  });

  it('should returns error without authorization', async () => {
    const USER_QUERY_SET = gql`
      query UserQuerySet {
        me {
          id
        }
        users {
          id
        }
        user(id: "USER_ID") {
          id
        }
      }
    `
    const { me, other } = {
      me: {
        id: 'MY_ID',
        email: 'MY_EMAIL',
        username: 'ME',
        password: 'MY_PASSWORD',
        createdAt: '0',
        updatedAt: '0'
      },
      other: {
        id: 'ANOTHER_ID',
        email: 'ANOTHER_EMAIL',
        username: 'ANOTHER',
        password: 'ANOTHER_PASSWORD',
        createdAt: '0',
        updatedAt: '0',
      },
    };

    prisma.user
      .mockResolvedValueOnce(me)
      .mockResolvedValueOnce(other);

    prisma.users
      .mockResolvedValueOnce([me, other]);

    const { client } = createTestEnv({
      middlewares: [shield]
    });
    const { data, errors } = await client.query({
      query: USER_QUERY_SET,
    }) as QueryResult<'me' | 'user' | 'users'>;

    expect(data).toBeNull();

    expect(errors).toBeDefined();
    expect(errors![0].message).toEqual('Not Authorised!');
  });
});
