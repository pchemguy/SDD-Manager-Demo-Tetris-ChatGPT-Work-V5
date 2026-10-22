# Main documentation tasks

This list owns main documentation preparation. Product implementation tasks belong to `TASKS.md`. Complete these tasks in order, reusing valid existing artifacts and completion evidence when resuming.

## Completion and tracking

Each document task and its issue track development through the document’s first human approval. After that approval, mark the task complete. Later document revisions leave this task complete and its issue closed. An explicit preapproval may satisfy the human checkpoint within its stated scope; it does not waive QC or publication. The user may preapprove future checkpoints at any time.

Include the checked task in `DOCS_TASKS.md` in the same commit that submits the approved document and records its first approval. If the reviewed document was already published unchanged, retain that exact document state in the acceptance commit; do not rewrite it merely to create a diff. Push and verify remote containment before closing the corresponding issue or advancing.

When tracking is enabled, each `DOCS-*` task maps to one issue in the `sdd-docs-main` milestone. Verify the milestone, all nine issues and their associations before modifying the repository. Reuse their stable identities on resume. Close issues only after the corresponding completion commit is published and verified. With tracking disabled, apply the same local task and checkpoint requirements.

The running SDD Manager package's `assets/DOCS_TRACKING_TEMPLATE.json` supplies the fixed milestone title/description and all nine issue definitions, including dependencies. Use those definitions through sdd-forge; this Markdown remains the local completion owner. Neither asset records provider handles or proves runtime eligibility. Resolve source/content conflicts before projection rather than replacing this list or inventing issue text.

## Preparation

- [x] DOCS-001 — Initialize the repository for SDD Manager.
    - Inspect root `AI_DISCLOSURE.md`, `SDD-MANAGER.md`, `AGENTS.md` and `SKILL_DISCOVERY_PROTOCOL.md` before copying. Preserve existing files and copy only missing files from the bundled templates.
    - Record which root files existed and which were copied; verify copied bytes and preserved content.
    - Establish/reconcile `docs/dev/HANDOFF.md` as generated checkpoint metadata, outside the four-file presence/copy test. Include it with this task's completion and initialization result, push and verify; then close and verify its issue when tracking is enabled.
    - Report initialization. If some but not all of the four root files existed initially, warn with the retained/copied filenames and end the turn before document work, unless the user explicitly preapproved continuation through this checkpoint. If none or all existed, continue without an additional approval pause.
- [ ] DOCS-002 — Prepare and accept PROJECT.
    - Establish the project brief: purpose, users, outcomes, scope, non-goals and consequential constraints; identify material assumptions and unresolved decisions.
    - Review the proposal with the human and complete its acceptance checkpoint.
- [ ] DOCS-003 — Prepare and accept ARCHITECTURE.
    - Define major system blocks, relationships, dependency direction and consequential structural decisions from the accepted brief.
    - Review the proposal with the human and complete its acceptance checkpoint.
- [ ] DOCS-004 — Prepare and accept DECOMPOSITION.
    - Define component responsibilities, collaboration, ownership and design-level interface boundaries consistently with ARCHITECTURE.
    - Review the proposal with the human and complete its acceptance checkpoint.
- [ ] DOCS-005 — Prepare and accept SPEC.
    - Specify observable behavior, interfaces, error contracts, required qualities and acceptance conditions from the accepted design.
    - Complete required SPEC QC and its human acceptance checkpoint.
- [ ] DOCS-006 — Prepare and accept PLAN.
    - Define delivery phases, milestones, dependencies and exit conditions against SPEC.
    - Complete PLAN QC, then present PLAN for human approval.
- [ ] DOCS-007 — Prepare and accept layout.
    - Allocate source, tests, documentation and artifacts to physical paths consistently with the accepted design and PLAN.
    - Review layout against the design and PLAN, update the PLAN review report, then present layout for human approval.
- [ ] DOCS-008 — Prepare and accept TASKS.
    - Derive executable tasks, dependencies and required milestone/phase review units from accepted SPEC, PLAN and layout.
    - Complete required task-list QC and its human acceptance checkpoint. Do not start implementation or project implementation-phase objects yet.
- [ ] DOCS-009 — Pass documentation package QC.
    - Require all preceding tasks complete and their issue closures verified when tracking is enabled.
    - Review the entire document set, necessary children and QC reports for consistency, traceability, delivery readiness and unresolved blockers. Check initialization, orientation, human acceptance and publication evidence.
    - Resolve blockers through their owning documents and recheck affected readiness and acceptance. Retain the package QC report with the preparation documents.
    - Refresh `docs/dev/HANDOFF.md` with the package outcome, evidence and next boundary, retaining later integration/milestone effects as requiring confirmation. Commit the handoff, passing report and this task marked complete together, push and verify; then close and verify the final QC issue.

## Integration and final checkpoint

After DOCS-009, explicitly merge the verified documentation branch into the actual default branch. Verify the merged result, commit, push and confirm remote containment. Then close and verify the `sdd-docs-main` milestone when tracking is enabled. Failed or uncertain integration or milestone closure remains pending; checked tasks alone do not complete preparation.

Report the package QC result, published merge and tracking status. Confirm the final checkpoint before implementation and obtain the authorized implementation range. Proceed without another pause only when explicit preapproval covers that checkpoint and implementation scope is already established.

On interruption, recover the earliest unmet operation from documents, acceptance decisions, Git and hosted evidence. Preserve a pending mixed-initialization decision. Do not regenerate the list, infer acceptance from file presence or repeat completed work. Honor explicit narrower scope, local-only or no-merge instructions and report any remaining completion steps.

## Initialization evidence

Established on 2026-10-22 under `sdd-manage`. Source: the running SDD Manager 0.15.2 package. The repository also contains SDD Manager 0.15.1; its skill entries match the active installation. Existing root guidance remains authoritative and unchanged.

Before branch creation or preparation writes, the predefined `sdd-docs-main` milestone and all nine issues were created and read back with exact content and associations. Tracking is enabled by root `AGENTS.md`, for documentation preparation and implementation. Milestone: [sdd-docs-main](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/milestone/1).

| Task | Verified issue |
| --- | --- |
| DOCS-001 | [#1](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/1) |
| DOCS-002 | [#2](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/2) |
| DOCS-003 | [#3](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/3) |
| DOCS-004 | [#4](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/4) |
| DOCS-005 | [#5](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/5) |
| DOCS-006 | [#6](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/6) |
| DOCS-007 | [#7](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/7) |
| DOCS-008 | [#8](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/8) |
| DOCS-009 | [#9](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Work-V5/issues/9) |

All four initialization destinations existed at entry. Retained all four byte for byte; copied none. No mixed-presence continuation checkpoint applies. SHA-256 identities:

| Retained file | SHA-256 |
| --- | --- |
| `AI_DISCLOSURE.md` | `09411dc61f4966efabe8e821f2270c768baf5b96f4fd4587eb5c05233de7ffea` |
| `SDD-MANAGER.md` | `ab12d665c8148cbf4fb8e190f265ccda667c4d47e8aae2304deed0bcf3d5a5bf` |
| `AGENTS.md` | `7ff5e248253507a77a39ddaf3e4b267655951758152a13680209c30b712345ea` |
| `SKILL_DISCOVERY_PROTOCOL.md` | `ae6fd000ed174d13706689148ab9ab20cd26ed5826ead72829679905bd44f5ec` |

Added effective `*.tkn` exclusion and verified that the credential is untracked before protected storage. Established `HANDOFF.md` with the initial branch and next checkpoint. DOCS-001 publication and issue closure must be verified after this completion commit before document authoring.
