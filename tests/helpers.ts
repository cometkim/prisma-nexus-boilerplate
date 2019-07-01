import { ApolloServer } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';
import cloneDeepWith from 'lodash/cloneDeepWith';
import isFunction from 'lodash/isFunction';

import { NexusGenFieldTypes } from '~/src/generated/nexus';
import { Fragmentable } from '~/src/generated/prisma-client';

export type MutationResult<T = any> = T extends keyof NexusGenFieldTypes['Mutation']
  ? { data: Record<T, NexusGenFieldTypes['Mutation'][T]> }
  : { data: NexusGenFieldTypes['Mutation'] }
  ;

export type QueryResult<T = any> = T extends keyof NexusGenFieldTypes['Query']
  ? { data: Record<T, NexusGenFieldTypes['Query'][T]> }
  : { data: NexusGenFieldTypes['Query'] }
  ;

export type DeeplyMocked<T> = T extends (...args: infer U) => infer R
  ? jest.Mock<NoFragmentLike<R>, U>
  : T extends object
  ? DeeplyMockedObject<T>
  : T
  ;

export type NoFragmentLike<T> = T extends Fragmentable
  ? T extends Promise<infer U>
  ? Promise<U>
  : never
  : T

export type DeeplyMockedObject<T> = {
  [P in keyof T]: DeeplyMocked<T[P]>;
};

type DeeplyMockInterfaceCustomizer<T> = (original: T, mocked: DeeplyMocked<T>) => any;
export function deeplyMockInterface<T>(modulePath: string, cb?: DeeplyMockInterfaceCustomizer<T>) {
  function mock(value: any) {
    if (isFunction(value)) {
      return jest.fn();
    }
  }
  const original = require.requireActual(modulePath) as T;
  const mocked = cloneDeepWith(original, mock) as DeeplyMocked<T>;
  if (cb) {
    const customized = cb(original, mocked);
    jest.mock(modulePath, () => customized);
    return customized;
  } else {
    jest.mock(modulePath, () => mocked);
    return mocked;
  }
}

export function createTestEnv() {
  const { default: schema } = require('~/src/schema');
  const { prisma } = require('~/src/generated/prisma-client');
  const server = new ApolloServer({
    schema,
    context: req => ({
      ...req,
      prisma,
    }),
  });
  const client = createTestClient(server);
  return { server, client };
}
