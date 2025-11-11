/**
 * NextAuth Route Handler
 * v0.35.16a - Force Node.js runtime for email provider (nodemailer)
 */

import NextAuth from 'next-auth'
import { authOptions } from './options'

// Force Node.js runtime (required for EmailProvider/nodemailer)
export const runtime = 'nodejs';

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

