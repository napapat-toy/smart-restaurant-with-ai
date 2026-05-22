import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyRole } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 2000;

export async function GET(request: NextRequest) {
  // Verify role (kitchen or admin) via cookies — works in Route Handlers
  try {
    await verifyRole(["admin", "kitchen"]);
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectToDatabase();

  const encoder = new TextEncoder();
  let lastSnapshot = "";

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      // Send initial connection confirmation
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      const poll = async () => {
        if (closed) return;
        try {
          const orders = await Order.find({
            status: { $in: ["Pending", "Cooking"] },
          })
            .sort({ createdAt: 1 })
            .lean();

          if (closed) return;

          const formatted = orders.map((o: any) => ({
            id: o._id.toString(),
            tableId: o.tableId,
            items: o.items,
            totalAmount: o.totalAmount,
            status: o.status,
            createdAt: o.createdAt,
          }));

          const snapshot = JSON.stringify(formatted);
          if (snapshot !== lastSnapshot) {
            lastSnapshot = snapshot;
            controller.enqueue(
              encoder.encode(`data: ${snapshot}\n\n`)
            );
          }
        } catch (err: any) {
          const isClosedError = 
            closed || 
            err?.message?.includes("closed") || 
            err?.message?.includes("Invalid state") || 
            err?.code === "ERR_INVALID_STATE";
            
          if (isClosedError) {
            closed = true;
            clearInterval(interval);
            return;
          }
          console.error("[SSE Kitchen] Poll error:", err);
        }
      };

      // Initial fetch
      await poll();

      // Poll every 2 seconds
      const interval = setInterval(poll, POLL_INTERVAL_MS);

      // Cleanup when client disconnects
      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Ignore error if controller is already closed/errored
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
