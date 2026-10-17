#!/usr/bin/env python3
"""Assemble /work, /blog and the three posts for the TYFNOW static site. Run: python3 -I build_work_blog.py <site_dir>"""
import sys, re, html, pathlib

SITE = pathlib.Path(sys.argv[1])
stub = (SITE / "work" / "index.html").read_text()

# Chrome: everything from <body> to <main class="wrap"> and from </main> to the end.
head_chrome = stub.split("<body>")[1].split("<main class=\"wrap\">")[0]
tail_chrome = stub.split("</main>")[1]
# Add Blog to header and footer nav in the chrome.
head_chrome = head_chrome.replace('<a href="/work">Work</a>\n      <a href="/contact"', '<a href="/work">Work</a>\n      <a href="/blog">Blog</a>\n      <a href="/contact"')
tail_chrome = tail_chrome.replace('<a href="/work">Work</a><a href="/contact">', '<a href="/work">Work</a><a href="/blog">Blog</a><a href="/contact">')

CTA = '''
<section class="cta-sec">
  <div class="card cta-card">
    <h2>Something need fixing?<br><span>Say what it is.</span><br>We'll say what it takes.</h2>
    <form class="cta-form" action="/contact" method="get">
      <div class="cta-field">
        <label for="cta-email" class="sr-only">Your email</label>
        <input id="cta-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="Your email">
        <button type="submit" class="btn">Tell us what's not working</button>
      </div>
      <p class="trust">Reply within five working days. No hard sell.</p>
    </form>
  </div>
</section>
'''

def page(path, title, desc, body, canonical, index=True, extra_head="", body_attr=""):
    robots = "index, follow" if index else "noindex, nofollow"
    doc = f'''<!doctype html>
<html lang="en-GB" data-ga="">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{html.escape(title, quote=True)}">
<meta property="og:description" content="{html.escape(desc, quote=True)}">
<meta property="og:url" content="{canonical}">
<meta property="og:type" content="{'article' if '/blog/' in canonical else 'website'}">
{extra_head}<link rel="preload" href="/fonts/InterTight-var.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/pages.css">
</head>
<body{body_attr}>{head_chrome}<main class="wrap">
{body}
</main>{tail_chrome}'''
    out = SITE / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc)
    print("wrote", path)

BASE = "https://www.threeyearsfromnow.com"

# ---------------- Work ----------------
work_body = f'''
<section class="page-head">
  <h1>Built, fixed or improved.</h1>
  <p class="sub">Some of it with TYFNOW. Most of it before, in the years that built the way we work.</p>
</section>

<section class="work-block">
  <p class="group-label">With TYFNOW</p>
  <div class="tiles one">
    <figure class="tile"><img src="/img/sporthopod.jpg" alt="Sporthopod Clinics sign on a building" width="961" height="822" loading="eager"><figcaption class="t">Sporthopod</figcaption></figure>
  </div>
</section>

<section class="work-block">
  <p class="group-label">Before TYFNOW, the work that built it</p>
  <div class="tiles">
    <figure class="tile"><img src="/img/todaytix.jpg" alt="TodayTix campaign artwork" width="960" height="823" loading="lazy"><figcaption class="t">TodayTix</figcaption></figure>
    <figure class="tile"><img src="/img/amex-puppet.jpg" alt="Sock puppet at a desk in front of a city skyline" width="961" height="823" loading="lazy"><figcaption class="t">American Express</figcaption></figure>
    <figure class="tile"><img src="/img/amex-business.jpg" alt="American Express small business campaign artwork" width="961" height="823" loading="lazy"><figcaption class="t">American Express</figcaption></figure>
    <figure class="tile"><img src="/img/wardrobe.jpg" alt="Open wardrobe, styled for a campaign" width="960" height="822" loading="lazy"><figcaption class="t"><!-- caption pending: believed IKEA Space Solutions --></figcaption></figure>
    <figure class="tile"><img src="/img/helmet.jpg" alt="Helmet, campaign artwork" width="961" height="822" loading="lazy"><figcaption class="t"><!-- caption pending: client to confirm --></figcaption></figure>
  </div>
  <p class="line">Also: Conference Badges, NESO, IKEA, Huawei, Siemens, McCarthy Stone, Nutella, Wetha, Kids Clubs and Velvis. <a href="/contact">Ask about any of them.</a></p>
</section>
{CTA}'''
page("work/index.html", "Work. Three Years From Now",
     "Work by Three Years From Now: brand, website, content and pipeline, built with TYFNOW and in the years before it.",
     work_body, f"{BASE}/work")

