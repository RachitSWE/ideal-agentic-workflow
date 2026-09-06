# Global Skill Suggester

## 1. Introduction and Purpose
This document provides the template and instructions for emitting optimization recommendations at the conclusion of the S11 phase. 
As the `ideal-agentic-workflow` operates across diverse codebases, it frequently detects recurring friction points, missing automation, or inefficient development loops.
Without a mechanism to report these insights back to the user, valuable opportunities to improve the project's baseline efficiency are lost.
By standardizing the emission of Global Skill Suggestions, the workflow actively coaches the user on how to level up their repository's capabilities.
The agent MUST utilize this specific format to communicate its strategic recommendations after the `GEMINI.md` file has been successfully updated.
The agent MUST ensure these suggestions are highly contextual, based entirely on observations made during the preceding S1-S10 phases.
The agent MUST NOT spam the user with generic advice; every suggestion must solve a specific pain point encountered during the session.
Failure to emit these suggestions gracefully deprives the user of the workflow's full analytical value.

## 2. Emitting Skill Suggestions
The emission of skill suggestions is the final communicative act the agent performs before signaling the end of the conversation loop. 
The agent MUST explicitly formulate 1 to 3 targeted recommendations that would improve the project's developer experience or operational stability.
The agent MUST format these suggestions as a distinct, clearly labeled section in its final output to the user.
The suggestions MUST reference specific, known concepts like adding GitHub Actions, implementing stricter linters, or creating custom project skills.
The agent MUST construct its suggestions using the following structural guidelines to ensure maximum clarity and actionability.
The agent MUST NOT suggest creating skills that already exist in the project's `GEMINI.md` or `.agents/` directory.
The agent MUST present these recommendations immediately prior to the final loop signal.
The agent MUST ensure its suggestions remain relevant to the specific friction encountered during the current coding session.

### 2.1 Suggestion Formatting Requirements
The agent MUST format each individual suggestion using the exact structure defined in the list below. 
The agent MUST ensure all required fields are present and clearly delineated in the output.
- **Actionable Title**: The agent MUST provide a clear, imperative title for the suggestion (e.g., "Implement Automated Dependency Updates").
- **Observed Pain Point**: The agent MUST explicitly state the friction observed during the session that prompted the suggestion (e.g., "During S7, several deprecated package warnings slowed down the build.").
- **Proposed Solution**: The agent MUST describe exactly what the user should do to resolve the issue (e.g., "Add Dependabot configuration to `.github/` to automate these patches.").
- **Workflow Impact**: The agent MUST concisely explain how implementing the suggestion will speed up or secure future agentic sessions.
