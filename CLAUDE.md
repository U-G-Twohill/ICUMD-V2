# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

This is the **Claude Workspace Toolkit** — a two-layer system for working with Claude Code as an agent assistant across sessions and projects.

- **Toolkit layer**: Universal commands installed once at `~/.claude/commands/`, available in every project
- **Project layer**: Per-project scaffolding (context templates, skills, directory structure) installed per repo

Commands provide the logic; each project provides the data. All commands use relative paths (`./context/`, `./CLAUDE.md`, `./plans/`) so they work in any project directory.

**This file (CLAUDE.md) is the foundation.** It is automatically loaded at the start of every session. Keep it current — it is the single source of truth for how Claude should understand and operate within this workspace.

---

## The Claude-User Relationship

Claude operates as an **agent assistant** with access to the workspace folders, context files, commands, and outputs. The relationship is:

- **User**: Defines goals, provides context about their role/function, and directs work through commands
- **Claude**: Reads context, understands the user's objectives, executes commands, produces outputs, and maintains workspace consistency

Claude should always orient itself through `/prime` at session start, then act with full awareness of who the user is, what they're trying to achieve, and how this workspace supports that.

---

## Workspace Structure

```
.
├── CLAUDE.md                  # This file — core context, always loaded
├── .claude/
│   ├── commands/              # Slash commands (toolkit-layer — universal)
│   │   ├── prime.md               # /prime — session initialization
│   │   ├── create-plan.md         # /create-plan — create implementation plans
│   │   ├── implement.md           # /implement — execute plans
│   │   ├── discover.md            # /discover — audit project for hidden context
│   │   ├── scope.md               # /scope — discovery-to-prototype pipeline
│   │   ├── sync-toolkit.md        # /sync-toolkit — sync commands with toolkit repo
│   │   └── harden.md              # /harden — find bugs, security issues, edge cases
│   ├── settings.local.json    # Project-level permissions
│   └── skills/                # Skills (project-layer — installed per project)
│       ├── mcp-integration/       # MCP server integration guidance
│       └── skill-creator/         # Skill authoring guidance
├── context/                   # Background context (project-layer)
│   ├── personal-info.md          # Your role and responsibilities
│   ├── business-info.md          # Organization overview
│   ├── strategy.md               # Current priorities and goals
│   └── current-data.md           # Metrics and current state
├── plans/                     # Implementation plans
├── outputs/                   # Work products and deliverables
├── reference/                 # Templates, guides, and patterns
│   ├── getting-started.md           # START HERE — full walkthrough for both paths
│   ├── toolkit-architecture.md      # Two-layer architecture docs
│   ├── command-development-guide.md # How to author new commands
│   └── workspace-setup-guide.md     # Installation details and aliases
├── scripts/
│   ├── install-toolkit.sh     # Install commands to ~/.claude/ (one-time)
│   └── install.sh             # Scaffold a project (per-project)
└── shell-aliases.md           # Shell alias documentation
```

**Key directories:**

| Directory    | Purpose                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| `context/`   | Who the user is, their role, current priorities, strategies. Read by `/prime`.      |
| `plans/`     | Detailed implementation plans. Created by `/create-plan`, executed by `/implement`. |
| `outputs/`   | Deliverables, analyses, reports, and work products.                                 |
| `reference/` | Guides: getting-started, architecture, command development, setup.                  |
| `scripts/`   | Install scripts for toolkit and project scaffolding.                                |

---

## Commands

### Workflow Pipeline

The standard workflow follows this pipeline:

```
/prime → /discover → /scope → /create-plan → /implement → /harden
                                                                    ↑                        │
                                                                    └── /create-plan fixes ◄──┘
```

Each command can also be used independently. The `/harden` → `/create-plan` → `/implement` → `/harden` loop repeats until the project is clean.

### /prime

**Purpose:** Initialize a new session with full context awareness.

Run this at the start of every session. Claude will:

1. Read CLAUDE.md and context files
2. Summarize understanding of the user, workspace, and goals
3. Note any active plans and available commands
4. Confirm readiness to assist

### /discover [scope]

**Purpose:** Audit a project for undocumented context — find what's in the code but not in the docs.

Systematically searches the codebase for architecture patterns, dependencies, configuration, conventions, and hidden knowledge, then produces a gap analysis comparing documented vs actual state.

**Scope options:** `full` (default), `code`, `config`, `deps`, or a specific path

Example: `/discover config`

### /scope [phase]

**Purpose:** Guide a project from discovery through scope definition to first prototype plan.

Runs a structured scoping pipeline: context check → scope discovery (conversation with user) → scope definition document → bridge to `/create-plan`.

**Phase options:** `discover`, `define`, `plan`, or omit for full pipeline

Example: `/scope define`

### /create-plan [request]

**Purpose:** Create a detailed implementation plan before making changes.

Use when adding new functionality, commands, scripts, or making structural changes. Produces a thorough plan document in `plans/` that captures context, rationale, and step-by-step tasks.

