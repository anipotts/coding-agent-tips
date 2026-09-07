---
title: working on a project
description: everyday, parallel, long running, and handed off codex work.
products: [codex]
updatedAt: "2026-09-07T16:33:00-04:00"
checkedAt: "2026-09-07T15:01:58-04:00"
status: pending
completion: outline
draft: true
evidence: [official-source, analysis]
sources: [openai-codex-worktrees, openai-codex-automations, openai-remote-connections, openai-codex-cloud, openai-codex-image-generation]
redirects: []
voice: evidence
navigation:
  scope: codex
  order: 40
---

## how do i scope a task?

start with a result you can inspect. “fix the save button losing the selected
workspace” gives the task a behavior to reproduce. include the failing route,
what you expected, and any work already in progress. let the agent locate the
implementation and propose the narrowest useful verification.

keep the evidence with the task: reproduction steps, changed files, commands,
and results. when the work moves to another conversation, those details let
the next agent continue without rediscovering the same failure.

## how do i keep parallel edits separate?

[worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) let
separate tasks work on separate checkouts of one Git repository. they share
Git history, while each checkout has its own files. dependencies, environment
files, and running services may still need setup in the new checkout.

for example, split a settings feature into API validation and UI behavior:

```text
create separate implementation tasks for API validation and the settings UI.
agree on the request and response shape before either changes it.
each task owns its assigned files and returns its branch, changed behavior,
tests, and any contract change. integrate and check the complete save flow afterward.
```

a shared checkout can also work when file ownership is clear. whichever setup
you choose, tell each agent what the other owns and preserve existing changes.
run the combined behavior after integration: each half can pass its own checks
while disagreeing about the shape of the data between them.

### what belongs in the coordinator?

the [coordinator example](/guides/codex/extensions/#task-coordination-and-subagents)
keeps routing and project state in one conversation. send concise updates:
what changed, whether verification passed, and what decision comes next. the
implementation task retains the detailed debugging conversation.

ask for parallel work where the questions can advance independently. an agent
waiting for another agent's answer adds little capacity. when several results
arrive together, review the most consequential dependency first.

## how do i schedule repeated work?

[scheduled tasks](https://learn.chatgpt.com/docs/automations) can run a saved
prompt independently or continue an existing chat with its context. local
project work requires the host and app to remain available. cloud work uses its
configured hosted environment.

a useful first automation is a report with a narrow scope:

```text
each weekday morning, check the latest CI run for this repository's default branch.
report a new failure with the job, failed step, and run link.
stay quiet when the state is unchanged. keep this task limited to inspection.
```

run it once while you are present. confirm the repository identity, the
information it can read, and the result it produces when a run is unavailable.
then decide whether it should ever propose or implement a fix. expanding the
job changes both its required access and the evidence you need back.

## where should the work run?

local execution uses your current machine. [Remote](https://learn.chatgpt.com/docs/remote-connections)
lets another supported device steer a connected host; that host supplies the
files, tools, credentials, and permissions. an SSH project runs commands on the
SSH host. [Codex cloud](https://learn.chatgpt.com/docs/cloud) runs in a separate
hosted environment with its own setup.

for a mobile handoff, check the connected host, task, checkout, and latest diff.
a laptop that goes to sleep changes what local work can continue. a cloud task
may keep running, but needs its own dependencies and access. choose the host
first, then the screen that is convenient for steering it.

## image generation

Codex can [generate and edit images](https://learn.chatgpt.com/docs/image-generation)
from a prompt and reference material. describe the asset's purpose, dimensions,
composition, and the parts that need to stay fixed. review the generated image
before integrating it, then inspect it in the actual page at the sizes readers
will see.

for example, a background illustration can look good on its own while making
overlaid text unreadable. keep the original, prepare the required derivative,
and check loading cost, contrast, cropping, and alternative text in the page.
visual review and code verification answer different parts of whether it works.

## what belongs in a handoff?

finish with the repository and branch, changed behavior, verification results,
known gaps, and next action. distinguish a local patch, a pushed branch, an
opened pull request, and a deployed change. the next person should be able to
see exactly where the work reached and continue from there.
