# SP4 Spec Review Guide for Reviewer Subagents

## 1. Overview
This guide provides the evaluation standards and rubric for subagents reviewing feature specifications during the SP4 Spec Review phase.
Reviewers MUST rigorously audit the submission payload in `.agents/specs/session-[SHA]/code-review/submit/submit(n).md`.

---

## 2. Reviewer Persona Mandates

### 1. `spec-system-architect-reviewer`
- Scrutinizes architectural fit, domain layer boundaries, and stack compliance.
- Ensures YAGNI and DRY principles are respected.
- Rejects unnecessary complexity or premature microservices.

### 2. `spec-security-edgecase-reviewer`
- Scrutinizes OWASP Top 10 vulnerabilities, auth/tenant boundaries, and input validation schemas.
- Audits concurrency hazards, optimistic locking requirements, and race conditions.
- Identifies unhandled edge cases (empty lists, timeouts, duplicate requests).

### 3. `spec-testability-scale-reviewer`
- Scrutinizes test plans for concrete failing/passing test code blocks.
- Ensures test commands match the stack and target domain classes.
- Audits database indexing, sequence allocation, N+1 query traps, and pagination bounds.

---

## 3. Strict Verdict Criteria
A reviewer subagent MUST emit one of two unambiguous verdicts:

### `LGTM` (Looks Good To Me)
- Emitted ONLY when the specification satisfies 100% of the checklist items.
- No blocking defects, missing file paths, or hand-waving placeholders exist.

### `CHANGES_REQUESTED`
- Emitted if ANY flaw, placeholder, missing test code, unindexed query, or security loophole is found.
- The review MUST cite:
  1. The exact section and line number in the spec.
  2. The nature of the flaw.
  3. Actionable, concrete remediation steps.
