---
title: your first task
description: a first useful claude code loop with one repository, one task, and one way to verify it.
products: [claude-code]
updatedAt: "2026-09-07T16:33:00-04:00"
checkedAt: "2026-09-07T15:02:34-04:00"
status: pending
completion: outline
draft: true
evidence: [official-source, analysis, open-question]
sources: [anthropic-claude-overview, anthropic-memory]
redirects: []
voice: evidence
navigation:
  scope: claude-code
  order: 20
---

## what should i try first?

pick a change whose result you can recognize: a broken edge case, a confusing
error, or a small layout problem. give Claude the starting behavior, the
expected behavior, and the boundary of the change. that makes its first pass
something you can evaluate.

use Anthropic’s [setup guide](https://code.claude.com/docs/en/overview) for the
current installation and login steps. start Claude Code inside the repository
you intend to work on. check the branch and existing changes before giving it
an editing task, especially in a checkout other people or agents use.

### fix a small bug

this example uses Node’s built in test runner and needs no installed packages.
create an empty scratch folder, then save this as `label.mjs`:

```js
export function displayLabel(value) {
  return value.trim();
}
```

save this as `label.test.mjs`:

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { displayLabel } from './label.mjs';

test('labels collapse whitespace without losing the words', () => {
  assert.equal(displayLabel('  two   words  '), 'two words');
  assert.equal(displayLabel('one\ttwo\nthree'), 'one two three');
  assert.equal(displayLabel('   '), '');
  assert.equal(displayLabel('already clear'), 'already clear');
});
```

run `node --test label.test.mjs`. the first assertion fails because trimming
only changes the edges of the string. start `claude` in that folder and use:

```text
fix displayLabel so each whitespace run becomes one ordinary space and the
edges are trimmed. preserve the words and their casing. the input contract is
a string. run node --test label.test.mjs and explain the change and result.
```

the task has a bounded input contract and an executable finish line. it also
leaves a real decision to the agent: how to implement that behavior. this is
an instructional fixture, separate from Ani’s project history.

## save the project instructions

[`CLAUDE.md`](https://code.claude.com/docs/en/memory) can hold the facts that
apply across tasks: where the code lives, how to run checks, and which project
conventions matter. for the exercise, two lines are enough:

```markdown
Use the existing JavaScript module style.
Run node --test label.test.mjs after changing label behavior.
```

keep today’s bug and acceptance criteria in today’s prompt. once the bug is
fixed, those details become history; the test command can remain useful.
Anthropic’s `/init` command can propose repository instructions. review its
inferences against the actual scripts and conventions before adopting them.

## how do i know it worked?

read the changed function and rerun the test. check that the agent preserved
the test’s meaning while fixing the implementation. for UI work, add the
rendered state at the relevant viewport; a successful build answers a different
question from whether a person can use the page.

finish with three concrete facts: what changed, what verified it, and what
remains open. if the agent ran into an unrelated failure, keep that limitation
attached to the result. the same loop scales to a real repository when its
inputs, ownership, and checks stay understandable.
