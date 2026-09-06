# Breaking Change Guide

## 1. Introduction and Purpose
This document provides the mandatory instructions for documenting breaking changes during the S10 Git Commit phase. 
In complex software architectures, modifying public APIs, altering database schemas, or changing established configuration formats often breaks downstream dependents.
Without a standardized method for signaling these disruptions, consumers of the codebase will experience unexpected failures during deployments.
By enforcing the Conventional Commits breaking change footer, the workflow ensures that automated semantic versioning tools correctly bump major version numbers.
The agent MUST utilize this specific footer format whenever a commit introduces an incompatible API change.
The agent MUST NOT attempt to hide or obscure breaking changes within standard feature or fix commits.
Failure to properly tag a breaking change is considered a critical architectural violation.
The agent MUST follow the formatting rules defined below exactly.

## 2. Formatting the Breaking Change Footer
The breaking change footer is a specific string appended to the very bottom of the commit message body. 
It explicitly flags the commit to release automation tools, ensuring that major version bumps are triggered automatically.
The agent MUST add exactly one blank line after the mandatory lowercase commit body, followed immediately by the footer text.
The footer MUST begin exactly with the string `BREAKING CHANGE: ` (including the space after the colon).
Following the colon, the agent MUST provide a clear, concise description of what broke and how consumers must migrate their implementations.
The agent MUST NOT use alternative phrasing like "Breaking:" or "Warning: breaking change".
The agent MUST strictly adhere to the following structure for any incompatible change.
The agent MUST NOT omit the migration instructions.

### 2.1 Example Format
The following example demonstrates the correct usage of the breaking change footer. 
The agent MUST study this example to understand the spatial relationship between the body text and the footer itself.
The agent MUST replicate this exact spacing and capitalization pattern.
The agent MUST clearly describe the mitigation path for users affected by the breaking change.
The agent MUST NOT use generic filler text for the migration instructions.
- `feat: replace legacy authentication provider`
  
  `migrated all authentication endpoints from the legacy jwt service to the new oauth2 provider. this atomic unit replaces the core security module.`
  
  `BREAKING CHANGE: the /api/v1/login endpoint no longer accepts basic auth. consumers must now use the /api/v2/oauth/authorize flow.`