# ---------------- Blog posts ----------------
CATS = ["Bikepacking", "Charity work", "Sponsorship", "Adventure", "Heritage"]
LINKS = {
    "JG": '<a href="https://www.justgiving.com/crowdfunding/londontolisbon-2026km" rel="noopener">JustGiving-London2Lisbon2026</a>',
    "IG": '<a href="https://www.instagram.com/cadenceandclouds/" rel="noopener">Instagram</a>',
    "LI": '<a href="https://www.linkedin.com/company/three-years-from-now/" rel="noopener">LinkedIn</a>',
}
SLOT = {
    "single": '<!-- image slot (single). To use, replace this comment with:\n<figure class="fig"><img src="/img/blog/FILE.jpg" alt="DESCRIBE" width="1600" height="1000" loading="lazy"><figcaption>Optional caption</figcaption></figure> -->',
    "pair": '<!-- image slot (pair). To use, replace this comment with:\n<figure class="fig pair"><img src="/img/blog/FILE-1.jpg" alt="DESCRIBE" loading="lazy"><img src="/img/blog/FILE-2.jpg" alt="DESCRIBE" loading="lazy"><figcaption>Optional caption</figcaption></figure> -->',
    "strip": '<!-- image slot (strip of three, 4:5). To use, replace this comment with:\n<figure class="fig strip"><img src="/img/blog/FILE-1.jpg" alt="DESCRIBE" loading="lazy"><img src="/img/blog/FILE-2.jpg" alt="DESCRIBE" loading="lazy"><img src="/img/blog/FILE-3.jpg" alt="DESCRIBE" loading="lazy"><figcaption>Optional caption</figcaption></figure> -->',
}
HERO_SLOT = '<!-- hero image slot. To use, replace this comment with:\n<figure class="fig hero"><img src="/img/blog/FILE.jpg" alt="DESCRIBE" width="1600" height="1000" loading="eager" fetchpriority="high"><figcaption>Optional caption</figcaption></figure> -->'
CLOSE = f'''
<div class="post-links">
  {LINKS["JG"].replace('<a ', '<a class="btn" ').replace('JustGiving-London2Lisbon2026', 'Donate on JustGiving')}
  {LINKS["IG"].replace('<a ', '<a class="btn outline" ').replace('>Instagram<', '>Follow on Instagram<')}
  {LINKS["LI"].replace('<a ', '<a class="btn outline" ').replace('>LinkedIn<', '>Follow on LinkedIn<')}
</div>
<blockquote class="pull"><p>“If you can't fly, run. If you can't run, walk. If you can't walk, crawl, but by all means, keep moving forward.”</p><footer>Martin Luther King Jr.</footer></blockquote>
'''

def P(s): return f"<p>{s}</p>"
def H(s): return f"<h2>{s}</h2>"

posts = []

