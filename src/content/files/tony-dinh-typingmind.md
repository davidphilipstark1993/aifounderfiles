---
title: "Five days in March: how Tony Dinh built TypingMind"
standfirst: "A developer whose last two AI products earned about $100 between them built a better chat window in five days, charged for it once instead of monthly, and now says it brings in well over a million dollars a year. Here is what he did, why it worked, and what you can copy."
seoTitle: "Tony Dinh, TypingMind: Built in Five Days"
metaDescription: "On 1 March 2023 OpenAI opened ChatGPT to developers. Five days later Tony Dinh had TypingMind on sale. How he built it, priced it and grew it."
fileNumber: 5
publishDate: 2026-11-15
author: "AI Founder Files"
founder:
  name: "Tony Dinh"
  role: "Founder and developer"
company:
  name: "TypingMind"
  website: "https://www.typingmind.com"
  founded: "2023"
  hq: "Remote (the founder travels)"
  sector: "AI chat interface (software)"
  stage: "Bootstrapped, small team"
  funding: "None reported"
  businessModel: "One-time licences for individuals, subscriptions for teams"
pillar: "how-they-built-it"
tags: ["typingmind", "chatgpt-api", "bootstrapped", "indie-hacker", "pricing"]
sources:
  - title: "Making $22K in 7 days: the story, Tony Dinh's Newsletter (2 April 2023, recapping March 2023)"
    url: "https://news.tonydinh.com/p/making-22k-in-7-days-the-story"
  - title: "Feb 2023 updates: Twitter API, ChatGPT API, Hackaigon, Tony Dinh's Newsletter (5 March 2023)"
    url: "https://news.tonydinh.com/p/feb-2023-updates-twitter-api-chatgpt"
  - title: "Apr 2023: I sold Black Magic, Tony Dinh's Newsletter (9 May 2023)"
    url: "https://news.tonydinh.com/p/apr-2023-i-sold-black-magic"
  - title: "May 2023: I sold my 2 years old business for only $128K, Tony Dinh's Newsletter (5 June 2023)"
    url: "https://news.tonydinh.com/p/may-2023-i-sold-my-2-years-old-business"
  - title: "Quitting my job to pursue full-time indie hacking, Tony Dinh's Newsletter (1 September 2021)"
    url: "https://news.tonydinh.com/p/quitting-my-job-to-pursue-full-time"
  - title: "2023 Recap, Tony Dinh's Newsletter (26 December 2023)"
    url: "https://news.tonydinh.com/p/2023-recap"
  - title: "Another 6-figure exit, and the future, Tony Dinh's Newsletter (19 March 2024)"
    url: "https://news.tonydinh.com/p/another-6-figure-exit-and-the-future"
  - title: "Nov 2024: My first million!, Tony Dinh's Newsletter (22 November 2024)"
    url: "https://news.tonydinh.com/p/nov-2024-my-first-million"
  - title: "Tony Dinh on X: $148k revenue last month, all-time high for TypingMind (5 April 2025)"
    url: "https://x.com/tdinh_me/status/1908345028327727335"
  - title: "Oct 2025 Updates: Code, Money, and Travel, Tony Dinh's Newsletter (9 October 2025)"
    url: "https://news.tonydinh.com/p/oct-2025-updates-code-money-and-travel"
  - title: "I'm building a new email client, Tony Dinh's Newsletter (27 November 2025)"
    url: "https://news.tonydinh.com/p/im-building-a-new-email-client"
  - title: "Tony Dinh on X: 8,000+ new customers and $210K+ revenue in December 2025 (1 January 2026)"
    url: "https://x.com/tdinh_me/status/2006858726884708814"
  - title: "I'm on Product Hunt! + Updates Jun 2026, Tony Dinh's Newsletter (10 June 2026)"
    url: "https://news.tonydinh.com/p/im-on-product-hunt-updates-jun-2026"
  - title: "Best of Product Hunt: June 10, 2026, Product Hunt daily leaderboard"
    url: "https://www.producthunt.com/leaderboard/daily/2026/6/10"
  - title: "Tony Dinh on X: Product Hunt launch brought me $349.3 revenue (16 June 2026)"
    url: "https://x.com/tdinh_me/status/2066776808524333210"
  - title: "I made a game with AI, Tony Dinh's Newsletter (29 August 2026)"
    url: "https://news.tonydinh.com/p/i-made-a-game-with-ai"
  - title: "TypingMind on Product Hunt (2023 launch and 2026 relaunch)"
    url: "https://www.producthunt.com/products/typing-mind"
  - title: "Tony Dinh, Ups and Downs of an Indie Hacker Journey, The Bootstrapped Founder"
    url: "https://thebootstrappedfounder.com/tony-dinh-ups-and-downs-of-an-indie-hacker-journey/"
  - title: "How Tony Dinh built TypingMind to $500K revenue in one year, Starter Story"
    url: "https://www.starterstory.com/typingmind-breakdown"
  - title: "BlackMagic is shutting down, BlackMagic.so"
    url: "https://blackmagic.so"
  - title: "TypingMind"
    url: "https://www.typingmind.com"
