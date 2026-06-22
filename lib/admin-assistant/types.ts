export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantIntent =
  | "revenue"
  | "orders"
  | "products"
  | "inventory"
  | "analytics"
  | "users"
  | "stock"
  | "suppliers"
  | "optimization"
  | "payments"
  | "forecast"
  | "general";

export type AssistantResponse = {
  reply: string;
  suggestions: string[];
  intent?: AssistantIntent;
  data?: unknown;
};
