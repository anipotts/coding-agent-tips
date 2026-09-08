---
title: choosing a coding agent setup
description: compare surfaces, harnesses, models, orchestration, and hardware before choosing a setup.
products: [market]
updatedAt: "2026-09-07T22:03:00-04:00"
checkedAt: "2026-09-07T15:05:08-04:00"
status: current
evidence: [official-source, analysis]
sources: [cursor-docs, cursor-pricing, opencode, git-worktrees, openai-remote-connections, openai-codex-cloud, karpathy-mac-mini-claws]
redirects: [/market/, /market/hardware/]
voice: evidence
navigation:
  scope: handbook
  order: 20
---

choose a setup around the work you need to finish and how you want to inspect
it. a useful comparison includes the agent, its tools, the execution environment,
and the time you spend steering and reviewing the result.

<span id="separate-the-choices" class="heading-alias" aria-hidden="true"></span>

## what am i choosing?

| choice | question it answers |
| --- | --- |
| surface | where will you prompt, intervene, and review? |
| harness | what runs the agent loop, tools, context, and permissions? |
| model | what supplies the reasoning and generation? |
| execution host | where will files, commands, and services run? |
| coordination | how will independent tasks exchange context and results? |

one product can cover several of these choices. [Codex](/guides/codex/) and
[Claude Code](/guides/claude-code/) each provide several ways to work with their
agent. [Cursor](https://cursor.com/docs) combines editor features with agent
workflows. [OpenCode](https://github.com/anomalyco/opencode) provides an open
source agent with several model provider options. the
[Grok guide](/guides/grok/) separates its conversational, coding, and Bot
experiences.

changing one part can change the result. the same model receives different
context and tools through different harnesses. a familiar editor may help you
review faster. a remote host may have a dependency your laptop lacks. record
those differences when comparing products.

<span id="choose-a-surface-you-can-judge-the-work-through" class="heading-alias" aria-hidden="true"></span>

## which app should i use?

| your main activity | a useful surface to try | tradeoff to inspect |
| --- | --- | --- |
| tracing code and reviewing small patches | terminal or editor | how easily you can see commands, failures, and the complete diff |
| steering several independent tasks | desktop task view | whether ownership and blocked work remain visible |
| checking work away from your desk | mobile access to the relevant task | how much review the smaller screen supports |
| running work in a separate environment | cloud or remote project | dependency setup, access, and reproducibility |

begin with one outcome in a surface you already understand. add coordination
when there are independent tasks to manage. a task list becomes
useful when it helps you make the next decision about the work.

<span id="run-a-small-comparison" class="heading-alias" aria-hidden="true"></span>

## how do i compare them?

choose a representative task with a known starting state. for example, use the
same repository revision and ask each setup to fix the same search navigation
bug. provide the same expected behavior and checks. give each attempt its own
checkout, and keep the results separate until you review them.

record:

- the product, model selection, and settings you used.
- the repository revision, environment, and information supplied.
- time to a reviewable result and any interventions you made.
- whether the change passed the relevant checks and browser flow.
- remaining mistakes, unnecessary changes, and work needed to finish.

one attempt can expose a problem or a useful capability. try several tasks
that resemble your work before treating the outcome as a reliable preference.
change one major variable at a time when you want to understand why a result
improved.

for a paid option, compare the value of completed, reviewed work against the
cost and constraints shown in your account and the provider's current pricing,
such as [Cursor's plan page](https://cursor.com/pricing). model availability, included usage,
and provider integrations change; inspect those terms before committing to a
workflow that depends on them.

<span id="measure-the-machine-before-replacing-it" class="heading-alias" aria-hidden="true"></span>

## do i need a better computer?

with a hosted model, inference happens at the provider. local builds, browsers,
containers, language servers, and tests still run wherever the task's execution
host is. several agents can put pressure on that host even while all their
models run remotely.

| pattern | where model inference runs | where project commands run |
| --- | --- | --- |
| hosted model with local tools | provider | your computer |
| hosted model with a remote project | provider | remote host |
| cloud coding task | provider | configured cloud environment |
| local model with local tools | your computer | your computer |

measure a representative workload while it is running. inspect memory
pressure, CPU use, available storage, and the processes using them. identify
whether the delay comes from model responses, dependency installation, builds,
browser work, or waiting for your review.

[worktrees](https://git-scm.com/docs/git-worktree) keep separate checked out
files, and each may accumulate dependencies or build output. local models add
weights and runtime memory. estimate those needs from the model and runner you
intend to use, then test the actual workload. a hardware specification alone
cannot tell you whether a particular agent setup will feel responsive.

Karpathy posted about buying a Mac mini to experiment with claws. his post
also raises the question of what private data and credentials to give an agent.
your workload and access requirements should guide that choice.

<div class="publication-embed" data-media-id="karpathy-mac-mini-claws">
  <iframe src="https://platform.twitter.com/embed/Tweet.html?id=2024987174077432126&amp;dnt=true&amp;hideThread=true&amp;theme=light" title="Karpathy on a Mac mini and claws (February 2026)" width="550" height="369" style="--embed-height: 369px; --embed-height-mobile: 380px" loading="lazy" allow="autoplay 'none'" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe>
  <p class="publication-embed-credit"><a href="https://x.com/karpathy/status/2024987174077432126" target="_blank" rel="noopener noreferrer">Andrej Karpathy (@karpathy)</a>, february 2026.</p>
</div>

<span id="move-execution-for-a-concrete-reason" class="heading-alias" aria-hidden="true"></span>

## should it run somewhere else?

remote execution can help when the necessary environment already lives on
another machine, local resources are constrained, or the task should continue
in a hosted environment. check how setup, files, permissions, and results move
between the machines. [Codex Remote](https://learn.chatgpt.com/docs/remote-connections)
controls a connected host; [Codex cloud](https://learn.chatgpt.com/docs/cloud)
uses a separately configured environment.

local model execution gives you another deployment choice, with responsibility
for model selection, runtime configuration, hardware, and evaluation. inspect
all other connections as well when privacy or offline use is the reason for
choosing it. the model's location describes only one part of the data flow.

keep the setup whose benefits recur in your actual work. expand it when a
specific limitation appears, and make the added component earn the time spent
configuring, reviewing, and maintaining it.
