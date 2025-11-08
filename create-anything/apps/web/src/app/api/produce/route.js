import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      farmer_id,
      category_id,
      name,
      description,
      price_per_unit,
      unit_type,
      quantity_available,
      harvest_date,
      expiry_date,
      is_organic,
    } = await request.json();

    if (
      !farmer_id ||
      !name ||
      !price_per_unit ||
      !unit_type ||
      !quantity_available
    ) {
      return Response.json(
        {
          error:
            "farmer_id, name, price_per_unit, unit_type, and quantity_available are required",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO produce (
        farmer_id, category_id, name, description, price_per_unit, 
        unit_type, quantity_available, harvest_date, expiry_date, is_organic
      )
      VALUES (
        ${farmer_id}, ${category_id}, ${name}, ${description}, ${price_per_unit}, 
        ${unit_type}, ${quantity_available}, ${harvest_date}, ${expiry_date}, ${is_organic}
      )
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating produce:", error);
    return Response.json(
      { error: "Failed to create produce" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const farmer_id = searchParams.get("farmer_id");
    const category_id = searchParams.get("category_id");
    const is_available = searchParams.get("is_available");
    const search = searchParams.get("search");

    let whereConditions = ["p.is_available = true"];
    let values = [];
    let paramCount = 0;

    if (farmer_id) {
      whereConditions.push(`p.farmer_id = $${++paramCount}`);
      values.push(farmer_id);
    }

    if (category_id) {
      whereConditions.push(`p.category_id = $${++paramCount}`);
      values.push(category_id);
    }

    if (is_available !== null && is_available !== undefined) {
      whereConditions.push(`p.is_available = $${++paramCount}`);
      values.push(is_available === "true");
    }

    if (search) {
      whereConditions.push(
        `(LOWER(p.name) LIKE LOWER($${++paramCount}) OR LOWER(p.description) LIKE LOWER($${++paramCount}))`,
      );
      values.push(`%${search}%`, `%${search}%`);
      paramCount++; // increment again for the second parameter
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const query = `
      SELECT p.*, 
             c.name as category_name,
             u.name as farmer_name,
             fp.farm_name,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', pm.id,
                   'media_url', pm.media_url,
                   'media_type', pm.media_type,
                   'is_primary', pm.is_primary
                 )
               ) FILTER (WHERE pm.id IS NOT NULL), 
               '[]'
             ) as media
      FROM produce p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN produce_media pm ON p.id = pm.produce_id
      ${whereClause}
      GROUP BY p.id, c.name, u.name, fp.farm_name
      ORDER BY p.created_at DESC
    `;

    const produce = await sql(query, values);
    return Response.json(produce);
  } catch (error) {
    console.error("Error fetching produce:", error);
    return Response.json({ error: "Failed to fetch produce" }, { status: 500 });
  }
}
