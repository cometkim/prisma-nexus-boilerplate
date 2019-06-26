import gql from 'graphql-tag';

//@ts-ignore
import { createTestEnv, MockedPrismaClient } from '~/tests/helpers';

const SIGNUP_MUTAION = gql`
  mutation signup($email: String!, $username: String!, $password: String!) {
    signup(email: $email, username: $username, password: $password) {
      token
      user {
        id
      }
    }
  }
`
// beforeEach(() => {
  jest.mock('~/src/generated/prisma-client', () => {
    const actual = require.requireActual('~/src/generated/prisma-client');
    console.log(actual);
    function mockEntry(entry: any): any {
      if (entry instanceof Function) {
        return jest.fn()
      } else if (entry instanceof Array) {
        return entry.map(e => mockEntry(e))
      } else if (entry && typeof entry === 'object') {
        return Object.fromEntries(
          Object.entries(entry)
            .map(([key, val]) => [key, mockEntry(val)])
        )
      } else {
        return entry
      }
    }
    return {
      prisma: mockEntry(actual.prisma),
    };
  });
// })

afterEach(() => {
  jest.unmock('~/src/generated/prisma-client');
})

it('Signup', async () => {
  const { client, prisma } = createTestEnv();

  const prismaMock = prisma as MockedPrismaClient;
  prismaMock.createUser.mockImplementationOnce((_: any, args: any) => {
    return { ...args };
  })

  const res = await client.mutate({
    mutation: SIGNUP_MUTAION,
    variables: {
      email: 'test@example.com',
      username: 'TEST_USERNAME',
      password: 'TEST_PASSWORD',
    },
  });
  console.log(res);
});
