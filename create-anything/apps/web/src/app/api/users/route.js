import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, name, phone, user_type } = await request.json();

    if (!email || !name || !user_type) {
      return Response.json(
        { error: "Email, name, and user_type are required" },
        { status: 400 },
      );
    }

    if (!["farmer", "customer"].includes(user_type)) {
      return Response.json(
        { error: "user_type must be farmer or customer" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO users (email, name, phone, user_type)
      VALUES (${email}, ${name}, ${phone}, ${user_type})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_type = searchParams.get("user_type");

    let query;
    if (user_type) {
      query = sql`SELECT * FROM users WHERE user_type = ${user_type} ORDER BY created_at DESC`;
    } else {
      query = sql`SELECT * FROM users ORDER BY created_at DESC`;
    }

    const users = await query;
    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
