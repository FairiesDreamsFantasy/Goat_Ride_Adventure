# System Index Game_Boot Subsystem - Agents Directive

## Strict Anti-Pruning & System Architecture Lock
This module orchestrates BIOS Power-On Self-Test (POST) validation, memory checks, audio synthesizer wave-table scanning, graphics projection matrix readiness, and system boot staging.

### Directives:
- `index.tsx` must re-export `./General`.
- `General/index.tsx` must retain the complete `GameBootManager` implementation and `BootStatus` types.
- No deletions, pruning, simplifications, or stubbing permitted.
