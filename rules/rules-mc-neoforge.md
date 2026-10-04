# Critical Rules: Minecraft NeoForge Modding

This document defines the strict, non-negotiable architectural rules and invariants for projects developing Minecraft mods using NeoForge.

---

## 1. Scope & Target Stack
- **Loader**: NeoForge (MC 1.21.x / 26.x)
- **Language**: Modern Java (21 / 25)
- **Applicable Files**: `src/main/java/**/*.java`, `src/main/resources/META-INF/neoforge.mods.toml`, `build.gradle`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-NEOFORGE-01: DeferredRegister Exclusivity
- All Blocks, Items, Entities, and CreativeTabs MUST be declared and registered using the `DeferredRegister` pattern.
- Static direct instantiation of game objects without `DeferredRegister` is strictly FORBIDDEN.

### RULE-NEOFORGE-02: Precise Event Bus Targeting
- Registration and lifecycle setup listeners MUST target `Bus.MOD` (`@EventBusSubscriber(bus = Bus.MOD)`).
- Runtime gameplay listeners (ticks, player interaction, world loads) MUST target `Bus.FORGE` (`@EventBusSubscriber(bus = Bus.FORGE)`).
- Mismatched bus targets cause event listeners to silently fail to trigger.

### RULE-NEOFORGE-03: Physical Client Isolation
- Event subscribers and rendering code that touches client-only classes MUST be explicitly guarded with `value = Dist.CLIENT` in `@EventBusSubscriber(value = Dist.CLIENT)`.
- Never load or reference client classes on dedicated server environments.

### RULE-NEOFORGE-04: Mandatory Mixin Registration in Metadata
- Any Mixin configuration JSON file MUST be explicitly declared in `neoforge.mods.toml` under `[[mixins]]`:
  ```toml
  [[mixins]]
  config = "modid.mixins.json"
  ```
- Undeclared mixin configurations silently fail to inject at runtime.

### RULE-NEOFORGE-05: Mod ID Parity
- The mod ID string passed to `@Mod("modid")` MUST exactly match the `modId` in `neoforge.mods.toml` and resource directories, using lowercase alphanumeric characters with no dashes or spaces.
