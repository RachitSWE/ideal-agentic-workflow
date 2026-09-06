# Priority Rubric

## 1. Introduction and Purpose
This document defines the mathematical scoring model used during the S3 Planning phase to prioritize tasks. 
The `ideal-agentic-workflow` plugin relies on this rubric to prevent subagents from becoming distracted by low-impact feature requests while severe architectural flaws or security vulnerabilities remain unresolved in the codebase. 
Without a rigorous, mathematical approach to task assignment, AI coding assistants tend to gravitate toward the easiest, fastest tickets to resolve, creating a false sense of momentum while technical debt compounds.
By implementing a strict scoring system, the orchestrator enforces a disciplined, senior-developer mindset across all autonomous workers.
The S3 planning agent MUST evaluate every proposed task against this specific rubric before writing it to the final `task.md` file.
The agent MUST NOT invent proprietary scoring metrics or alter the 1-to-5 scale defined below.
This standardized approach guarantees that tasks are executed in a sequence that maximizes system stability and user value.
Any deviation from this calculation method will result in immediate failure during peer review.

## 2. The Scoring Formula
The final priority score for any given task is calculated by multiplying three independent variables: Severity, Complexity, and Dependencies. 
The agent MUST calculate this score for every task using the exact formula: `Score = Severity × Complexity × Dependencies`.
By multiplying these factors rather than adding them, the rubric heavily penalizes high-severity issues that block other development, ensuring they rise to the absolute top of the backlog queue.
The maximum possible score for a task is 125 (5 × 5 × 5), while the minimum possible score is 1 (1 × 1 × 1).
The planning agent MUST sort the final task list in descending order based on this calculated score.
If two tasks share the identical final score, the agent MUST resolve the tie by prioritizing the task with the higher Severity value.
If the Severity values are also identical, the tie is broken by prioritizing the task with the higher Dependencies value.
The agent MUST strictly follow the exact 1-5 scales defined in the subsequent subsections to determine the values for the formula.

### 2.1 Severity Definition (1-5)
Severity measures the immediate impact of the issue on the application's stability, security, or core business logic. 
The planning agent MUST evaluate the task's context against the definitions below to assign a strict numerical value.
Overestimating severity leads to panic-driven development, while underestimating it leaves the system vulnerable.
The agent MUST select exactly one integer from the following list.
- **5 (Critical)**: Active security vulnerabilities (e.g., SQL injection), system crashes, or data loss.
- **4 (High)**: Major architectural anti-patterns, broken core features, or severe performance degradation.
- **3 (Medium)**: Broken secondary features, missing test coverage for critical paths, or deprecated API usage.
- **2 (Low)**: Minor UI bugs, missing documentation on non-critical functions, or code styling issues.
- **1 (Trivial)**: Invisible typo corrections, unused import removals, or trivial formatting tweaks.

### 2.2 Complexity Definition (1-5)
Complexity measures the cognitive load and estimated time required to successfully implement and test the solution. 
The planning agent MUST evaluate the scope of the required changes across the codebase to assign this numerical value.
Highly complex tasks are scored lower to encourage the agent to break them down into smaller, more manageable units of work before execution.
The agent MUST select exactly one integer from the following list.
- **5 (Trivial)**: A single-line change in a single file with no risk of side effects.
- **4 (Simple)**: Modifications localized to a single function or a highly isolated component.
- **3 (Moderate)**: Changes spanning multiple files within the same bounded context or module.
- **2 (Complex)**: Refactoring shared utilities or modifying database schemas requiring data migration.
- **1 (Extreme)**: Cross-cutting architectural changes affecting the entire application lifecycle.

### 2.3 Dependencies Definition (1-5)
Dependencies measure how many other pending tasks are blocked by the completion of the current task. 
The planning agent MUST analyze the task graph to determine the critical path of execution before assigning this numerical value.
Tasks that serve as foundational prerequisites for other work MUST receive higher scores to prevent downstream subagents from stalling.
The agent MUST select exactly one integer from the following list.
- **5 (Foundational)**: This task must be completed before any other work in the current sprint can begin (e.g., fixing a broken build).
- **4 (Blocking Many)**: Three or more other tasks explicitly depend on this task's completion.
- **3 (Blocking Some)**: One or two other tasks explicitly depend on this task's completion.
- **2 (Independent)**: No other tasks depend on this task, but it shares state with other active work.
- **1 (Isolated)**: Completely decoupled task that can be executed at any time without affecting the broader system.