draft: true
---

Hello again, and welcome to File #005.

On Wednesday 1 March 2023, OpenAI announced that developers could plug ChatGPT into their own software. Plenty of people will have had the same thought: the official chat window was clumsy, and a nicer one might sell. Almost none of them shipped one that week.

Tony Dinh registered a domain the next day. Then, by his own account, he dithered. For a couple of days he worked on it "on and off", unmotivated and distracted. On Saturday he finally sat down and gave it the whole weekend. On Monday he shared a free version, then added a payment page the same day. The first sale came that Monday.

By the following Saturday it had made about $22,000.

That week is the famous part, and we'll go through it day by day. But the more useful story is on either side of it. Before it, there were two AI products that flopped. After it, there were more than three years in which a weekend project turned into a real company with security audits, sales calls and staff, run by a man who says he works about four hours a day and spent much of 2025 surfing his way round the world. (All figures are in US dollars, and they are Tony's own.)

## The short version

- **Who:** Tony Dinh, a Vietnamese-born developer who quit his job in 2021 to build small software products on his own.
- **What:** TypingMind, a chat window for AI models. You plug in your own account with OpenAI, Anthropic, Google or others, pay them directly for what you use, and pay Tony once for the interface.
- **Why it matters:** it's the cleanest example we know of shipping a small, useful product in the week a new technology arrives. It also shows what that kind of product has to become if it is going to last.
- **The number to remember:** five. That's the number of days between OpenAI's announcement and the first paid sale.

## The founder

Tony spent about seven years as a salaried software developer. By his own timeline he graduated in 2014 and worked as a software engineer, then moved to Singapore in 2018 as a senior software engineer. Along the way he found the indie hacker world: people building small software businesses in public, alone, and posting their revenue as they went.

He started building in his spare time. He announced on 18 August 2021 that he had quit, after seven years as a developer. By then he already had some income from side projects. We have not used a single monthly figure for that income, because the ones in circulation do not agree and are not all his.

Two of those early products are worth knowing about. DevUtils is a Mac app that bundles the small tools developers reach for all day, and he calls it his first successful indie product. Black Magic was stranger and more successful: a tool that let people dress up their Twitter profiles, most famously with a progress bar. In his own posts from late 2022 and early 2023 the monthly figure for Black Magic moves around in the low-to-mid teens of thousands of dollars.

Black Magic depended entirely on Twitter's API, the gateway outside software uses to work with Twitter. In February 2023 Twitter announced that free access was ending, without saying what it would cost. In his newsletter of 5 March 2023, the day before TypingMind went on sale, Tony wrote that nobody knew the price yet, and that he would be happy to pay $100 a month. We'll come back to how that turned out.

One more thing about him. He is blunt about what he's bad at. "I really suck at marketing in general," he wrote in October 2025. What he had instead of marketing skill was an audience. By March 2023, after two years of sharing his work in public, about 76,000 people followed him on Twitter.

## Two flops first

This part gets less attention.

When the AI wave arrived, Tony didn't start with TypingMind. He built two other AI products first, EmojiAI and AskCommand. He promoted them to his audience, then about 50,000 people, and one tweet got about 5,000 likes.

Between them, the two products earned about $100.

