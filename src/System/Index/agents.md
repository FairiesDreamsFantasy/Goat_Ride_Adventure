# System Index Subsystem - Agents Directive

## Strict Non-Modification & Anti-Pruning Rule
This directory and all of its subdirectories (`General/`, `Engine/`, `Game_Boot/`, and nested modules) are strictly protected against any automated or unauthorized alterations, refactoring, deletions, omissions, pruning, simplification, or stubbing.

### Invariants:
1. `index.tsx` must always re-export from `./General`.
2. `General/index.tsx` must maintain complete and unbroken exports for all internal and parent system registries:
   - `../Engine`
   - `../Game_Boot`
   - `../../Hardware_Virtualization`
   - `../../Engine`
   - `../../AI`
   - `../../Building_Blocks`
   - `../../Items`
   - `../../Sound`
   - `../../Visuals`
   - `../../Controllers`
   - `../../UI`
3. No file or subfolder may be stripped, emptied, stubbed, or pruned.
