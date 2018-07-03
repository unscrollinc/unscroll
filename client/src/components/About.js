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
                my DMs are open but email is best.</p>
                
                <h2>What in the hell is this new stupid thing that I know I will hate?</h2>
                
                <p>Unscroll is a tool for writing and exploring lots
                of information. It helps you fact-check your own
                writing.</p>
                
                <ol>
                  <li>It's got Timelines filled with Events!</li>
                  <li>It's got Notebooks filled with Notes!</li>
                </ol>
                
                <p>That's basically it, but it leads to a nice new way
                  of writing. Because the Events are searchable it's
                  easy to look through lots of them and do basic
                  research.</p>
                
                <p>You can organize your Notes to produce anything,
                  like essays or articles, or book chapters, and all
                  the footnotes are always right there.</p>
                 
                <p>It gives you a superpower: The power to remember
                  what the hell you are talking about. If you don't
                  need that superpower, more power to you. But I
                  personally need that superpower.</p>
                
                <h2>I don't get why you'd use this instead of [any other one of thousands of software products].</h2>
                
                <p>I built this for myself, after decades of looking
                  at and thinking about writing online. It makes me so
                  happy and it helps me be a better writer. I think
                  that writing is a service to the reader and that
                  it's important to get things right. When I get
                  things wrong I'm depressed for days.</p>

                <p>Also, the publishing industry laid off so many
                  fact-checkers and editors that the responsibility
                  for accuracy now falls very firmly on the shoulders
                  of writers, at the exact moment when the media
                  industry is utterly besieged by the political
                  establishment and people are all yelling about Fake
                  News. We can't all write for the <i>Times</i>.</p>

		<p>Also: When you write online you have to write
		 defensively. This is a defensive writing tool.</p>

                <p>If other people use it that'll be great. Up to
                  you!</p>
                
                <h2>If I use this, who owns my work?</h2>
                
                <p>Not clear yet. Mostly YOU, sometimes EVERYONE,
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
                
                <p>Will that work? Let's see what happens. Right now
                  this thing has ONE user so it's NBD.</p>

		<h2>What about copyright?</h2>

		<p>On the search engine side, we spider web pages, use open data, and respect robots.txt.</p>
		
		<p>Also: DMCA-1026160</p>

		<h2>What about my privacy and security?</h2>

		<p>I won't go snooping but I might see something while
		   administering the database. In general please don't
		   put anything super-secret or valuable into this
		   new, untrusted, experimental web service. I don't
		   think you would but it makes me feel better to say
		   it.</p>
		
		<p>I use the Django framework and follow its security
		guidelines. All requests are via HTTPS.</p>

		<p>Your private events and notes are NOT encrypted on
		  the server, at least not yet. It's very hard to do
		  that right.</p>

		<p>Ultimately though what I want is if/when hackers
	   	  break into this thing they only get a bunch of
	   	  encrypted passwords, maybe some emails, and a bunch
	   	  of data from the commons + essays.</p>

                <h2>Who are you?</h2>
                
                <p>My name is Paul Ford. I'm a writer, programmer, and
                  entrepreneur. I co-founded a NYC software company
                  called <a href="https://postlight.com">Postlight</a>
                  with my friend Rich, and I'm the CEO there today. We
                  have about 50 employees.</p>
                
                <p>I've been coding and managing software projects for
                  years. I was <a href="http://www.ftrain.com">a very
                  early blogger</a>, from before the terrible word
                  "blog." I also used to be an editor
                  at <a href="http://www.harpers.org/">Harper's
                  Magazine</a> and built an archive there. I once
                  wrote <a href="https://www.bloomberg.com/graphics/2015-paul-ford-what-is-code/">an
                  entire issue of Bloomberg Businessweek about
                  Code</a> and we
                  won <a href="http://www.magazine.org/asme/2016-national-magazine-awards">the
                  National Magazine Award</a> for that. I've written
                  for a lot of magazines and it's gone pretty well,
                  but I live in terror of getting things wrong, like
                  any journalist.</p>
                
                <p>I've been working on this thing for years and I
		  have the resources to keep it running, at least as
		  as an experiment.</p>

                <h2>Why did you do this?</h2>
                
                <p>I'm a CEO. Most of my life is selling services to
                  Fortune 1000 companies. I love the work but I also
                  felt an urgent need to stay connected to the work we
                  do. I love writing and I love programming.</p>

		<p>Also I owe FSG a book about the web and I decided
   		  to build a CMS first to help me build a better book.
   		  Classic procrastination mentality.</p>
                
                <p>So that's this. I work on it nights and weekends
                  for an hour or two, after the kids are in bed. Those
                  hours add up over time.</p>
                
                <p>I first registered the URL in February 2010,
                  although but back then I just wanted to make a bunch
                  of timelines. Over time I realized what I wanted was
                  time.</p>
                
                <p>I've built it three times over four years, and
                  presented it twice as part of larger talks. This
                  version feels solid enough to release so that
                  everyone can yell at me. Let's see what happens.</p>

                <h2>What do you expect to happen?</h2>
                
                <p>I want to help writers be less anxious--and god are
                  we anxious--so that they can do more thoughtful
                  work. I wanted to make a tool that helped you write
                  that wasn't another empty box. I was motivated to do
                  so because it brought me joy. Mostly, though, I want
                  to use this thing. Let's see what happens.</p>

		<h2>Writers need fewer, not more, distractions.</h2>

		<p>Use the tool that works for you. This is a tool for
  		  people who have to put pieces together to make
  		  something, even in a hurry. I wouldn't write poems
  		  with it. Let's see what happens.</p>
		
                <h2>It should be free software.</h2>
                
                <p>Maybe so! If people use it and care about it, that
                  would make sense. It's built on django-rest-framework
                  and React. Let's see what happens.</p>
                
                <h2>The data should be open.</h2>
                
                <p>The events sure should. Info dumps into the commons
                  are hard to pull off. Let's see what happens. In a
                  good world you could just torrent every public
                  artifact including thumbnails in SQLite and run it
                  locally with a Datasette API on top.</p>
                
                <h2>There's no business model.</h2>
                
                <p>There are tons of business models and not-business
                  models. Right now it has one user and this thing
		  would need to get tens of thousands
                  of committed daily users before it cost more than a
                  couple hundred bucks to run per month. I'm good for
                  that. Let's see what happens.</p>
                
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
                  soon, not too late. So we err on the side of the
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
                
                <h2>What would insane success look like?</h2>
                
                <p>I'd be able to use other people's events and
		   timelines to inform my own writing and
		   thinking. Someone besides me would write something
		  and feel good and confident about it.</p>

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

