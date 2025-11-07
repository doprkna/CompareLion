
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
