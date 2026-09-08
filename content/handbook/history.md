---
title: how coding agents got here
description: a selective timeline of the research, repository tools, and review surfaces behind coding agents.
products: [cross runtime]
updatedAt: "2026-09-07T22:03:00-04:00"
checkedAt: "2026-09-07T15:10:06-04:00"
status: current
evidence: [official-source, analysis]
sources: [transformer-paper, openai-gpt3, openai-codex-paper, github-copilot-preview, react-paper, aider-docs, aider-early-release, cursor-2023-problems, swe-bench-paper, github-copilot-workspace, swe-agent-paper, anthropic-mcp-launch, github-copilot-agent-mode, anthropic-claude-code-preview, openai-codex-launch, openai-codex-app, cursor-3, cognition-devin-launch-post, anthropic-computer-use-demo-post, anthropic-claude-code-launch-post]
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
    <p class="history-year"><time datetime="2024-03-12">march 2024</time></p>
    <h2 id="devin-demonstrates-a-software-task">Devin demonstrates a software task</h2>
    <p>Cognition introduced Devin with a demonstration of an agent using a shell, editor, and browser. the launch brought the idea of delegating a whole software task into a single visible workflow. the video records Cognition’s demonstration at the time.</p>
<div class="publication-embed" data-media-id="cognition-devin-launch-post">
  <iframe src="https://platform.twitter.com/embed/Tweet.html?id=1767548763134964000&amp;dnt=true&amp;hideThread=true&amp;theme=dark" title="Devin launch demonstration (March 2024)" width="360" height="662" style="--embed-height: 662px; --embed-height-mobile: 555px" loading="lazy" allow="fullscreen; autoplay 'none'" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe>
  <p class="publication-embed-credit"><a href="https://x.com/cognition/status/1767548763134964000" target="_blank" rel="noopener noreferrer">Cognition (@cognition)</a>, march 2024.</p>
</div>
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
    <p class="history-year"><time datetime="2024-10-22">october 2024</time></p>
    <h2 id="claude-uses-the-screen">Claude uses the screen</h2>
    <p>Anthropic introduced computer use in beta: Claude could interpret screenshots and act through mouse and keyboard commands. this October 2024 demo shows the screen itself becoming an interface for agent actions.</p>
<div class="publication-embed" data-media-id="anthropic-computer-use-demo-post">
  <iframe src="https://platform.twitter.com/embed/Tweet.html?id=1848742752403476488&amp;dnt=true&amp;hideThread=true&amp;theme=dark" title="Claude computer use demonstration (October 2024)" width="360" height="662" style="--embed-height: 662px; --embed-height-mobile: 540px" loading="lazy" allow="fullscreen; autoplay 'none'" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe>
  <p class="publication-embed-credit"><a href="https://x.com/AnthropicAI/status/1848742752403476488" target="_blank" rel="noopener noreferrer">Anthropic (@AnthropicAI)</a>, october 2024.</p>
</div>
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
    <p>Anthropic’s February 2025 launch recording shows that workflow in the terminal.</p>
<div class="publication-embed" data-media-id="anthropic-claude-code-launch-post">
  <iframe src="https://platform.twitter.com/embed/Tweet.html?id=1894095276740055364&amp;dnt=true&amp;hideThread=true&amp;theme=dark" title="Claude Code terminal launch demonstration (February 2025)" width="360" height="710" style="--embed-height: 710px; --embed-height-mobile: 597px" loading="lazy" allow="fullscreen; autoplay 'none'" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe>
  <p class="publication-embed-credit"><a href="https://x.com/AnthropicAI/status/1894095276740055364" target="_blank" rel="noopener noreferrer">Anthropic (@AnthropicAI)</a>, february 2025.</p>
</div>
  </li>
  <li>
    <p class="history-year"><time datetime="2026">2026</time></p>
    <h2 id="supervision-gets-a-dedicated-surface">supervision gets a dedicated surface</h2>
    <p>on February 2, OpenAI <a href="https://openai.com/index/introducing-the-codex-app/">launched the Codex app</a> for supervising agents across projects, threads, and isolated worktrees. on April 2, Cursor <a href="https://cursor.com/blog/cursor-3">introduced a workspace</a> centered on parallel local and cloud agents, review, and handoffs.</p>
    <p>supervising several tasks puts scope, context, permissions, and integration into the interface. each completed task still needs an understandable result and a place for review.</p>
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
