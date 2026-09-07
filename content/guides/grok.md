---
title: grok
description: a current source based map of grok build, grok bot, and the wider grok product surface.
products: [grok]
updatedAt: "2026-09-07T14:37:16-04:00"
status: pending
evidence: [official-source, analysis, open-question]
sources: [grok-build, grok-bot, grok-bot-mobile, grok-bot-computer, grok-bot-approvals, grok-bot-profiles, x-api, grok-assistant]
redirects: []
voice: evidence
navigation:
  scope: grok
  order: 10
---

## this is grok

Grok now offers an assistant accessible through the web or X, a coding agent called Grok Build, and persistent
cloud agents called Grok Bot. this section keeps those products separate so a
model comparison does not get confused with a harness or a cloud computer.

<div class="surface-bento">
  <figure><a href="https://docs.x.ai/build/overview"><img src="/media/publications/grok-build-1200.webp" srcset="/media/publications/grok-build-640.webp 640w, /media/publications/grok-build-1200.webp 1200w" sizes="(max-width: 48rem) calc(100vw - 2rem), (max-width: 72rem) calc((100vw - 20rem) / 2), 32rem" alt="Grok Build in its coding interface" loading="eager" fetchpriority="high" decoding="async" width="1200" height="630" /><figcaption>Grok Build and Build Mode</figcaption></a></figure>
  <figure><a href="https://docs.x.ai/grok-bot/overview"><img src="/media/publications/grok-bot-1200.webp" srcset="/media/publications/grok-bot-640.webp 640w, /media/publications/grok-bot-1200.webp 1200w" sizes="(max-width: 48rem) calc(100vw - 2rem), (max-width: 72rem) calc((100vw - 20rem) / 2), 32rem" alt="an xAI product graphic for Grok tools" loading="lazy" decoding="async" width="1200" height="630" /><figcaption>Grok Bot and persistent cloud work</figcaption></a></figure>
</div>

as of september 7, 2026, [Grok Build provides](https://docs.x.ai/build/overview) an interactive terminal CLI,
headless scripting, ACP integration, custom models, skills, plugins, hooks, MCP,
subagents, and workflows. [Grok Bot](https://docs.x.ai/grok-bot/overview) is an OS level application that offers
persistent Grok agents on a shared cloud computer that you can oversee from your computer or phone.

i use Grok drastically less than Codex and Claude Code, so these pages won't
give you the perspective of an extreme power user. for most of Grok's life,
i've used it through the X app or watched people bring it into comment replies
to argue with people who definitely don't go outside of their house ever.

i haven't had much personal need for real time social context. if that's what
you're looking for, [Grok and SuperGrok](https://x.ai/grok) are worth exploring. for programmatic
access to posts and other X platform data, there's the
[X API](https://docs.x.com/x-api/introduction).

what interests me about Grok Bot is the polished mobile experience: chat with
an agent, see the computer it's using, step in yourself, then hand it back.
it brings to mind the promise of Claude Cowork, ChatGPT Agent, and
especially OpenClaw. i think of OpenClaw as an agent you give “claws” to.
right now, a browser and the ability to coordinate other agents might be the
most useful claws: create them, message them, read their histories, check what
they're doing, and archive them when the work is done.

if you're a creator, influencer, or voice making your living primarily on X,
there's also the appeal of working within the broader X and xAI ecosystem.

Grok Bot also feels the most personified to me out of these three products,
with Codex somewhere in the middle and Claude Code at the other end. the
names and customizable appearances make individual Bots feel more like
characters. the icons, shapes, and colors i've seen are part of that
impression. xAI documents [editable names and avatars](https://docs.x.ai/grok-bot/bots),
and Bots can [message each other and pass work between them](https://docs.x.ai/grok-bot/overview).
those details give the whole experience a different personality.

## grok bot puts the computer beside the conversation

### swipe from the chat into the computer

you can literally see the browser the agent is working in. i imagine it like
being on a mobile Zoom call and sliding through the participants because they
do not all fit on one screen. here, you chat with an agent, then swipe to the
right and see its computer view, with a terminal and a browser.

that is the part i want to go into with Grok Bot. the conversation and the
computer are right beside each other. you can look at the actual page, see
where the agent is, and step in when you need to.

### take over, then hand it back

you can tap into cursor mode, intercept the agent's actions, and use the
keyboard on the virtual browser. type a password, do an action yourself, then
hand it back to the agent. it feels built natively for that back and forth.

xAI's [mobile documentation](https://docs.x.ai/grok-bot/mobile) describes the
same handoff: open the computer from a conversation, take over for a password
or verification step, and return control.

entering a password happens in the service's login screen while you have
control. xAI also documents [secure handoffs](https://docs.x.ai/grok-bot/approvals-security-and-privacy)
and supported masked secret requests for sensitive inputs. completing a login
and approving the Bot's next action are separate decisions.

### each bot has a screen on the shared computer

the interface makes it feel like each agent has its own computer. underneath,
xAI says the Bots on your account share one persistent
[cloud computer](https://docs.x.ai/grok-bot/computer-and-apps). each Bot has its
own screen, while files, browser sessions, and logins are shared.

that explains how another Bot can pick up saved work without repeating the
setup. it also means a login you add for one Bot becomes available to the
others on your account. the separate screens give them room to work in
parallel; the account is the boundary around the computer.

continue with [configuration](/guides/grok/configuration/) or
[recommendations](/guides/grok/recommendations/).
