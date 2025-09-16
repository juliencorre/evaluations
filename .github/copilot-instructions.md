# Evaluations Repository

This is a minimal evaluation repository containing only documentation. It serves as a starting point for evaluation-related projects and development.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Repository Structure

- Current state: Minimal repository with only `README.md` (13 bytes containing "# evaluations")
- No build system, dependencies, or application code currently exists
- Available tools: Python3, Node.js, npm, pip are pre-installed in the environment

### Basic Operations

- Clone and navigate: Repository is ready to use immediately after cloning
- `git --no-pager status` - Check repository status (completes in <1 second)
- `git --no-pager log --oneline -5` - View recent commits (completes in <1 second)
- `ls -la` - List all files and directories (completes in <1 second)
- `cat README.md` - View current documentation

### No Build Process Required

- **DO NOT** attempt to run build commands like `npm install`, `pip install`, or `make` - there are no dependencies or build configurations defined
- **DO NOT** look for package.json, requirements.txt, Makefile, or other build files - they do not exist
- The repository currently requires no installation or setup steps beyond git clone

### No Testing Framework

- **DO NOT** attempt to run test commands - no testing framework is currently configured
- **DO NOT** look for test directories or test files - they do not exist
- If tests are needed for future development, they will need to be created from scratch

## Validation

### Current State Validation

- Always verify the minimal state: `ls -la` should show only `.git/`, `.github/`, and `README.md`
- Confirm README content: `cat README.md` should output exactly "# evaluations"
- Verify git functionality: `git --no-pager status` should show clean working tree

### Development Validation

- ALWAYS run `git --no-pager status` before and after making changes
- When adding new files or code, create appropriate build/test instructions and update these instructions
- If adding dependencies, document exact installation commands and timing expectations

## Future Development Guidelines

### When Adding Dependencies

- Document exact installation commands (e.g., `npm install`, `pip install -r requirements.txt`)
- **CRITICAL**: Measure and document build times. Add "NEVER CANCEL" warnings for commands taking >2 minutes
- Include specific timeout values: use 60+ minutes for build commands, 30+ minutes for test commands

### When Adding Build Process

- Validate EVERY command before documenting it
- Include exact timing expectations and timeout recommendations
- Document any commands that fail and provide workarounds

### When Adding Tests

- Document exact test execution commands
- Include timing expectations and "NEVER CANCEL" warnings
- Provide specific validation scenarios for manual testing

## Current Tool Output References

### Repository Root Contents

```bash
$ ls -la
total 20
drwxr-xr-x 4 runner docker 4096 Sep  7 10:06 .
drwxr-xr-x 3 runner docker 4096 Sep  7 10:04 ..
drwxr-xr-x 7 runner docker 4096 Sep  7 10:07 .git
drwxr-xr-x 2 runner docker 4096 Sep  7 10:06 .github
-rw-r--r-- 1 runner docker   13 Sep  7 10:04 README.md
```

### README.md Content

```bash
$ cat README.md
# evaluations
```

### Git Status

```bash
$ git --no-pager status
On branch copilot/fix-3
Your branch is up to date with 'origin/copilot/fix-3'.

nothing to commit, working tree clean
```

### Available Development Tools

```bash
$ which python3 node npm pip
/usr/bin/python3
/usr/local/bin/node
/usr/local/bin/npm
/usr/bin/pip
```

## Common Tasks

### Adding New Content

1. Create or modify files as needed
2. Run `git --no-pager status` to review changes
3. Use `git add .` to stage changes (when ready to commit)
4. Document any new build/test procedures in these instructions

### Working with Git

- `git --no-pager log --oneline -10` - View recent commit history
- `git --no-pager diff` - See current changes
- `git remote -v` - Verify remote repository configuration

### File Operations

- `find . -type f -name "*.extension"` - Search for specific file types
- `tree .` or `find . -type d` - View directory structure
- Use absolute paths: `/home/runner/work/evaluations/evaluations/` for repository root

Remember: This repository is currently in a minimal state. When adding substantial functionality, update these instructions with specific build, test, and validation procedures including precise timing expectations and "NEVER CANCEL" warnings for long-running operations.
