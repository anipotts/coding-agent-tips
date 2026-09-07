---
title: where this comes from
description: how sources, tests, personal writing, automated checks, and publication are distinguished.
products: [cross runtime]
updatedAt: "2026-09-07T15:08:30-04:00"
checkedAt: "2026-09-07T15:08:30-04:00"
status: current
evidence: [official-source, analysis, open-question]
sources: [handbook-source-registry, handbook-source-checker, handbook-freshness-workflow]
redirects: [/method/]
voice: evidence
navigation:
  scope: handbook
  order: 50
---

this handbook brings together personal observations, source based explanations,
and reproducible examples. each has a different job. a description of a feature
comes from its documentation or a recorded test. a personal opinion needs the
person’s own words behind it.

## read the evidence beside the claim

| label | what it means |
| --- | --- |
| tested | reproduced in a named environment and version, with the tester and limits stated |
| official source | supported by the linked primary documentation or source code |
| analysis | a judgment derived from the stated evidence |
| open question | evidence is missing or incomplete |

one page can carry several labels because its paragraphs make different kinds
of claims. a product feature and an opinion about how that product feels can
sit together, with their basis clear. a source link should support the specific
claim beside it.

a test record should name the task, expected result, environment, version,
commands or interaction, actual result, and limitations. identify whether Ani
or an agent ran it. an agent running a fixture establishes what happened in
that fixture; Ani’s experience using a product remains a separate account.

## check what automation actually checked

the [source registry](https://github.com/anipotts/coding-agent-tips/blob/main/editorial/sources.json)
records source URLs, review dates, evidence types, and tracked package versions.
the repository’s [source checker](https://github.com/anipotts/coding-agent-tips/blob/main/.github/scripts/check_sources.py)
validates that metadata. its optional freshness mode also checks review windows,
compares supplied upstream versions, and fetches watched pages to look for
specific terms.

those signals locate material that may need attention. a page can keep the same
words while changing what they mean, and a changed page can still support the
existing claim. a fetch failure can also look like drift. reading the relevant
source and checking its meaning is a separate step.

### detected changes can become a draft

the configured [weekly freshness workflow](https://github.com/anipotts/coding-agent-tips/blob/main/.github/workflows/freshness-draft.yml)
starts with package version lookups and source checks. when it detects a review
need and a drafting credential is available, a separate job can propose changes
from official update material. path checks limit the draft and exclude
recommendation pages; a later job validates the patch and opens a draft pull
request.

that describes the configured workflow. a successful run, an accurate draft,
and a published update each need their own result. the workflow describes the process available to maintain the site. its run
history and the resulting reviews establish when specific claims were checked.

## keep authorship and review visible

rough notes, dictation, and manual edits provide evidence of what Ani means.
agent generated scaffolds remain proposed material until reviewed. editing one
sentence leaves the authorship and review status of neighboring sentences
unchanged.

the editing process preserves the original meaning while improving structure
and grammar. an unclear personal claim needs clarification; a changing product
fact needs research. those are different gaps. approval of personal experience comes from the
author’s review of that passage.

wording acceptance, factual review, and publication are tracked separately.
a locally finished chapter can still need its author’s review. a merged change
needs deployment verification before it can be described as live.

## use examples within their limits

a useful example includes enough context to repeat the relevant behavior. a
small successful test can establish a mechanism; a broader recommendation needs
to account for the tasks, environments, and failures it covers.

historical launch posts describe a release at that time. current product docs
and dated checks support current behavior. vendor benchmarks describe their own
conditions. the practical question throughout the handbook is what the evidence
lets a reader conclude and what they should still verify in their own setup.
