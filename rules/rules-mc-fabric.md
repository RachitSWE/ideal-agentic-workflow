# Critical Rules: Minecraft Fabric Modding

This document defines the strict, non-negotiable architectural rules and invariants for projects developing Minecraft mods using Fabric Loom.

---

## 1. Scope & Target Stack
- **Loader**: Fabric Loom (MC 1.21.x / 26.x)
- **Mappings**: Yarn (1.21.x only) / Mojang Mappings (1.21.x and 26.x mandatory)
- **Applicable Files**: `src/main/java/**/*.java`, `src/main/resources/fabric.mod.json`, `build.gradle`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-FABRIC-01: Absolute Physical Client/Server Isolation
- Client-only classes (`net.minecraft.client.*`, `Screen`, `KeyBinding`, `Renderer`) MUST NEVER be referenced or imported in `ModInitializer` or common gameplay logic.
- Client logic MUST live exclusively in `ClientModInitializer`.
- Server logic MUST live in `DedicatedServerModInitializer`.
- Violating this boundary causes instant `ClassNotFoundException` crashes when the mod is deployed to a dedicated server.

### RULE-FABRIC-02: Zero `@Overwrite` Mixins
- Mixin classes MUST NEVER use `@Overwrite` to replace vanilla Minecraft methods.
- Modders MUST use non-destructive hooks: `@Inject` (with `cancellable = true`), `@ModifyVariable`, `@ModifyReturnValue`, or `@WrapOperation`.

### RULE-FABRIC-03: Synchronous Registration Timing
- All game objects (Items, Blocks, Entities, ScreenHandlers, SoundEvents) MUST be registered synchronously inside `ModInitializer.onInitialize()`.
- Registering objects during world loading or tick events is strictly FORBIDDEN.

### RULE-FABRIC-04: Strict Version Mappings Alignment
- Yarn mappings are FORBIDDEN on MC 26.x+; Mojang mappings MUST be used.
- For MC 26.2+, legacy raw OpenGL calls (`GL11.*`) are FORBIDDEN; use Blaze3D / Vulkan-compatible matrix rendering pipelines.

### RULE-FABRIC-05: 20 TPS Tick Rate Discipline
- Never perform blocking file I/O, synchronous network requests, or unbounded loops inside tick listeners (`ServerTickEvents`).
- All background tasks must be dispatched to worker thread pools and synchronized back via `server.execute(...)`.
