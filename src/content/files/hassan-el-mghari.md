---
title: "Hassan El Mghari builds an app in a weekend, gives it away, and millions of people turn up"
standfirst: "A New York developer has a habit of building a small AI app the moment a new model makes it possible, publishing the code for free and watching it spread. His apps have reached millions of visitors. He never turned them into a company, and that choice is the interesting part."
seoTitle: "Hassan El Mghari: Weekend AI Apps, Millions of Visitors"
metaDescription: "Hassan El Mghari builds an AI app in a weekend, gives the code away and watches it spread. roomGPT drew 12 million visitors. His five-step method."
fileNumber: 11
publishDate: 2026-12-27
author: "AI Founder Files"
founder:
  name: "Hassan El Mghari"
  role: "Developer and open-source builder; leads developer experience at Together AI"
company:
  name: "roomGPT, restorePhotos, LlamaCoder and other apps"
  website: "https://www.nutlope.com"
  founded: "2023 (roomGPT)"
  hq: "New York City"
  sector: "Consumer and developer AI apps"
  stage: "Side projects alongside a full-time role"
  funding: "None reported"
  businessModel: "Free open-source apps; roomGPT sold credit packs"
pillar: "how-they-built-it"
tags: ["hassan-el-mghari", "roomgpt", "open-source", "viral-apps", "developer-relations", "nutlope"]
sources:
  - title: "Hassan El Mghari, personal site (apps, visitor counts, role)"
    url: "https://www.nutlope.com/"
  - title: "How Hassan grew RoomGPT to 100K monthly visitors in 48 hours, Starter Story (2 November 2024)"
    url: "https://www.starterstory.com/roomgpt-breakdown"
  - title: "Episode 3: Weekend projects to millions served, Cloudflare TV, Friends in Code Spaces (17 April 2025)"
    url: "https://cloudflare.tv/friends-in-code-spaces/episode-3-weekend-projects-to-millions-served/Mg6WOwvl"
  - title: "Posts by Hassan El Mghari, Convex Stack"
    url: "https://stack.convex.dev/author/nutlope"
  - title: "Hassan El Mghari on LinkedIn: it's been exactly a week since I launched roomGPT"
    url: "https://www.linkedin.com/posts/nutlope_its-been-exactly-a-week-since-i-launched-activity-7039805322365935616-tt-3"
  - title: "Hassan El Mghari, AI Engineer speaker page"
    url: "https://ai.engineer/speakers/hassan-el-mghari"
  - title: "The missing layer: design taste in AI agents, AI Engineer World's Fair 2026 (talk)"
    url: "https://ai.engineer/talks/the-missing-layer-design-taste-in-ai-agents"
  - title: "LlamaCoder by Together AI, TestingCatalog"
    url: "https://www.testingcatalog.com/llamacoder-by-together-ai-revolutionizing-ai-assisted-app-development-2/"
  - title: "Bygga: a vibe-coded, open-source 3D IKEA assembly guide that reads instructions out loud, The Menon Lab"
    url: "https://themenonlab.blog/blog/bygga-3d-ikea-assembly-guide-open-source/"
  - title: "The builders behind 2026's weirdest viral AI apps, Differ"
    url: "https://blog.getdiffer.com/builders-behind-2026-weirdest-viral-ai-apps"
draft: true
---

Hello again, and welcome to File #011. Thank you for reading.

In early March 2023, a developer called Hassan El Mghari put a small website online. You gave it a photo of a room in your home, picked a style, and a few seconds later it showed you the same room redecorated: same walls, same windows, new everything else. He called it roomGPT.

A week later he posted the numbers. More than 515,000 people had visited, and they had generated 728,000 rooms between them. He'd spent one or two weekends building it.

Then he gave the code away. Anyone could copy it, and plenty of people did.

Most of the founders in this series built a business. Hassan built a reputation, and what he does with it is different enough that we think it deserves its own file. He isn't trying to get rich from these apps. He's using them for something else, and for a lot of readers it may be the more realistic model. (All figures are in US dollars. The visitor numbers are his own.)

## The short version

- **Who:** Hassan El Mghari, a developer in New York who builds small AI apps in public. Online he goes by Nutlope.
- **What:** a run of free, open-source apps. roomGPT redesigns a room from a photo. restorePhotos repairs old, damaged pictures. LlamaCoder builds a small working app from a one-line request. BlinkShot draws images as fast as you can type.
- **Why it matters:** it's the clearest example of a simple method, building one small demo the week a new AI capability arrives, and of what that method earns you when you aren't trying to start a company.
- **The number to remember:** 12 million. That's the number of visitors his site lists for roomGPT alone. A visitor isn't a customer, though, and we'll come back to that.

