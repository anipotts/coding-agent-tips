---
title: grok
description: a current source based map of grok build, grok bot, and the wider grok product surface.
products: [grok]
updatedAt: "2026-09-07T16:33:00-04:00"
status: pending
evidence: [official-source, analysis, open-question]
sources: [grok-build, grok-bot, grok-bot-mobile, grok-bot-computer, grok-bot-approvals, grok-bot-profiles, grok-bot-mobile-trackpad-capture, x-api, grok-assistant]
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

## cooperative computer use

<div class="publication-embed" data-media-id="grok-bot-mobile-trackpad">
  <iframe src="https://platform.twitter.com/embed/Tweet.html?id=2094265782054367651&amp;dnt=true&amp;hideThread=true&amp;theme=light" title="Grok Bot mobile screenshot showing the virtual desktop and trackpad menu, in Japanese" width="360" height="716" style="--embed-height: 716px; --embed-height-mobile: 596px" loading="lazy" allow="autoplay 'none'" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerpolicy="no-referrer"></iframe>
  <p class="publication-embed-credit">mobile desktop and trackpad menu, shared by <a href="https://x.com/old_pgmrs_will/status/2094265782054367651" target="_blank" rel="noopener noreferrer">Will Oldgram (@old_pgmrs_will) on X</a>.</p>
</div>

### computer view

you can literally see the browser the agent is working in. it's like being
on a Zoom call where the speaker is sharing their screen: you can focus on
the presentation when you want to see what they're doing. with Grok Bot,
you swipe from the conversation into the computer view, with its terminal
and browser.

when you don't need to watch the screen, you can go back to chatting with
other agents while the virtual computer keeps working in the
[background](https://docs.x.ai/grok-bot/computer-and-apps). you choose when
to watch, when to step in, and when to let it keep going.

### taking control

you can control the virtual mouse/cursor with your fingertip and use your
phone's keyboard on the agent's computer. if it reaches a login screen, you can
[type your password](https://docs.x.ai/grok-bot/mobile) into the site yourself,
then hand control back and tell the agent to keep going. it feels built
natively for that back and forth.

some connections also offer [masked secret requests](https://docs.x.ai/grok-bot/approvals-security-and-privacy).
signing in and approving the agent's next action are separate decisions.

### shared computer

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
