import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { OrderStatus } from "@/types/database.types";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { status, carrier, trackingNumber, estimatedDelivery } = body;

    if (!status || !VALID_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check user role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()) as { data: { role: string } | null; error: unknown };

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required" },
        { status: 403 }
      );
    }

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (carrier) updatePayload.carrier = carrier;
    if (trackingNumber) updatePayload.tracking_number = trackingNumber;
    if (estimatedDelivery) updatePayload.estimated_delivery = estimatedDelivery;
    if (status === "delivered") updatePayload.payment_status = "paid";

    const { data: updatedOrder, error } = await (supabase.from("orders") as any)
      .update(updatePayload)
      .eq("id", orderId)
      .select("*, order_items(*)")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Insert customer notification
    if (updatedOrder?.user_id) {
      await (supabase.from("notifications") as any).insert({
        user_id: updatedOrder.user_id,
        title: `Order #${updatedOrder.order_number} Updated`,
        message: `Your order status has progressed to ${status.toUpperCase()}.`,
        link: `/orders/${updatedOrder.id}`,
        type: "order_status",
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