posts.append(dict(
    slug="build-grow-and-keep-moving", old="/blog/cyclingtolisbonsponsorship",
    title="Build, grow and keep moving", date="2026-03-15", nice="15 March 2026",
    stand="This September, supported by Three Years From Now, Amber and Shaheryar will ride 2,026 km from London to Lisbon, raising £2,026 for Shelter and Andy's Man Club. Here's why.",
    desc="Three Years From Now is supporting Amber and Shaheryar's 2,026 km ride from London to Lisbon, raising £2,026 for Shelter and Andy's Man Club.",
    body="\n".join([
        P("Three Years From Now started in the hardest year of one of its founders' lives. No grand vision. No business plan. Just a need to build while everything else was falling apart; one problem fixed, then the next, movement because standing still wasn't an option."),
        P("That's their background, and it's still how they work. This September, they're taking it literally and we're supporting Amber and Shaheryar's journey."),
        H("UNESCO site to UNESCO site"),
        P("They roll out from the Tower of London, a UNESCO World Heritage Site, and fourteen days later (±a few days) aim to arrive at Lisbon's Belém Tower, another UNESCO landmark. They plan to travel through eight World Heritage Sites on this ride, from Mont-Saint-Michel rising out of its bay to the Gothic bulk of Burgos Cathedral."),
        P("For them, the number is the point. It's 2026. They're riding 2,026 km. And they're raising £2,026 (a pound for every kilometre) split between two charities they chose with care."),
        H("Building people up"),
        P("<strong>Shelter</strong> exists because a safe home is the foundation everything else gets built on, and too many people in Britain don't have one. <strong>Andy's Man Club</strong> gets men talking freely in weekly, peer-to-peer groups where the only requirement is turning up."),
        P("Both charities work from the same understanding, and it's one we recognise from our own story: the hardest steps are the ones you take alone. No one should have to."),
        H("Starting from zero"),
        P("Shaheryar has ridden London to Paris, London to Geneva, a few other very long days in the saddle cover. Amber has never ridden anything close to this distance. For them, that's the point. Build a long distance the way you build anything: start, keep going, and let one day's progress make the next day possible. Small and positive actions in a forward direction."),
        H("The long way south"),
        P("The route follows the Atlantic edge of Europe, across the Channel, down the French coast, over the Basque country into Spain, and then the long road west to Lisbon. Amber is a heritage consultant by profession, so the story of this ride will dig into the places as much as the pedalling."),
        SLOT["pair"],
        H("Follow the ride"),
        P(f"Their JustGiving page is live: every pound is a kilometre, and every kilometre gets them closer to Lisbon. Donate at {LINKS['JG']}, and follow the training, the route and the ride itself on {LINKS['IG']} and {LINKS['LI']} between now and September."),
        P("<strong>14+ days. 4 countries. 8 World Heritage Sites. 2,026 kilometres, one pedal stroke at a time.</strong>"),
        P("Standing still isn't an option. See you in Lisbon."),
    ])))

