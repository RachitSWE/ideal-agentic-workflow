# PRD: {{PROJECT_NAME}} — {{PROJECT_SUBTITLE}}
### Author: {{AUTHOR_NAME}} · Version {{VERSION}}

> **This document is the single source of truth for the project.**
> Nothing gets built that isn't in this document. Nothing in this document gets skipped.

---

## Table of Contents

The following table of contents provides quick navigation to the core sections of the PRD.
The agent MUST use this to quickly locate specific constraints.

1. [Project Identity & Philosophy](#1-project-identity--philosophy)
2. [Workflow Architecture](#2-workflow-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Open Features](#5-open-features)
6. [Anti-Patterns](#6-anti-patterns)

---

## 1. Project Identity & Philosophy

{{PROJECT_NAME}} is {{HIGH_LEVEL_DESCRIPTION_OF_PRODUCT_AND_TARGET_USERS}}.

### Core Philosophy & Operational Principles
- **{{PRINCIPLE_1_TITLE}}**: {{PRINCIPLE_1_EXPLANATION}}
- **{{PRINCIPLE_2_TITLE}}**: {{PRINCIPLE_2_EXPLANATION}}
- **{{PRINCIPLE_3_TITLE}}**: {{PRINCIPLE_3_EXPLANATION}}
- **{{PRINCIPLE_4_TITLE}}**: {{PRINCIPLE_4_EXPLANATION}}

---

## 2. Workflow Architecture

The {{PROJECT_NAME}} operates across {{N}} integrated functional workflows:

### 2.1 {{WORKFLOW_1_NAME}}
1. **Phase 1 — {{PHASE_1_TITLE}}**:
   - {{PHASE_1_STEP_A}}
   - {{PHASE_1_STEP_B}}
2. **Phase 2 — {{PHASE_2_TITLE}}**:
   - {{PHASE_2_STEP_A}}
   - {{PHASE_2_STEP_B}}

### 2.2 {{WORKFLOW_2_NAME}}
1. **{{SUB_WORKFLOW_1}}**:
   - {{DATA_FLOW_DESCRIPTION}}
2. **{{SUB_WORKFLOW_2}}**:
   - {{STATE_SYNCHRONIZATION_DESCRIPTION}}

---

## 3. Technology Stack

The agent MUST strictly adhere to the verified tools, frameworks, and protocol specifications:

### 3.1 {{SUBSYSTEM_1_NAME}} (e.g. Frontend Subsystem)
- **Core Framework**: {{FRAMEWORK_AND_EXACT_VERSION}}
- **UI Runtime**: {{RUNTIME_AND_VERSION}}
- **Language**: {{LANGUAGE_AND_VERSION}} (Strict mode, zero-any policy)
- **Styling & Layout**: {{STYLING_LIBRARIES}}
- **State & HTTP**: {{STATE_AND_HTTP_CLIENT}}

### 3.2 {{SUBSYSTEM_2_NAME}} (e.g. Backend Subsystem)
- **Enterprise Framework**: {{BACKEND_FRAMEWORK_AND_VERSION}}
- **Runtime & SDK**: {{SDK_RUNTIME_AND_VERSION}}
- **Build Orchestration**: {{BUILD_TOOL_AND_VERSION}}
- **Security & IAM**: {{SECURITY_FRAMEWORK}}
- **Persistence & ORM**: {{PERSISTENCE_LIBRARIES}}

### 3.3 Database & In-Memory Infrastructure
- **Relational Database**: {{PRIMARY_DATABASE}}
- **In-Memory Cache & Session Store**: {{CACHE_STORE}}
- *(Architectural Truth: Stale or unverified database frameworks must be explicitly eliminated from this stack)*

---

## 4. Directory Structure

The directory tree below reflects the exact max-depth tracked files in the repository. The agent MUST NOT modify files outside of these boundaries.
```text
{{ROOT_DIRECTORY}}/
  |-- {{SUBDIR_1}}/                       ← {{ONE_LINE_EXPLAINER_FOR_SUBDIR_1}}
  |   |-- {{NESTED_FILE_1}}               ← {{ONE_LINE_EXPLAINER_FOR_NESTED_FILE_1}}
  |   \-- {{NESTED_FILE_2}}               ← {{ONE_LINE_EXPLAINER_FOR_NESTED_FILE_2}}
  \-- {{ROOT_FILE_1}}                     ← {{ONE_LINE_EXPLAINER_FOR_ROOT_FILE_1}}
```

---

## 5. Open Features

The agent MUST read this during planning and update during S11:
- [ ] **FEAT-1**: {{FEATURE_1_TITLE}} — {{FEATURE_1_SPEC}}
- [ ] **FEAT-2**: {{FEATURE_2_TITLE}} — {{FEATURE_2_SPEC}}

---

## 6. Anti-Patterns

The CI/CD peer review pipeline and S6/S8 code review gates MUST reject any code violating these project-specific constraints:

1. **{{ANTI_PATTERN_1_TITLE}}**
   - *Violation*: {{EXACT_PROHIBITED_ACTION}}
   - *Consequence*: {{DIRECT_FAILURE_MODE_OR_RISK}}
   - *Mitigation*: {{MANDATORY_ARCHITECTURAL_RULE_OR_UTILITY}}

2. **{{ANTI_PATTERN_2_TITLE}}**
   - *Violation*: {{EXACT_PROHIBITED_ACTION}}
   - *Consequence*: {{DIRECT_FAILURE_MODE_OR_RISK}}
   - *Mitigation*: {{MANDATORY_ARCHITECTURAL_RULE_OR_UTILITY}}
