# Session Initialization Protocol

## What This Resource Does

This document defines the exact procedure for generating a session SHA and creating the workspace tree. 

The reader is the AI agent executing the S1 Orchestrator skill. 

The purpose of this protocol is to ensure that every workflow session is cleanly isolated. 

It provides the mathematical algorithm for the SHA and the shell commands for the directory structure. 

By following this strictly, we prevent file collisions between concurrent or resumed sessions. 

The agent MUST execute these steps verbatim during S1. 

Failure to follow this protocol will result in scattered artifacts and broken downstream skills.

It is absolutely forbidden to create any files or folders before this initialization completes successfully.

## SHA Generation Algorithm

The session SHA is a 6-character hexadecimal string derived from the current system timestamp. 

It serves as the unique identifier for the entire session lifecycle. 

It MUST be pseudo-random enough to prevent collisions within a single project. 

Using a hash of the timestamp ensures uniqueness even if multiple sessions start on the same day.

The agent MUST implement this logic internally before creating any files.

Precondition: The S1 skill has reached the SHA generation phase.

1. Obtain the current system time in milliseconds since the UNIX epoch (e.g., `1752419345892`).
   - Expected Output: An integer representation of the current time.
2. Compute the SHA-1 hash of the string representation of that integer.
   - Expected Output: A full 40-character hexadecimal SHA-1 string.
3. Extract the first 6 characters of the resulting hex string.
   - Expected Output: A 6-character string (e.g., `e3f9a2`) that will act as the `[SHA]`.

Postcondition: The agent holds a valid 6-character session SHA in its active memory.

## Directory Tree Creation

Once the SHA is generated, the physical workspace MUST be initialized. 

This involves creating a nested directory structure within the `.agents/` folder. 

All paths MUST be absolute, anchored to the project root, to prevent execution context errors. 

We MUST create empty stub files for `plan.md` and `task.md` so that S3 has a valid target to write to.

The agent MUST verify that these commands succeed without throwing permission errors.

Precondition: The `[SHA]` has been generated and the project root path is known.

1. Execute a shell command to create the root session directory: `mkdir -p [PROJECT_ROOT]/.agents/session-[SHA]/`.
   - Expected Output: The root session folder exists.
2. Execute shell commands to create the subdirectories: `mkdir -p [PROJECT_ROOT]/.agents/session-[SHA]/audit/bin/`, `mkdir -p [PROJECT_ROOT]/.agents/session-[SHA]/code-review/submit/`, and `mkdir -p [PROJECT_ROOT]/.agents/session-[SHA]/code-review/review/`.
   - Expected Output: All nested directories exist.
3. Execute shell commands to create the stub files: `touch [PROJECT_ROOT]/.agents/session-[SHA]/plan.md` and `touch [PROJECT_ROOT]/.agents/session-[SHA]/task.md`.
   - Expected Output: The empty stub files are created in the session root.

Postcondition: The complete directory tree is present on the filesystem, ready for S2 and S3 operations.
