import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { produce_id, media_url, media_type, is_primary } =
      await request.json();

    if (!produce_id || !media_url || !media_type) {
      return Response.json(
        { error: "produce_id, media_url, and media_type are required" },
        { status: 400 },
      );
    }

    if (!["image", "video"].includes(media_type)) {
      return Response.json(
        { error: "media_type must be image or video" },
        { status: 400 },
      );
    }

    // If this is set as primary, unset other primary media for this produce
    if (is_primary) {
      await sql`
        UPDATE produce_media 
        SET is_primary = false 
        WHERE produce_id = ${produce_id}
      `;
    }

    const result = await sql`
      INSERT INTO produce_media (produce_id, media_url, media_type, is_primary)
      VALUES (${produce_id}, ${media_url}, ${media_type}, ${is_primary || false})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating produce media:", error);
    return Response.json(
      { error: "Failed to create produce media" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const produce_id = searchParams.get("produce_id");
    const media_type = searchParams.get("media_type");

    let whereConditions = [];
    let values = [];
    let paramCount = 0;

    if (produce_id) {
      whereConditions.push(`produce_id = $${++paramCount}`);
      values.push(produce_id);
    }

    if (media_type) {
      whereConditions.push(`media_type = $${++paramCount}`);
      values.push(media_type);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const query = `
      SELECT * FROM produce_media 
      ${whereClause}
      ORDER BY is_primary DESC, created_at ASC
    `;

    const media = await sql(query, values);
    return Response.json(media);
  } catch (error) {
    console.error("Error fetching produce media:", error);
    return Response.json(
      { error: "Failed to fetch produce media" },
      { status: 500 },
    );
  }
}
