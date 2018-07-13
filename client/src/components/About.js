import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

class About extends React.Component {

    render() {
        return (
            <div className="Meta">
              <Scrollbars
                autoHide
                style={{ height: '100%' }}>                          
                <div className="About">
                  
                  <h1>Frequently Anticipated Objections</h1>
                  
                  <h2>Who can I interrogate, scold, or praise?</h2>

                  <p>Site news
                    at <a href="https://twitter.com/unscroll">@unscroll</a>. Bug
                    reports and existential crises to Paul
                    Ford, <a href="mailto:ford@unscroll.com">ford@unscroll.com</a>. Also
                    on twitter
                    at <a href="https://twitter.com/ftrain">@ftrain</a>;
                    my DMs are open.</p>
                  
                  <h2>What is this new thing?</h2>
                  
                  <p>Unscroll is an experimental tool for writing that
		    helps you fact-check your own writing.</p>

		  <p>It sees the worlds in terms of Events and Notes.</p>

  		  <p>You can put events into a Timeline. Events are
		    things that happened, or objects from museums, or
		    issues of magazines, or whatever.</p>

		  <p>Notes are what you think about Events.</p>

  		  <p>Events go into Timelines and Notes go into
                    Notebooks. You arrange your notes and that makes
                    an Essay.</p>
                  
                  <p>Easy enough, but it gives you a superpower: The
                    power to remember what the hell you are writing
                    about so that you don't run your fool mouth. If
                    you don't need that superpower, more power to
                    you. But I personally need that superpower more
                    every day.</p>

                  <h2>Who is it for?</h2>

                  <p>People who require accuracy.</p>

                  <p>Also: Something something Fake News.</p>

                  <p>But really it's for me.</p>

                  <h2>Who are you?</h2>
                  
                  <p>My name is Paul Ford. I'm a writer, programmer,
                    and entrepreneur.</p>

                  <p>As a writer I'm best known for taking over an
                    entire issue of Bloomberg Businessweek to
                    write <a href="https://www.bloomberg.com/graphics/2015-paul-ford-what-is-code/">What
                    Is Code?</a>, which won awards and acclaim, but
                    I've also written a novel for Plume, and was an
                    editor at Harper's Magazine for five years, where
                    I built them an archive and a big web thing. Aside
                    from Businessweek I've written
                    for <i>Harper's</i>, the <i>New York Times
                    Magazine</i>, <i>Wired</i>, and so forth.</p>

                  <p>As a programmer, well, you're looking at it. Also
                    I've built a lot of CMSes.</p>

                  <p>As an entrepreneur, my friend Rich and I, and
                    many other wonderful people in NYC founded a
                    software development company
                    called <a href="https://postlight.com">Postlight</a>,
                    and today I'm the CEO there. We have about 50
                    employees. We're named one of the best places to
                    work.</p>

                  <p>This is a side-project though, done at night with
                    a glass of wine with the kids in bed, when I
                    should be at the gym, and it pre-dates
                    Postlight. Postlight people are way too busy
                    working for our clients to get roped into my
                    quixotic late-night dreamquests, plus they have
                    side projects of their own.</p>
                  
                  <h2>Writers need fewer, not more, distractions.</h2>

                  <p>Everyone says they want a distraction-free
                    writing environment but what they really need are
                    external pressure and deadlines. I wrote this web
                    CMS to help me in writing a book about the web,
                    which is now three years late. Anyway. Go stare at
                    a blank screen. I'll be here writing occasional
                    essays for national magazines with my notes on a
                    timeline.</p>

                  <h2>It should be free software.</h2>
                  
                  <p>Maybe so! If people use it and care about it, that
                    would make sense. It's built on django-rest-framework
                    and React. Let's see what happens.</p>
                  
                  <h2>The data should be open.</h2>
                  
                  <p>The events sure should. Info dumps into the commons
                    are hard to pull off. Let's see what happens.</p>
                  
                  <h2>I don't get why you'd use this instead of [any other one of thousands of software products].</h2>
                  
                  <p>It's totally up to you! Let's see what happens.</p>
                  
                  <h2>If I use this, who owns my work?</h2>
                  
                  <p>Right now this thing has ONE user. But let's say
                    you were the second. Who controls what goes here?</p>
                  
                  <p>Mostly YOU, sometimes EVERYONE, never just ME.</p>
                  
                  <p>I'm still working this out, but here's where I'm
                    at:</p>
                  
                  <ul>
                    <li>Private stuff can only be seen by you.</li>

                    <li>Everything--Timelines, Events, Notes, and
                      Events--starts out private.</li>
                    
                    <li>Timelines and their Events can be private or
                      public.</li>
                    
                    <li>Notebooks and their Notes can be private or
                      public.</li>
                    
                    
                    <li>When you make Timelines public you're not just
                      making them public but adding them to the commons
                      and giving up ownership. Like Wikipedia. Even if
                      you make them private someone could have
                      downloaded the whole thing in a batch.</li>
                    
                    <li>When you make Notebooks public you're
                      just...publishing them on Unscroll. You own the
                      copyright over your Notebooks forever. If you make
                      them public you're giving Unscroll the right to
                      use them until you unpublish them. Think any
                      blogging platform.</li>
                    
                  </ul>
                  
                  <p>Will that work? Let's see what happens.</p>

                  <h2>What about copyright?</h2>

                  <p>On the search engine side, I spider web pages, use
  	            open data, and respect robots.txt (well, I try to,
  	            things can be vague.) It's just descriptive text and
  	            thumbnails.</p>
                  
                  <p>On the what-people-post side, DMCA-1026160.</p>

                  <h2>What about my privacy and security?</h2>

                  <p>I won't go snooping but I might see something while
	            administering the database. In general please don't
	            put anything super-secret or valuable into this new,
	            untrusted, experimental web service. I don't think
	            you would, but it makes me feel better to say
	            that.</p>
                  
                  <p>I use the Django framework and follow its
 	            guidelines. All traffic is via HTTPS via Let's
 	            Encrypt.</p>

                  <p>Your private events and notes are NOT encrypted on
	            the server, at least not yet. I'd love to do
	            that.</p>

                  <h2>If I use this and you go out of business or get acquired it'll be another stupid nightmare and you'll dump all the data down the toilet and why should I ever trust you at all?</h2>
                  
                  <p>You put the cart about 10 miles in front of the
                    horse there, huh? Anyway this is ultimately a thing
                    designed to give back to the commons so if something
                    weird happens, like anyone besides me uses it, and I
                    feel an attack of the vapors coming on that makes me
                    wonder if I'll be able to keep the server up, I'll
                    DM <a href="https://en.wikipedia.org/wiki/Jason_Scott">Jason
                      Scott</a>, which is something I often do, actually,
            and I'll ask him to tell me exactly what to do to
        archive the data here without violating anyone's
            privacy. </p>

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
            manipulated. Or to reward successful data
            importers. Let's see what happens.</p>
      
      <h2>This has nothing to do with machine learning.</h2>
      
      <p>I don't know, imagine what you could do with
          billions of public events. Let's see what
        happens.</p>
      
      <h2>This is just another centralized effort designed to own other people's creative work</h2>
                
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
            lot to learn here. Frankly you could be looking at a
            clay pot from Sicily that's circa 1500 and not know
        whether it's circa 1500 Greenwich Mean Time or circa
            1500 Eastern Standard Daylight. Anwyway right now
            I'm winging it and just pretending timezones aren't
            real. Let's see what happens.</p>
      
      <h2>This is not how history is done/there's more to history than chronology.</h2>
                
                <p>Yes, agreed. It's a writing tool that keeps the
        vaguest chronology in view. Let's see what
            happens.</p>

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
      
      <p>Oh sheesh have I thought hard about this one. This
        sounds simple but it actually veers into
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

      
      <h2>What about griefers/Nazis/racists/sexists/anti-Semites/goofballs/trolls/men?</h2>
      
      <p>Right now I'm the only one here. If exhausting
            people, bad actors, griefers, and so forth show up
            we'll set limits, hire people, charge money,
        whatever. It's not a social network.</p>

                <p>Anyway if this thing looks like it's being used to
        harm people I'll boot people or pull the plug. I
            have to do enough bullshit in my life to keep all
            the fires lit. I'm not going to have my side project
        become yet another Internet tool for
        dehumanization.</p>

      <p>This is subtle but important: The Timelines are
        about Who Did What When. Let me take something
        pretty reprehensible: Alex Jones saying Michelle
        Obama is a transsexual, which was sexist, racist,
        and transphobic. It's important that we preserve him
            saying that, in an archive, and make that usable to
            people who are thinking about things. It's actual
        evidence of someone who has lots of fans
        participating in the marginalization of others. It's
            hurtful but it's useful, in an archive. So it needs
        to "be" there, but it needs to be in a context, so
        that we can understand what is happening. But it
        doesn't need to be amplified nor should it be
            presented as news or "the record."</p>

                <p>These are all product problems, ultimately. Do you
            tag Alex Jones under "conspiracy" and "racism"? Do
                you have a button that says "show me the bad
        things"? I don't have solutions, because that's
            going to be up to the users.</p>

                <p>Plus it gets more complex. Archives are totally
            biased in favor of history, news, fame, and
            money. Because that's who makes archives. Doing this
        project has made that ridiculously obvious. Public
        data in the commons is either about vast, anonymized
        groups of people (like people who take cabs) or it's
            about expensive and rare things, and stories of
            great success or failure. That's what's durable. I'm
        going to do my best to add events about women,
        people of color, LGBTQ folks, autistic folks---all
        the communities that don't have much voice in
            history. And the web has its own tractable history
            now, running 25 years, with lots of voices
            represented. But for the most part the public
            archives that I'm importing don't represent regular
            people very much. The Cooper Hewitt Design Museum
            does pretty well because everyone needs
            wallpaper.</p>

                <p>The world is big and difficult and most likely no
            one will care and this will be just another dead
            website.</p>

                <p>It's interesting though.</p>

      <p>Let's see what happens.</p>
                
                <h2>You've already failed in so many ways!</h2>
      
      <p>And there's more to come!</p>

                <p>Or maybe nothing will happen. It's an
  	experiment.</p>

      <p>It's so good to finally have this thing out of my
  	    brain, where it's been sitting for years, and into
  	the world. Let's see what happens.</p>
                
            </div>
                </Scrollbars>
                </div>
        );
    }
}


export default About;

