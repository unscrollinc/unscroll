import React from 'react';

class About extends React.Component {
    
    render() {
        return (
            <div className="Editor">
              <div className="About">
                
                <h1>Frequently Anticipated Anxieties and Objections</h1>
                
                <h2>Who can I interrogate, scold, or praise?</h2>
                
                <p>Paul
                Ford, <a href="mailto:ford@unscroll.com">ford@unscroll.com</a>. Also
                on twitter
                at <a href="https://twitter.com/ftrain">@ftrain</a>;
                my DMs are open.</p>
                
                <h2>What is this new thing?</h2>
                
                <p>Unscroll is an experimental tool for writing that helps
                 you fact-check your own writing. It sees the worlds in terms of Events and Notes. Events are things that happened and Notes are what people think about them. Events go into Timelines and Notes go into Notebooks. You arrange your notes and that makes an Essay.</p>
                 
                <p>Easy enough, but it gives you a superpower: The power to remember
                  what the hell you are talking about. If you don't
                  need that superpower, more power to you. But I
                  personally need that superpower more every day.</p>
                
                <h2>I don't get why you'd use this instead of [any other one of thousands of software products].</h2>
                
                <p>I built this for myself, after decades of looking
                  at and thinking about writing online. It made me 
                  happy to build it and it helps me be a better writer.</p>

                <p>Also, the publishing industry laid off so many
                  fact-checkers and editors that the responsibility
                  for accuracy now falls very firmly on the shoulders
                  of writers, at the exact moment when the media
                  industry is utterly besieged by the new political and social
                  establishment and people are all yelling about Fake
                  News.</p>

		<p>This is a defensive writing tool.</p>
                
                <h2>If I use this, who owns my work?</h2>
                
                <p>Mostly YOU, sometimes EVERYONE,
                never just ME.</p>
                
                <p>I'm still working this out, but here's where I'm
                at:</p>
                
                <ul>
                  <li>Timelines and their Events can be private or public.</li>
                  
                  <li>Notebooks and their Notes can be private or public.</li>
                  
                  <li>Private stuff can only be seen by you.</li>
                  
                  <li>When you make Timelines public you're not just
                    making them public but adding them to the commons
                    and giving up ownership. Think Wikipedia.</li>
                  
                  <li>When you make Notebooks public you're
                    just...publishing them on Unscroll. You own the
                    copyright over your Notebooks forever. If you make
                    them public you're giving Unscroll the right to
                    use them until you unpublish them. Think any
                    blogging platform.</li>
                  
                </ul>
                
                <p>Will that work? Right now this thing has ONE user. Let's see what happens.</p>

		<h2>What about copyright?</h2>

		<p>On the search engine side, we (I) spider web pages, use open data, and respect robots.txt.</p>
		
		<p>Also: DMCA-1026160</p>

		<h2>What about my privacy and security?</h2>

		<p>I won't go snooping but I might see something while
		   administering the database. In general please don't
		   put anything super-secret or valuable into this
		   new, untrusted, experimental web service. I don't
		   think you would, but it makes me feel better to say
		   that.</p>
		
		<p>I use the Django framework and follow its guidelines. All traffic is via HTTPS.</p>

		<p>Your private events and notes are NOT encrypted on
		  the server, at least not yet. I'd love to do that.</p>

                <h2>Who are you?</h2>
                
                <p>My name is Paul Ford. I'm a writer, programmer, and
                  entrepreneur. I co-founded a NYC software company called <a href="https://postlight.com">Postlight</a> with my friend Rich, and I'm the CEO there today. We have about 50 employees. This is a side-project thought, and it pre-dates Postlight. Postlight people are way too busy working for our clients to get roped into my quixotic dreamquests.</p>
                
		<h2>Writers need fewer, not more, distractions.</h2>

                <p>Everyone says they want a distraction-free writing environment but what they really need are deadlines. This is a tool for people who already have deadlines, but have to turn all their distractions into working prose. It slows you down, if you let it, just enough so that it becomes worthwhile to get things right. This saves time in the long run. It makes writing a particular paragraph much less painful, and if it works you won't get yelled at so much on Twitter, or sued so much by lawyers.</p>

                <h2>It should be free software.</h2>
                
                <p>Maybe so! If people use it and care about it, that
                  would make sense. It's built on django-rest-framework
                  and React. Let's see what happens.</p>
                
                <h2>The data should be open.</h2>
                
                <p>The events sure should. Info dumps into the commons
                  are hard to pull off. Let's see what happens.</p>
                
                <h2>If I use this and you go out of business or get acquired it'll be another stupid nightmare and you'll dump all the data down the toilet and why should I ever trust you at all?</h2>
                
                <p>I simply won't let that happen because I believe passionately in people owning and controlling their own data. I'm a digital advisor to the Library of Congress and good friends and an admirer of Jason Scott. If this thing gathers any steam at all I'll literally write instructions for the disposition of its archives into my will. Let's see what happens.</p>

                <h2>There's no business model.</h2>
                
                <p>There are tons of business models and not-business
                  models. Right now it has one user and this thing
                  would need to get many thousands of committed daily
                  users before it cost more than a couple hundred
                  bucks to run per month. Let's see what happens.</p>
                
                <h2>That has nothing to do with the blockchain.</h2>
                
                <p>It would be nice, some day, to auto-publish
                  Timeline hashes into a blockchain so that people can
                  be relatively assured that history has not been
                  manipulated. Let's see what happens.</p>
                
                <h2>This has nothing to do with machine learning.</h2>
                
                <p>I don't know, imagine what you could do with billions
                  of public events. Let's see what happens.</p>
                
                <h2>This is just another centralized effort designed to own culture.</h2>
                
                <p>Maybe! I don't really want to own time or culture
                  though. I want people to feel safe and protected and
                  like they have the tools they need to do good
                  work. It is nice to imagine this as a federated
                  service, using it to index HTML microformats, blog
                  posts, and tweets at the time of their
                  authorship. On the other hand, humans love
                  convenience so maybe a centralized service is
                  best. Most likely there won't be that many users and
                  it won't really matter. Let's see what happens.</p>
                
                <h2>The approach to date-time parsing and processing is utterly half-assed.</h2>
                
                <p>Yes, it's terrible. Extracting a date from, say, a
                  filename on archive.org and turning it into a
                  realistic calendar moment is pretty hard. There's a
                  lot to learn here. Right now I'm winging it. Let's
                  see what happens.</p>
                
                <h2>This is not how history is done/there's more to history than chronology.</h2>
                
                <p>Yes, agreed. It's a writing tool that keeps
                  chronology in view. Let's see what happens.</p>

                <h2>The events show all kinds of bias.</h2>
                
                <p>They sure do. The resources in the commons that I'm
                  importing are definitely biased towards the
                  conventionally-funded western-dominated metric of
                  what's important. There's only so much I personally
                  can do here, so I'll pay a reasonable hourly rate
                  for people who want to correct that and create
                  timelines around marginalized people's history. If
                  you know someone who should do that kind of work
                  ping me and I'll reach out to them. Let's see what
                  happens.</p>
		
                <h2>How will I know if the events are accurate?</h2>
                
                <p>This sounds simple but it actually veers into
                  foundational philosophical challenges about the
                  nature of truth in about five minutes.</p>
 
		<p>Even when you import really well-regarded
                  sources--museum collections, for example--it's hard
                  to know when something happened and often utterly
                  ambiguous. Dealing with that ambiguity led me to
                  come up with the "principle of the last possible
                  moment."  For example if something is identified as
                  being "circa 1880-1889" the datestamp I assign to it
                  is December 31st 1889 one second before
                  midnight. Let's see what happens. This is because
                  the problem I've found when writing about things
                  that happened is almost always that you put them too
                  soon, not too late. So I err on the side of the
                  last possible moment and keep the original text of
                  the date/time around.</p>

		<p>Here's a hedge for you: A community, should one
                  form, will define the culture here, and the software
                  would support the community's definition of
                  accuracy. Let's see what happens.</p>
                
                <h2>What about griefers/Nazis/etc?</h2>
                
                <p>Right now I'm the only one here. If exhausting
                  people, bad actors, griefers, and so forth show up
                  we'll set limits, hire people, charge money,
                  whatever. It's not a social network. Let's see what
                  happens.</p>
                
                <h2>You've already failed in so many ways!</h2>
                
                <p>And there's more to come! Let's see what happens.</p>

		<p>Or maybe nothing will happen. It's an
  		  experiment. Social networks rule our world and
  		  anything with less than a 100 million users is
  		  trash. I'm off by a factor of 100 million.</p>

		<p>It's so good to finally have this thing out of my
  		  brain, where it's been sitting for years, and into
  		  the world. Let's see what happens.</p>
                
              </div>
                
            </div>
        );
    }
}


export default About;

