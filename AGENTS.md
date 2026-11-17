# Game Feature Persistence Instructions

## Audio & Sound Systems
- **Ambient Sounds:** Maintain the "Overwhelming Ambient" system in `useGameEngine.ts`. It triggers multiple oscillators periodically to create a rich, emulated soundscape.
- **Rhythm-based Gallop:** Ensure the gallop timing is tied to the goat's size/type for scientific precision. Use equine-inspired dual-thump "clops".
- **Environmental Reverberation:** Implement acoustics for Cave, Forest (Jungle), Mountain, and City using `SFXManager.setEnvironment`.
- **Audio Panning:** Obstacles must use spatial audio (panning) as they approach to aid non-visual players.

## Accessibility (Screen Reader)
- **On-Demand Info:** Maintain the "B", "A", "W", and "C" keys for game state announcements.
- **Score Announcements:** Announce point gains (e.g., "[10] points") immediately upon clearing an obstacle.
- **Discrete Actions:** Do NOT announce standard repetitive actions like "Jump" to prevent auditory clutter.

## POV & Rendering
- **Forward-Facing POV:** The camera is fixed to the rider's perspective on the goat's back, including neck and head bobbing animations calculated via gait rhythmic frequencies.
- **Path Curvature:** Use mathematical offsets (sine-base) for curved paths at higher levels.
- **Lane-Based Straffing:** Implement 8 distinct lanes for horizontal movement using Arrow keys.
- **Progression:** Support up to 400 levels with unique environments like Nebula Plains and Cyber City.

## Gameplay & Controls
- **Pause/Resume:** Use "Shift+7" to toggle the game state.
- **Opponent Scans:** "O" key in primary layout announces nearby opponents (if implemented).
- **Goat Selection:** Dedicated selection screen with 16 unique goats, each with distinct scientific dimensions and personalities.

## Core Virtualization & System Architecture
- **Hardware Virtualization:** Maintain the `Hardware_Virtualization` subsystem (including `CPU`, `RAM`, `Video_Card`, `Sound_Card`, and `GPU` modules) under `src/System/Hardware_Virtualization/`.
- **System Engines & Core:** Maintain `src/System/Engine/` for cycle executors, clocks, and orchestration tasks.
  - **Mathematics Engine:** Keep the high-precision 3D/2D vector space mechanics and sine-base curve generators inside `src/System/Engine/Mathematics/`.
  - **Science Sub-Engine:** Keep the Graphical Renderer camera projections and kinematic/collision Physics checks inside `src/System/Engine/Science/`.
  - **Input Engine:** Ensure key states and multi-lane calculations remain intact under `src/System/Engine/Input/`.
- **Index & Controller Registry:** Retain the unified `Index/` (including `Index/index.tsx`, `Index/General/`, `Index/Engine/`, `Index/Engine/General/`, `Index/Game_Boot/`, `Index/Game_Boot/General/` with Power-On Self-Tests) and the `Controllers/` keyboard and gamepad layout structures under `src/System/` at all costs. Pruning, deletions, omissions, simplifications, or stubbing of any index or configuration file is strictly forbidden.
- **Security & Anti-Bot Subsystem:** Retain `src/System/Security/` (`Security/index.tsx`, `Security/General/`, `Security/Anti-Bot/`, `Security/Anti-Bot/General/`, `Security/Engine/`, `Security/Engine/General/`). Protect input entropy detection, scraper mitigation, and anti-DDoS rate buffers against pruning or refactoring.
- **UI & Core Views:** Retain centralized views including `Play_Area/` and `Goat_Selection/` inside `src/System/UI/` and centralized core elements under `src/System/components/`. Unauthorized automated refactoring, relocation, or stripping of these folders is strictly forbidden.
- **Advanced Visual Pipelines:** Protect and retain the expanded sub-engine directories inside `src/System/Visuals/`:
  - `Animations/` (2-D, Polygons, Pixelations configurations)
  - `3-D/` (Vertex buffers and model normal vectors)
  - `Color_Palette/` (Monochrome profile settings)
  - `Resolution/` (Supporting SD, HD, Low, Medium, High, Very_High, Ultra-High, 2K, 4K, 8K, 16K, 32K, 64K, 128K, 256K, 512K, 1024K, 2048K, 4096K, 8192K, Very_Low, and Ultra-Low profile grids)
  - `Engine/` (The independent graphics pipeline and frame buffers)

