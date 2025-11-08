import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    // Create sample users
    const farmers = await sql`
      INSERT INTO users (email, name, phone, user_type) VALUES 
      ('john.farmer@email.com', 'John Green', '+1-555-0101', 'farmer'),
      ('mary.organic@email.com', 'Mary Sunshine', '+1-555-0102', 'farmer'),
      ('bob.valley@email.com', 'Bob Valley', '+1-555-0103', 'farmer')
      RETURNING *
    `;

    const customers = await sql`
      INSERT INTO users (email, name, phone, user_type) VALUES 
      ('alice.customer@email.com', 'Alice Johnson', '+1-555-0201', 'customer'),
      ('david.buyer@email.com', 'David Smith', '+1-555-0202', 'customer')
      RETURNING *
    `;

    // Create farmer profiles
    await sql`
      INSERT INTO farmer_profiles (user_id, farm_name, farm_address, farm_description, certification_type, years_farming) VALUES 
      (${farmers[0].id}, 'Green Valley Farm', '123 Farm Road, Valley City, CA 90210', 'Organic vegetables and fruits grown with sustainable practices', 'Organic', 15),
      (${farmers[1].id}, 'Sunshine Organics', '456 Sunny Lane, Organic Hills, CA 90211', 'Certified organic produce with a focus on heirloom varieties', 'Organic', 8),
      (${farmers[2].id}, 'Valley Fresh Produce', '789 Valley Drive, Fresh Valley, CA 90212', 'Traditional farming methods with modern efficiency', 'Conventional', 25)
    `;

    // Create customer profiles
    await sql`
      INSERT INTO customer_profiles (user_id, delivery_address, preferred_delivery_time) VALUES 
      (${customers[0].id}, '321 Main Street, City Center, CA 90220', 'Morning (8-12 PM)'),
      (${customers[1].id}, '654 Oak Avenue, Suburb Town, CA 90221', 'Evening (4-8 PM)')
    `;

    // Create sample produce
    const produce = await sql`
      INSERT INTO produce (farmer_id, category_id, name, description, price_per_unit, unit_type, quantity_available, harvest_date, expiry_date, is_organic) VALUES 
      (${farmers[0].id}, 1, 'Fresh Tomatoes', 'Vine-ripened organic tomatoes, perfect for salads and cooking', 3.50, 'kg', 50, '2024-11-01', '2024-11-15', true),
      (${farmers[0].id}, 1, 'Organic Lettuce', 'Crisp butter lettuce grown without pesticides', 2.25, 'piece', 30, '2024-11-01', '2024-11-10', true),
      (${farmers[0].id}, 1, 'Bell Peppers', 'Colorful mix of red, yellow, and green bell peppers', 4.00, 'kg', 25, '2024-10-30', '2024-11-20', true),
      (${farmers[1].id}, 1, 'Organic Carrots', 'Sweet and crunchy heirloom carrots', 2.75, 'kg', 40, '2024-10-28', '2024-12-01', true),
      (${farmers[1].id}, 2, 'Strawberries', 'Fresh picked strawberries, sweet and juicy', 6.50, 'kg', 20, '2024-11-02', '2024-11-08', true),
      (${farmers[1].id}, 3, 'Fresh Basil', 'Aromatic basil perfect for cooking', 1.50, 'bunch', 15, '2024-11-01', '2024-11-07', true),
      (${farmers[2].id}, 2, 'Apples', 'Crisp Gala apples, great for snacking', 3.25, 'kg', 100, '2024-10-25', '2024-12-15', false),
      (${farmers[2].id}, 4, 'Brown Rice', 'Locally grown brown rice, perfect for healthy meals', 4.50, 'kg', 200, '2024-09-15', '2025-09-15', false),
      (${farmers[2].id}, 5, 'Fresh Milk', 'Farm fresh whole milk from grass-fed cows', 3.75, 'liter', 50, '2024-11-02', '2024-11-09', false)
      RETURNING *
    `;

    // Add sample media for produce (using placeholder images)
    const mediaData = [
      {
        produce_id: produce[0].id,
        media_url:
          "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[1].id,
        media_url:
          "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[2].id,
        media_url:
          "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[3].id,
        media_url:
          "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[4].id,
        media_url:
          "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[5].id,
        media_url:
          "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[6].id,
        media_url:
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[7].id,
        media_url:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
        media_type: "image",
        is_primary: true,
      },
      {
        produce_id: produce[8].id,
        media_url:
          "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
        media_type: "image",
        is_primary: true,
      },
    ];

    for (const media of mediaData) {
      await sql`
        INSERT INTO produce_media (produce_id, media_url, media_type, is_primary)
        VALUES (${media.produce_id}, ${media.media_url}, ${media.media_type}, ${media.is_primary})
      `;
    }

    // Create a sample order
    const order = await sql`
      INSERT INTO orders (customer_id, total_amount, delivery_address, delivery_phone, order_status)
      VALUES (${customers[0].id}, 12.25, '321 Main Street, City Center, CA 90220', '+1-555-0201', 'confirmed')
      RETURNING *
    `;

    // Add order items
    await sql`
      INSERT INTO order_items (order_id, produce_id, farmer_id, quantity, unit_price, total_price) VALUES 
      (${order[0].id}, ${produce[0].id}, ${farmers[0].id}, 2, 3.50, 7.00),
      (${order[0].id}, ${produce[1].id}, ${farmers[0].id}, 1, 2.25, 2.25),
      (${order[0].id}, ${produce[5].id}, ${farmers[1].id}, 2, 1.50, 3.00)
    `;

    // Update produce quantities
    await sql`UPDATE produce SET quantity_available = quantity_available - 2 WHERE id = ${produce[0].id}`;
    await sql`UPDATE produce SET quantity_available = quantity_available - 1 WHERE id = ${produce[1].id}`;
    await sql`UPDATE produce SET quantity_available = quantity_available - 2 WHERE id = ${produce[5].id}`;

    return Response.json({
      message: "Sample data created successfully!",
      farmers: farmers.length,
      customers: customers.length,
      produce: produce.length,
      orders: 1,
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return Response.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
