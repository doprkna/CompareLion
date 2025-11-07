// app/api/auth/[...nextauth]/options.ts
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
// import RedditProvider from "next-auth/providers/reddit";
import { verifyPassword } from "@/lib/auth/password";
import { logger } from "@/lib/logger";

// Import Prisma client with fallback strategy
import * as dbModule from "@/lib/db";
const prisma = (dbModule as any).default || (dbModule as any).prisma;

// Verify prisma is valid before passing to adapter
if (!prisma || typeof prisma?.user?.findUnique !== 'function') {
  logger.error("❌ CRITICAL: Prisma client is not properly initialized!");
  throw new Error("Prisma client not initialized - cannot create NextAuth adapter");
}

export const authOptions: NextAuthOptions = {
  // NOTE: PrismaAdapter works for OAuth/Email providers but NOT for CredentialsProvider
  // Using JWT strategy for credentials login, adapter for OAuth/Email
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use JWT for credentials, adapter handles OAuth/Email sessions
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("User not found. Please check your email address.");
          }

          if (!user.passwordHash) {
            throw new Error("Account not set up for password login. Please use a different sign-in method.");
          }

          const valid = await verifyPassword(user.passwordHash, credentials.password);
          if (!valid) {
            throw new Error("Incorrect password. Please try again.");
          }

          // Minimal safe user object
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            role: user.role,
          };
        } catch (error: any) {
          logger.error("[Auth] Login error", { message: error.message });
          throw error;
        }
      },
    }),

    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "placeholder",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "placeholder",
    }),

    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "placeholder",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "placeholder",
      version: "2.0",
    }),

    // RedditProvider({
    //   clientId: process.env.REDDIT_CLIENT_ID || "placeholder",
    //   clientSecret: process.env.REDDIT_CLIENT_SECRET || "placeholder",
    // }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // auto-create on OAuth
      if (
        ["email", "google", "facebook", "twitter", "reddit"].includes(
          account?.provider || ""
        )
      ) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign in - user object is available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = (user as any).role;
      }
      
      return token;
    },

    async session({ session, token }) {
      // Add user info from JWT token to session
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string || null,
          image: token.image as string || null,
          role: token.role as string,
        };
      }
      
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login?error=",
  },
};
