import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { logError } from "@/lib/monitoring/logger";
import {
  getBusinessSnapshot,
  getDecisionBrainSnapshot,
  getInventoryStatus,
  getPaymentRecords,
  getRecentOrders,
  getRevenue,
  getTopProducts,
  getUsersOnline,
} from "./tools";
import type { AssistantResponse } from "./types";

/**
 * The dashboard's own numbers, handed to Claude as tools.
 *
 * Every tool here wraps a function the admin pages already call, so the
 * assistant reads exactly what the dashboard reads — there is no second,
 * drifting copy of the business logic, and a fix to a stat fixes both.
 */

const MODEL = "claude-opus-5";
const MAX_TOOL_ITERATIONS = 8;

const SYSTEM_PROMPT = `You are the operations assistant for DrivoraParts, an automotive
performance parts marketplace. You answer the owner's questions about their own
store using the tools provided.

Ground every factual claim in a tool result. The tools are the only source of
truth about this business — you have no other knowledge of their orders,
revenue, inventory or customers. If a tool returns nothing useful, say so
plainly rather than estimating.

Do not invent figures, trends, forecasts, or confidence percentages. When a
number is unavailable, say it is unavailable. When you do have numbers, state
them exactly as the tool returned them.

Keep responses focused and brief — lead with the answer, then the supporting
detail. Use plain prose; reserve tables for genuinely tabular figures. The
reader is the business owner, not an engineer, so avoid jargon and internal
field names.

Prices and totals are in USD unless a tool says otherwise. Note that pending
orders are often abandoned checkouts rather than sales awaiting fulfilment.`;

/** Trimmed so a whole snapshot doesn't blow the tool-result budget. */
function compact(value: unknown, maxChars = 6000): string {
  const json = JSON.stringify(value ?? null, null, 1) ?? "null";
  return json.length <= maxChars ? json : `${json.slice(0, maxChars)}\n…(truncated)`;
}

const tools = [
  betaTool({
    name: "get_revenue",
    description:
      "Revenue and payment totals: paid-order revenue, order counts by state, payment counts and amounts by status and provider, plus traffic figures (product views, cart adds, checkouts started). Call this for any question about money taken, sales performance, or conversion.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => compact(await getRevenue()),
  }),
  betaTool({
    name: "get_recent_orders",
    description:
      "The most recent orders with their id, total, status, customer email and creation time. Call this when asked about specific or latest orders, or to check what a customer bought.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          description: "How many orders to return, 1-50. Defaults to 10.",
        },
      },
      additionalProperties: false,
    },
    run: async ({ limit }) =>
      compact(await getRecentOrders(Math.min(Math.max(limit ?? 10, 1), 50))),
  }),
  betaTool({
    name: "get_inventory_status",
    description:
      "Inventory totals across the whole catalog (SKU count, total units, low-stock and out-of-stock counts) plus the specific SKUs currently at or below their restock threshold. Call this for stock, restocking, or 'what am I about to run out of' questions.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => compact(await getInventoryStatus()),
  }),
  betaTool({
    name: "get_top_products",
    description:
      "Products ranked by the store's own engagement scoring. Call this for best-seller, trending, or 'what should I promote' questions.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => compact(await getTopProducts()),
  }),
  betaTool({
    name: "get_payments",
    description:
      "Individual payment records with status, amount and provider. Call this to investigate a specific payment, or to reconcile payments against orders.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          description: "How many payment records to return, 1-50. Defaults to 20.",
        },
      },
      additionalProperties: false,
    },
    run: async ({ limit }) =>
      compact(await getPaymentRecords(Math.min(Math.max(limit ?? 20, 1), 50))),
  }),
  betaTool({
    name: "get_live_users",
    description:
      "Who is on the site right now. Call this for live traffic or 'how many people are browsing' questions.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => compact(await getUsersOnline()),
  }),
  betaTool({
    name: "get_business_snapshot",
    description:
      "A combined snapshot of revenue, top products, recent orders, inventory, supplier recommendations and optimisation signals. Call this for broad, open-ended questions ('how is the business doing?') where you don't yet know which area matters. Prefer a narrower tool when the question is specific.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => compact(await getBusinessSnapshot(), 12000),
  }),
  betaTool({
    name: "get_decision_signals",
    description:
      "The store's own rule-based daily decision output and action recommendations. These are heuristics computed from the store's data, not predictions — describe them as suggestions to review, never as forecasts.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    run: async () => compact(await getDecisionBrainSnapshot(), 8000),
  }),
];

export function isClaudeAssistantConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/**
 * Answers via Claude with the dashboard's data as tools. Returns null when the
 * API key is absent or the call fails, so the caller can fall back to the
 * local keyword engine rather than showing the owner an error.
 */
export async function generateClaudeAssistantReply(
  message: string
): Promise<AssistantResponse | null> {
  if (!isClaudeAssistantConfigured()) return null;

  try {
    const client = new Anthropic();

    const finalMessage = await client.beta.messages.toolRunner({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages: [{ role: "user", content: message }],
      max_iterations: MAX_TOOL_ITERATIONS,
    });

    if (finalMessage.stop_reason === "refusal") {
      return null;
    }

    const reply = finalMessage.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!reply) return null;

    return {
      reply,
      suggestions: [
        "How is revenue tracking?",
        "What needs restocking?",
        "Show me the latest orders",
      ],
      intent: "general",
    };
  } catch (error) {
    logError("admin_assistant_claude_failed", error);
    return null;
  }
}
