"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  projectName: z.string().optional(),
  type: z.enum(["Apartment", "Villa", "Plot", "Commercial", "Office", "Retail"]),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD", "OFF_MARKET"]).default("AVAILABLE"),
  location: z.string().min(1, "Location is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  possessionStatus: z.string().optional(),
  possessionDate: z.string().optional(),
  amenities: z.string().optional(),
  description: z.string().optional(),
  images: z.string().optional(),
  availableUnits: z.number().min(1).default(1),
})

export async function getProperties(filters?: {
  status?: string
  type?: string
  location?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  page?: number
  limit?: number
}) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { properties: [], total: 0, error: "Unauthorized" }
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const skip = (page - 1) * limit

    const where: any = {
      organizationId: session.user.organizationId,
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status
    }

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.location) {
      where.location = { contains: filters.location, mode: "insensitive" }
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {}
      if (filters?.minPrice) where.price.gte = filters.minPrice
      if (filters?.maxPrice) where.price.lte = filters.maxPrice
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { projectName: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
        { address: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          _count: {
            select: { appointments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ])

    return { properties, total, page, limit }
  } catch (error) {
    console.error("Error fetching properties:", error)
    return { properties: [], total: 0, error: "Failed to fetch properties" }
  }
}

export async function getPropertyById(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { property: null, error: "Unauthorized" }
    }

    const property = await prisma.property.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        appointments: {
          include: {
            lead: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
          orderBy: { date: "desc" },
          take: 20,
        },
      },
    })

    if (!property) {
      return { property: null, error: "Property not found" }
    }

    return { property }
  } catch (error) {
    console.error("Error fetching property:", error)
    return { property: null, error: "Failed to fetch property" }
  }
}

export async function createProperty(data: z.infer<typeof propertySchema>) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { property: null, error: "Unauthorized" }
    }

    const validated = propertySchema.parse(data)

    const property = await prisma.property.create({
      data: {
        ...validated,
        possessionDate: validated.possessionDate ? new Date(validated.possessionDate) : null,
        amenities: validated.amenities || null,
        description: validated.description || null,
        images: validated.images || null,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath("/dashboard/properties")
    return { property }
  } catch (error) {
    console.error("Error creating property:", error)
    return { property: null, error: "Failed to create property" }
  }
}

export async function updateProperty(id: string, data: Partial<z.infer<typeof propertySchema>>) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { property: null, error: "Unauthorized" }
    }

    const existing = await prisma.property.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!existing) {
      return { property: null, error: "Property not found" }
    }

    const updateData: any = { ...data }
    if (data.possessionDate) updateData.possessionDate = new Date(data.possessionDate)

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/dashboard/properties")
    revalidatePath(`/dashboard/properties/${id}`)
    return { property }
  } catch (error) {
    console.error("Error updating property:", error)
    return { property: null, error: "Failed to update property" }
  }
}

export async function deleteProperty(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return { success: false, error: "Unauthorized" }
    }

    const property = await prisma.property.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })

    if (!property) {
      return { success: false, error: "Property not found" }
    }

    await prisma.property.delete({
      where: { id },
    })

    revalidatePath("/dashboard/properties")
    return { success: true }
  } catch (error) {
    console.error("Error deleting property:", error)
    return { success: false, error: "Failed to delete property" }
  }
}
