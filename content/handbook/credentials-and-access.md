---
title: credentials and agent access
description: how credentials reach browser sessions and application processes, with scoped identities and a harmless test.
products: [codex, claude-code]
updatedAt: "2026-09-07T15:08:30-04:00"
checkedAt: "2026-09-07T15:08:30-04:00"
status: pending
completion: outline
draft: true
evidence: [official-source, analysis, open-question]
sources: [onepassword-codex, onepassword-claude, onepassword-cli-secrets, onepassword-service-accounts]
redirects: [/guides/credentials-and-access/]
voice: evidence
navigation:
  scope: handbook
  order: 30
---

## credential access

start with the operation: read a deployment result, run a development server,
or sign in to a browser session. then identify the account and credential that
operation needs. a login shared with an agent can carry much more access than
the immediate task requires.

an access layer can keep credential values out of prompts and supply them to
the application at runtime. the application still needs to use the value.
inspect the path from storage to process, including what can appear in its
output, instead of treating encryption at rest as the whole design.

## choose the path that fits the work

### an interactive browser login

[1Password for Claude](https://1password.com/blog/1password-for-claude) describes
an integration on Mac that requests consent before filling a login or one time
code into the browser. 1Password says the secret stays outside the model’s
context and its Agentic Mode restricts the extension while a compatible agent
is using the browser.

that is a specific integration with setup and compatibility requirements.
check the documented apps and extensions before expecting the same behavior
from an arbitrary browser tool. approving a credential request also has a
specific meaning: the session can use that login. the actions it takes after
login still need to follow the task’s authority and the account’s permissions.

### an application that needs environment variables

[1Password’s Codex integration](https://1password.com/blog/1password-trusted-access-layer-for-openai-codex)
uses a local MCP server for managing Environments and arranging runtime access.
the documented design exposes names and operations through the integration,
while the application receives the variables it needs. the May 2026 launch
describes explicit approval and opt in requirements.

keep that boundary visible when reviewing an integration. ask which process
receives the value, how long it needs it, and whether the agent can cause the
process to print it. an application with debug logging can expose information
even when the original credential exchange was carefully scoped.

## try the data flow with a harmless fixture

[1Password CLI](https://developer.1password.com/docs/cli/secrets-scripts) supports
secret references and `op run` for runtime environment injection. the example
below assumes an existing test item, with a harmless dummy value, in a test
vault you control. the reference names are illustrative.

save the reference in `demo.env`:

```dotenv
DEMO_TOKEN=op://sandbox/demo/token
```

save this program as `check-demo.mjs`:

```js
if (!process.env.DEMO_TOKEN) {
  console.error('demo variable missing');
  process.exit(1);
}
console.log('demo variable available');
```

run it through the CLI:

```sh
op run --env-file=demo.env -- node check-demo.mjs
```

the output reports whether a value arrived, and the program makes no network
request. inspect the reference file and program before running them. keep real
vault names and account details out of a published example too.

this exercise checks a narrow part of the path. it leaves the service account’s
scope, the agent’s tool permissions, and the destination application’s behavior
to review separately. use a dummy value while learning where output appears.

## give unattended work an explicit identity

[1Password Service Accounts](https://www.1password.dev/service-accounts) support
access to selected vaults and Environments with defined actions. they give an
automated process an identity separate from a person’s interactive session.

scope that identity to a job. a test runner can receive development credentials;
a deployment task needs an explicit target and release policy. keep the token
that authenticates the service account in the runner’s credential mechanism,
and document who can revoke it.

before leaving a task unattended, run a harmless check of the allowed path and
an expected rejection outside its scope. confirm the account, destination,
output, and expiration or revocation path. record those facts without printing
the credential value.

## keep access and action review connected

a useful result says which account and environment were used, what operation
completed, and which decision remains. “signed in” establishes an authenticated
session. “deployed this revision to staging” needs the deployment result.

choose a credential system by the concrete workflows it supports: interactive
approval, runtime injection, scoped automation, and recoverable access changes.
try one interactive task and one automated task you expect to repeat. compare
the access granted, the interruptions, the output, and the steps to revoke it.
