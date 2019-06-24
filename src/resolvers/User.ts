import { prismaObjectType } from 'nexus-prisma'

export const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields([
      'id',
      'email',
      'username',
      'nickname',
      'createdAt',
      'updatedAt',
      {
        name: 'posts',
        args: [],
      },
    ])
  },
})
