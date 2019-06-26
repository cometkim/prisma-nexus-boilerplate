import { ApolloServer } from 'apollo-server';
import { createTestClient } from 'apollo-server-testing';

import { prisma } from '~/src/generated/prisma-client';
import schema from '~/src/schema';

export type MockEntry<T> = T extends (...args: any[]) => any
    ? jest.Mock
    : T extends any[]
    ? MockEntryArray<T[number]>
    : T extends object
    ? MockEntryObject<T>
    : T

export interface MockEntryArray<T> extends Array<MockEntry<T>> {}
export type MockEntryObject<T> = {
    [P in keyof T]: MockEntry<T[P]>
};

export type MockedPrismaClient = MockEntry<typeof prisma>;

export function createTestEnv() {
    const server = new ApolloServer({ schema });
    const client = createTestClient(server);
    return { server, client, prisma };
}
