import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      customer_id,
      items, // array of { produce_id, quantity }
      delivery_address,
      delivery_phone,
    } = await request.json();

    if (
      !customer_id ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !delivery_address
    ) {
      return Response.json(
        {
          error: "customer_id, items array, and delivery_address are required",
        },
        { status: 400 },
      );
    }

    // Calculate total and create order with items in a transaction
    const result = await sql.transaction(async (txn) => {
      let total_amount = 0;
      const orderItems = [];

      // Get produce details and calculate totals
      for (const item of items) {
        const produce = await txn`
          SELECT * FROM produce 
          WHERE id = ${item.produce_id} AND is_available = true AND quantity_available >= ${item.quantity}
        `;

        if (produce.length === 0) {
          throw new Error(
            `Produce ${item.produce_id} not available or insufficient quantity`,
          );
        }

        const produceItem = produce[0];
        const itemTotal = produceItem.price_per_unit * item.quantity;
        total_amount += itemTotal;

        orderItems.push({
          produce_id: item.produce_id,
          farmer_id: produceItem.farmer_id,
          quantity: item.quantity,
          unit_price: produceItem.price_per_unit,
          total_price: itemTotal,
        });
      }

      // Create the order
      const order = await txn`
        INSERT INTO orders (customer_id, total_amount, delivery_address, delivery_phone)
        VALUES (${customer_id}, ${total_amount}, ${delivery_address}, ${delivery_phone})
        RETURNING *
      `;

      const orderId = order[0].id;

      // Create order items and update produce quantities
      for (const orderItem of orderItems) {
        await txn`
          INSERT INTO order_items (order_id, produce_id, farmer_id, quantity, unit_price, total_price)
          VALUES (${orderId}, ${orderItem.produce_id}, ${orderItem.farmer_id}, ${orderItem.quantity}, ${orderItem.unit_price}, ${orderItem.total_price})
        `;

        // Update produce quantity
        await txn`
          UPDATE produce 
          SET quantity_available = quantity_available - ${orderItem.quantity}
          WHERE id = ${orderItem.produce_id}
        `;
      }

      return order[0];
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json(
      { error: error.message || "Failed to create order" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get("customer_id");
    const farmer_id = searchParams.get("farmer_id");
    const status = searchParams.get("status");

    let whereConditions = [];
    let values = [];
    let paramCount = 0;

    if (customer_id) {
      whereConditions.push(`o.customer_id = $${++paramCount}`);
      values.push(customer_id);
    }

    if (farmer_id) {
      whereConditions.push(
        `EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.farmer_id = $${++paramCount})`,
      );
      values.push(farmer_id);
    }

    if (status) {
      whereConditions.push(`o.order_status = $${++paramCount}`);
      values.push(status);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const query = `
      SELECT o.*, 
             u.name as customer_name,
             u.email as customer_email,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', oi.id,
                   'produce_id', oi.produce_id,
                   'produce_name', p.name,
                   'farmer_name', fu.name,
                   'farm_name', fp.farm_name,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price,
                   'total_price', oi.total_price,
                   'unit_type', p.unit_type
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), 
               '[]'
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN produce p ON oi.produce_id = p.id
      LEFT JOIN users fu ON oi.farmer_id = fu.id
      LEFT JOIN farmer_profiles fp ON fu.id = fp.user_id
      ${whereClause}
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `;

    const orders = await sql(query, values);
    return Response.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
