# AeroDark Intelligence — Stitch Design System Specification

## Overview
AeroWatch uses the **AeroDark Intelligence Design System**, inspired by the Stitch UI/UX design paradigm for high-stakes operational command-and-control interfaces.

## 1. Color Palette
- **Background**: `#111318` (Deep Void)
- **Surface Panels**: `#1e2024` (Radar Dark)
- **High Elevation**: `#282a2e` (Console Surface)
- **Primary Cyber Glow**: `#00f0ff` (Electric Cyan)
- **Secondary Atmospheric Accent**: `#7000ff` (Stratosphere Purple)
- **Text / Foregrounds**:
  - Primary: `#e2e2e8`
  - Variant: `#b9cacb`
  - Muted: `#849495`
  - Borders: `#3b494b`

### Meteorological Severity Scale
- **Severe**: `#ff4444` (Critical Alert / Red Pulse)
- **High**: `#ff8800` (High Hazard / Orange)
- **Elevated**: `#ffcc00` (Elevated Warning / Amber)
- **Moderate**: `#44aaff` (Advisory / Azure)
- **Low / Normal**: `#00dbe9` (Baseline / Cyan)

## 2. Typography
- **Monospace Telemetry**: `JetBrains Mono` (used for all numeric readings, lat/lon coordinates, risk scores, timestep tags)
- **Body & Headings**: `Geist` (clean geometric sans-serif for high legibility on dark displays)
- **Icons**: Google `Material Symbols Outlined`

## 3. Visual Language Elements
- **Scanlines**: Subtle CSS repeating horizontal line overlay simulating CRT radar monitors
- **HUD Bracket Corners**: Technical corner demarcations for panels and cards
- **Pulse Indicators**: Multi-tier animated halos on map markers representing spatio-temporal risk intensity
- **Glassmorphism**: Translucent backdrop-filtered panels with subtle cyan-tinted borders
