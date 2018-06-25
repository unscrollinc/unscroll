import React from 'react';
import Search from './Search';
import AppContext from './AppContext';
import { Link } from 'react-router-dom' ;


class About extends React.Component {
    
    render() {
        return (
            <div class="Editor">
              <div class="About">
                
                <h1>Frequently Anticipated Anxieties and Objections</h1>
                
                <h2>Who can I interrogate, scold, or praise?</h2>
                
                <p>Paul Ford, <a href="mailto:ford@unscroll.com">ford@unscroll.com</a>.</p>
                
                <h2>What in the hell is this new stupid thing that I know I will hate?</h2>
                
                <p>Unscroll is a tool for writing and exploring!</p>
                
                <ol>
                  
                  <li>It's got Timelines filled with Events!</li>
                  
                  <li>It's got Notebooks filled with Notes!</li>
                  
                </ol>
                
                <p>That's basically it, but it leads to a nice new way
                  of writing.</p>
                
                <p>Because the Events are searchable it's easy to
                  look through lots of them and do basic
                  research.</p>
                
                <p>Because of The Magic of Hypertext you can easily make
                  a Note based on any Event, so your writing is always
                  connected to events that happened.</p>
                
                <p>You can organize your notes to produce anything, like
                  essays or articles, or book chapters, and all the
                  footnotes are always right there.</p>
                
                <p>It gives you a superpower: The power to remember what
                  the hell you are talking about.</p>
                
                <p>If you don't need that superpower, more power to
                  you. But I personally need that superpower.</p>
                
                <h2>I don't get why you'd use this instead of [any other
                  tool].</h2>
                
                <p>I built this for myself, after decades of looking
                  at and thinking about writing online. It makes me so
                  happy and it helps me be a better writer. I think
                  that writing is a service to the reader and that it's
                  important to get things write. Also, the publishing
                  industry load off so many fact-checkers and editors
                  that the responsibility for accuracy now falls very
                  firmly on the shoulders of writers.</p>
                
                <p>If other people use it that'll be great. Up to
                  you!</p>
                
                <h2>If I use this, who owns my work?</h2>
                
                <p>Mostly YOU, sometimes EVERYONE, never just ME.</p>
                
                <p>I'm still working this out, but here's where I'm at:</p>
                
                <ul>
                  <li>Timelines and their Events can be private or public.</li>
                  
                  <li>Notebooks and their Notes can be private or public.</li>
                  
                  <li>Private stuff can only be seen by you.</li>
                  
                  <li>When you make Timelines public you're not just
                    making them public but adding them to the commons and
                    giving up ownership. Think Wikipedia.</li>
                  
                  <li>When you make Notebooks public you're
                    just...publishing them on Unscroll. You own the
                    copyright over your Notebooks forever. If you make
                    them public you're giving Unscroll the right to use
                    them until you unpublish them. Think any blogging
                    platform.</li>
                  
                </ul>
                
                <p>Will that work? Let's see what happens. Right now
                  this thing has ONE user so it's NBD.</p>
                
                <h2>Who are you? Can I trust you?</h2>
                
                <p>My name is Paul Ford. I'm a writer and programmer and
                  entrepreneur. I co-founded a NYC software company
                  called Postlight and I'm the CEO there today. We have
                  about 50 employees.</p>
                
                <p>I've been coding and managing software projects for
                  years. I also once wrote an entire issue of Bloomberg
                  Businessweek about Code and won the national magazine
                  award for that. I've written for an awful lot of
                  magazines and it's gone pretty well. Plus a novel,
                  etc. I advise Medium and in general I think I'm known
                  as a well-intentioned if slightly eccentric person of
                  the Internet</p>
                
                <p>I've been working on this thing for years and I have
                  the resources, connections, and capital to keep it
                  running.</p>
                
                <h2>Why did you do this?</h2>
                
                <p>One side-effect of having a software company focused
                  on client work is that it's incredibly hard to stand
                  up a team to work on your own ideas. If you're doing
                  well everyone is too busy.</p>
                
                <p>At the same time I felt an urgent need to stay
                  connected to the work we do. My job is a lot of sales. I
                  love my job, but I need to make things too.</p>
                
                <p>So that's this. I've work on it nights and weekends
                  for an hour or two, after the kids are in bed. Those
                  hours add up over time.</p>
                
                <p>This idea pre-dates Postlight. I first registered the
                  URL in February 2010, although but back then I just
                  wanted to make a bunch of timelines. Over time I
                  realized what I wanted was time.</p>
                
                <p>I've built it three times over four years, and
                  presented it twice as part of larger talks. This
                  version feels solid enough to release so that everyone
                  can yell at me. Let's see what happens.</p>
                
                <h2>What do you expect to happen?</h2>
                
                <p>I want to help writers be less anxious--and god are
                  they anxious--so that they can do more thoughtful
                  work. I wanted to make a tool that helped you write
                  that wasn't another empty box. I was motivated to do
                  so because it brought me joy. Let's see what
                  happens.</p>
                
                <h2>It should be free software.</h2>
                
                <p>Maybe so! If people use it and care about it, that
                  would make sense. It's built on django-rest-framework
                  and React. Let's see what happens.</p>
                
                <h2>The data should be open.</h2>
                
                <p>The events sure should. Info dumps into the commons
                  are terrible. Let's see what happens.</p>
                
                <h2>There's no business model.</h2>
                
                <p>There are tons of business models and not-business
                  models. This thing would need to get tens of thousands
                  of committed daily users before it cost more than a
                  couple hundred bucks to run per month. I'm good for
                  that. Let's see what happens.</p>
                
                <h2>That has nothing to do with the blockchain.</h2>
                
                <p>It would be nice, some day, to publish Timeline
                  hashes into a blockchain so that people can be
                  relatively assured that history has not been
                  manipulated. Let's see what happens.</p>
                
                <h2>This has nothing to do with machine learning.</h2>
                
                <p>I don't know, imagine what you could do with billions
                  of open events. Let's see what happens.</p>
                
                <h2>This is just another centralized effort designed to
                  own culture.</h2>
                
                <p>Maybe! It would be nice, some day, to imagine this as
                  a federated service, using it to index HTML
                  microformats, blog posts, and tweets at the time of
                  their authorship. Let's see what happens.</p>
                
                <h2>The approach to date-time is utterly
                  half-assed.</h2>
                
                <p>Yes, it's terrible. Extracting a date from, say, a
                  filename on archive.org and turning it into a
                  realistic Julian time is pretty hard. There's a lot to
                  learn here. Right now I'm winging it. Let's see what
                  happens.</p>
                
                <h2>This is not how history is done/there's more to
                  history than chronology.</h2>
                
                <p>Yes, agreed. It's a writing tool that keeps
                  chronology in view. Let's see what happens.</p>
                
                <h2>How will I know if the events are accurate?</h2>
                
                <p>A community, should one form, will define the culture
                  here, not the software. What you'll find is that
                  things are just less locked down, date-time wise, then
                  you might ever expect. Even when you import really
                  well-regarded sources--museum collections, for
                  example--it's hard to know when something
                  happened. Let's see what happens.</p>
                
                <h2>What about griefers/Nazis/etc?</h2>
                
                <p>With any moderate success will come exhausting
                  people, bad actors, griefers, and so forth. We'll set
                  limits, charge money, whatever.  It's not a social
                  network. Let's see what happens.</p>
                
                <h2>You've already failed in so many ways!</h2>
                
                <p>And there's more to come! Let's see what happens.</p>
                
                <h2>What would insane success look like?</h2>
                
                <p>Something would happen.</p>
                
              </div>
              
            </div>
        );
    }
}


export default About;

