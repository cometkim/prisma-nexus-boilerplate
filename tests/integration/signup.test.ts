import gql from 'graphql-tag';
import { verify } from 'jsonwebtoken';

import * as PrismaClient from '~/src/generated/prisma-client'

import {
  createTestEnv,
  deeplyMockInterface,
  DeeplyMocked,
  MutationResult,
} from '~/tests/helpers';
import { getAppSecret } from '~/src/utils';

// FIXME: Should have automatically inferred return type
const { prisma: _prisma } = deeplyMockInterface<typeof PrismaClient>('~/src/generated/prisma-client', (orignal, mocked) => ({
  ...orignal,
  prisma: mocked.prisma,
}));
const prisma = _prisma as DeeplyMocked<typeof PrismaClient['prisma']>

it('Signup', async () => {
  const SIGNUP_MUTATION = gql`
    mutation signup($email: String!, $username: String!, $password: String!) {
      signup(email: $email, username: $username, password: $password) {
        token
        user {
          id
          email
          username
          nickname
          createdAt
          updatedAt
        }
      }
    }
  `;

  const { client } = createTestEnv();

  prisma.createUser.mockImplementationOnce((args) => {
    const testUser = {
      ...args,
      id: 'TEST_ID',
      nickname: undefined,
      createdAt: '2019-06-27T16:43:55.475Z',
      updatedAt: '2019-06-27T16:43:55.475Z',
    };
    return Promise.resolve(testUser);
  });

  const { data } = await client.mutate({
    mutation: SIGNUP_MUTATION,
    variables: {
      username: 'TEST',
      email: 'TEST@example.com',
      password: 'TEST_PASSWORD',
    },
  }) as MutationResult<'signup'>;

  expect(data.signup).toBeDefined();
  expect(data.signup.user).toMatchObject({
    id: 'TEST_ID',
    email: 'TEST@example.com',
    username: 'TEST',
    nickname: null,
    createdAt: '2019-06-27T16:43:55.475Z',
    updatedAt: '2019-06-27T16:43:55.475Z',
  });

  const decodedJWT = verify(data.signup.token, getAppSecret());
  expect(decodedJWT).toMatchObject({ userId: 'TEST_ID' });
});
