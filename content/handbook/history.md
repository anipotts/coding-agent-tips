---
title: how coding agents got here
description: a selective timeline of the research, repository tools, and review surfaces behind coding agents.
products: [cross runtime]
updatedAt: "2026-09-07T15:10:06-04:00"
checkedAt: "2026-09-07T15:10:06-04:00"
status: current
evidence: [official-source, analysis]
sources: [transformer-paper, openai-gpt3, openai-codex-paper, github-copilot-preview, react-paper, aider-docs, aider-early-release, cursor-2023-problems, swe-bench-paper, github-copilot-workspace, swe-agent-paper, anthropic-mcp-launch, github-copilot-agent-mode, anthropic-claude-code-preview, openai-codex-launch, openai-codex-app, cursor-3]
redirects: [/history/]
tableOfContents: false
voice: evidence
navigation:
  scope: handbook
  order: 40
---

this timeline follows several developments that help explain today’s coding
agents: models that work with code, loops that call tools, environments that
run those tools, and interfaces for reviewing the result. the dates mark the
linked paper or announcement. the broader history includes overlapping work
and many other contributors.

<ol class="history-timeline">
  <li>
    <p class="history-year"><time datetime="2017">2017</time></p>
    <h2 id="the-transformer-creates-the-foundation">the transformer creates the foundation</h2>
    <p><cite>Attention Is All You Need</cite> <a href="https://arxiv.org/abs/1706.03762">introduced the Transformer</a>, an attention based architecture designed for parallel training. later large language models built on that architecture.</p>
    <p>the practical connection is sequence modeling: instructions, code, and later tool results can become context for another prediction. the architecture gives part of the foundation; the surrounding tool system supplies execution.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2020">2020</time></p>
    <h2 id="prompts-become-a-general-interface">prompts become a general interface</h2>
    <p>GPT-3 <a href="https://arxiv.org/abs/2005.14165">showed</a> how scaling improved performance on tasks specified through text and examples, using the same model without a separate gradient update for each task.</p>
    <p>programming a model through language started to look like a general interface. reliable action loops came later.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2021">2021</time></p>
    <h2 id="code-generation-reaches-the-editor">code generation reaches the editor</h2>
    <p>OpenAI <a href="https://arxiv.org/abs/2107.03374">published Codex</a>, a GPT model trained on public code, while GitHub <a href="https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/">introduced Copilot</a> as an editor product powered by it. the Codex paper also introduced HumanEval as a way to measure code generation from docstrings.</p>
    <p>generation moved from a research result into the place many developers already worked.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2022">2022</time></p>
    <h2 id="the-model-gets-an-action-loop">the model gets an action loop</h2>
    <p>ReAct <a href="https://arxiv.org/abs/2210.03629">described</a> an interleaved loop of reasoning and actions against external systems.</p>
    <p>the core pattern now appears across agent systems: inspect state, decide what to do, use a tool, read the result, and continue.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2023">2023</time></p>
    <h2 id="the-terminal-and-editor-become-agent-surfaces">the terminal and editor become agent surfaces</h2>
    <p>aider’s <a href="https://github.com/Aider-AI/aider/blob/v0.5.0/README.md">early release</a>, published on <a href="https://pypi.org/project/aider-chat/0.5.0/">June 8, 2023</a>, supported repository editing, diffs, git commits, and undo in a terminal workflow. Cursor <a href="https://www.cursor.com/blog/problems-2023">was building</a> around codebase context, inline edits, and constrained agents inside its editor.</p>
    <p>these tools made the surrounding interface part of the value. context selection, change review, and recovery became product decisions.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2023">2023</time></p>
    <h2 id="the-benchmark-becomes-a-real-repository">the benchmark becomes a real repository</h2>
    <p>SWE-bench <a href="https://arxiv.org/abs/2310.06770">collected</a> 2,294 real GitHub issues and their pull requests from twelve Python repositories. the paper reported that its best evaluated model, Claude 2, resolved 1.96 percent of those issues.</p>
    <p>that historical result describes the paper’s evaluation. the benchmark gave the field a harder target: repository work required long context, execution environments, and coordinated edits across files.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2024-04-29">april 2024</time></p>
    <h2 id="the-task-becomes-the-unit-of-work">the task becomes the unit of work</h2>
    <p>GitHub <a href="https://github.blog/news-insights/product-news/github-copilot-workspace/">previewed Copilot Workspace</a> as a task based environment that could move from an issue or prompt through planning, implementation, testing, and execution.</p>
    <p>the interface moved above individual completions and toward a reviewable sequence of agent work.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2024-05">may 2024</time></p>
    <h2 id="the-harness-becomes-its-own-engineering-problem">the harness becomes its own engineering problem</h2>
    <p>SWE-agent <a href="https://arxiv.org/abs/2405.15793">showed</a> that the interface between a model and a computer materially affects results. its custom interface let the agent navigate repositories, edit files, and run tests.</p>
    <p>this made the harness legible as its own engineering layer alongside model capability.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2024-11-25">november 2024</time></p>
    <h2 id="tools-get-a-shared-protocol">tools get a shared protocol</h2>
    <p>Anthropic <a href="https://www.anthropic.com/news/model-context-protocol">released the Model Context Protocol</a> as an open standard for connecting assistants to tools and data sources. the launch included a specification, software development kits, local server support, and an open repository of servers.</p>
    <p>agent capability started depending more visibly on the connections around the model.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2025">2025</time></p>
    <h2 id="terminal-and-cloud-agents-spread">terminal and cloud agents spread</h2>
    <p>GitHub <a href="https://github.blog/news-insights/product-news/github-copilot-the-agent-awakens/">introduced agent mode</a> for Copilot in VS Code in February. Anthropic <a href="https://www.anthropic.com/news/claude-3-7-sonnet">launched Claude Code</a> as a terminal research preview later that month. OpenAI <a href="https://openai.com/index/introducing-codex/">launched Codex</a> as a cloud software engineering agent in May.</p>
    <p>the product decision now included execution location, permissions, context, and review surface.</p>
  </li>
  <li>
    <p class="history-year"><time datetime="2026">2026</time></p>
    <h2 id="supervision-gets-a-dedicated-surface">supervision gets a dedicated surface</h2>
    <p>on February 2, OpenAI <a href="https://openai.com/index/introducing-the-codex-app/">launched the Codex app</a> for supervising agents across projects, threads, and isolated worktrees. on April 2, Cursor <a href="https://cursor.com/blog/cursor-3">introduced a workspace</a> centered on parallel local and cloud agents, review, and handoffs.</p>
    <p>supervising several tasks puts scope, context, permissions, and integration into the interface. each completed task still needs an understandable result and a place for review.</p>
    <figure><a href="https://openai.com/index/introducing-the-codex-app/"><img src="https://images.ctfassets.net/kftzwdyauwt9/7eyalGUXstkzzzJ3Pb008m/9f71260a3f127dc142cc8c479d0cf68f/Installer4.png?fm=webp&q=90&w=1600" alt="the Codex app supervising agent work" loading="lazy" width="1600" height="900" /></a><figcaption>product image from <a href="https://openai.com/index/introducing-the-codex-app/">OpenAI’s February 2026 announcement</a></figcaption></figure>
  </li>
</ol>

## what the timeline explains

the useful pattern is how much of the work moved into the loop. a completion
suggests code; a repository task can inspect files, run a command, use its output,
and return a change for review. improvements can come from the model, the tools
it receives, or the environment and interface around them.

that gives a practical way to evaluate a new release. look for the part of the
workflow it changes, then try a task that exercises that part. a new model score,
a different tool interface, and a better review surface each need an example
suited to the claim. the product guides carry the current details; the timeline
provides the context for understanding what changed.