posts.append(dict(
    slug="five-months-of-saturdays", old="/blog/cyclingtolisbontraining",
    title="Five months of Saturdays", date="2026-08-21", nice="21 August 2026",
    stand="In September, Amber and Shaheryar ride 2,026 km from London to Lisbon, raising £2,026 for Shelter and Andy's Man Club. Before any of that happens, there is the training. Here is where it stands.",
    desc="Five months of training for the London to Lisbon ride: Richmond Park laps, two sportives, Hadrian's Cycleway coast to coast and the Dunwich Dynamo.",
    body="\n".join([
        P("Back in March they set out the principle: you build for a long distance the way you build for anything. Start, keep going, and let one day's progress make the next one possible. That principle has since turned into a fairly unglamorous routine. Amber and Shaheryar have gone out and ridden roughly 100 km, most Saturdays, for the last five months. Some of those rides were fast, most were not, and the majority were hot and sweaty. Added together, the Saturdays alone come to about the distance of the ride itself. They have already covered London to Lisbon, one weekend at a time, without leaving the south of England."),
        H("Nine laps of Richmond Park"),
        P("Once a month for the last three months, they went to Richmond Park. They rode nine laps, which comes out at almost exactly 100 km, with the same climbs in the same direction. It is a dull way to spend a morning and an honest one. With every variable held still, the only thing left to measure is the rider."),
        P("Each visit they increased their speed by a kilometre an hour. Two kilometres an hour across the three months. On a 3-week ride that difference is worth close to an hour a day, which is the difference between arriving in daylight and hunting for a hotel in the dark."),
        SLOT["single"],
        H("Two sportives with UK Cycling Events"),
        P('The sportives, ridden with hundreds of people at <a href="https://www.ukcyclingevents.co.uk/" rel="noopener">UK Cycling Events</a>, did a different job. Riding in a group teaches you things a solo Saturday cannot, such as keeping on somebody\'s wheel to push yourself, having an overall time limit, or pacing against people who are quicker than you and encouraging the ones who are not. Amber went into the first sportive having not ridden at all much. She came out of the second one comfortable in it.'),
        SLOT["single"],
        H("Sea to sea, in two days"),
        P("In early summer over two days, they rode Hadrian's Cycleway coast to coast, Irish Sea to the North Sea. Back-to-back long days are the closest to the real thing, because the second morning is where the ride actually starts. Legs are heavy, the saddle is unwelcoming, and the only way to find out what you have left is to get on and turn the pedals. It also gave the heritage side of the project its first proper outing, a Roman frontier ridden end to end, which is useful preparation for the eight World Heritage Sites they are planning on visiting."),
        SLOT["single"],
        H("The Dunwich Dynamo"),
        P("Then, 200 km through the night from London to the Suffolk coast. No signs, no support, no sleep. A few thousand riders leaving the city after dark and arriving at Dunwich beach around sunrise, with the middle hours spent on unlit lanes navigating by the red lights of whoever is in front."),
        P('Night riding is a skill of its own, and the Dynamo is the fastest way to learn it. <a href="https://www.knog.com/" rel="noopener">Knog</a> kitted them out for exactly this, and the lights held up through the whole night. On the road to Lisbon there will be evenings that run late and mornings that start before dawn. Both are considerably less intimidating now.'),
        SLOT["single"],
        H("What five months has changed"),
        P("Amber started this with no long-distance riding behind her. She has now completed a coast-to-coast, an overnight double century and two sportives, and rides 100 km on a Saturday as a matter of routine. Shaheryar has ridden long before, but never with a partner learning the whole thing from zero, which turns out to be its own kind of training. Fitness was the easy part. The harder skills have been reading the route, managing food intake and getting comfortable with the ordinary discomfort of a long day."),
        P('Their routes are plotted in <a href="https://www.komoot.com/" rel="noopener">Komoot</a>, the kit list is nearly settled, and the bikes are close to their final setup. What remains is more of the same. More Saturdays, a little quicker each time.'),
        P(f"Their JustGiving page is live: every pound is a kilometre, and every kilometre gets them closer to Lisbon. Donate at {LINKS['JG']}, and follow the training, the route and the ride itself on {LINKS['IG']} and {LINKS['LI']} between now and September."),
        P("<strong>14+ days. 4 countries. 8 World Heritage Sites. 2,026 kilometres, one pedal stroke at a time.</strong>"),
        P("Standing still isn't an option. See you in Lisbon."),
    ])))

