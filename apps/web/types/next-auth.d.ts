
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      orgs: { id: string; name: string }[]
      memberships?: { org: string }[]
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string | null
      isPremium?: boolean // v0.36.21 - Premium subscription status
      premiumUntil?: Date | null // v0.36.21 - Premium expiration date (null = ongoing)
      level?: number // v0.46.08 - User level for feature gates
    }
  }

  interface User {
    id: string
    orgs: { id: string; name: string }[]
    memberships?: { org: string }[]
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    email?: string
    name?: string | null
    image?: string | null
    role?: string
    isPremium?: boolean // v0.36.21
    premiumUntil?: string | null // v0.36.21 - ISO string in JWT
    level?: number // v0.46.08 - feature gates
  }
}
