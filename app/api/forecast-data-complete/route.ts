import { NextResponse } from "next/server"
import { db } from "@/lib/db/dbpostgres"
import { forecastData, products, classifications } from "@/lib/db/schema"
import { eq, asc, ilike, or, and } from "drizzle-orm"
import { checkPermission } from "@/lib/casl/middleware"

export async function GET(request: Request) {
  const permissionCheck = await checkPermission(request, "read", "ForecastData")
  if (permissionCheck) return permissionCheck

  try {
    if (!request?.url) {
      return NextResponse.json({ error: "Invalid request URL" }, { status: 400 })
    }
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const searchTerm = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const forecastExecutionId = searchParams.get("forecastExecutionId") // NOUVEAU PARAMÈTRE

    const offset = (page - 1) * limit

    // Construire les conditions de filtrage
    const conditions = [eq(forecastData.type, "forecast")] // Only forecast data, not historical

    // NOUVEAU : Filtrer par forecast_execution_id si fourni
    if (forecastExecutionId) {
      conditions.push(eq(forecastData.forecastExecutionId, Number.parseInt(forecastExecutionId)))
    }

    if (searchTerm) {
      conditions.push(or(ilike(products.name, `%${searchTerm}%`), ilike(products.description, `%${searchTerm}%`)))
    }

    if (category && category !== "all") {
      conditions.push(eq(classifications.name, category))
    }

    // Première requête : obtenir les combinaisons uniques product_id + date avec pagination
    const uniqueCombinationsQuery = db
      .selectDistinct({
        productId: forecastData.productId,
        date: forecastData.date,
      })
      .from(forecastData)
      .leftJoin(products, eq(forecastData.productId, products.id))
      .leftJoin(classifications, eq(products.classificationId, classifications.id))
      .where(and(...conditions))
      .orderBy(asc(forecastData.date), asc(forecastData.productId))
      .limit(limit)
      .offset(offset)

    // Compter le total des combinaisons uniques
    const totalCombinationsQuery = db
      .selectDistinct({
        productId: forecastData.productId,
        date: forecastData.date,
      })
      .from(forecastData)
      .leftJoin(products, eq(forecastData.productId, products.id))
      .leftJoin(classifications, eq(products.classificationId, classifications.id))
      .where(and(...conditions))

    const [uniqueCombinations, allCombinations] = await Promise.all([uniqueCombinationsQuery, totalCombinationsQuery])

    const total = allCombinations.length
    const totalPages = Math.ceil(total / limit)

    // Deuxième requête : obtenir toutes les données pour ces combinaisons
    if (uniqueCombinations.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      })
    }

    // Créer les conditions pour récupérer les données complètes
    const combinationConditions = uniqueCombinations
      .map((combo) =>
        combo?.productId ? and(eq(forecastData.productId, combo.productId), eq(forecastData.date, combo.date)) : "",
      )
      .filter((condition) => condition !== "")

    const fullDataQuery = db
      .select({
        id: forecastData.id,
        productId: forecastData.productId,
        productName: products.name,
        classificationId: products.classificationId,
        classificationName: classifications.name,
        forecastTypeId: forecastData.forecastTypeId,
        forecastExecutionId: forecastData.forecastExecutionId, // NOUVEAU CHAMP
        date: forecastData.date,
        value: forecastData.value,
        type: forecastData.type,
      })
      .from(forecastData)
      .leftJoin(products, eq(forecastData.productId, products.id))
      .leftJoin(classifications, eq(products.classificationId, classifications.id))
      .where(and(eq(forecastData.type, "forecast"), or(...combinationConditions)))
      .orderBy(asc(forecastData.date), asc(forecastData.productId))

    const data = await fullDataQuery

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching paginated forecast data:", error)
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 })
  }
}
