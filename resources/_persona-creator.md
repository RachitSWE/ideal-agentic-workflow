# Persona Extensibility Protocol

This document defines the strict procedure for adding a new audit or reviewer persona to the workflow. 
It MUST be strictly followed by the AI whenever the user requests a new subagent persona. 
Any deviation from this protocol will result in incomplete or malformed persona definitions that fail Antigravity engine validation.

---

## 1. Identify Domain Gap
1. The agent MUST identify an audit or review concern not covered by the existing 34 canonical subagents in `agents/`.
2. It MUST confirm the gap with the user before drafting the new persona.
3. The new persona MUST have a distinct focus area that does not overlap with existing agents.
4. The agent MUST clearly articulate why the new persona is necessary to the user and obtain explicit approval.

---

## 2. Draft the Persona Definition
The agent MUST format the new persona according to the modern Antigravity subagent specification:
- Must reside as a flat file in `agents/[persona-name].md` (lowercase, kebab-case).
- Must include valid YAML frontmatter declaring `name`, `description`, and the Golden 5-Tools (`view_file`, `write_to_file`, `grep_search`, `find_by_name`, `list_dir`).
- Must declare `## Write Scope Constraint` restricting file mutation tools exclusively to `.agents/session-[SHA]/`.
- Must declare domain checklist, anti-patterns to reject, and output schema.

### Required Modern Subagent Template
The following structure MUST be reproduced when authoring new subagents:

```markdown
---
name: [persona-name]
description: [Concise 1-2 sentence description of persona role, domain, and review responsibilities.]
tools:
  - view_file
  - write_to_file
  - grep_search
  - find_by_name
  - list_dir
---

# [Persona Display Name]

## Write Scope Constraint
You possess write_to_file EXCLUSIVELY to author your assigned report inside .agents/session-[SHA]/. You are strictly forbidden from modifying or creating files outside of .agents/.

## Domain & Stack Awareness
- **Target Technologies**: [Relevant stack technologies and frameworks]
- **Architectural Layer**: [Target layers, e.g., Persistence, Controllers, UI, Security]

## Review Checklist
- [Specific verifiable check 1]
- [Specific verifiable check 2]
- [Specific verifiable check 3]

## Anti-Patterns to Reject
- [Prohibited pattern 1]
- [Prohibited pattern 2]

## Output Schema
Write findings using `resources/audit-template.md` (or `resources/review-template.md` during S8) with ratings: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
```

---

## 3. Write and Register
1. The agent MUST write the new persona to `agents/[persona-name].md`.
2. It MUST update the appropriate persona bank or reviewer matrix:
   - For auditors: update `skills/s2-codebase-audit/resources/fullstack-persona-bank.md` or `minecraft-persona-bank.md`.
   - For reviewers: update `skills/s8-code-review/resources/task-reviewer-matrix.md`.
3. It MUST register the agent citation in `README.md` and verify with `node scripts/verify-file-citations.js`.

---

## 4. Obtain User Approval
1. Present the drafted persona file to the user for sign-off.
2. The user MUST have the opportunity to refine focus areas or constraints.
3. Once approved, the new persona is considered fully integrated and ready for execution.
