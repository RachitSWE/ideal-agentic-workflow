# Commit Examples Reference

## 1. Introduction and Purpose
This document provides the definitive repository of correctly formatted Git commit messages for the S10 Git Commit phase. 
Because autonomous agents frequently struggle with maintaining discipline in version control histories, these examples serve as mandatory structural templates.
Without this rigid reference, agents often generate monolithic commits with missing context, violating the project's formatting constraints.
By mimicking the successful patterns demonstrated below, the workflow guarantees that the commit history remains highly readable, easily searchable, and automation-friendly.
The agent MUST consult these examples before formatting any commit message during the execution of S10.
The agent MUST explicitly format its own commit messages to mirror the structure, tone, and character limits shown in the "Good Examples" section.
The agent MUST NOT replicate any of the flawed structures demonstrated in the "Bad Examples" section under any circumstances.
Failure to adhere to these formats will break release automation scripts and severely degrade the repository's auditability.

## 2. Good Examples (Allowed)
The following examples adhere to `ideal-agentic-workflow` v2.0 `AGENTS.md §5` constraints:
- Imperative Conventional Commit subject (`<type>(<scope>): <subject>`), lowercase type/scope prefix, target `<= 72` chars (`100` hard cap), preserve exact `PascalCase`/`camelCase` code identifiers, no trailing period.
- Mandatory blank line before body; concise 1–2 sentence body target `<= 150` chars (`180` hard cap), preserving exact code identifier casing, prefixed `atomic:` when a cohesive single file exceeds `150` LOC.

### 2.1 Standard Feature and Fix Commits
- `feat(auth): add UserRoleResolutionService scoped lookup`

  `Resolve designation display prefixes against matrix_designations IDs in UserRoleResolutionService to prevent 403 lockdowns.`
- `fix(rbac): restore parent toggle switch on ServersDashboardSection`

  `Enable top-level dashboard.servers switch in PermsVisualRbacEditor so individual server permissions evaluate properly.`
- `refactor(db): eliminate N+1 queries in ProductListingQuery`

  `Replace lazy per-row queries with eager join fetch inside ProductListingQuery; reduces catalog p50 latency.`
- `test(billing): add idempotency tests for StripeWebhookHandler`

  `Verify duplicate webhook deliveries do not double-charge accounts inside StripeWebhookHandlerTest.`
- `perf(ui): enable lazy decoding in MediaPreviewGrid`

  `atomic: Single MediaPreviewGrid component file exceeds 150 LOC due to cohesive async image decoding updates.`

## 3. Bad Examples (Forbidden)
The following examples violate `AGENTS.md §5` formatting or structural boundaries and must never be committed:
- `Fixed the bug` (Missing Conventional Commits `<type>(<scope>):` prefix, missing blank line, missing body, past tense).
- `feat: added new login page` (Past tense `"added"` instead of imperative `"add"`, missing blank line, missing body).
- `Feat(Auth): resolved issue.`
  `fixed RoleVerifyExecutor bug` (Uppercase `Feat(Auth)`, trailing period on subject; body omits rationale and exceeds limits if padded).
- `chore: update packages`
  `updated various packages across the entire repository to their latest versions to ensure we have all the newest features, security fixes, and documentation notes in one commit.` (Body exceeds hard `180` character limit).
- `feat: massive overhaul of the entire application architecture including the database, api gateway, and frontend dashboard views` (Subject exceeds `100` character hard limit).
