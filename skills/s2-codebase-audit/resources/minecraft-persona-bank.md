# Minecraft Persona Bank

## 1. Introduction and Purpose
This document defines the ordered repository of subagent personas used exclusively for auditing Minecraft modding projects (Fabric and NeoForge) during the S2 Codebase Audit phase. 
The `ideal-agentic-workflow` plugin relies on these definitions to enforce modding-specific constraints, such as registry timing, event bus targeting, and mixin safety. 
The S1 Orchestrator MUST read this list sequentially when spawning auditors.
Unlike standard web applications, Minecraft mods require specialized knowledge of the JVM, obfuscation mappings, and specific loader APIs.
These personas are explicitly designed to target those domain-specific challenges and MUST NOT be substituted with generic fullstack personas.
The definitions provided here act as the core instruction set for the subagents, dictating exactly what they should look for when analyzing the mod's codebase.
The agent MUST ensure that the persona definitions are passed verbatim to the `invoke_subagent` tool during the spawning phase.
Modifying or omitting parts of these definitions will result in broken mods and undetectable runtime crashes.

## 2. Persona Selection Logic
The order of the personas listed below strictly dictates their priority during subagent spawning based on the adaptive repository size tier. 
Maintaining this specific order ensures that critical mod compatibility and architectural concerns are prioritized over general test quality on smaller projects.
The agent MUST NOT shuffle or reorder this list under any circumstances.
If the agent fails to respect this logic, a Tier 1 project might skip critical mixin safety checks, leading to severe incompatibilities with other mods.
The agent MUST apply the following selection rules to determine which personas to activate from the list below.
- **Tier 1 (Small)**: The agent MUST spawn exactly the first 2 personas in this list.
- **Tier 2 (Medium)**: The agent MUST spawn exactly the first 4 personas in this list.
- **Tier 3 (Large) & Duolithic Mode**: The agent MUST spawn exactly all 5 personas in this list.

## 3. Ordered Persona Definitions
The following list defines the exact personas that must be instantiated for Minecraft projects. 
The agent MUST NOT deviate from this order or substitute these with web-focused personas.
Each persona has a highly specific domain of expertise tailored to the unique complexities of the Minecraft modding ecosystem.
By combining these distinct viewpoints, the workflow produces a holistic assessment that prevents common modding pitfalls.
The agent MUST supply these exact descriptions to the respective subagents when invoking them.
1. **Architecture Auditor**: Responsible for verifying strict client/server code isolation, event bus targeting (`MOD` vs `FORGE`), and ensuring registries are initialized in the correct phase.
2. **Mod Compatibility Auditor**: Responsible for evaluating Mixin safety (prohibiting `@Overwrite`), checking API stability, and verifying that dependency declarations in `fabric.mod.json` or `neoforge.mods.toml` are accurate.
3. **Game Performance Auditor**: Responsible for detecting lag-inducing logic in tick events, excessive object instantiation in render loops, and improper usage of chunk attachments that bloat save files.
4. **Mapping Compliance Auditor**: Responsible for verifying that the mod compiles against the correct mappings (e.g., strictly Mojang mappings for MC 26.x) and adheres to the version constraint matrix for Loom/Gradle/Java.
5. **Test Quality Auditor**: Responsible for evaluating the coverage of data generators (recipes, loot tables, models) and ensuring that core game mechanics are verifiable via automated test frameworks where possible.
