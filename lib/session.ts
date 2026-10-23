import { SignJWT, jwtVerify } from 'jose'

// In production, you should put this in your .env file
const secret = new TextEncoder().encode('super-secret-random-string-at-least-32-chars')

export async function createSession(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function readSession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.userId as string
  } catch {
    return null
  }
}