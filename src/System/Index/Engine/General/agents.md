# System Index Engine General - Agents Directive

## Module Protection & Invariants
- Retains `IntegratedSystemEngineRegistry` wiring together `EmulationCoreEngine`, `VectorMath`, `CurvatureEngine`, `PhysicsCalculator`, and `InputEngine`.
- Deletions, pruning, or stubbing of these integrations is strictly prohibited.
