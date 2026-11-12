# Heroes Protect

An original superhero sandbox prototype built with **Babylon.js** for desktop and mobile browsers. Begin on a rooftop overlooking a fixed, explorable city. The protagonist is invulnerable, can fly, move at super speed, perform a nonlethal strength burst, and protect people during city incidents.

> **Prototype status:** initial playable vertical slice. Everything in the scene is procedural geometry—there are no borrowed Superman, Batman, or game assets. The city layout is fixed for this build. This repository is **public**.

## Play

Once GitHub Pages is enabled under **Settings → Pages → Build and deployment → GitHub Actions**, the prototype can run at:

https://montrelvo.github.io/Heros-Protect/

Or run locally using any static file server:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Babylon.js is currently loaded from the official development CDN; move to a pinned npm dependency / self-hosted bundle for production.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | W/A/S/D or arrow keys | Left directional pad |
| Look around | Move mouse (click scene to lock pointer) | Drag empty area of scene |
| Toggle flight | F | FLY |
| Ascend while flying / jump | Space | UP |
| Descend while flying | Control or C | DOWN |
| Boost | Shift | BOOST |
| Interact / rescue / stop vehicle | E | HELP |
| Cold-breath burst (fires) | Q | COOL |
| Strength shockwave | J or left mouse click | PULSE |
| Restart incidents | R | Reset in menu |
| Release pointer | Escape | — |

## First gameplay loop

1. Spawn atop the central tower and survey the city.
2. Locate four clearly marked incidents using the in-world signals, HUD, and minimap.
3. Reach an incident using walking, jumping, or unrestricted flight.
4. Respond with an appropriate ability: cool a rooftop fire, rescue a stranded civilian, halt a runaway vehicle, or clear fallen debris.
5. Complete all incidents to secure the district. The hero has no health bar: the challenge is **what you protect**, not whether the hero survives.

## Structure

- `index.html` — browser entrypoint, accessible controls and HUD.
- `styles.css` — responsive presentation and touch controls.
- `src/game.js` — fixed city layout, third-person controls, flight, interactions, mission system and minimap.
- `docs/ROADMAP.md` — concrete expansion plan covering deterministic procedural layouts and new heroic archetypes.
- `.github/workflows/pages.yml` — static GitHub Pages workflow (requires selecting GitHub Actions as Pages source).

## Engine direction

**Babylon.js is the first implementation.** Godot remains a supported future port. Reuse data definitions, GLB assets, mission designs, balance constants and visual references, while translating engine-dependent physics, rendering and controller code. Unreal assets should only be imported where their use and redistribution are authorized.

## Rights and attribution

The code and original generated geometry here are independently authored for this prototype. `Babylon.js` is a third-party engine distributed under Apache 2.0. No third-party game source or copyrighted superhero character designs have been copied. For now, this project has no explicit license for its own code; repository visibility does **not** automatically grant others rights to reuse it.

## Known limits

- This is not yet a fully simulated civilian ecosystem; incidents are scripted.
- Flight collision and building contact are intentionally simple.
- No persistence, multiplayer, sophisticated AI, authored meshes, quests or random city generation yet.
- GitHub Pages may require one-time repository settings before the live URL works.
