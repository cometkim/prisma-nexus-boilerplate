import { verify } from 'jsonwebtoken';
import { Context } from './types';

const {
    APP_SECRET
} = process.env

if (APP_SECRET || APP_SECRET === '') {
    throw new Error('APP_SECRET must be provided');
}

interface Token {
  userId: string
}

export function getUserId(context: Context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const verifiedToken = verify(token, APP_SECRET!) as Token
    return verifiedToken && verifiedToken.userId
  }
}
