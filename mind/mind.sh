#!/bin/bash
#
# Mind Shell Wrapper
# 
# Run Mind with various modes:
#   mind chat          - Interactive chat
#   mind exec <cmd>    - Execute single command
#   mind agent <task>  - Run autonomous agent
#
# Examples:
#   mind chat
#   mind exec wallet balance
#   mind exec "send 10 CRX to 0x123..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_BIN="$(command -v node 2>/dev/null || which node 2>/dev/null)"

if [ -z "$NODE_BIN" ]; then
  echo "Error: Node.js not found. Please install Node.js first."
  exit 1
fi

# Parse arguments
MODE="${1:-chat}"
shift

case "$MODE" in
  chat)
    exec "$NODE_BIN" "$SCRIPT_DIR/src/index.js" chat
    ;;
  exec|run)
    exec "$NODE_BIN" "$SCRIPT_DIR/src/index.js" "$@"
    ;;
  agent)
    exec "$NODE_BIN" "$SCRIPT_DIR/src/agent.js" "$@"
    ;;
  chat)
    exec "$NODE_BIN" "$SCRIPT_DIR/src/index.js" chat
    ;;
  *)
    echo "Usage: mind <command>"
    echo ""
    echo "Commands:"
    echo "  chat             Start interactive chat"
    echo "  exec <cmd>      Execute single command"
    echo "  agent <task>   Run autonomous agent"
    echo ""
    echo "Examples:"
    echo "  mind chat"
    echo "  mind exec status"
    echo "  mind exec wallet balance"
    echo "  mind agent deploy token contract"
    exit 1
    ;;
esac