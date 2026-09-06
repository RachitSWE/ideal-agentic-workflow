# Trivial Mode Protocol

## What This Resource Does

This document defines the strict operational protocol for the Trivial Change Protocol. 

The reader is the AI agent orchestrating the session after `/trivial` has been detected. 

The purpose of this protocol is to optimize the workflow for changes that have absolutely zero logic impact. 

It explicitly outlines which phases are skipped to allow for immediate commits of trivial fixes. 

By following this protocol, the agent bypasses heavy audits and reviews for safe documentation changes. 

The agent MUST follow these rules exactly, as they drastically bypass the normal workflow. 

Failure to follow these rules could result in unreviewed, broken code being committed.

It is absolutely forbidden to use this protocol for any logic-bearing changes.

## Defining Trivial Changes

The defining criterion for this mode is that no production logic is added, modified, or removed. 

The agent MUST strictly enforce this definition before executing any changes. 

Qualifying examples include README typo fixes, Markdown formatting corrections, or updating a version number in docs. 

Adding a missing license header or fixing a comment that references a wrong file name also qualify.

If the request falls outside these examples, the agent MUST escalate to a higher mode.

Precondition: The user has requested `/trivial` mode.

1. Analyze the user's request against the definition of a trivial change.
   - Expected Output: The agent confirms the request has zero logic impact.
2. If the request involves logic, configuration, or source code modifications, reject the `/trivial` flag.
   - Expected Output: The agent escalates to Fast or Standard Mode.

Postcondition: The agent confirms the change is genuinely trivial.

## Skipped Phases

To maximize speed for documentation fixes, almost the entire standard workflow is skipped. 

The agent MUST bypass S2, S3, S4, S5, and S6. 

No audit, no plan, and no code review cycle are necessary for correcting a typo. 

The agent makes the documentation or trivial change directly. 

Furthermore, S8 (Code Review) and S11 (Update GEMINI.md phase) are also completely skipped.

We MUST proceed directly to S7 and S10.

Precondition: The change is confirmed to be trivial.

1. Skip S2, S3, S4, S5, and S6 entirely.
   - Expected Output: No audit or plan artifacts are generated.
2. Apply the requested documentation or formatting change directly to the file.
   - Expected Output: The change is made on the filesystem.
3. Skip S8 (Code Review) and S11 (Update GEMINI.md phase).
   - Expected Output: No peer review is invoked, and the PRD is untouched.

Postcondition: The trivial change is applied and ready for validation and commit.

## S7 Build and S10 Commit

Even for trivial changes, basic sanity checks and strict commit hygiene apply. 

The agent MUST run the build step in S7 to ensure a Markdown typo didn't break a generator. 

However, running the full test suite is NOT required unless the file is test-adjacent. 

The commit MUST strictly follow Conventional Commits format, using `docs` or `chore` types.

We MUST maintain a clean git history, even for tiny fixes.

Precondition: The trivial change has been applied.

1. Run the project's build command to verify structural integrity.
   - Expected Output: The build passes successfully.
2. Group the change into a single atomic unit.
   - Expected Output: The files are staged for commit.
3. Write a single commit with type `docs` or `chore`.
   - Expected Output: The change is committed to the repository history.

Postcondition: The trivial change is safely integrated into the project.

## Hard Source File Guard

This guard is the ultimate safety mechanism for the Trivial Change Protocol. 

If the agent detects that the change requires modifying ANY source file, it MUST immediately exit. 

This includes files like `.ts`, `.js`, `.java`, `.rs`, `.py`, `.kt`, or `.json` (config files). 

Trivial Protocol is for documentation and non-source files ONLY. 

Attempting to modify a source file under this protocol is a critical safety violation.

We MUST escalate to Fast Mode or Standard Mode instantly if this rule is breached.

Precondition: The agent is about to modify a file.

1. Check the file extension and directory of the target file.
   - Expected Output: The file type is identified.
2. If the file is a source file or configuration file, halt the operation.
   - Expected Output: The modification is blocked.
3. Escalate the session to Fast Mode or Standard Mode and notify the user.
   - Expected Output: The workflow resets to Fast Mode or Standard Mode.

Postcondition: Source files are protected from unreviewed modifications.
