import { NextResponse } from "next/server"
import { db } from "@/lib/db/dbpostgres"
import { forecastTypes } from "@/lib/db/schema"
import { checkPermission } from "@/lib/casl/middleware"

export async function GET(request: Request) {
  const permissionCheck = await checkPermission(request, "read", "ForecastType")
  if (permissionCheck) return permissionCheck

  try {
    const types = await db
      .select({
        id: forecastTypes.id,
        name: forecastTypes.name,
        description: forecastTypes.description,
        isEditable: forecastTypes.isEditable,
        color: forecastTypes.color, // Include the color column
        lineType: forecastTypes.lineType, // Include the lineType column
      })
      .from(forecastTypes)

    return NextResponse.json(types)
  } catch (error) {
    console.error("Error fetching forecast types:", error)
    return NextResponse.json({ error: "Failed to fetch forecast types" }, { status: 500 })
  }
}
