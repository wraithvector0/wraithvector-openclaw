export function register(api) {
  api.on("before_tool_call", async (event) => {

    const toolName = event.toolName || event.tool_name || "unknown";
    console.log("[WraithVector] intercept tool:", toolName);

    const command = event.params?.command || event.params?.cmd || "";
    const path = event.params?.path || event.params?.file || "";

    const apiKey = process.env.WRAITHVECTOR_API_KEY || "";

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      console.warn("[WraithVector] No API key set. Get yours at https://app.wraithvector.com/onboarding");

      return {
        block: true,
        blockReason:
          "WraithVector: API key not configured. Visit https://app.wraithvector.com/onboarding",
      };
    }

    let res;

    for (let attempt = 0; attempt < 3; attempt++) {

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      try {

        console.log("[WraithVector] sending governance check:", {
          tool: toolName,
          command,
          path,
        });

        res = await fetch("https://app.wraithvector.com/api/v1/governance", {
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
            command: command,
            path: path,
            args: event.params,
            run_id: event.runId || "",
            call_id: event.toolCallId || "",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) throw new Error("bad response");

        const data = await res.json();

        if (data.decision === "BLOCK") {
          return {
            block: true,
            blockReason: `WraithVector BLOCKED: ${data.reason}`,
          };
        }

        console.log("[WraithVector] decision:", data.decision, data.reason);

        return {};

      } catch (err) {

        clearTimeout(timeout);

        console.warn("[WraithVector] attempt failed:", attempt + 1);

        if (attempt === 2) {
          console.error("[WraithVector] governance unreachable:", err?.message);

          return {
            block: true,
            blockReason:
              "WraithVector: governance API unreachable. Set WRAITHVECTOR_FAIL_OPEN=true to allow actions when offline.",
          };
        }

        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  });
}
