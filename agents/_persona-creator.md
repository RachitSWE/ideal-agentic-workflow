# Persona Extensibility Protocol

This document defines the strict procedure for adding a new audit persona to the workflow. 
It MUST be strictly followed by the AI whenever the user requests a new subagent persona. 
Any deviation from this protocol will result in incomplete or malformed persona definitions.
The agent MUST prioritize accuracy and strict adherence to the templated format.
Failure to follow these rules will corrupt the inter-agent communication channels.
The integrity of the peer review workflow depends on consistent persona boundaries.
We MUST enforce these rules rigorously to prevent architectural decay.
The CI/CD pipeline will validate these definitions during execution.

Precondition: The user has identified a valid audit concern and requested a new subagent persona.

## 1. Identify Domain Gap
The agent MUST identify an audit concern not covered by the existing 5 personas in the specified domain. 
It MUST confirm the gap with the user before drafting the new persona.
The new persona MUST have a distinct focus area that does not overlap with existing agents.
We MUST prevent redundancy to keep the audit phase efficient.
This step requires careful analysis of the existing persona bank prior to proposing a new agent.
The agent MUST clearly articulate why the new persona is necessary to the user.
Without explicit user approval, the agent MUST NOT proceed to drafting.
This ensures the agent does not unilaterally expand the scope of the workflow.

## 2. Draft the Persona Definition
The agent MUST define the role title, expertise domain, focus areas, and do-NOT-flag list. 
It MUST format the new persona according to the structure defined in PRD Section 14.2.
The agent MUST NOT use markdown bolding for the section keys to adhere to the strict plaintext template.
It MUST ensure the output format explicitly references `audit-template.md`.
The drafted file MUST be saved with the `.md` extension in the correct subdirectory.
The agent MUST verify the focus areas are specific and actionable, not generic.
We MUST ensure the do-NOT-flag list explicitly prevents common false positives.
This precision is required to keep the subagent from generating excessive noise.

### Required Persona Template
The following structure MUST be used for the new persona definition. 
It MUST be reproduced exactly as shown below, without any unauthorized prologues or extra descriptive text.

```markdown
# [Persona Name] Auditor
Role: [Job title]
Expertise: [Domain]
Stack awareness: [Relevant stack technologies, if any]
Focus Areas: 

- [Bulleted list — specific, not generic]

Do NOT Flag: 

- [Common false positives to ignore]
Output: Uses audit-template.md. Severity ratings: CRITICAL/HIGH/MEDIUM/LOW.
```
The agent MUST observe that the template strictly uses plaintext keys like `Role:` without markdown formatting.
It MUST ensure that no descriptive narrative sentences are added before the bulleted lists.

## 3. Write and Register
The agent MUST write the new persona to `agents/[domain]/[persona-name].md`. 
It MUST then update the explicitly declared persona bank (e.g., `fullstack-persona-bank.md` or `minecraft-persona-bank.md`) to include the new persona. 
This action explicitly increases the subagent count for the S2 Audit phase.
The agent MUST insert the new persona into the correct priority order within the bank.
It MUST NOT delete or modify existing entries in the persona bank during this process.
This registration step is what actually activates the persona in the workflow.
Without registration, the persona file will simply exist as dead code.
The agent MUST verify the file path matches the registration entry exactly.

## 4. Obtain User Approval
The agent MUST obtain explicit user approval before the new persona is used in production sessions. 
It MUST ensure the user reviews the new markdown file and the updated persona bank.
The agent MUST present the final drafted persona file to the user for sign-off.
This step acts as a final manual gate before the workflow is permanently altered.
The user MUST have the opportunity to refine the focus areas or do-NOT-flag list.
Once approved, the new persona is considered fully integrated.
The agent MUST NOT invoke the new persona until this approval is received.
This ensures that the user retains ultimate control over the workflow's architecture.

Postcondition: The new persona is written, registered in the persona bank, approved by the user, and ready for use in the workflow.
