import { rule, shield } from 'graphql-shield'

import { Context } from '~/src/types'
import { getUserId } from '~/src/utils'

const rules = {
  isAuthenticatedUser: rule()((parent, args, context: Context) => {
    const userId = getUserId(context)
    return Boolean(userId)
  }),
  isPostOwner: rule()(async (parent, { id }, context: Context) => {
    const userId = getUserId(context)
    const author = await context.prisma.post({ id }).author()
    return userId === author.id
  }),
}

export default shield({
  Query: {
    me: rules.isAuthenticatedUser,
    user: rules.isAuthenticatedUser,
    users: rules.isAuthenticatedUser,
    post: rules.isAuthenticatedUser,
    posts: rules.isAuthenticatedUser,
  },
  Mutation: {
  },
})
