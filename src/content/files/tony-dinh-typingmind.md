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
  - title: "Making $22K in 7 days: the story, Tony Dinh's Newsletter (March 2023)"
    url: "https://news.tonydinh.com/p/making-22k-in-7-days-the-story"
  - title: "Nov 2024: My first million!, Tony Dinh's Newsletter"
    url: "https://news.tonydinh.com/p/nov-2024-my-first-million"
  - title: "Oct 2025 Updates: Code, Money, and Travel, Tony Dinh's Newsletter"
    url: "https://news.tonydinh.com/p/oct-2025-updates-code-money-and-travel"
  - title: "Tony Dinh on X: $148k revenue last month, all-time high for TypingMind (April 2025)"
    url: "https://x.com/tdinh_me/status/1908345028327727335"
  - title: "Tony Dinh, Ups and Downs of an Indie Hacker Journey, The Bootstrapped Founder (episode 236)"
    url: "https://thebootstrappedfounder.com/tony-dinh-ups-and-downs-of-an-indie-hacker-journey/"
  - title: "How Tony Dinh built TypingMind to $500K revenue in one year, Starter Story"
    url: "https://www.starterstory.com/typingmind-breakdown"
  - title: "TypingMind on Product Hunt (2023 launch and 2026 relaunch)"
    url: "https://www.producthunt.com/products/typing-mind"
  - title: "How much does TypingMind make? (secondary tracker, figures unverified), The AI Receipts (formerly I Made Money With AI)"
    url: "https://theaireceipts.com/blog/how-much-does-typingmind-make/"
  - title: "TypingMind"
    url: "https://www.typingmind.com"
draft: true
---

Hello again, and welcome to File #005. Thank you for being here.

On Wednesday 1 March 2023, OpenAI announced that developers could plug ChatGPT into their own software. Plenty of people will have had the same thought: the official chat window was clumsy, and a nicer one might sell. Almost none of them shipped one that week.

Tony Dinh registered a domain the next morning. Then, by his own account, he dithered. For three days he worked on it "on and off", bored and distracted. On Saturday he finally sat down and gave it the whole weekend. On Monday he shared a free version, then added a payment page the same day. The first sale came that Monday.

By the following Saturday it had made about $22,000.

That week is the famous part, and we'll go through it day by day. But the more useful story is on either side of it. Before it, there were two AI products that flopped. After it, there were three years in which a weekend project turned into a real company with security audits, sales calls and staff, run by a man who says he works about four hours a day and is currently surfing his way around the world. (All figures are in US dollars, and they are Tony's own.)

## The short version

- **Who:** Tony Dinh, a Vietnamese-born developer who quit his job in 2021 to build small software products on his own.
- **What:** TypingMind, a chat window for AI models. You plug in your own account with OpenAI, Anthropic, Google or others, pay them directly for what you use, and pay Tony once for the interface.
- **Why it matters:** it's the cleanest example we know of shipping a small, useful product in the week a new technology arrives. It also shows what that kind of product has to become if it is going to last.
- **The number to remember:** five. That's the number of days between OpenAI's announcement and the first paid sale.

## The founder

Tony spent about seven years as a salaried software developer. He has written about moving from Vietnam to Singapore and, while working from home there, coming across the indie hacker world: people building small software businesses in public, alone, and posting their revenue as they went. Secondary profiles have given 2020 as the year of the move; we have not confirmed the year from his newsletters.

He started building in his spare time. In 2021 he left his job. He announced the decision in August, and has written that September was his last month on a salary. By then he already had some income from side projects. We have not used a single monthly figure for that income, because the ones in circulation do not agree and are not all his.

Two of those early products are worth knowing about. DevUtils is a Mac app that bundles the small tools developers reach for all day, and it was the first thing he built that made real money. Black Magic was stranger and more successful: a tool that let people dress up their Twitter profiles, most famously with a progress bar. In his own posts from late 2022 and early 2023 the monthly figure for Black Magic moves around in the low-to-mid teens of thousands of dollars.

Then Twitter changed what it charged outside developers. In his March 2023 newsletter Tony wrote that the new minimum was $42,000 a month. A product in the mid-teens couldn't pay that bill, and Black Magic was sold. (One profile puts the price at $128,000. We couldn't confirm it, and he has not published a price in the newsletters we have.)

Keep that in mind, because it explains almost everything he did next. He had just watched a platform he didn't control wipe out his best product with a single pricing announcement.

One more thing about him. He is refreshingly blunt about what he's bad at. "I really suck at marketing in general," he wrote in October 2025. What he had instead of marketing skill was an audience. By March 2023, after two years of sharing his work in public, about 76,000 people followed him on Twitter.

## Two flops first

This is the part most tellings leave out.