Example: `/create-plan add a competitor analysis command`

### /implement [plan-path]

**Purpose:** Execute a plan created by /create-plan.

Reads the plan, executes each step in order, validates the work, and updates the plan status.

Example: `/implement plans/2026-01-28-competitor-analysis-command.md`

### /sync-toolkit [action]

**Purpose:** Sync commands between this project and the Claude Workspace Toolkit repo.

Manages the feedback loop — promotes battle-tested commands from projects back to the toolkit repo, or pulls toolkit commands into a project for customization.

**Actions:** `status`, `push [command]`, `pull [command]`, `push-all`

Example: `/sync-toolkit status`

### /harden [focus]

**Purpose:** Systematically find bugs, security vulnerabilities, edge cases, and performance issues — then guide fixes.

Understands how the project should work, then tries to break it. Produces a severity-ranked report in `outputs/harden-report-[date].md` and maintains a cumulative knowledge base at `outputs/harden-knowledge.md` that improves every subsequent audit.

**Focus options:** `full` (default), `security`, `bugs`, `edge-cases`, `performance`, `validation`, or a specific file/path

**The hardening loop:**
1. `/harden` — find issues, produce report
2. `/create-plan` — plan fixes based on report
3. `/implement` — execute the fix plan
4. `/harden` — verify fixes, find remaining issues
5. Repeat until clean

Behavior-altering fixes are flagged in a Functionality Impact Assessment requiring explicit user approval.

Example: `/harden security`

### Install Scripts

#### `scripts/install-toolkit.sh` — Install Universal Commands

```bash
bash scripts/install-toolkit.sh          # Interactive
bash scripts/install-toolkit.sh --force  # Skip prompts
```

Installs all commands to `~/.claude/commands/` — available in every project. Run once, then again whenever commands are updated.

#### `scripts/install.sh` — Scaffold a Project

```bash
bash scripts/install.sh ~/my-project            # Interactive
bash scripts/install.sh --force ~/my-project     # Skip prompts
```

Scaffolds a project with context templates, skills, CLAUDE.md, and directory structure. Does NOT install commands — those come from the toolkit layer.

**Options for both:** `--force` (skip prompts), `--no-alias` (skip alias offer), `--help` (usage info)

See `shell-aliases.md` for alias setup instructions.

---

## Development Workflow

To create and deploy new commands:

1. **Author** the command in this repo's `.claude/commands/`
2. **Deploy** with `install-toolkit.sh` to push to `~/.claude/commands/`
3. **Test** in a real project
4. **Refine** through use — or refine in a project and `/sync-toolkit push` back

See `reference/command-development-guide.md` for the full guide and `reference/toolkit-architecture.md` for architecture details.

---

## Critical Instruction: Maintain This File

**Whenever Claude makes changes to the workspace, Claude MUST consider whether CLAUDE.md needs updating.**

After any change — adding commands, scripts, workflows, or modifying structure — ask:

1. Does this change add new functionality users need to know about?
2. Does it modify the workspace structure documented above?
3. Should a new command be listed?
4. Does context/ need new files to capture this?

If yes to any, update the relevant sections. This file must always reflect the current state of the workspace so future sessions have accurate context.

**Examples of changes requiring CLAUDE.md updates:**

- Adding a new slash command → add to Commands section
- Creating a new output type → document in Workspace Structure or create a section
- Adding a script → document its purpose and usage
- Changing workflow patterns → update relevant documentation

---

## For Users Downloading This Template

**Start here: `reference/getting-started.md`** — a complete walkthrough with two paths:

- **Path A: New Project** — Build from scratch: scaffold → context → scope → plan → build → harden
- **Path B: Existing Project** — Bring up to scratch: scaffold → discover → harden → fix → repeat

Quick version:

1. **Install the toolkit** (one-time): `bash scripts/install-toolkit.sh`
2. **Scaffold a project** (per-project): `bash scripts/install.sh /path/to/your-project`
3. **Start a session**: `cd your-project && claude` then `/prime`

See `shell-aliases.md` for shortcut aliases.

---

## Session Workflow

1. **Start**: Run `/prime` to load context
2. **Discover**: Run `/discover` to audit for undocumented context (new projects)
3. **Scope**: Run `/scope` to define what to build (new features)
4. **Plan**: Use `/create-plan` before significant additions
5. **Execute**: Use `/implement` to execute plans
6. **Harden**: Run `/harden` to find bugs, security issues, and edge cases
7. **Fix loop**: `/create-plan` fixes → `/implement` → `/harden` again until clean
8. **Sync**: Use `/sync-toolkit push` to promote refined commands back to the toolkit
9. **Maintain**: Claude updates CLAUDE.md and context/ as the workspace evolves

---

## Notes

- Keep context minimal but sufficient — avoid bloat
- Plans live in `plans/` with dated filenames for history
- Outputs are organized by type/purpose in `outputs/`
- Reference materials go in `reference/` for reuse
- Commands use relative paths only — see `reference/command-development-guide.md`
