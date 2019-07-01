import gql from 'graphql-tag';
import { verify } from 'jsonwebtoken';

import * as PrismaClient from '~/src/generated/prisma-client'

import {
  createTestEnv,
  deeplyMockInterface,
  DeeplyMocked,
} from '~/tests/helpers';
import { getAppSecret } from '~/src/utils';
import { NexusGenRootTypes, NexusGenFieldTypes } from '~/src/generated/nexus';

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
      id: 'TEST_ID',
      nickname: null,
      createdAt: new Date('2019-06-27T16:43:55.475Z'),
      updatedAt: new Date('2019-06-27T16:43:55.475Z'),
      ...args,
    }
    return Promise.resolve(testUser);
  });

  const result = await client.mutate({
    mutation: SIGNUP_MUTATION,
    variables: {
      username: 'TEST',
      email: 'TEST@example.com',
      password: 'TEST_PASSWORD',
    },
  });
  const data = result.data as NexusGenFieldTypes['Mutation'];

  expect(data.signup).toBeDefined();
  expect(data.signup.user).toMatchSnapshot();
  expect(verify(data.signup.token, getAppSecret())).toMatchObject({ userId: 'TEST_ID' });
});
