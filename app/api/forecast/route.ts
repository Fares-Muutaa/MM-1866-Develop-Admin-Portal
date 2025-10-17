import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { checkPermission } from "@/lib/casl/middleware"
import { db } from "@/lib/db/dbpostgres"
import { forecastData } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

// GET /api/forecast - Read forecast data
export async function GET(request: NextRequest) {
  // Check permission using CASL
  const permissionError = await checkPermission("read", "Forecast")
  if (permissionError) return permissionError

  try {
    const forecasts = await db.select().from(forecastData).limit(100)

    return NextResponse.json({
      success: true,
      data: forecasts,
    })
  } catch (error) {
    console.error("[v0] Error fetching forecasts:", error)
    return NextResponse.json({ error: "Failed to fetch forecasts" }, { status: 500 })
  }
}

// POST /api/forecast - Create forecast data
export async function POST(request: NextRequest) {
  // Check permission using CASL
  const permissionError = await checkPermission("create", "Forecast")
  if (permissionError) return permissionError

  try {
    const session: any = await getServerSession(authOptions)
    const body = await request.json()

    const newForecast = await db
      .insert(forecastData)
      .values({
        ...body,
        createdBy: Number.parseInt(session.user.id),
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newForecast[0],
    })
  } catch (error) {
    console.error("[v0] Error creating forecast:", error)
    return NextResponse.json({ error: "Failed to create forecast" }, { status: 500 })
  }
}

// PUT /api/forecast - Update forecast data
export async function PUT(request: NextRequest) {
  // Check permission using CASL
  const permissionError = await checkPermission("update", "Forecast")
  if (permissionError) return permissionError

  try {
    const session: any = await getServerSession(authOptions)
    const body = await request.json()

    const { id, createdAt, createdBy, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Forecast ID is required" }, { status: 400 })
    }

    if (updateData.date && typeof updateData.date === "string") {
      // Keep as string, Drizzle will handle the conversion for date type
      updateData.date = updateData.date.split("T")[0] // Ensure YYYY-MM-DD format
    }

    delete updateData.updatedAt

    const updatedForecast = await db
      .update(forecastData)
      .set({
        ...updateData,
        updatedBy: Number.parseInt(session.user.id),
        updatedAt: new Date(),
      })
      .where(eq(forecastData.id, id))
      .returning()

    if (updatedForecast.length === 0) {
      return NextResponse.json({ error: "Forecast not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedForecast[0],
    })
  } catch (error) {
    console.error("[v0] Error updating forecast:", error)
    return NextResponse.json(
      {
        error: "Failed to update forecast",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// DELETE /api/forecast - Delete forecast data
export async function DELETE(request: NextRequest) {
  // Check permission using CASL
  const permissionError = await checkPermission("delete", "Forecast")
  if (permissionError) return permissionError

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Forecast ID is required" }, { status: 400 })
    }

    await db.delete(forecastData).where(eq(forecastData.id, Number.parseInt(id)))

    return NextResponse.json({
      success: true,
      message: "Forecast deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Error deleting forecast:", error)
    return NextResponse.json({ error: "Failed to delete forecast" }, { status: 500 })
  }
}
