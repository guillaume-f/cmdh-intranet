# Guardrails — PreToolUse hook (GitHub Copilot agent hooks, Windows). Blocks dangerous terminal commands.
# The tool call arrives as JSON on stdin. Only terminal tools are checked, so editing a doc
# that merely mentions a forbidden command is not blocked.
# Exit 2 blocks the tool call; stderr is fed back to the agent.

$ErrorActionPreference = 'Stop'

try { $payload = [Console]::In.ReadToEnd() } catch { $payload = '' }
if (-not $payload) { exit 0 }

# Known tool name that is not a terminal tool -> nothing to check.
$m = [regex]::Match($payload, '"tool_?[Nn]ame"\s*:\s*"([^"]*)"')
if ($m.Success -and $m.Groups[1].Value -notmatch '(?i)terminal|execute|shell|bash|command|run') { exit 0 }

$forbidden = @(
    # Destructive filesystem
    'rm\s+-rf\s+/',
    'rm\s+-rf\s+~',
    'rm\s+-rf\s+\*',
    'Remove-Item\s.*-Recurse.*\s[A-Za-z]:\\*\s*$',
    'Format-Volume',
    'mkfs\.',
    'dd\s+if=.*of=/dev/',
    'chmod\s+-R\s+777\s+/',
    ':\(\)\s*\{\s*:\|\s*:\s*&\s*\}\s*;\s*:',
    # Git history / work loss
    'git\s+push\s.*--force',
    'git\s+push\s.*\s-f(\s|$|")',
    'git\s+reset\s+--hard',
    'git\s+clean\s+-[a-zA-Z]*f',
    '--no-verify',
    # Humans merge: no push to the default branch, no PR merge
    'git\s+push[^|;&]*[\s:](main|master)([^A-Za-z0-9_./-]|$)',
    'gh\s+pr\s+merge',
    # Remote code execution
    'curl\s.*\|\s*(sudo\s+)?(bash|sh|zsh|powershell|pwsh)\b',
    'wget\s.*\|\s*(sudo\s+)?(bash|sh|zsh|powershell|pwsh)\b',
    '(iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\s.*\|\s*(iex|Invoke-Expression)\b'
)

foreach ($pattern in $forbidden) {
    if ($payload -match $pattern) {
        [Console]::Error.WriteLine("Guardrail tripped: command matches forbidden pattern /$pattern/. Refusing to execute.")
        exit 2
    }
}

exit 0
