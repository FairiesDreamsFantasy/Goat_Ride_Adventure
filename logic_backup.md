# LOGIC BACKUP & ARCHITECTURAL SPECIFICATION

## Overview
Goat Ride Adventure is an advanced, scientifically-grounded 3D riding simulation and arcade game designed with forward-facing perspective projection, realistic goat gait physics, custom synthesized audio, master audio dynamics compression, and screen-reader accessibility.

## System Directory Architecture
- `src/System/Engine/`: Core game loop, collision detection, physics calculation, and narrator hooks.
- `src/System/AI/In-Game/Category/Pseudorandom_Functions/`:
  - `General/index.tsx`: Mulberry32 PRNG, Box-Muller Gaussian distribution, hash functions, and 1D smooth noise functions.
  - `Opponents/General/index.tsx`: Opponent AI trait profile generator, rubber-banding speed modifier, and reaction jitter.
  - `Opponents/index.tsx`: Arcade decision engine for opponent lane shifts, speed adjustments, and hurdle jumping.
- `src/Levels/`:
  - `General/index.tsx`: Mathematical configuration engine supporting 400 distinct levels, environment themes, spawn intervals, and path curve multipliers.
  - `Level_1/general/index.tsx`: Level 1 specific configuration module.
  - `Level_N/general/index.tsx`: Level N general configuration resolver.
  - `index.tsx`: Unified level configuration loader exporting `getLevelConfig(levelNumber: number)`.
- `src/System/Sound/`:
  - `Engine/`: Sound subsystem core with Master Dynamics Compressor to eliminate audio clipping spikes.
  - `BGM/`: Background music synthesizers and ambience managers.
  - `SFX/`: Multi-frequency audio synthesis, environmental acoustics, and obstacle panning.
  - `TTS/` & `services_tts/`: Screen reader announcement engines and multi-dialect voice configurations.
- `src/System/Visuals/`:
  - `Engine/`: Graphical rendering engine core.
  - `Renderer.ts`: Canvas 2D projection engine with pitch/yaw camera bobbing, path curvature, and lane offsets.
- `src/Logic/`:
  - `useGameEngine.ts`: Central game state machine and frame update loop integrated with PRNG opponent decisions and level configuration.

## View Layouts & Scrollbar Support
- **Landing Page (`src/components/LandingPage.tsx`):** Header, navigation, main game launch portal, and footer. Supports scroll bars (`overflow-y-auto`).
- **Rider Selection (`src/components/RiderSelectionScreen.tsx`):** Character browser with giant goat compatibility details. Supports scroll bars (`overflow-y-auto`).
- **Goat Selection (`src/Goat_Selection/GoatSelectionScreen.tsx`):** Goat breed selection matrix (16 breeds). Supports scroll bars (`overflow-y-auto`).
- **Play Area (`src/Play_Area/PlayAreaView.tsx`):** Focused canvas play area with no scroll bars (`overflow-hidden`).
