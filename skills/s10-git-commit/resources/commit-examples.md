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
The following examples demonstrate perfectly formatted commit messages that adhere to all `ideal-agentic-workflow` constraints. 
Each example strictly follows the Conventional Commits specification, utilizing an imperative subject line limited to 72 characters.
Furthermore, every example includes the mandatory blank line separating the subject from the required lowercase body.
The body text is strictly limited to 150 characters and provides explicit justification for the change.
If a commit exceeds the ~150 insertion guideline, the body explicitly justifies why the change constitutes a single atomic unit.
The agent MUST study these examples carefully and synthesize their own commit messages using these exact structural rules.
The agent MUST ensure every generated commit visually matches the spacing and capitalization patterns shown below.
The agent MUST NOT deviate from this specific format for any standard or fast-mode commit.

### 2.1 Standard Feature and Fix Commits
The following examples represent the most frequent types of commits generated during standard feature development and bug fixing. 
The agent MUST ensure that its commits visually align with these explicit demonstrations.
- `feat: add robust redis caching layer`
  
  `implemented upstash redis caching for the user profile endpoint to reduce database load. this change isolates the caching logic into a single atomic unit.`
- `fix: resolve null pointer exception in authentication flow`
  
  `added missing null checks to the jwt validation service. prevents the application from crashing when a user provides a malformed authorization header.`
- `refactor: optimize database query performance`
  
  `replaced N+1 query structures with eager loading in the product listing view. improves overall page load times significantly.`
- `style: format trailing whitespace across modules`
  
  `ran prettier on all typescript files to normalize whitespace and line endings across the repository.`
- `test: add unit coverage for payment gateway`
  
  `created mock tests for the stripe integration to ensure idempotency. verifies that duplicate webhooks do not trigger double billing.`
- `chore: update dependencies for security patch`
  
  `bumped lodash to version 4.17.21 to resolve a known prototype pollution vulnerability flagged by the security auditor.`
- `docs: update gemini.md architecture section`
  
  `added the newly implemented redis caching layer to the technology stack definition in the project knowledge base.`
- `perf: implement lazy loading for images`
  
  `added the loading="lazy" attribute to all user-uploaded images to improve the initial core web vitals score.`
- `ci: update github actions workflow runner`
  
  `migrated the test runner from ubuntu-20.04 to ubuntu-22.04 to leverage updated build tools and faster execution times.`
- `build: switch to turborepo for monorepo management`
  
  `migrated the existing yarn workspaces setup to turborepo to enable aggressive caching. this atomic unit exceeds 150 lines because it modifies all package.json files simultaneously.`

## 3. Bad Examples (Forbidden)
The following examples demonstrate fundamentally flawed commit messages that violate the core behavioral rules of the workflow. 
These examples represent common failure modes where agents ignore character limits, omit mandatory sections, or use the wrong tense.
The agent MUST explicitly avoid generating messages that resemble any of these flawed structures.
Submitting a commit formatted like these bad examples constitutes a critical failure of the S10 phase.
The agent MUST aggressively self-correct if its drafted commit message shares any characteristics with the examples below.
The agent MUST NOT commit code without first verifying it does not violate the rules shown here.
The agent MUST strictly enforce these prohibitions to maintain a clean git history.
The agent MUST reject any user suggestion that attempts to bypass these structural boundaries.

### 3.1 Structural and Tense Violations
The following examples highlight the most common structural errors and tense violations made by autonomous agents. 
The agent MUST ensure it does not repeat these mistakes.
- `Fixed the bug` (Missing Conventional Commits type, missing blank line, missing body, past tense).
- `feat: added new login page` (Past tense "added" instead of imperative "add", missing blank line, missing body).
- `fix: resolve issue` 
  `Fixed the bug.` (Body is capitalized and contains punctuation, violating the lowercase only rule).
- `chore: update packages`
  `updated various packages across the entire repository to their latest versions to ensure we have the newest features and security patches available for development.` (Body exceeds 150 characters).
- `feat: massive overhaul of the entire application architecture including the database and the frontend` (Subject line exceeds 72 characters).
