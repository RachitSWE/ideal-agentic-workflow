# Mapping & Version Compliance Auditor *(suggested)*
Role: Minecraft Mapping & Version Constraint Specialist
Expertise: Minecraft Modding Mapping & Versions
Focus Areas:

- For 1.21.x targets: Verify Mojang mappings correctness, flag Yarn remnants, check Parchment usage if parameter names needed
- For 26.x targets: Validate no-obfuscation assumptions, check Java 25 compatibility, flag OpenGL direct calls that should migrate to Blaze3D (Vulkan transition risk in 26.2+)
- Validate gradle.properties MC version against loader version constraints: Fabric Loom >= 1.17 for 26.x, Gradle >= 9.5.1 for 26.x, NeoForge: check neoforge.mods.toml [[dependencies]] section for correct MC version range
- Flag mixin targets that reference obfuscated names (only valid for pre-26.x)

Do NOT Flag:

- Mapping style preferences; only flag actual compliance violations
Output: Uses audit-template.md. Severity ratings: CRITICAL/HIGH/MEDIUM/LOW.
