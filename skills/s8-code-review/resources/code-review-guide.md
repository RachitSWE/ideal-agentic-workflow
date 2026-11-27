# Code Review Guide

## 1. Introduction and Purpose
This document provides the definitive evaluation framework that all code reviewer subagents MUST utilize during the S8 Code Review phase. 
The code review phase is the final, uncompromising barrier preventing defective logic, architectural drift, and technical debt from merging into the target repository.
Unlike standard linters, the reviewer subagents are tasked with deep semantic analysis, evaluating whether the implementation truly fulfills the task requirements robustly.
By establishing these rigorous evaluation criteria, the workflow ensures that every line of code meets the high standards of a senior engineering team.
Reviewers MUST strictly evaluate the submitted code against these predefined dimensions rather than relying on subjective stylistic preferences.
Reviewers MUST immediately issue a `CHANGES_REQUESTED` status if any of the following constraints are violated, detailing the exact lines requiring modification.
Rubber-stamping bad code fundamentally compromises the Agentic Engineering philosophy and is strictly forbidden.
The reviewer MUST verify the implementation against the following core dimensions.

## 2. Review Dimensions
The following sub-sections define the precise technical areas that the code reviewer subagents MUST scrutinize. 
These dimensions represent the most common failure points where autonomous agents introduce bugs, security vulnerabilities, or brittle implementations.
Reviewers MUST approach the code with skepticism, hunting for flaws rather than assuming the original author's logic is sound.
If the reviewer cannot definitively prove that the code is correct, they MUST reject it and demand clarification or refactoring.
The reviewer MUST evaluate the code contextually, ensuring it aligns perfectly with the detected project persona loaded from the stack pack (e.g., fullstack web architecture versus minecraft modding paradigms).
A fullstack web feature requires different architectural considerations (like REST API security) than a Minecraft mod feature (like tick-rate performance).
The reviewer MUST rigorously assess the submitted diff against the following specific criteria.
The reviewer MUST reject the submission if any of these dimensions fail.

### 2.1 Anti-Pattern Verification
The reviewer MUST actively hunt for the four explicitly banned anti-patterns defined in the S6 Coding phase (AP-001 through AP-004). 
The reviewer MUST reject the code if it contains any simulation logic, mock data implementations, or placeholder text.
The reviewer MUST reject the code if it includes verbose, narrative comments that simply restate obvious logic flows.
The reviewer MUST reject the code if it contains any `TODO`, `FIXME`, or `PENDING` notes, demanding complete implementations.
The reviewer MUST reject the code if it utilizes compiler appeasement tactics like unauthorized `any` types or suppressed warnings.

### 2.2 Architectural Compliance
The reviewer MUST verify that the submitted implementation aligns perfectly with the established architectural guidelines of the repository. 
The reviewer MUST ensure the code does not introduce new structural paradigms, unauthorized third-party dependencies, or conflicting design patterns.
If the project follows a strict MVC pattern, the reviewer MUST reject logic that tightly couples database queries directly to view components.
The reviewer MUST verify that the specific constraints of the loaded stack pack (e.g., Next.js App Router rules) are strictly obeyed.
The reviewer MUST mandate a refactor if the code deviates from the established repository idioms.

### 2.3 Persona-Specific Logic Verification
The reviewer MUST evaluate the logic specifically through the lens of the project's designated persona (e.g., fullstack versus minecraft). 
For fullstack projects, the reviewer MUST prioritize verifying data sanitization, API security, and proper asynchronous state management.
For Minecraft projects, the reviewer MUST prioritize verifying tick-rate efficiency, memory management, and proper mixin implementation without conflicts.
The reviewer MUST ensure that the implementation is not just syntactically correct, but contextually robust for the target environment.
The reviewer MUST reject the code if it fails to account for these domain-specific vulnerabilities.

### 2.4 Platform & Domain Verification Tables

Reviewers MUST cross-reference changes against generic architecture checks plus any detected optional domain profile (such as `resources/stacks/discord-bot-customizer.md` for Discord bot / OpenType canvas compositor repos):