posts.append(dict(
    slug="two-thousand-and-ninety-three", old="/blog/cyclingtolisbontraining-6nw4c",
    title="Two thousand and ninety-three", date="2026-10-16", nice="16 October 2026",
    stand="London to Lisbon. Sixteen riding days, eight World Heritage Sites, and numbers that refused to behave.",
    desc="The ride report: 2,093 km from London to Lisbon over sixteen days, eight World Heritage Sites, and £2,026 raised for Shelter and Andy's Man Club.",
    body="\n".join([
        H("Day 8: Miranda de Ebro, northern Spain"),
        P("Seventy-two kilometres covered, less than half the plan for the day. We were in bed by four in the afternoon."),
        P("The thermometer had reached 38°C. The inclines had gone into double digits. A thousand kilometres sat behind us and the only sensible thing left to do that day was stop."),
        P("We had set out to ride 2,026 kilometres from London to Lisbon. One kilometre for each year, a pound raised per kilometre, split between Shelter and Andy's Man Club. The route was built around eight UNESCO World Heritage Sites. Sixteen riding days. That was the plan, and somewhere around Day 8 the plan and we stopped speaking to each other."),
        P("We want to tell you about the eight sites. But the honest version puts them where they actually fell, scattered across a fortnight, with most days containing none of them at all, and every one of them arriving when we were in no state to take it in properly."),
        H("The one we didn't ride to"),
        P("The Tower of London was Day 0. A rented flat by Tower Bridge, a bike built and repacked, zero kilometres logged. We stood and looked at it the evening before rather than flying past it the morning after, which turned out to be the right way round."),
        P("It is a building that has never settled on what it wants to be. William the Conqueror began the White Tower in the 1070s using limestone shipped over from Caen in Normandy. We would be riding through the country that quarried it within forty-eight hours. Henry III had it whitewashed in 1240 and gave it its name. Every coin in England was struck there from the reign of Edward I until 1810."),
        P("Our favourite part is the zoo. King John kept animals at the Tower from 1210, and over the centuries the collection ran to lions, elephants, ostriches and a polar bear. It closed in 1830, when William IV handed the survivors to the newly opened London Zoo."),
        P("Then we rode 135 kilometres to Portsmouth through roadworks and potholes, thinking mostly about the smooth roads that were yet to come in France, and got on an overnight ferry."),
        SLOT["single"],
        H("Mont-Saint-Michel, Day 2"),
        P("Two things about the continent announced themselves straight away. The road surface was enormously better. And somebody had left the oven on with the fan running."),
        P("Mont-Saint-Michel sat about fifty kilometres out from the St Malo landing, on a day that finished at 175 kilometres."),
        P("The cult of Saint Michael arrived on that rock in 708AD. Benedictines began building from the 10th century, and the place held out through the Hundred Years War behind its ramparts and its tides. The Revolution turned it into a prison. It stayed one until 1863, by which point the buildings were close to ruin."),
        P("The tides are the thing you feel rather than read. The range here runs up to fifteen metres, and only tides above fourteen turn the Mont into a true island. The old causeway had been silting the bay for years, so a dam went in during 2013 and a new bridge opened in July 2014, letting the water move freely round the rock again. In March 2015 a supertide put that new bridge underwater."),
        P("There is a thread here worth pulling. St Michael's Mount in Cornwall was given to these same Benedictine monks in the eleventh century and run as their priory, with the buildings raised in the twelfth. The island most likely took its name from its French mother house. The Hundred Years War cut the cord when Henry V dissolved the alien priories, and the Mount passed to Syon Abbey in 1424."),
        P("Days 3 and 4 were 155 kilometres each. More liquid carried and drunk, more food, more weight, more time spent flat on the tri-bars. By then we had stopped thinking about Lisbon altogether. Lisbon was not a useful thought. The useful thought was the minimum distance for the day. That, and the French pastries."),
        SLOT["single"],
        H("Cordouan, Day 4"),
        P("You cannot ride to Cordouan. It sits seven kilometres offshore near the mouth of the Gironde estuary, reachable only by boat at low tide, with 301 steps up to the lantern. Getting anywhere near it meant crossing the estuary by ferry to Le Verdon instead of running inland through Bordeaux, and finishing the day at Soulac-sur-Mer."),
        P("It is the strangest thing on the whole route. Building started in 1584 under Louis de Foix at the command of Henri III. Henri IV then approved a far grander scheme with a chapel and royal apartments added on. It was finished in 1611, twenty-seven years later. De Foix had spent his life and his own fortune on it and died before it was done."),
        P("There is a king's apartment on the first floor that no monarch has ever slept in. There is a chapel with stained glass on the second, which exists in no other lighthouse anywhere in the world. And in 1823 Augustin Fresnel tested his stepped lens here for the first time. It is the system now sitting in most of the world's lighthouses."),
        P("Then came Day 5, and we went all in."),
        P("The wind was relentless and the temperature held at 30°C, feeling more like 33. It had to be done for practical reasons. The 32 to 35°C range waiting across the Spanish border, on top of the daily climbing, was going to slow us badly. We needed breathing room before we got there."),
        P("Two hundred and sixteen kilometres. Finished around half past ten at night. The longest distance either of us had ridden, on the heaviest bikes we had ever ridden."),
        SLOT["single"],
        H("The Camino, Day 6"),
        P("Our leg muscles spent that night discussing the previous day's events among themselves. We got very little sleep. They wanted to stop at Biarritz and make a weekend of it."),
        P("Day 6 was spent in every café along the route, and eventually out of France with 135 kilometres on the computer."),
        P("The Routes of Santiago de Compostela are the only entry on our list that is a network rather than a building. Four northern pilgrimage routes were added in 2015 to the Camino Francés already inscribed in 1993. The whole thing traces back to the ninth-century discovery of a tomb believed to be Saint James's, and in 1987 it became the first European Cultural Route."),
        P("There is something pointed about crossing it on a bike. Everyone else on it was walking, heading west to Santiago, taking weeks over it. We were heading south, taking days, and would be in another country by dinner."),
        P("Day 7 gave us San Sebastián, and we left it far too quickly. A small, beautiful town with ocean, beach and mountains all in one place. We ordered café con leche when the town deserved to be taken like a double espresso: short, bittersweet, and packing considerably more punch than our legs were ready for."),
        P("Then came the elevation. Then the high temperatures. And then, thankfully, the locals. A couple stopped to ask about the setup and the trip. Local riders offered hellos, wows and goodbyes over the next few kilometres. For a stretch it felt less like an endurance challenge and more like we had accidentally joined a very sweaty cycling parade."),
        P("The Atlantic vanished behind a long climb. It kept reappearing through gaps between houses and fences, and we kept standing up on the pedals to steal another look at it."),
        SLOT["single"],
        H("Days 8 and 9: The wall"),
        P("Then Day 8, and the stop, and the four o'clock bedtime."),
        P("Day 9 we were awake at four in the morning instead. Riding in the dark was the only way to get hours in before the sun arrived. It worked until about half past seven, when the wind turned up uninvited at 43 km/h across semi-arid country and everything slowed again. Bearded vultures circling overhead did nothing for morale."),
        P("Seventy-eight kilometres into Burgos."),
        P("The cathedral there was begun in 1221 under Ferdinand III and Bishop Don Mauricio. It is the first Gothic cathedral in Spain, built by French architects who brought Paris, Reims and Amiens with them. It is also the only Spanish cathedral inscribed by UNESCO in its own right rather than as part of a city centre, which puts it in a category of one."),
        P("El Cid has lain in the transept beside his wife Doña Jimena since 1921. The Golden Staircase inside, by Diego de Siloé, is thought to have been the model for the grand staircase at the Paris Opera."),
        P("The detail we came away with is the Papamoscas. It is a figure on a sixteenth-century clock who opens and closes his mouth on every hour, for reasons nobody has ever satisfactorily explained."),
        SLOT["single"],
        H("The grind, Days 10 to 12"),
        P("The wind dropped from 47 km/h to around 18, which felt a great deal less like cycling through a wind tunnel. Early starts helped. Day 11 even produced a tailwind. Free watts, always welcome, badly needed by that point."),
        P("Days 8 and 9 had made Spain feel like it was stretching out into infinity. Days 10 to 12 were different. Head down. Pedal. Eat. Drink. Find shade. Repeat."),
        P("The kit was getting looser and the legs leaner. Water stops tripled and food doubled. The bikes were the only things not losing weight."),
        P("Ávila came on Day 11, at 140 kilometres, and it is a climb. The town sits at roughly 1,130 metres."),
        P("The walls went up from 1090. Two and a half kilometres of perimeter, 88 semicircular towers, and nine gates finished across several different centuries. The cathedral's apse forms one of those towers, so the church is built into the defensive line rather than standing beside it. Building and maintaining the walls seems to have been a joint effort between the city's Christian, Jewish and Muslim residents. Saint Teresa was born there in 1515."),
        P("After a week of nothing but moving, arriving somewhere built specifically to stop people moving does something odd to your head."),
        SLOT["single"],
        P("Salamanca followed on Day 12, another 35°C scorcher, so we finished early and spent the evening cleaning and re-greasing the bikes."),
        P("The university was founded by royal decree in 1218 and has run without a break ever since, standing alongside Bologna, Paris and Oxford as one of the four great universities of medieval Europe. The Plaza Mayor came much later, built between 1729 and 1733 and designed to double as a bullring."),
        P("Salamanca hides jokes in its own stonework. There is a small stone frog perched on a skull on the university's entrance, and the legend says finding it brings luck in your studies. Better still, during restoration work in the 1990s, masons added an astronaut and a dragon eating an ice cream to the New Cathedral's Puerta de Ramos. Visitors have been squinting at them ever since."),
        SLOT["single"],
        H("Portugal, eventually"),
        P("Day 13 and Portugal felt reachable. About 120 kilometres away, and the £2,026 target was already in the bank, which made the pull to finish stronger than the pull of a pastel de nata."),
        P("Then, seventy kilometres into another brutal day, the batteries in the electronic shifting ran out. Front and rear, in the hoods, within minutes of each other. That left gearing nobody had chosen, in heat that made flat roads feel like climbs. Ninety-two kilometres to Ciudad Rodrigo. Portugal could wait another day."),
        P("Day 14, fresh batteries fitted, everything repacked with aerodynamics in mind. The wind had dropped but the temperature kept climbing, and by midday our bodies made the decision the bikes would not. All we could think about was shade, water and somewhere cooler."),
        P("Then a campsite, and a woman we asked to fill our bottles. She disappeared behind a wall and came back with a completely frozen one-litre bottle of water. She refused payment. At 39°C it was the biggest ice lolly and one of the best-timed gifts anyone could have given us. The campsite also had a working swimming pool which we couldn't resist a dip in."),
        P("We got back on and rode well into the night. A hundred and fifty kilometres, and Lisbon finally on the map."),
        P("Day 15 the heat had the final say. A century was not happening. Eighty kilometres was all we had in us, and even that took everything. Sometimes the strongest thing available is to keep going when the number you wanted is out of reach."),
        SLOT["single"],
        H("Belém, Day 16"),
        P("A hundred and eighty kilometres into Lisbon."),
        P("Jerónimos and the Tower of Belém hold a single UNESCO listing between them, inscribed in 1983. That surprises people who assume they are two separate sites. The logic is that they are one project. Both were commissioned by Manuel I, both built in the early 1500s, and both paid for by the sea. The monastery was funded through a five per cent tax on trade from Africa and the Orient, worth something like seventy kilograms of gold a year. The monks were there to pray for the king and to offer spiritual support to sailors leaving Lisbon."),
        P("The tower has the better story. Built between 1514 and 1519, it carries a stone rhinoceros on its façade. It commemorates Ganda, a live rhinoceros sent to Manuel I by the Sultan of Gujarat in 1515, and it is generally reckoned the first rhinoceros carved into European monumental architecture. Ganda caused a sensation in Lisbon, was shipped onward as a gift to Pope Leo X, and drowned at sea on the way."),
        P("Every one of these buildings exists because people were leaving from here and, with luck, coming back. That was the thought we finished on. Sixteen days moving slowly past eight places that were themselves all about movement: a fortified river port, a pilgrimage rock, a light to bring ships home, a road to a tomb, a cathedral on that road, and finally the point of departure for the open sea."),
        P("Two of them break the pattern, which is why we liked them. Ávila is walls built to keep people out. Salamanca is a university built to make people stay."),
        SLOT["single"],
        H("The number"),
        P("We set out to ride 2,026 kilometres. We rode 2,093."),
        P("Sixty-seven over, and the reason is the sites themselves. They do not sit on a straight line between London and Lisbon. Reaching them meant not riding one."),
        P("The run out to Mont-Saint-Michel and back onto the line. Crossing the Gironde by ferry to Soulac instead of cutting inland through Bordeaux. Climbing to Ávila at 1,130 metres rather than going round it."),
        P("We could have hit 2,026 exactly. It would have meant dropping two of the eight, and the eight were the whole point."),
        P("<strong>2,093 kilometres. Sixteen riding days. Eight World Heritage Sites. £2,026 raised for Shelter and Andy's Man Club.</strong>"),
        SLOT["pair"],
        P(f"Our JustGiving page is still live. Please donate at {LINKS['JG']}, and follow the training, the route and the ride itself on {LINKS['IG']} and {LINKS['LI']}."),
    ])))

