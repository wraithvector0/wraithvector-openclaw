export function register(api) {
  api.on("before_tool_call", async (event) => {
    const toolName = event.toolName || event.tool_name || "unknown";
    const command = event.params?.command || event.params?.cmd || "";
    const path = event.params?.path || event.params?.file || "";
    const apiKey = process.env.WRAITHVECTOR_API_KEY || "";

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      console.warn("[WraithVector] No API key set. Get yours at https://app.wraithvector.com/onboarding");
      return {
        block: true,
        blockReason: "WraithVector: API key not configured. Visit https://app.wraithvector.com/onboarding",
      };
    }

    try {
      const res = await fetch("https://app.wraithvector.com/api/governance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "x-agent-id": "openclaw",
          "x-agent-role": "assistant",
        },
        body: JSON.stringify({
          event: "tool_request",
          tool_name: toolName,
          command: command,
          path: path,
          args: event.params,
          run_id: event.runId || "",
          call_id: event.toolCallId || "",
        }),
      });

      if (!res.ok) {
        return {
          block: true,
          blockReason: `WraithVector: governance API returned ${res.status}`,
        };
      }

      const data = await res.json();

      if (data.decision === "BLOCK") {
        return {
          block: true,
          blockReason: `WraithVector BLOCKED: ${data.reason}`,
        };
      }

      return {};
    } catch (err) {
      return {
        block: true,
        blockReason: "WraithVector: governance API unreachable. Set WRAITHVECTOR_FAIL_OPEN=true to allow actions when offline.",
      };
    }
  });
}
