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

const INTENT_PATTERNS: Array<{ intent: AssistantIntent; patterns: RegExp[] }> = [
  {
    intent: "users",
    patterns: [/live user/, /online/, /active user/, /traffic now/, /visitors/],
  },
  {
    intent: "inventory",
    patterns: [/restock/, /inventory/, /stock alert/, /low stock/, /out of stock/],
  },
  {
    intent: "stock",
    patterns: [/stock status/, /sku/, /warehouse/],
  },
  {
    intent: "suppliers",
    patterns: [/supplier/, /vendor/, /source parts/, /restock from/],
  },
  {
    intent: "payments",
    patterns: [/cryptomus/, /payment/, /crypto/, /bitcoin/, /invoice/],
  },
  {
    intent: "orders",
    patterns: [/recent order/, /pending order/, /order status/, /latest order/],
  },
  {
    intent: "products",
    patterns: [/top product/, /best seller/, /trending product/, /hot product/],
  },
  {
    intent: "optimization",
    patterns: [/pricing/, /bundle/, /optimize revenue/, /underperform/],
  },
  {
    intent: "forecast",
    patterns: [/forecast/, /predict/, /next 7 day/, /projection/],
  },
  {
    intent: "revenue",
    patterns: [/revenue/, /sales/, /conversion/, /money/, /profit/],
  },
  {
    intent: "analytics",
    patterns: [/analytics/, /metrics/, /performance/, /dashboard/],
  },
];

export function classifyAssistantIntent(message: string): AssistantIntent {
  const text = message.toLowerCase().trim();
  if (!text) return "general";

  for (const entry of INTENT_PATTERNS) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      return entry.intent;
    }
  }

  return "general";
}

export function getIntentSuggestions(intent: AssistantIntent): string[] {
  const base = [
    "Show revenue and conversion",
    "How many live users are online?",
    "What products need restock?",
    "Top products by demand velocity",
    "Revenue optimization suggestions",
  ];

  switch (intent) {
    case "users":
      return [
        "How many live users are online?",
        "Which pages are most active?",
        "Show realtime conversion rate",
        ...base.slice(2),
      ];
    case "inventory":
      return [
        "What products need restock?",
        "Show inventory risk scores",
        "Supplier recommendations for low stock",
        ...base,
      ];
    default:
      return base;
  }
}