posts.sort(key=lambda p: p["date"], reverse=True)

def words(s): return len(re.sub(r"<[^>]+>", " ", s).split())

for i, p in enumerate(posts):
    newer = posts[i - 1] if i > 0 else None
    older = posts[i + 1] if i + 1 < len(posts) else None
    mins = max(1, round(words(p["body"]) / 220))
    cats = "".join(f'<span class="cat">{c}</span>' for c in CATS)
    nav = '<nav class="post-nav" aria-label="More posts">'
    nav += f'<a href="/blog/{older["slug"]}" class="prev"><span>Previous</span>{older["title"]}</a>' if older else '<span></span>'
    nav += f'<a href="/blog/{newer["slug"]}" class="next"><span>Next</span>{newer["title"]}</a>' if newer else '<span></span>'
    nav += '</nav>'
    body = f'''
<article class="post">
  <header class="post-head">
    <div class="cats">{cats}</div>
    <h1>{p["title"]}</h1>
    <p class="stand">{p["stand"]}</p>
    <p class="meta"><time datetime="{p["date"]}">{p["nice"]}</time> · {mins} min read · Shaheryar Malik</p>
  </header>
  {HERO_SLOT}
  <div class="post-body">
{p["body"]}
  </div>
  {CLOSE}
</article>
{nav}
{CTA}'''
    import json
    ld = '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "description": p["desc"], "datePublished": p["date"], "author": {"@type": "Person", "name": "Shaheryar Malik"}, "publisher": {"@type": "Organization", "name": "Three Years From Now"}, "mainEntityOfPage": f"{BASE}/blog/{p['slug']}"}, ensure_ascii=False) + '</script>\n'
    page(f"blog/{p['slug']}/index.html", f"{p['title']}. Three Years From Now", p["desc"], body, f"{BASE}/blog/{p['slug']}", extra_head=ld)