When the AI wave arrived, Tony didn't start with TypingMind. He built two other AI products first, EmojiAI and AskCommand. He promoted them to that same large audience, and one tweet got about 5,000 likes.

Between them, the two products earned about $100.

So he had an audience, the technology was new, and the launch tweet went viral. He still made about enough for a nice dinner. If you take one thing from this file, take that: attention isn't the same as demand. Five thousand people can like something that nobody needs.

It also makes what came next look less like luck. The third product didn't work because he had a bigger audience or better timing. It worked because it fixed something people were already irritated by every day.

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
| Sat 11 March | Product Hunt launch. It finishes first for the day with 902 votes, and running sales reach about $22,000 |

Two things stand out.

The first is the dithering. He is open about it, and that matters, because the version of this story that gets passed around is "built in a weekend", which makes it sound like one clean burst of inspiration. The real version has three unproductive days in the middle. He nearly didn't finish it.

The second is where the money came from. You'll often read that TypingMind grew through Reddit and word of mouth. That's true later. It isn't true of launch week. By Tony's own estimate, about 99 percent of those first sales came from his Twitter followers. He announced it there, and then every time he added a feature he tweeted it. The tweets were his changelog and his advertising at the same time. Product Hunt and his newsletter added to a fire that was already burning.

## The decision that made it work

TypingMind looked like a simple product, and it was. The clever part was what he decided not to build.

**You bring your own key.** To use TypingMind you plug in your own API key from the model company, which is roughly an account number. Every question you ask is billed to you, by them, at their price. Tony never pays for anyone's usage. A customer who uses it all day costs him exactly the same as one who never opens it: nothing.

**You pay once.** In March 2023 the market was filling up with ChatGPT "wrappers" charging $10 or $20 a month. Tony went the other way and sold a licence for a single payment.

He could do that because of how the thing was built. The first version of TypingMind was a static web app: a page that runs entirely in your browser. He had no server to run, no database to maintain and nobody's conversations to store. With no monthly costs, he didn't need monthly income to cover them.

It looks like a pricing decision, but really it's an engineering decision. He could charge once because he'd built something that cost him nothing to keep running.

And it answered the Black Magic problem. A developer was already warning publicly that OpenAI would simply absorb wrapper products with its next update, and Tony knew better than most what it feels like when a platform turns on you. So he built something with no ongoing bill, took the money up front, and made sure that if it all ended tomorrow he would owe nothing.

For the customer there was a bonus he hadn't had to invent. With no server in the middle, your conversations stay on your own device. For people nervous about pasting work into a chatbot, that mattered.

## From a licence to a company

One-time sales have an obvious weakness. Once everyone who wants one has bought it, you've run out of customers. For about a year and a half that didn't happen. Tony says lifetime licence sales kept growing for 20 months, fed by mentions on Reddit and social media and by people recommending it to each other.

Then something better happened. His customers started taking it to work.

People who had bought TypingMind for themselves wanted their colleagues to have it too. So Tony built a Team version: a private, company-branded AI workspace that a business sets up once and gives to its staff, with the company's own keys, documents and controls. And companies pay monthly.

By November 2024 he was describing deals for 1,000 seats, and one for 3,000. About half his monthly revenue was still one-off licences, and the other half was now recurring. That month he checked his profit-and-loss statement and found that TypingMind had taken in $1 million over the previous twelve months.

It changed the kind of work he was doing, and he's honest that he doesn't love all of it.

| | Launch week, March 2023 | By late 2025 |
|---|---|---|
| Who buys | Individuals, mostly his Twitter followers | Individuals, plus companies buying hundreds or thousands of seats |
| What they pay | Once | Once for individuals, monthly for teams |
| What it needs | A browser | Security audits, contracts, single sign-on |
| How it sells | A tweet | Word of mouth for individuals, sales calls and resellers for companies |
| Who does the work | Tony | Tony, a developer, a designer, freelancers, a design agency and help with sales |

Big customers ask for things that individuals never do. He has written that he spent more than $20,000 on security certifications (SOC 2, HIPAA and GDPR compliance), outside security audits and lawyers for contracts. He found sales calls draining, noticing that many of them never got past answering questions. He admitted he had let leads go cold because he never called people who filled in the contact form, and decided to hire a "Sales Closer". In April 2025 he posted that he had welcomed two new teammates, a developer and a designer.

By October 2025 the recurring Team revenue had passed half the total.

## What he tried that didn't work

Paid advertising, mostly. In November 2024 he called the results of ads and sponsorships "terrible" and said he had stopped. A year later he tried again with a $600 campaign. It produced two sales.

He has never found a paid channel that works. Nearly everything still comes from people telling other people. That's a strength, because it costs nothing, and it's also a risk, which we'll come to.

## The numbers

Every figure here is Tony's own, from his newsletter or his posts. Nothing has been checked against a payment processor.

