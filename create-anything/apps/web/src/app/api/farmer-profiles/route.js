import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      user_id,
      farm_name,
      farm_address,
      farm_description,
      certification_type,
      years_farming,
    } = await request.json();

    if (!user_id || !farm_name || !farm_address) {
      return Response.json(
        { error: "user_id, farm_name, and farm_address are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO farmer_profiles (user_id, farm_name, farm_address, farm_description, certification_type, years_farming)
      VALUES (${user_id}, ${farm_name}, ${farm_address}, ${farm_description}, ${certification_type}, ${years_farming})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating farmer profile:", error);
    return Response.json(
      { error: "Failed to create farmer profile" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    let query;
    if (user_id) {
      query = sql`
        SELECT fp.*, u.name, u.email, u.phone 
        FROM farmer_profiles fp
        JOIN users u ON fp.user_id = u.id
        WHERE fp.user_id = ${user_id}
      `;
    } else {
      query = sql`
        SELECT fp.*, u.name, u.email, u.phone 
        FROM farmer_profiles fp
        JOIN users u ON fp.user_id = u.id
        ORDER BY fp.created_at DESC
      `;
    }

    const profiles = await query;
    return Response.json(profiles);
  } catch (error) {
    console.error("Error fetching farmer profiles:", error);
    return Response.json(
      { error: "Failed to fetch farmer profiles" },
      { status: 500 },
    );
  }
}
