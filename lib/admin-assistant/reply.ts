import { generateClaudeAssistantReply, isClaudeAssistantConfigured } from "./claude";
import { generateAdminAssistantReply as generateHeuristicReply } from "./engine";
import type { AssistantResponse } from "./types";

/**
 * Answer an admin question, preferring Claude when it's configured.
 *
 * The keyword engine underneath only recognises about a dozen fixed patterns
 * and returns a canned lookup for each, so anything phrased outside them falls
 * through to a generic reply. Claude reads the same data through tools and can
 * answer arbitrary questions about it.
 *
 * Falling back rather than erroring is deliberate: without ANTHROPIC_API_KEY —
 * or if the call fails — the dashboard keeps the behaviour it had before,
 * instead of showing the owner a broken assistant.
 */
export async function answerAdminQuestion(message: string): Promise<AssistantResponse> {
  if (isClaudeAssistantConfigured()) {
    const claudeReply = await generateClaudeAssistantReply(message);
    if (claudeReply) return claudeReply;
  }

  return generateHeuristicReply(message);
}
