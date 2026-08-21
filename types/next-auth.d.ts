import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      organizationId?: string
      organization?: {
        id: string
        name: string
        slug: string
      }
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    organizationId?: string | null
    organization?: {
      id: string
      name: string
      slug: string
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    organizationId?: string
    organization?: {
      id: string
      name: string
      slug: string
    }
  }
}