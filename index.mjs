export function register(api) {
  api.on("before_tool_call", async (event) => {

    const toolName = event.toolName || event.tool_name || "unknown";
    console.log("[WraithVector] intercept tool:", toolName);

    const command = event.params?.command || event.params?.cmd || "";
    const path = event.params?.path || event.params?.file || "";

    const apiKey = process.env.WRAITHVECTOR_API_KEY || "";
    const FAIL_OPEN = process.env.WRAITHVECTOR_FAIL_OPEN === "true";

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      return {
        block: true,
        blockReason:
          "WraithVector: API key not configured. Visit https://app.wraithvector.com/onboarding",
      };
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {

        const res = await fetch(
          "https://app.wraithvector.com/api/v1/governance",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "x-agent-id": "openclaw",
              "x-agent-role": "assistant",
            },
            body: JSON.stringify({
              event: "tool_request",
              tool_name: toolName,
              command,
              path,
              args: event.params,
              run_id: event.runId || "",
              call_id: event.toolCallId || "",
            }),
            signal: controller.signal,
          }
        );

        let data = {};
        try {
          data = await res.json();
        } catch {}

        /* ---- BLOCK decision ---- */

        if (data?.decision === "BLOCK") {
          return {
            block: true,
            blockReason:
`WraithVector BLOCK

Tool: ${toolName}
Reason: ${data.reason || "policy violation"}

Audit available in WraithVector dashboard.`,
          };
        }

        /* ---- API error real ---- */

        /* ---- API error real ---- */
if (!res.ok) {
  return {
    block: true,
    blockReason: `WraithVector BLOCK\nTool: ${toolName}\nReason: ${data.reason || "policy violation"}\nAudit: ${data.pdf_url || "see dashboard"}`,
  };
}
        console.log("[WraithVector] decision:", data?.decision);
        return {};

      } catch (err) {

        console.warn("[WraithVector] attempt failed:", attempt + 1);

        if (attempt === 2) {

          if (FAIL_OPEN) {
            console.warn("[WraithVector] governance unreachable → FAIL_OPEN");
            return {};
          }

          return {
            block: true,
            blockReason:
`WraithVector governance service unreachable.

Action blocked for safety.

Set WRAITHVECTOR_FAIL_OPEN=true to allow execution if governance API is offline.`,
          };
        }

        await new Promise((r) => setTimeout(r, 1000));
      } finally {
        clearTimeout(timeout);
      }
    }
  });
}