#### Frontend Architecture & Compositor Domain Checks
| Subsystem / Rule | Requirement & Detection Signal | Severity if Violated |
| :--- | :--- | :--- |
| **Single Routing Root** | Root `app/` and `src/app/` MUST NOT coexist. Root `app/` shadows `src/app/`, creating silent collision and rendering defects. Conflicting directories must be eliminated. | **CRITICAL** (`CHANGES_REQUESTED`) |
| **No Solo Typecheck** | `npx tsc --noEmit` validates types only, NOT runtime rendering. Every UI component task MUST include automated render/mount tests (React Testing Library / Vitest) or end-to-end verification. | **HIGH** (`CHANGES_REQUESTED`) |
| **No `localStorage` Fallback** | Production API clients (`lib/api.ts`) MUST NOT catch HTTP errors and silently return `localStorage` dummy payloads. Violates AP-001. Errors must propagate. | **CRITICAL** (`CHANGES_REQUESTED`) |
| **Revocation of Aesthetic Immunity** | Reviewers MUST reject UI clutter, developer test buttons, unhandled overflow, and decorative slop geometry outside the project's design system. Interactive drag canvases must expose clear focus/selection feedback and contrast $\ge 3:1$. | **HIGH** (`CHANGES_REQUESTED`) |
| **Mobile Pointer Parity** | Canvas and drag surfaces MUST declare `touch-action: pan-y` (or `none` for 2D canvases), standardize on W3C Pointer Events (`onPointerDown`), and require a 10px directional movement threshold before calling `e.preventDefault()`. | **HIGH** (`CHANGES_REQUESTED`) |
| **Optional Domain Profiles** | When `context.md` loads an optional profile (e.g., `resources/stacks/discord-bot-customizer.md` for `3,000ms` `deferReply()`, `/plugins`, `/api/welcomer/asset`, `#E92738` selection border, or `opentype.js` `>50KB` buffer parity), enforce that profile's full checklist. | **HIGH** (`CHANGES_REQUESTED`) |

---

## 3. Two-Round Review Circuit-Breaker Standard

To prevent infinite rejection cycles between orchestrators and reviewers, the review protocol enforces a strict **2-Round Circuit Breaker**:

1. **Round 1 (Initial Review)**:
   - Reviewer evaluates `submit(0).md`.
   - If defects are found, emit `CHANGES_REQUESTED` with explicit line-level findings and actionable remediation instructions.
2. **Round 2 (Re-evaluation)**:
   - Reviewer evaluates resubmitted fixes in `submit(1).md`.
   - If the implementation is verified, emit `LGTM`.
   - **Circuit Breaker Rule**: If unresolved defects remain on Round 2, the reviewer MUST NOT issue another open-ended rejection. The reviewer MUST EITHER:
     - **Option A (Exact Patch Diff)**: Provide the exact drop-in unified patch diff necessary for the author to achieve immediate `LGTM`.
     - **Option B (Operator Escalation)**: If an irreconcilable architectural impasse exists, set status to `CHANGES_REQUESTED (CIRCUIT_BREAKER_TRIPPED)` and escalate directly to the human operator for explicit guidance.

---

## 4. Execution-Backed Proof Filter (`skills/adversarial-review/SKILL.md`)

To prevent speculative theoretical noise from blocking valid implementations while catching real end-to-end failures:
1. **Behavioral Claims Require Live Proof**: When flagging a functional bug, permission bypass, serialization mismatch, or UI regression (outside deterministic static lint/scanner rules), reviewers (`agents/adversarial-falsifier-reviewer.md`) MUST include the exact failing command/test output against the code under review.
2. **Drop Unverified Speculation**: Concerns that cannot be reproduced, stylistic naming preferences, and "what-if" scenarios requiring unrelated future edits MUST be dropped from `CHANGES_REQUESTED` findings and summarized only in the Dropped table.
3. **Attack Callers & End-to-End Integration**: Reviewers check downstream readers/writers (e.g., UI format written vs backend parser format read, parent toggle gates vs child switches) rather than rubber-stamping isolated unit mocks (`EP-06`, `EP-10`).
