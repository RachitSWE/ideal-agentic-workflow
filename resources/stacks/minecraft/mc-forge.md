# Stack Pack: Minecraft Modding (NeoForge & Forge)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Minecraft modding applications built on NeoForge and Minecraft Forge, ModDevGradle, and Mojang/Parchment mappings.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Minecraft | 1.20.6+ / 1.21+ (Recommended 1.21.x+) | Java 21 LTS (or Java 25 LTS) | Java < 21 |
| NeoForge / Forge | NeoForge 21.0+ / Forge 50+ | `net.neoforged:neoforge` | Fabric Loader directly |
| Build Tool | ModDevGradle 1.0+ or ForgeGradle 6+ | Gradle 8.8+ | Gradle < 8.5 |
| Mappings | Mojang Official + Parchment | ParchmentMC parameter mappings | Deobfuscated runtime without mapping layers |
| Java Runtime | Java 21 LTS (Recommended 25 LTS) | Eclipse Adoptium / Temurin 21/25 | Java <= 17 on MC 1.20.5+ |

## 2. Architecture Rules
These rules define the registry architectures, event bus boundaries, physical dist isolation, and tick performance governance for NeoForge and Forge mods.

- **Mandatory `DeferredRegister` Pattern**: All game objects (Items, Blocks, Block Entities, Entities, Sound Events, Creative Tabs) MUST be registered exclusively using `DeferredRegister` and `DeferredHolder` (or `RegistryObject` in legacy Forge). Direct synchronous instantiation or manual registry manipulation is strictly PROHIBITED.
- **Event Bus Separation Discipline**: Mod lifecycle events (`FMLCommonSetupEvent`, registration events, creative tab populating) MUST be subscribed strictly to the **MOD event bus** (`FMLJavaModLoadingContext.get().getModEventBus()` or `@EventBusSubscriber(bus = Bus.MOD)`). In-game runtime events (`ServerTickEvent`, `PlayerInteractEvent`, `EntityJoinLevelEvent`) MUST be subscribed to the **GAME / NeoForge event bus**. Mixing buses causes silent listener drops.
- **Physical Client Dist Isolation (`Dist.CLIENT`)**: Classes, methods, and event subscribers referencing client classes (`Minecraft`, `Screen`, `EntityRenderer`) MUST be strictly quarantined to the client distribution (`@EventBusSubscriber(value = Dist.CLIENT)` or client setup classes). Invoking client code on a dedicated server causes catastrophic `NoClassDefFoundError` crashes.
- **Namespace & Registry Key Collision Safety**: All registry keys and resource locations MUST use the mod's lowercase namespace ID (`mod_id:object_name`). Using the vanilla `minecraft` namespace or hardcoding unvalidated strings is prohibited.
- **20 TPS Tick Rate Performance & Memory Discipline**: Ticking block entities (`BlockEntityTicker`) and tick event listeners MUST NOT allocate excessive temporary objects or perform blocking I/O, maintaining full 20 TPS tick rate stability.
- **Mandatory Runtime Game Bootstrap Smoke Gate (S7-B Gate)**: Unit tests with mocked registries alone CANNOT satisfy S7 verification. Any changes modifying registries, network payloads, or capabilities MUST execute an automated runtime headless smoke test (`./gradlew runData` or headless server launch) verifying clean registration and zero crash reports.

## 3. Common Anti-Patterns

#### AP-FORGE-01: Cross-Bus Event Subscription
**What it is**: Registering a game event listener (e.g. `ServerTickEvent`) on the MOD event bus, or registering setup lifecycle events on the GAME event bus.
**Detection signal**: `@SubscribeEvent` on an event bus with the incorrect `Bus` parameter.
**Consequence**: The event listener is never invoked by the event dispatcher, leading to silent feature failure without error logs.
**Correct alternative**: Target lifecycle events to `Bus.MOD` and gameplay events to `Bus.GAME` (or `NeoForge.EVENT_BUS`).

#### AP-FORGE-02: Direct Instantiation Bypassing `DeferredRegister`
**What it is**: Instantiating game objects directly outside the deferred registration lifecycle.
**Detection signal**: `public static final Item MY_ITEM = new Item(...)` without `DeferredRegister.register(...)`.
**Consequence**: Objects fail to register into Forge registries, resulting in missing textures, unregistered IDs, and runtime game crashes.
**Correct alternative**: Use `public static final DeferredHolder<Item, Item> MY_ITEM = ITEMS.register("my_item", () -> new Item(...));`.

#### AP-FORGE-03: Physical Client Crash on Dedicated Server
**What it is**: Referencing client-only classes in common mod initialization or packet handling.
**Detection signal**: Importing `net.minecraft.client.*` inside common service or block entity classes.
**Consequence**: Immediate dedicated server crash on startup with `ClassNotFoundException` / `NoClassDefFoundError`.
**Correct alternative**: Separate client logic into dedicated client event subscriber classes gated by `Dist.CLIENT`.

## 4. Audit Checklist
- [ ] All registry objects use `DeferredRegister` and `DeferredHolder`.
- [ ] Events are accurately mapped to MOD bus vs GAME / NeoForge bus.
- [ ] Client code is isolated with `Dist.CLIENT` guards and client-only event subscribers.
- [ ] Resource locations strictly use the mod's dedicated namespace ID.
- [ ] Block entity tick methods avoid blocking I/O and excessive object allocations.
- [ ] Real headless bootstrap smoke test (`runData` or server test) passes green without errors (S7-B Gate).

## 5. Useful References
- [NeoForge Official Documentation](https://docs.neoforged.net/)
- [Minecraft Forge Documentation](https://docs.minecraftforge.net/)
- [Parchment Mappings Project](https://parchmentmc.org/)
