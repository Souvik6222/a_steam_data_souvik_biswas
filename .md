---
version: "neuform-staff-featured-2026-05-22"
name: "Lumina - Designing Clarity"
description: "Lumina Designing Background Effect is designed for delivering a visual treatment or immersive background effect. Key features include atmospheric visuals, motion depth, and flexible presentation layering. It is suitable for visual-first pages, motion studies, and atmospheric hero treatments."
colors:
  primary: "#E85D22"
  secondary: "#000000"
  accent: "#C98B5A"
  background: "#E85D22"
  surface: "#F8F4EC"
  text-primary: "#FFFFFF"
  text-secondary: "#A1A1AA"
  border: "#A8A19A"
typography:
  display-lg:
    fontFamily: "Instrument Sans"
    fontSize: "64px"
    fontWeight: 500
    lineHeight: "1.04"
    letterSpacing: "0"
  body-md:
    fontFamily: "Newsreader"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.6"
  label-md:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "1.2"
spacing:
  base: "8px"
  gap: "16px"
  card-padding: "24px"
  section-padding: "80px"
rounded:
  card: "8px"
  control: "8px"
  pill: "9999px"
components:
  card:
    background: "Use the surface token with subtle borders and HTML-matched shadow depth"
    radius: "Match the declared card radius token"
  button:
    background: "Use primary or accent colors for the main action"
    radius: "Use the control or pill radius based on the source HTML"
---
# Lumina - Designing Clarity
Source: Neuform staff featured templates. Author: Samnang Aing (@samnang). Views: 160; favorites: 6; remixes: 3.
Tags: background, animated, webgl, threejs, dither, effect.
## Overview
Lumina Designing Background Effect is designed for delivering a visual treatment or immersive background effect. Key features include atmospheric visuals, motion depth, and flexible presentation layering. It is suitable for visual-first pages, motion studies, and atmospheric hero treatments.

12 LUMINA — DESIGNING CLARITY Let's shape the future. Today . Your ideas. Our precision. Lasting value, by design. Begin a journey Consult with us Get in touch hello@lumina.io LUMINA SYS Crafting refined digital experie…
## Composition
Use the attached HTML reference as the source of truth. Preserve the visible hierarchy, first-screen composition, section rhythm, density, and interaction tone before adapting copy or content.
Key visible headings include: Let's shape the future. Today .; Company; Services; Resources; Let's connect.
## Colors
Anchor the palette in primary #E85D22, secondary #000000, accent #C98B5A, background #E85D22, surface #F8F4EC, text-primary #FFFFFF. Keep background, surface, text, and border roles distinct so generated layouts retain the same contrast pattern as the source.
## Typography
Use Instrument Sans for display moments and Newsreader for body copy unless the HTML clearly demands a compatible fallback. Labels and technical metadata should use JetBrains Mono or an equivalent mono face.
## Layout
Keep spacing deliberate and stable. Favor the same grid direction, max-width behavior, card density, and responsive stacking seen in the HTML. Do not replace distinctive source structures with generic SaaS sections.
## Components
Cards, buttons, badges, navigation, and repeated blocks should preserve the source geometry, border treatment, and hover feel.
## Motion
Preserve existing motion cues such as masked reveals, staggered entrance, hover lift, scroll-triggered transitions, and ambient movement. Keep easing smooth and restrained.
## WebGL & Effects

If the source includes canvas, WebGL, Three.js, gradients, particles, or atmospheric effects, rebuild them as supporting layers behind the content. Keep effects performant, responsive, and secondary to the interface.

## Guardrails
- Do not flatten the source into a generic card grid.
- Do not swap the color mode unless the source clearly supports it.
- Preserve the first viewport signal, focal object, and visual density.
- Keep buttons, cards, and badges aligned to the same radius and border language.