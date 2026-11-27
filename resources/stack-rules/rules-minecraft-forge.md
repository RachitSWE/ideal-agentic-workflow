# Critical Rules: Minecraft Modding (NeoForge & Forge)

This document defines the strict, non-negotiable architectural rules and invariants for projects modding Minecraft via NeoForge and Minecraft Forge.

---

## 1. Scope & Target Stack
- **Game Engine**: Minecraft 1.20.6+ / 1.21+ (Java 21 / 25 LTS runtime)
- **Mod Loader**: NeoForge 20.4+ / Forge 49+, ModDevGradle 1.0+
- **Mappings**: Official Mojang mappings + Parchment
- **Applicable Files**: `src/main/java/**/*.java`, `neoforge.mods.toml`, `*.mixins.json`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-FORGE-01: Mandatory `DeferredRegister` & `DeferredHolder` Pattern
- All game objects (Blocks, Items, Block Entities, Entities, Sounds, Creative Tabs) MUST be registered exclusively using `DeferredRegister` and `DeferredHolder` (or specialized `DeferredBlock`/`DeferredItem`).
- Direct static instantiation or registering outside the deferred lifecycle is strictly PROHIBITED.

### RULE-FORGE-02: Strict Event Bus Separation
- Mod lifecycle, registration, and data generation events MUST be subscribed strictly to the **MOD event bus** (`Bus.MOD` or `FMLJavaModLoadingContext.get().getModEventBus()`).
- In-game simulation and gameplay events (`ServerTickEvent`, player/entity events) MUST be subscribed strictly to the **GAME / NeoForge event bus** (`Bus.GAME` / `NeoForge.EVENT_BUS`).
- Mixing event buses causes silent event listener drops.

### RULE-FORGE-03: Physical Client Dist Guarding (`Dist.CLIENT`)
- Classes, methods, and event handlers referencing client-only classes (`Minecraft`, `Screen`, `ItemRenderer`, `SoundManager`) MUST be annotated with `@EventBusSubscriber(value = Dist.CLIENT)` and reside in dedicated client packages.
- Invoking client code on a dedicated server causes catastrophic `NoClassDefFoundError` crashes.

### RULE-FORGE-04: Mixin Conflict Safety & `@WrapOperation` Mandate
- Destructive `@Overwrite` in Mixin classes is strictly FORBIDDEN.
- Method call interceptions MUST use MixinExtras `@WrapOperation` and invoke `original.call(...)` to prevent conflicting with other mods. Legacy `@Redirect` is prohibited.

### RULE-FORGE-05: Mandatory Mixin Metadata Declaration
- All Mixin configuration JSON files in the project MUST be explicitly registered under `[[mixins]]` in `neoforge.mods.toml` (or `mods.toml`). Unregistered Mixin configs will fail to load silently.

### RULE-FORGE-06: Mandatory Runtime Game Bootstrap Smoke Gate (S7-B Gate)
- Mocked registries alone cannot satisfy S7 verification. Any changes modifying registries, network packets, or Mixins MUST execute an automated headless smoke test (`./gradlew runData` or server test) certifying clean registration and zero crash reports.