## The founder

Hassan started young. In a 2025 interview he described doing freelance programming work while still at school. He later ran a small marketing company for video games, and then worked at a handful of startups, including Vercel, a company that hosts websites for developers.

His job today is at Together AI, where he leads what's called developer experience. That needs a little explaining, because it changes how you should read everything else.

Together AI rents out computing power for running AI models, particularly the open ones that anybody is allowed to use and adapt. Its customers are developers. Hassan's job is to get developers excited about building on Together: he makes demos, writes guides and gives talks. His titles have varied depending on who was introducing him, from senior manager to director to lead. His own site says he manages a team.

So when Hassan builds a free app that runs on Together's models and two million people try it, he's doing his job. That isn't a hidden conflict. He's open about it, and roomGPT came before he worked there. But it means the apps don't need to make money. They pay off for him in other ways.

He also works on the designs with his brother, a small detail from the same interview that we rather liked.

## The method

He has described how he works in enough talks that the steps are easy to set out.

**1. Wait for something to become newly possible.** roomGPT wasn't a new idea. AI room redesign existed, but the results were bad: the AI would move your windows and invent doors. Then a technique called ControlNet appeared that let an image model keep the structure of a picture while changing its style. Hassan saw that this fixed the one thing that had been wrong. He built a quick test to confirm it, and then built the app.

**2. Keep it to one sentence.** He says a demo should be simple enough to explain in a single sentence. "Upload a photo of your room and see it redesigned" passes. The core of roomGPT, he has said, is a single request to the model. The rest of the code is there to present it.

**3. Then make it feel real.** This step is what separates his apps from a thousand other weekend demos. He adds sign-in, a dashboard, a history of what you've made, a way to pay. People don't trust a bare page with a text box on it, and they don't come back to one. They'll treat it as a product if it looks like one.

**4. Publish the code.** Everything goes on GitHub, the site where developers share code, and other developers "star" the projects they like. His site lists 10,000 stars for roomGPT, 6,000 for LlamaCoder and 8,000 for a small tool called AI Commits. Publishing the code brings a second audience, since developers come to learn from it and then write and talk about it.

**5. Let other people do the marketing.** According to a Starter Story write-up, roomGPT grew mainly through videos made by its users. People filmed themselves redesigning their bedrooms and posted the results on TikTok and YouTube. One of those videos reportedly passed three million views. Putting "GPT" in the name, in the spring of 2023, didn't hurt.

## The numbers

| App | What it does | What his site lists |
|---|---|---|
| roomGPT | Redesigns a room from a photo | 12 million visitors, 10,000 GitHub stars |
| restorePhotos | Repairs old photos | 5 million visitors, 4,000 stars |
| LlamaCoder | Builds an app from a prompt | 2 million visitors, 6,000 stars |
| BlinkShot | Generates images in real time | 1.5 million visitors, 1,000 stars |
| Self.so | Turns a LinkedIn profile into a personal website | 80,000 visitors, 2,000 stars |
| AI Commits | Writes notes describing code changes | 8,000 stars |

You'll see other totals quoted: 2.5 million users, more than three million. They aren't contradictions. They come from different years and count different things.

It helps to be clear about three words here. A **visitor** opened the page. A **user** did something on it. A **customer** paid. Hassan's big numbers are visitors. They tell you about reach and nothing about money.

## The money

There's little to report on money, which is itself informative.

roomGPT gave everyone three free redesigns and then sold packs of credits: $9 for 30, $19 for 100, $29 for 200. Starter Story lists its revenue at about $23,000 a month and labels that as "estimated from public sources". You'll also see $276,000 a year quoted, which is the same number multiplied by twelve. The estimate dates from November 2024. Hassan hasn't published a revenue figure himself, and his website doesn't mention money at all.

We have nothing for the other apps. Most are simply free. He has said he keeps them free through usage limits and through partnerships with companies that donate the computing, the database or the sign-in service in exchange for being part of something popular.

He could have gone another way. In March 2023, with half a million visitors in a week, he could have raised money, hired a team and tried to turn roomGPT into an interior design company. He kept working as a developer and built the next thing.

## What it got him

So what did he get, if not a fortune?

