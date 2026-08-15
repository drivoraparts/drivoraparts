import type { AssistantResponse } from "./types";

/**
 * The things people type that aren't questions about the business.
 *
 * "wassup how u doing" fell through every data handler and got answered with
 * a revenue snapshot and a list of capabilities — a strange reply to someone
 * saying hello, and the first impression most people form of the assistant.
 * Greetings, thanks and "can you edit products?" are the openers of any chat
 * box, so they deserve real answers rather than a funnel report.
 *
 * Checked before anything touches the database: none of these need data, and
 * a greeting should never be matched against the product catalog.
 */

/** Concrete, and every one of them actually works. */
const SUGGESTIONS = [
  "What's my average order value?",
  "What needs restocking?",
  "Where are people dropping off?",
];

const GREETING =
  /^(hi|hey+|hello+|yo|sup|wass?up|what'?s up|good (morning|afternoon|evening)|howdy|hola)\b/;

const HOW_ARE_YOU = /how (are|r) (you|u)|how'?s it going|how (are|r) (you|u) doing|how (you|u) doing/;

const THANKS = /^(thanks|thank you|thx|ty|cheers|appreciate it|nice one|good job|well done)\b/;

const IDENTITY = /who are you|what are you|your name|are you (a )?(bot|human|ai|real)/;

const CAPABILITIES = /what can (you|u) do|what do (you|u) do|how do (you|u) work|help me|what are (you|u) for/;

/**
 * "Can you add a product?" — a fair question with an unfair answer, since the
 * dashboard does this and the assistant does not. Points at the page instead
 * of shrugging.
 */
const WRITE_REQUEST =
  /\b(can|could|will|would|do)\s+(you|u)\b[\s\S]{0,40}\b(edit|add|create|update|change|delete|remove|upload|make|set|adjust)\b|\b(edit|add|create|delete|update|change)\b[\s\S]{0,20}\b(a |the |my )?(product|listing|item|price|order|stock)/;

/** Where each kind of change actually lives in the dashboard. */
function whereToChange(text: string): string {
  if (/product|listing|item|price|catalog/.test(text)) {
    return "Products, in the dashboard menu — you can add a listing there or edit an existing one.";
  }
  if (/stock|inventory|restock|quantity/.test(text)) {
    return "Inventory, in the dashboard menu.";
  }
  if (/order|ship|track|refund|cancel/.test(text)) {
    return "Orders, in the dashboard menu — open an order to update its status or shipping.";
  }
  return "the relevant page in the dashboard menu — Products, Inventory, Orders or Settings.";
}

export function answerConversational(message: string): AssistantResponse | null {
  const text = message.toLowerCase().trim();
  if (!text) return null;

  if (WRITE_REQUEST.test(text)) {
    return {
      reply: `I can read your data but I can't change anything — I'm here to answer questions, not to edit the store. For that, go to ${whereToChange(text)}`,
      suggestions: SUGGESTIONS,
      intent: "general",
    };
  }

  if (GREETING.test(text) || HOW_ARE_YOU.test(text)) {
    return {
      reply:
        "Doing well, thanks — ready when you are. I can look up anything about your store: revenue, orders, a specific product, stock levels, or where customers are dropping off. What would you like to know?",
      suggestions: SUGGESTIONS,
      intent: "general",
    };
  }

  if (THANKS.test(text)) {
    return {
      reply: "Any time. Ask me anything else about the store.",
      suggestions: SUGGESTIONS,
      intent: "general",
    };
  }

  if (IDENTITY.test(text)) {
    return {
      reply:
        "I'm the assistant built into your DrivoraParts dashboard. I read your live data — orders, payments, inventory, traffic — and answer questions about it. I don't make changes to the store.",
      suggestions: SUGGESTIONS,
      intent: "general",
    };
  }

  if (CAPABILITIES.test(text)) {
    return {
      reply:
        "I can tell you: revenue and conversion, how a specific product is performing, an order looked up by its DRV- number or the customer's email, what needs restocking, payment status, who's on the site now, and averages like order value. Ask in your own words — and if I don't know, I'll say so rather than guess.",
      suggestions: SUGGESTIONS,
      intent: "general",
    };
  }

  return null;
}
