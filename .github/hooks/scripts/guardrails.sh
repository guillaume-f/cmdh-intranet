#!/usr/bin/env bash
# Guardrails — PreToolUse hook (GitHub Copilot agent hooks). Blocks dangerous terminal commands.
# The tool call arrives as JSON on stdin. Only terminal tools are checked, so editing a doc
# that merely mentions a forbidden command is not blocked.
# Exit 2 blocks the tool call; stderr is fed back to the agent.

set -eu

payload="$(cat 2>/dev/null || true)"
[ -z "${payload}" ] && exit 0

# Known tool name that is not a terminal tool → nothing to check.
tool="$(printf '%s' "${payload}" | grep -Eo '"tool_?[Nn]ame"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n1 | sed -E 's/.*"([^"]*)"$/\1/' || true)"
if [ -n "${tool}" ] && ! printf '%s' "${tool}" | grep -Eqi 'terminal|execute|shell|bash|command|run'; then
    exit 0
fi

forbidden=(
    # Destructive filesystem
    'rm[[:space:]]+-rf[[:space:]]+/'
    'rm[[:space:]]+-rf[[:space:]]+~'
    'rm[[:space:]]+-rf[[:space:]]+\*'
    'mkfs\.'
    'dd[[:space:]]+if=.*of=/dev/'
    'chmod[[:space:]]+-R[[:space:]]+777[[:space:]]+/'
    ':\(\)[[:space:]]*\{[[:space:]]*:\|[[:space:]]*:[[:space:]]*&[[:space:]]*\}[[:space:]]*;[[:space:]]*:'
    # Git history / work loss
    'git[[:space:]]+push[[:space:]].*--force'
    'git[[:space:]]+push[[:space:]].*[[:space:]]-f([[:space:]]|$)'
    'git[[:space:]]+reset[[:space:]]+--hard'
    'git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f'
    '--no-verify'
    # Humans merge: no push to the default branch, no PR merge
    'git[[:space:]]+push[^|;&]*[[:space:]:](main|master)([^A-Za-z0-9_./-]|$)'
    'gh[[:space:]]+pr[[:space:]]+merge'
    # Remote code execution
    'curl[[:space:]].*\|[[:space:]]*(sudo[[:space:]]+)?(bash|sh|zsh)'
    'wget[[:space:]].*\|[[:space:]]*(sudo[[:space:]]+)?(bash|sh|zsh)'
)

for pattern in "${forbidden[@]}"; do
    if printf '%s' "${payload}" | grep -Eq -e "${pattern}"; then
        echo "🛑 Guardrail tripped: command matches forbidden pattern /${pattern}/. Refusing to execute." >&2
        exit 2
    fi
done

exit 0
