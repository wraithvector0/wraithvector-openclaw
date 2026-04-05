export function register(api) {
  api.on("before_tool_call", async (event) => {

    const toolName = event.toolName || event.tool_name || "unknown";
    console.log("[WraithVector] intercept tool:", toolName);

    const command = event.params?.command || event.params?.cmd || "";
    const path = event.params?.path || event.params?.file || "";

    const apiKey = process.env.WRAITHVECTOR_API_KEY || "";
    const FAIL_OPEN = process.env.WRAITHVECTOR_FAIL_OPEN === "true";

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      console.warn("[WraithVector] No API key set. Get yours at https://app.wraithvector.com/onboarding");
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
        console.log("[WraithVector] sending governance check:", {
          tool: toolName,
          command,
          path,
        });

        const res = await fetch("https://app.wraithvector.com/api/v1/governance", {
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
        });

        if (!res.ok) throw new Error("bad response");

        const data = await res.json();

        if (data.decision === "BLOCK") {
          return {
            block: true,
            blockReason:
`WraithVector intercepted this action.

Tool: ${toolName}
Reason: ${data.reason}

This action was blocked by the WraithVector governance layer.`,
          };
        }

        console.log("[WraithVector] decision:", data.decision, data.reason);
        return {};

      } catch (err) {
        console.warn("[WraithVector] attempt failed:", attempt + 1);

        if (attempt === 2) {
          if (FAIL_OPEN) {
            console.warn("[WraithVector] governance unreachable, FAIL_OPEN active");
            return {};
          }

          console.error("[WraithVector] governance unreachable:", err?.message);
          return {
            block: true,
            blockReason:
`WraithVector governance service is unreachable.

Action blocked for safety.

Set WRAITHVECTOR_FAIL_OPEN=true to allow actions when the governance API is offline.`,
          };
        }

        await new Promise((r) => setTimeout(r, 1000));
      } finally {
        clearTimeout(timeout);
      }
    }
  });
}
