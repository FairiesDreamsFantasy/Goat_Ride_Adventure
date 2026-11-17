# System Security Anti-Bot Subsystem - Agents Directive

## Module Protection & Invariants
- `index.tsx` re-exports `./General`.
- Retains `AntiBotDetector` implementation including human behavioral entropy variance calculation, input timing registration, and rate evaluation.
- Pruning, stubbing, or mock simplifications are strictly forbidden.
