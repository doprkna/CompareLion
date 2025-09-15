import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      orgs: { id: string; name: string }[]
      memberships?: { org: string }[]
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    orgs: { id: string; name: string }[]
    memberships?: { org: string }[]
    name?: string | null
    email?: string | null
    image?: string | null
  }
}
