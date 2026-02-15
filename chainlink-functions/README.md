# Chainlink Functions Sources

This folder contains JavaScript source variants sent to Chainlink Functions.

## Files

- `ai-analysis.js`: full source
- `ai-analysis-optimized.js`: size-optimized source
- `ai-analysis-minimal.js`: minimal version
- `ai-analysis-tiny.js`: smallest fallback

## Expected Args

All variants expect args:

- `args[0]`: user address
- `args[1]`: risk level (`0`, `1`, `2`)
- `args[2]`: esg priority (`true` or `false`)

## Return Format

Encoded values (in order):

1. `sentimentScore` (scaled by 100)
2. `volatilityScore` (0-100)
3. `riskScore` (0-100)
4. `esgScore` (0-100)
5. `recommendedAction` (`0..3`)

## Notes

- Keep source length under on-chain limit configured in `LinkForgeAI`.
- Prefer `frontend/lib/functionsSource.ts` as the runtime source entry point for the app.