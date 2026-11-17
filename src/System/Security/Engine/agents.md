# System Security Engine Subsystem - Agents Directive

## Module Protection & Invariants
- `index.tsx` re-exports `./General`.
- Retains `SecurityEngineManager` managing the inbound execution firewall, anti-DDoS throttling buffers, and threat telemetry monitoring.
- Pruning, stubbing, or removal is strictly forbidden.