| When | What he said | Where |
|---|---|---|
| March 2023 | About $22,000 in the first week | Newsletter |
| November 2024 | $1 million in the previous 12 months, about half of it from lifetime licences | Newsletter |
| April 2025 | $148,000 in a month, an all-time high at the time | X |
| October 2025 | About $130,000 to $160,000 a month, more than half from teams. "More than $1M a year" | Newsletter |
| December 2025 | $210,000 or more, his best month, and 8,000 new customers in 2025 | A secondary tracker (now The AI Receipts), which attributes the figures to an X post we could not open |

Two things are missing. The first is profit. He gives revenue and doesn't say what he keeps. Software with no usage costs usually has healthy margins, and he describes himself as financially independent, but that's our reasoning and he hasn't published a figure. The second is anything recent in his own words: the last firm number we can trace to a newsletter or post of his that we have actually opened is October 2025.

## How he lives

This part is why a lot of people follow him.

He has written about working roughly four hours a day. In his October 2025 update he said he'd been financially independent for about two years, that his lifestyle is "not very expensive" and hasn't changed much, and that he could stop and live off his investments if he chose.

He hasn't stopped. He and his wife were on a round-the-world trip, finding a surf town at each stop: Korea, Taiwan, France, Switzerland, Spain, Australia, Portugal. He was writing from Bali, where he called the waves "amazing". In November 2025 he helped run a month-long residency in Da Nang, Vietnam, for ten indie hackers, to show people at home that this way of working exists.

He also wrote this: for years, the pressure to keep earning meant he couldn't tell whether he loved coding or was just afraid of losing his income. Now that the pressure is gone, he has his answer. He says he is "in love with building with AI" and still writes code every day.

## Where the AI is

It would be easy to assume that AI built this business. Mostly it didn't. AI is what Tony sells access to. TypingMind is a front door to other companies' models, 18 providers of them by its own count this year.

His newsletter doesn't say which AI coding tools he uses, so we won't guess. What it does show is a way of working: a small core, shipped fast, improved in public, and kept simple enough that one person could run it for the first year.

## What made it possible

It's worth being honest about what he had going for him, because not all of it can be copied.

- **Seven years as a professional developer.** He could build a polished product in a weekend because he had years of professional practice behind him.
- **76,000 followers.** Nearly all the launch revenue came from an audience that took two years to build.
- **A recent, expensive lesson.** Losing Black Magic taught him to distrust platforms, and that shaped the pricing.
- **Speed.** Five days. A month later there were dozens of competitors.

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
> **Wait for customers to ask for the team version.** He didn't plan to sell to businesses. He built it when individual buyers started asking. Then find out what a company will need (security paperwork, contracts, sign-on) before you promise anything.

## What could go wrong

**The model companies.** TypingMind only exists because OpenAI, Anthropic, Google and the rest let outside software use their models at a fair price. If they change the access, the pricing or the terms, he feels it straight away. He knows this better than anyone.

**The free alternatives keep improving.** ChatGPT, Claude and Gemini all have their own apps, and they add features every month. TypingMind has to stay noticeably better, or at least different, for people who already have one of those for nothing.

**It isn't a one-person business any more.** That's normal and it isn't a criticism. But the work is now security reviews, long sales cycles and managing people, which are the things he has said he doesn't enjoy.

**Word of mouth is the only engine.** No paid channel has ever worked. That's fine until it slows, and he'll have no lever to pull when it does.

**One person's numbers.** He has been unusually open, for years. It is still his own account, with no outside check and no profit figure.

## What to watch

1. **The relaunch.** In June 2026, three years after the first launch, he put TypingMind back on Product Hunt. Trackers show it finishing second for the day. Does a product this mature still find new individual buyers?
2. **The Team business.** Do the big seat counts stay as long-term subscriptions?
3. **The official apps.** Do the model makers close the gap TypingMind fills?
4. **A new product.** He said in late 2025 that he might build something new "soon". Does he, or does TypingMind remain the whole company?

It took a domain name, one weekend, and a decision to charge once. He had already built two things nobody wanted. The third one fixed a real annoyance, cost him nothing to run, and had its first paying customer before he'd talked himself out of it.

---

That's File #005. Thank you for reading it. If it made you think of someone, forward it along, and if there's a founder you'd like to see opened next, tell us at info@aifounderfiles.com. File #006 lands next Sunday.

*Where this came from: Tony Dinh's own newsletter and posts, with figures as he reports them, plus interviews and profiles listed below. We haven't verified the figures independently and we haven't spoken to him. A note on disclosure: Anthropic makes Claude, the AI assistant that helped research and draft this file, and its models are among those TypingMind connects to. Spotted a mistake? Email info@aifounderfiles.com and we'll correct it.*
