
#!/usr/bin/env bash

set -e

PLUGIN_DIR="$HOME/.openclaw/workspace/plugins/wraithvector"

BASE_URL="https://raw.githubusercontent.com/wraithvector0/wraithvector-openclaw-/main"

echo ""

echo "╔══════════════════════════════════════════╗"

echo "║     WraithVector Governance Plugin       ║"

echo "║     for OpenClaw                         ║"

echo "╚══════════════════════════════════════════╝"

echo ""

echo "→ Creating plugin directory..."

mkdir -p "$PLUGIN_DIR"

echo "→ Downloading plugin files..."

curl -fsSL "$BASE_URL/index.mjs" -o "$PLUGIN_DIR/index.mjs"

curl -fsSL "$BASE_URL/openclaw.plugin.json" -o "$PLUGIN_DIR/openclaw.plugin.json"

if [ ! -f "$PLUGIN_DIR/index.mjs" ] || [ ! -f "$PLUGIN_DIR/openclaw.plugin.json" ]; then

  echo "✗ Download failed. Check your connection and try again."

  exit 1

fi

echo ""

echo "✓ Plugin installed at $PLUGIN_DIR"

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  Next step: set your API key"

echo ""

echo "  Get your free key at:"

echo "  https://app.wraithvector.com/onboarding"

echo ""

echo "  Then set it:"

echo "  export WRAITHVECTOR_API_KEY=wv_your_key_here"

echo ""

echo "  Then restart OpenClaw:"

echo "  openclaw gateway restart"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""

