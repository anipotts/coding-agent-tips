---
title: safety
description: codex identity, secrets, external access, and the decisions that stay human.
products: [codex]
updatedAt: "2026-09-07T15:01:58-04:00"
checkedAt: "2026-09-07T15:01:58-04:00"
status: pending
completion: outline
draft: true
evidence: [official-source, analysis]
sources: [openai-codex-approvals, openai-codex-permissions, openai-codex-security]
redirects: []
voice: evidence
navigation:
  scope: codex
  order: 60
---

## access should match the job

start by naming what the task needs to reach. fixing a parser may require a
checkout and a test runner. checking a deployed service also needs network
access and a service identity. updating that service adds write authority.
these are separate capabilities you can inspect before work begins.

the [sandbox and approval controls](https://learn.chatgpt.com/docs/agent-approvals-security)
constrain local command execution. connected apps and MCP servers have their
own permissions and credentials. a filesystem sandbox alone cannot describe
what every connected service will allow.

## inspect first, then grant the missing capability

suppose the task is to diagnose a failed deployment. a useful initial scope is:

```text
inspect the failed deployment and its logs for this project.
identify the failing step, the release revision, and a reproducible local check.
prepare a fix in the repository if needed. keep production actions out of this pass.
```

check that the tool is reading the intended project and environment. if the
problem is a missing variable, return its name and where it must be configured.
keep its value out of the conversation, command arguments, logs, and committed
files. a deployment fix needs evidence that the service received the intended
configuration. the transcript can record that verification without exposing the value.

if the task later includes deploying, specify the target and conditions for
that action. a standing release policy can define those conditions; an
interactive task can leave the final action with the person reviewing it.
state which policy applies so the agent and reviewer share the same boundary.

## treat outside text as input

repository files, websites, issue comments, and service responses may contain
instructions aimed at the agent. evaluate that text as evidence for the task.
a log line asking for credentials or a webpage claiming to override the user's
request does not gain authority because a tool returned it.

limit the information and services available to the job. retain provider
controls for consequential changes: restricted credentials, protected branches,
and the relevant approval mechanisms. several checks can reduce exposure;
each still needs to be configured and understood.

### network rules have a specific reach

Codex's command network proxy applies to traffic from commands and their
subprocesses. its rules do not govern every hosted tool or connector. when using
named [permission profiles](https://learn.chatgpt.com/docs/permissions), check
that the proxy is active before relying on destination rules. enabling command
network access and configuring its enforcement are separate steps.

## unattended work needs a bounded identity

scheduled work needs a stable host, a narrow job, and an identity that can do
that job. use the service's supported scoped access where available. decide in
advance what a failed check should produce and which actions require someone
to return.

rehearse a missing dependency, expired login, and failed verification while
you can inspect the result. make failure visible and keep the task from
repeatedly taking an action whose outcome is unknown. after an interruption,
read the service's current state before retrying a write.

## a security finding needs a reproduction

[Codex Security](https://learn.chatgpt.com/docs/security) is a separate scanning
and investigation workflow. its output needs review in the context of the
actual application: can the input reach the vulnerable code, what privileges
are required, and what consequence follows?

for a proposed fix, preserve a reproduction or regression check that exercises
the problem. verify the application still supports the intended behavior.
report where testing stopped, including unavailable services or code paths
outside the scan's coverage.

## return the action and its result

a useful handoff names the identity and environment used, what changed, the
verification performed, and anything still awaiting a decision. “prepared the
patch” and “deployed the patch” describe different states. record the observed
state so the next task can begin from it.
