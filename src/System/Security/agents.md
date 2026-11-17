# System Security Subsystem - Agents Directive

## Strict Non-Modification & Anti-Pruning Rule
This directory and all of its subdirectories (`General/`, `Anti-Bot/`, `Engine/`, and nested modules) are strictly protected against any automated or unauthorized alterations, refactoring, deletions, omissions, pruning, simplification, or stubbing.

### Invariants:
1. `index.tsx` must always re-export from `./General`.
2. `General/index.tsx` must maintain complete and unbroken exports for internal modules:
   - `../Anti-Bot`
   - `../Engine`
3. The Security & Anti-Bot protection layer mitigates scrapers, automated bot overloads, and DDoS rate surges.
4. No file or subfolder may be stripped, emptied, stubbed, or pruned under any circumstances.
