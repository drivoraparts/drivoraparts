import type { OrderStatus } from "@/lib/db/orders";



export type PaymentLifecycleStatus =

  | "pending"

  | "processing"

  | "paid"

  | "failed"

  | "refunded";



const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {

  pending: ["processing", "failed", "cancelled"],

  processing: ["paid", "failed", "cancelled"],

  paid: ["processing", "shipped", "refunded"],

  failed: ["pending", "cancelled"],

  shipped: ["delivered", "refunded"],

  delivered: ["refunded"],

  cancelled: [],

  refunded: [],

};



export function canTransitionOrderStatus(

  current: OrderStatus,

  next: OrderStatus

): boolean {

  if (current === next) return true;

  return VALID_TRANSITIONS[current]?.includes(next) ?? false;

}



export function assertOrderTransition(

  current: OrderStatus,

  next: OrderStatus

): void {

  if (!canTransitionOrderStatus(current, next)) {

    throw new Error(`Invalid order transition: ${current} → ${next}`);

  }

}



export function mapPaymentStatusToOrderStatus(

  paymentStatus: PaymentLifecycleStatus

): OrderStatus {

  switch (paymentStatus) {

    case "pending":

      return "pending";

    case "processing":

      return "processing";

    case "paid":

      return "paid";

    case "failed":

      return "failed";

    case "refunded":

      return "refunded";

    default:

      return "pending";

  }

}



export async function applyPaidOrderTransition(

  transition: (

    orderId: string,

    status: OrderStatus

  ) => Promise<{ status: OrderStatus } | null>,

  orderId: string,

  currentStatus: OrderStatus

): Promise<OrderStatus> {

  if (currentStatus === "paid") {

    return "paid";

  }



  if (currentStatus === "pending") {

    const processing = await transition(orderId, "processing");

    if (!processing) return currentStatus;

    currentStatus = "processing";

  }



  if (currentStatus === "processing") {

    const paid = await transition(orderId, "paid");

    return paid?.status ?? currentStatus;

  }



  return currentStatus;

}