- **A career.** He has gone from developer to leading a team at one of the better-known AI infrastructure companies.
- **A stage.** He speaks at the main conferences in his field. His 2025 talk was about using open models to build apps with millions of users. His 2026 talk was about design taste in AI agents.
- **An audience that follows him to the next thing.** When he releases something, a large audience of developers looks.
- **Freedom to keep playing.** He has no investors to answer to and no payroll to meet.

For many people who are good at their craft and don't want to run a company, that's a better outcome than the startup would have been.

## What he's doing now

He's still working the same way.

LlamaCoder, from 2024, was a deliberately open version of a feature that the big AI labs had just introduced: type a request and get a small working app. He built it on an open Llama model running on Together.

In 2026 he released a set of browser games in which different AI models compete to build a small game from the same instructions. He released Bygga, which takes the instruction booklet for flat-pack furniture and turns it into a 3D walkthrough that reads each step aloud. And he released Hallmark, an open-source set of design rules that developers give to their AI coding tools so that what comes out looks less generic. By his account more than 10,000 people tried it in the first six weeks. In late September he said it had passed 50,000 installations and that he was rebuilding it.

Hallmark is a shift worth noticing. His earlier apps were for the public. This one is for other builders who use AI to write their software. He has gone from making demos to making tools for people who make demos.

## The stack

He's open about his tools and chooses them for speed. In a 2024 talk he listed TypeScript and Next.js for the app, a Postgres database, Together AI for the models, Vercel for hosting and Clerk for sign-in. Early versions of roomGPT used a different model host and some Python behind the scenes. If none of those names mean anything to you, the point is that every one of them is an off-the-shelf service. He builds almost nothing from scratch.

## What made it possible

- **Years of practice at building small web apps quickly.** A weekend is enough for him because he has done it a hundred times.
- **A job that rewards the work.** His employer benefits when his demos spread.
- **Sponsored infrastructure.** Companies give him computing and services that a stranger would have to pay for.
- **Paying attention.** He noticed ControlNet in the week it mattered. Anyone could have done that.

> **Try this**
>
> **Keep a "newly possible" list.** Each time a new AI model or feature is announced, write one line: what can a normal person do with this today that they couldn't last month? Most weeks the answer is nothing. Occasionally there's a roomGPT in it.
>
> **Apply the one-sentence test.** If you can't describe the thing in a sentence that a friend would understand, it's too big for a first version.
>
> **Add the boring parts.** Sign-in, a history page, a clear price. They take a day and they're why people treat a demo as a product.
>
> **Decide what it's for before you launch.** Money, reputation and a job lead to different choices. If it's reputation, give the work away and make it easy to share. If it's money, you'll need something that open code doesn't hand to your competitors.
>
> **Show your working.** You don't have to be a programmer. A consultant can publish the template and a designer can publish the file. Things people can reuse get passed around.

## What could go wrong

**Attention fades.** Twelve million visitors is a total over several years. Interest in any one demo drops fast, and the method only works if there's always a next one.

**Anyone can copy it.** That's the cost of publishing the code. AI interior design and photo repair are now crowded with paid products, some of them built on his work.

**The money is mostly unknown.** One outside estimate, for one app, from 2024. Don't read this as an income story.

**It's tied to his employer.** The arrangement works while his interests and Together's line up. If he left, or the company's priorities changed, the free computing might go too.

**Other people's models.** Every app sits on a model he doesn't control. When prices or terms change, the apps change or close.

## What to watch

1. **Hallmark.** Whether a tool for other builders reaches as far as his consumer apps did.
2. **The next capability.** Something new arrives every few months. Which one does he pick up?
3. **roomGPT.** It was reported as active and profitable in late 2024. We found nothing more recent.
4. **Whether he ever starts a company.** He has had every opportunity and hasn't.

He needed a laptop and a free weekend, and he'd noticed something a few days before most people did. He could probably have built a company on roomGPT. He chose to build a reputation, and it has carried him a long way.

---

That's File #011. Thank you for reading it. If it made you think of someone, forward it along, and if there's a founder you'd like to see opened next, tell us at info@aifounderfiles.com. File #012 lands next Sunday.

*Where this came from: Hassan El Mghari's own site, talks and posts, Starter Story (the revenue figure is its estimate) and press and profile coverage. We haven't spoken to him or verified any figure. Claude, made by Anthropic, helped research and draft this file. Spotted a mistake? Email info@aifounderfiles.com and we'll correct it.*
