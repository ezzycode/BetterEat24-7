import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const categories = await sql`
      SELECT c.*, 
             COUNT(p.id) as produce_count
      FROM categories c
      LEFT JOIN produce p ON c.id = p.category_id AND p.is_available = true
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.name ASC
    `;

    return Response.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO categories (name, description)
      VALUES (${name}, ${description})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