# ---------------- Blog listing ----------------
cards = ""
for p in posts:
    mins = max(1, round(words(p["body"]) / 220))
    cards += f'''
    <a href="/blog/{p["slug"]}" class="post-card">
      <div class="thumb" aria-hidden="true"><!-- listing image slot: <img src="/img/blog/FILE.jpg" alt="" loading="lazy"> --></div>
      <p class="meta"><time datetime="{p["date"]}">{p["nice"]}</time> · {mins} min read</p>
      <h2>{p["title"]}</h2>
      <p class="stand">{p["stand"]}</p>
      <span class="read">Read</span>
    </a>'''
blog_body = f'''
<section class="page-head">
  <h1>Notes from the road.</h1>
  <p class="sub">Mostly the ride to Lisbon, for now.</p>
</section>
<section class="post-grid">{cards}
</section>
{CTA}'''
page("blog/index.html", "Blog. Three Years From Now", "Notes from Three Years From Now. Mostly the ride to Lisbon, for now.", blog_body, f"{BASE}/blog")

# ---------------- Redirects, sitemap, nav on existing pages ----------------
r = (SITE / "_redirects").read_text()
old_block = "/blog/cyclingtolisbontraining     /blog  301\n/blog/cyclingtolisbonsponsorship  /blog  301\n"
new_block = "".join(f"{p['old']:<40} /blog/{p['slug']}  301\n" for p in posts)
assert old_block in r
r = r.replace(old_block, new_block)
(SITE / "_redirects").write_text(r)

sm = (SITE / "sitemap.xml").read_text()
extra = f'  <url><loc>{BASE}/work</loc><lastmod>2026-10-17</lastmod></url>\n  <url><loc>{BASE}/blog</loc><lastmod>2026-10-17</lastmod></url>\n'
extra += "".join(f'  <url><loc>{BASE}/blog/{p["slug"]}</loc><lastmod>{p["date"]}</lastmod></url>\n' for p in posts)
sm = sm.replace("</urlset>", extra + "</urlset>")
(SITE / "sitemap.xml").write_text(sm)

for f in ["index.html", "contact/index.html", "privacy/index.html", "terms/index.html"]:
    t = (SITE / f).read_text()
    t = t.replace('<a href="/work">Work</a>\n      <a href="/contact"', '<a href="/work">Work</a>\n      <a href="/blog">Blog</a>\n      <a href="/contact"')
    t = t.replace('<a href="/work">Work</a><a href="/contact">', '<a href="/work">Work</a><a href="/blog">Blog</a><a href="/contact">')
    (SITE / f).write_text(t)
    print("nav updated", f)
print("done")
