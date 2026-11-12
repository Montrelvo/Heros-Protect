# Heroes Protect — Development Roadmap

## North star
The challenge is not whether the invulnerable hero survives; it is **whether the hero protects people responsibly**. The player begins powerful. Skill comes from navigation, awareness, triage, evidence, restraint and deliberate use of power.

## Prototype 01 — Babylon.js citywatch (implemented in src/game.js)
- Fixed seven-by-seven-block neighborhood with roads, parks, rooftops and recognizable central tower.
- Third-person camera, ground movement, jumping, directional flight, climb/descent and speed boost.
- Stylized original placeholder guardian, invulnerability (no health meter).
- Four scripted incidents: rooftop fire, rooftop rescue, runaway car and street debris.
- Cooling burst, rescue / stop / lifting interaction, strength shockwave.
- Mission beacons, tactical minimap, completion indicator, responsive touch controls.
- Pure JavaScript with CDN-loaded Babylon.js. No build tooling required.

**Manual acceptance checks**
1. BEGIN PATROL spawns on Northbridge Tower and shows the city.
2. F toggles flight. Space ascends; Ctrl/C descends; WASD steers, Shift boosts.
3. Player cannot lose health.
4. A fire responds to Q within range; civilian / car / debris respond to E within range; J can clear debris.
5. Completion updates progress from 0/4 through 4/4.
6. R restores the four incidents and returns to the central tower.
7. Touch controls allow equivalent patrol and actions.
8. Preview opens under a static localhost server and via GitHub Pages when configured.

## Prototype 02 — richer protection loop
- Dynamic citizens with pathfinding, actual schedules and personal needs.
- Emergencies with countdowns and consequences; injuries/city damage instead of hero HP.
- Mission dispatch, prioritization, carry/transport mechanics and emergency services.
- Real physics, breakable set pieces and explicit nonlethal strength limits.
- Audio, accessibility settings, saved patrol progress, and performance profiles.
- Pause and settings menu with remappable input.

## Prototype 03 — discoverable city
- Deterministic procedural seeds as an **option**, with a fixed canonical district retained for narrative missions.
- Street graph + parcel zoning + landmark placement + services + traversable rooftops.
- Save and share city seed. Guarantee mission reachability and valid flight corridors.
- Hierarchical activity layers: safe streets, emergencies, high-risk zones and story hubs.
- Stream distant districts; scale world without a huge draw-call penalty.

## Prototype 04 — powers and virtues
- Data-driven powers: speed, strength, aerial mobility, enhanced senses, engineering, gadgets, investigation.
- Multiple original archetypes: powerhouse; detective/inventor; speedster; adaptive/rescue specialist.
- Values system measures transparency, proportionality, civilian protection, due process and collateral harm.
- Different solutions to the same situation with mechanically meaningful tradeoffs.
- Ethical stakes should remain distinct from superficial good/evil meters.

## Portability: Godot and Babylon.js
- Babylon.js stays first playable implementation and browser deployment.
- Godot 4 can use the same **design**, mission data JSON, 3D assets (GLB) and map seeds.
- GDScript must reimplement controller, collisions, effects, events and rendering.
- Do not automatically port Unreal Blueprints/C++ or import proprietary content without authorization.
- Future project structure could separate engine-neutral JSON schemas from the Babylon implementation.
- For production, bundle a pinned Babylon.js package rather than rely on the project's learning/experiment CDN.

## IP and originality
Build original visuals, names, characters and narrative. Gameplay ideas such as flight, strength and invulnerability are usable as mechanical inspiration; renaming someone else's recognizable character is not a reliable way to clear IP issues.

## Recommended next small deliverable
Playtest flight/camera/navigation on desktop and Android; log any movement bugs. Only then add time-sensitive citizen incidents and a real consequence loop.