So he had an audience, the technology was new, and the launch tweet went viral. He still made about enough for a nice dinner. If you take one thing from this file, take that: attention isn't the same as demand. Five thousand people can like something that nobody needs.

It also makes what came next harder to explain away. His audience had grown, from about 50,000 followers when he launched the flops to about 76,000, and ChatGPT's API had just opened. But he had an audience and new AI technology for the flops too. Tony says he can't tell exactly what made the difference. The obvious candidate is that TypingMind fixed something people were already irritated by every day.

## Five days in March

Here is the week, from Tony's own newsletter.

| Date (2023) | What happened |
|---|---|
| Wed 1 March | OpenAI announces the ChatGPT API. Tony decides the same day to build a better chat interface |
| Thu 2 March | He registers typingmind.com |
| Thu to Fri | Slow progress and low motivation. He works on it "on and off" |
| Sat 4 and Sun 5 March | He gives the whole weekend to finishing it |
| Mon 6 March | He shares a free version, then adds payment. The first purchase arrives the same day |
| Tue 7 to Fri 10 March | He tweets every new feature as he ships it. Running sales pass about $1,000, then $2,000, $4,000 and $10,000 |
| Sat 11 March | Product Hunt launch. It finishes first for the day with 902 votes (Tony's count at the time), and running sales reach about $22,000 |

Two things stand out.

The first is the dithering. He is open about it, and that matters, because the version of this story that gets passed around is "built in a weekend", which makes it sound like one clean burst of inspiration. The real version has two slow days in the middle. He wrote that if he hadn't given it the weekend, he might never have finished it.

The second is where the money came from. You'll often read that TypingMind grew through Reddit and word of mouth. That's true later. It isn't true of launch week. By Tony's own estimate, about 99 percent of those first sales came from his Twitter followers. He announced it there, and then every time he added a feature he tweeted it. The tweets were his changelog and his advertising at the same time. Product Hunt and his newsletter added to sales that were already coming in.

## The decision that made it work

TypingMind looked like a simple product, and it was. The clever part was what he decided not to build.

**You bring your own key.** To use TypingMind you plug in your own API key from the model company, which is roughly an account number. Every question you ask is billed to you, by them, at their price. Tony never pays for anyone's usage. A customer who uses it all day costs him exactly the same as one who never opens it: nothing.

**You pay once.** In March 2023 the market was filling up with ChatGPT "wrappers" charging a monthly fee. Tony went the other way and sold a licence for a single payment.

He could do that because of how the thing was built. The first version of TypingMind was a static web app: a page that runs entirely in your browser. He had no server to run, no database to maintain and nobody's conversations to store. With no monthly costs, he didn't need monthly income to cover them.

The pricing followed from the engineering. He could charge once because he'd built something that cost him nothing to keep running.

His reasons, as he set them out, were that everyone else was charging monthly, that OpenAI might simply build his features into its own product, and that with no server he had no running costs to cover. So he built something with no ongoing bill, took the money up front, and made sure that if it all ended tomorrow he would owe nothing.

For the customer there was a bonus he hadn't had to invent. With no server in the middle, your conversations stay on your own device. For people nervous about pasting work into a chatbot, that mattered.

## Meanwhile, Black Magic

Within three weeks of TypingMind's launch, another Twitter app company told Tony privately what the API would cost. In his newsletter recapping March 2023, he wrote that the cheapest tier usable by a business like his was $42,000 a month. Twitter also announced a free tier and a $100 tier, but he judged both too limited for "any serious business".

Black Magic was making about $14,000 a month at the time of the sale, by his account. It couldn't pay that bill, and Twitter was expected to cut off free access within about two weeks. He sold it to Hypefury for $128,000, less than one year's revenue, about three months after turning down an offer of $500,000. He called his feelings about it "mixed". He counted not selling earlier as his own failure, but he was glad customers could keep using the product. Black Magic carried on after the sale; its website now says it shut down on 1 July 2026.

So the platform risk he had priced into TypingMind arrived from a different direction, weeks later, and took his best-earning product with it. With Black Magic sold, he wrote, he had no other recurring revenue, and TypingMind had all his focus.

## From a licence to a company

One-time sales have an obvious weakness. Once everyone who wants one has bought it, you've run out of customers. For about a year and a half that didn't happen. Tony says lifetime licence sales kept growing for 20 months, fed by mentions on Reddit and social media and by people recommending it to each other.

It also stopped being a one-man show almost at once. Less than four weeks after launch he had brought in a freelance developer, and in May 2023 he hired his first full-time employee.

He had wanted a business-to-business product since Black Magic, and within a month of launch he was planning a version for teams. By May 2023 he was offering a custom deployment for companies. The business side took off when people who had bought TypingMind for themselves brought it into work. That became the Team version: a private, company-branded AI workspace that a business sets up once and gives to its staff, with the company's own keys, documents and controls. And companies pay monthly.

By November 2024 he was describing deals for 1,000 seats, and one for 3,000. About half his monthly revenue was still one-off licences, and the other half was now recurring. That month he checked his profit-and-loss statement and found that TypingMind had taken in $1 million over the previous twelve months.

It changed the kind of work he was doing, and he's honest that he doesn't love all of it.

| | Launch week, March 2023 | By late 2025 |
|---|---|---|
| Who buys | Individuals, mostly his Twitter followers | Individuals, plus companies buying hundreds or thousands of seats |
| What they pay | Once | Once for individuals, monthly for teams |
| What it needs | A browser | Security audits, contracts, single sign-on |
| How it sells | A tweet | Word of mouth for individuals, sales calls and resellers for companies |
| Who does the work | Tony | Tony and a small team: staff, freelancers and a design agency |

Big customers ask for things that individuals never do. He has written that he spent at least $20,000 on security certifications (SOC 2, HIPAA and GDPR compliance), outside security audits and lawyers for contracts. He found sales calls draining, noticing that many of them never got past answering questions. He admitted he had let leads go cold because he never called people who filled in the contact form, and decided to hire a "Sales Closer". In April 2025 he posted that he had welcomed two new teammates, a developer and a designer.

By October 2025 the recurring Team revenue had passed half the total.

## What he tried that didn't work

Paid advertising, mostly. In November 2024 he called the results of ads and sponsorships "terrible" and said he had stopped. In October 2025 he reported a $600 campaign that had produced two sales.

As of October 2025 he said no paid channel had worked for him. Nearly everything still comes from people telling other people. That's a strength, because it costs nothing, and it's also a risk, which we'll come to.

## The numbers

Every figure here is Tony's own, from his newsletter or his posts. Nothing has been checked against a payment processor.

| When | What he said | Where |
|---|---|---|
| March 2023 | About $22,000 in the first week | Newsletter |
| November 2024 | $1 million in the previous 12 months. One-off licences were then about half of monthly revenue | Newsletter |
| March 2025 (posted April) | $148,000 in the month, an all-time high at the time | X |
| October 2025 | About $130,000 to $160,000 a month, more than half from teams. "More than $1M a year" | Newsletter |
| December 2025 | $210,000 or more, his best month, and 8,000 new customers in 2025 | X (1 Jan 2026) |

Two things are missing. The first is profit. He gives revenue and doesn't say what he keeps. Software with no usage costs usually has healthy margins, and he describes himself as financially independent, but that's our reasoning and he hasn't published a figure. The second is anything more recent: the latest TypingMind revenue figure we could find from him is for December 2025.

## How he lives

He has written about working roughly four hours a day. In his October 2025 update he said he'd been financially independent for about two years, that his lifestyle is "not very expensive" and hasn't changed much, and that he could stop and live off his investments if he chose.

He hasn't stopped. He and his wife were on a round-the-world trip, trying to find a surf town wherever they went. That year took them to Korea, Taiwan, France, Switzerland, Spain, Australia and Portugal. He was writing from Bali, where he called the waves "amazing". In November 2025 he co-hosted a month-long residency for ten indie hackers in Da Nang, Vietnam, to show more people that this way of building a company exists. It ran again in May 2026.

He also wrote this: for years, the pressure to keep earning meant he couldn't tell whether he loved coding or was just afraid of losing his income. Now that the pressure is gone, he has his answer. He says he is "in love with building with AI" and still writes code every day.

## Where the AI is

It would be easy to assume that AI built this business. Mostly it didn't. AI is what Tony sells access to. TypingMind is a front door to other companies' models, 18 providers of them by its own count this year.

In 2026 his newsletter became much more specific about how he builds. He builds side projects with Claude Code, including iOS apps that an agent built and shipped to the App Store largely unattended, and he uses Cursor's cloud agents to tidy up code overnight. What it shows about TypingMind itself is a way of working: a small core, shipped fast and improved in public.

## What made it possible

It's worth being honest about what he had going for him, because not all of it can be copied.

- **Seven years as a professional developer.** He could build a polished product in a weekend because he had years of professional practice behind him.
- **76,000 followers.** Nearly all the launch revenue came from an audience that took two years to build.
- **A good read of platform risk.** He priced TypingMind as a one-off partly because he expected OpenAI to absorb wrapper products. Weeks later, Twitter's API pricing proved the point by forcing him to sell Black Magic.
- **Speed.** Five days from announcement to first sale.

The first two took years. The last two are available to anyone.

> **Try this**
>
> **Write down the annoyance, not the idea.** Next time a new tool or model arrives, don't ask "what could I build with this?" Ask "what is irritating about the official version?" Build that one fix and nothing else.
>
> **Check whether your costs can be someone else's.** Could your customer bring their own account, their own API key or their own storage? If their usage costs you nothing, you can charge once and still be safe.
>
> **Test demand before you trust applause.** Tony's two flops got thousands of likes and about $100. Before you build, ask ten people to pay, not to like.
>
> **Give a paid channel one small, honest test.** His was $600. It bought two customers. Know your number, and stop when it's bad.
>
> **Let individual buyers pull you into teams.** He planned a business version early, but it grew because people who had bought it for themselves brought it to work. Find out what a company will need (security paperwork, contracts, sign-on) before you promise anything.

## What could go wrong

**The model companies.** TypingMind only exists because OpenAI, Anthropic, Google and the rest let outside software use their models at a fair price. If they change the access, the pricing or the terms, he feels it straight away. He has been through it before: Twitter's API pricing forced him to sell Black Magic in 2023.

**The free alternatives keep improving.** ChatGPT, Claude and Gemini all have their own apps, and they add features every month. TypingMind has to stay noticeably better, or at least different, for people who already have one of those for nothing.

**It isn't a one-person business any more.** That's normal and it isn't a criticism. But the work is now security reviews, long sales cycles and managing people, which are the things he has said he doesn't enjoy.

**Word of mouth is the only engine.** No paid channel has worked so far. That's fine until it slows, and he'll have no lever to pull when it does.

**One person's numbers.** He has been unusually open, for years. It is still his own account, with no outside check and no profit figure.

## What to watch

1. **The relaunch.** In June 2026, three years after the first launch, he put TypingMind back on Product Hunt. Product Hunt's leaderboard has it second for the day, and Tony later posted that the launch brought in $349.30. Does a product this mature still find new individual buyers?
2. **The Team business.** Do the big seat counts stay as long-term subscriptions?
3. **The official apps.** Do the model makers close the gap TypingMind fills?
4. **What comes next.** Since late 2025 he has started an email client (Midday), shipped small iOS apps built by an AI agent and made a game. Do any of them become a second business, or does TypingMind remain the whole company?

It took a domain name, one weekend, and a decision to charge once. He had already built two things nobody wanted. The third one fixed a real annoyance, cost him nothing to run, and had its first paying customer before he'd talked himself out of it.

---

That's File #005. Thank you for reading it. If it made you think of someone, forward it along, and if there's a founder you'd like to see opened next, tell us at info@aifounderfiles.com. File #006 lands next Sunday.

*Where this came from: Tony Dinh's own newsletter and posts, with figures as he reports them, plus interviews, profiles and Product Hunt's own pages, listed below. We haven't verified the figures independently and we haven't spoken to him. A note on disclosure: Anthropic makes Claude and Claude Code. Tony says he builds with Claude Code, Anthropic's models are among those TypingMind connects to, and Claude helped research and draft this file. Spotted a mistake? Email info@aifounderfiles.com and we'll correct it.*
