import { verify, sign } from 'jsonwebtoken';

import { Context } from '~/src/types';

const { APP_SECRET } = process.env;
if (!APP_SECRET || APP_SECRET === '') {
  throw new Error('APP_SECRET must be provided');
}

interface Token {
  userId: string
}

export function getAppSecret() {
  return APP_SECRET!;
}

export function signToken(userId: string): string {
  return sign({ userId }, getAppSecret());
}

export function getUserId(context: Context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const verifiedToken = verify(token, getAppSecret()) as Token
    return verifiedToken && verifiedToken.userId
  }
}
