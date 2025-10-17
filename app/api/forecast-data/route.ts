import { NextResponse } from "next/server"
import { db } from "@/lib/db/dbpostgres"
import { forecastData } from "@/lib/db/schema"
import { eq, and, asc } from "drizzle-orm"
import { checkPermission } from "@/lib/casl/middleware"

export async function GET(request: Request) {
  const permissionCheck = await checkPermission(request, "read", "ForecastData")
  if (permissionCheck) return permissionCheck

  try {
    if (!request?.url) {
      return NextResponse.json({ error: "Invalid request URL" }, { status: 400 })
    }
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const forecastExecutionId = searchParams.get("forecastExecutionId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Build the where conditions
    const whereConditions = [eq(forecastData.productId, Number.parseInt(productId))]

    // Add forecastExecutionId filter if provided
    if (forecastExecutionId) {
      whereConditions.push(eq(forecastData.forecastExecutionId, Number.parseInt(forecastExecutionId)))
    }

    // Query forecast data for the specified product and optionally execution, ordered by date
    const data = await db
      .select({
        id: forecastData.id,
        type: forecastData.type,
        forecastTypeId: forecastData.forecastTypeId,
        forecastExecutionId: forecastData.forecastExecutionId,
        date: forecastData.date,
        value: forecastData.value,
      })
      .from(forecastData)
      .where(and(...whereConditions))
      .orderBy(asc(forecastData.date)) // Order by date ascending

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching forecast data:", error)
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const permissionCheck = await checkPermission(request, "update", "ForecastData")
  if (permissionCheck) return permissionCheck

  try {
    const body = await request.json()
    const { productId, forecastTypeId, forecastExecutionId, date, value } = body

    if (!productId || !forecastTypeId || !date || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Build the where conditions for finding existing data
    const whereConditions = [
      eq(forecastData.productId, Number.parseInt(productId)),
      eq(forecastData.forecastTypeId, forecastTypeId),
      eq(forecastData.date, new Date(date)),
    ]

    // Add forecastExecutionId to where conditions if provided
    if (forecastExecutionId) {
      whereConditions.push(eq(forecastData.forecastExecutionId, Number.parseInt(forecastExecutionId)))
    }

    // Check if the forecast data already exists
    const existingData = await db
      .select()
      .from(forecastData)
      .where(and(...whereConditions))

    let result

    if (existingData.length > 0) {
      // Update existing forecast data
      result = await db
        .update(forecastData)
        .set({
          value: value,
          updatedAt: new Date(),
        })
        .where(and(...whereConditions))
        .returning()
    } else {
      // Insert new forecast data
      const insertData: any = {
        productId: Number.parseInt(productId),
        forecastTypeId: forecastTypeId,
        date: new Date(date),
        value: value,
        type: "forecast", // Default type
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add forecastExecutionId if provided
      if (forecastExecutionId) {
        insertData.forecastExecutionId = Number.parseInt(forecastExecutionId)
      }

      result = await db.insert(forecastData).values(insertData).returning()
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating forecast data:", error)
    return NextResponse.json({ error: "Failed to update forecast data" }, { status: 500 })
  }
}
