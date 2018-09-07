import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

class About extends React.Component {
    componentDidMount() {
        document.title = 'About This Website (Unscroll)';
    }
    render() {
        return (
            <div className="Meta">
                <Scrollbars autoHide style={{ height: '100%' }}>
                    <div className="About">
                        <h1>Frequently Anticipated Objections</h1>

                        <h2>Who can I interrogate, scold, or praise?</h2>

                        <p>
                            Site news at{' '}
                            <a href="https://twitter.com/unscroll">@unscroll</a>
                            . Bug reports and existential crises to Paul Ford,{' '}
                            <a href="mailto:ford+unscroll@ftrain.com">
                                ford@ftrain.com
                            </a>
                            . Also on twitter at{' '}
                            <a href="https://twitter.com/ftrain">@ftrain</a>; my
                            DMs are open.
                        </p>

                        <p>
                            This is very alpha. I'm releasing it in the spirit
                            of just releasing it. I'd love to know about bugs,
                            or about how it could really help you.
                        </p>

                        <h2>What is this?</h2>

                        <p>
                            Unscroll is an experimental tool for writing that
                            helps a person fact-check their own writing.
                        </p>

                        <p>
                            It sees the worlds in terms of <i>Events</i> and{' '}
                            <i>Notes</i>.
                        </p>

                        <p>
                            You put <i>Events</i> into a <i>Timeline</i>.
                        </p>

                        <p>
                            You arrange <i>Notes</i> in <i>Notebooks</i>. Get
                            enough notes together and they start to look like
                            essays, or book chapters, or blog posts.
                        </p>

                        <p>
                            In theory (and personal practice) this gives you a
                            superpower: The power to remember what you are
                            writing about as you are writing it, so that you
                            don't run your fool mouth. If you don't need that
                            superpower, more power to you. But I personally need
                            that superpower more every day.
                        </p>

                        <h2>
                            Why did you do something when it would be easier for
                            me, as a consumer of things, if you had done
                            nothing?
                        </h2>

                        <p>Let's see what happens.</p>

                        <h2>Who is this for?</h2>

                        <p>
                            Professional accurists of all stripes. People who
                            like history, high school students, grad students,
                            journalists who don't have enough editorial and
                            fact-checking support, personal-essay-writer types,
                            basically anyone who wants to catch themselves on
                            their own foolishness, and catch the foolishness of
                            others before it infects the water supply. Also just
                            people who like looking at old vases and how book
                            covers change over time. Everyone.
                        </p>

                        <p>
                            It's also edging on a tool for people to do serious
                            work on their phones. That's how I use it mostly.
                            Think millennial law students.
                        </p>

                        <p>But really it's for me.</p>

                        <h2>Who are you?</h2>

                        <p>
                            My name is Paul Ford. I'm a writer, programmer, and
                            an entrepreneur.
                        </p>

                        <p>
                            As a writer I'm best known for taking over an entire
                            issue of <i>Bloomberg Businessweek</i> to write{' '}
                            <a href="https://www.bloomberg.com/graphics/2015-paul-ford-what-is-code/">
                                What Is Code?
                            </a>
                            , which won awards and acclaim. I've also written
                            and published a novel and countless personal essays
                            and blog posts.
                        </p>

                        <p>
                            As a programmer, well, you're looking at it. Also
                            I've built a lot of CMSes and archives.
                        </p>

                        <p>
                            As an entrepreneur, my friend Rich and I, with many
                            wonderful people, built a NYC-based software
                            development company called{' '}
                            <a href="https://postlight.com">Postlight</a>, and
                            today I'm the CEO there. We have around 50 employees
                            and work on large, complex products and platforms
                            for our clients.
                        </p>

                        <p>
                            {' '}
                            A CEO is not supposed to code. But I missed making
                            things, and I really wanted this in the world in
                            exactly the shape it was in my head. It has been in
                            my head for many years.
                        </p>

                        <p>
                            I made it at night with the kids in bed and in the
                            mornings at work after I got emails done. I made a
                            deal with myself: I could work on it when it
                            wouldn't interfere with the healthy growth of my
                            family or my company. I (mostly) stuck to that.
                        </p>

                        <h2>
                            I don't get why you'd use this instead of [any other
                            one of thousands of software products].
                        </h2>

                        <p>
                            It's for a specific kind of anxious writer. If
                            you're happy and productive with other tools then
                            that's great. Let's see what happens.
                        </p>

                        <h2>It should be free software. Everything should.</h2>

                        <p>
                            Maybe so! If people use Unscroll and care about it,
                            and other people start creating timelines using
                            commons resources, that would make sense. It's built
                            on Django and React. Let's see what happens.
                        </p>

                        <h2>
                            The data should be open. All the data should be
                            open.
                        </h2>

                        <p>
                            Some should. Sharing out data in a reasonable way
                            takes time to do right so I'm not rushing. I don't
                            want to just release data out of guilt or mandate,
                            or just dump an intractable blob of JSON into a
                            bucket. I want to make sure what goes back into the
                            commons is tractable, useful, and can be used to
                            contribute back to Unscroll, too. Let's see what
                            happens.
                        </p>

                        <h2>If I use this, who owns my work?</h2>

                        <p>
                            Right now this thing has one user. But let's say you
                            were the second. Who owns what?
                        </p>

                        <p>Mostly YOU, sometimes EVERYONE, never just ME.</p>

                        <p>
                            I'm still working this out, but here's where I'm at:
                        </p>

                        <ul>
                            <li>Private stuff can only be seen by you.</li>

                            <li>
                                Everything (Timelines, Events, Notes, and
                                Events) starts out PRIVATE.
                            </li>

                            <li>
                                Timelines and their Events can be private or
                                public.
                            </li>

                            <li>
                                Notebooks and their Notes can be private or
                                public.
                            </li>

                            <li>
                                When you make Timelines public you're not just
                                making them public but adding all the events in
                                them to the commons and you can't really put
                                that back in the box. Think Wikipedia. Even if
                                you make them private later someone could have
                                downloaded the whole thing in a batch.
                            </li>

                            <li>
                                When you make Notebooks public you're
                                just...publishing them on Unscroll. You own the
                                copyright over your Notebooks forever. If you
                                make them public you're giving Unscroll the
                                right to use them until you unpublish them.
                                Think any blogging platform. Then they're gone.
                            </li>
                        </ul>

                        <p>
                            Will that work? Let's see what happens. I realize
                            this is kind of a lot. It needs a picture. Maybe
                            after launch I will draw one. Or you can if you
                            want.
                        </p>

                        <h2>
                            This is pointless without API access, I want API
                            access.
                        </h2>

                        <p>
                            You have it actually. I just need a little while for
                            Swagger, etc.
                        </p>

                        <h2>This website is not accessible.</h2>

                        <p>
                            It isn't, and it should be, and needs to be.{' '}
                            <i>Mea culpa</i>. It's going to take a while. The
                            thing to get right is the composition experience.
                            Glad to hear from people about what needs to happen.
                        </p>

                        <h2>What about copyright?</h2>

                        <p>
                            On the search engine side, I spider web pages, use
                            open data, and respect robots.txt (well, I try to,
                            things can be vague.) It's just descriptive text and
                            thumbnails. I tried to make everything as
                            predictably obviously fair use as I could.
                        </p>

                        <p>On the what-people-post side, DMCA-1026160.</p>

                        <h2>What about my privacy and security?</h2>

                        <p>
                            I, or someone I delegate, might see something while
                            administering the database. In general please don't
                            put anything super-secret or valuable into this new,
                            untrusted, experimental web service. I don't think
                            you would, but it makes me feel better to say that.
                        </p>

                        <p>
                            I use the Django framework and follow its
                            guidelines. All traffic is via HTTPS via Let's
                            Encrypt. So it's roughly as locked down as any
                            reasonable web-based thing.
                        </p>

                        <p>
                            {' '}
                            Your events and notes are NOT encrypted on the
                            server, at least not yet. I'd love to do that, it's
                            not a one-person job.
                        </p>

                        <h2>
                            If I use this and you go out of business or get
                            acquired it'll be another stupid nightmare and
                            you'll dump all the data down the toilet and why
                            should I ever trust you at all?
                        </h2>

                        <p>
                            This is ultimately a thing designed to give back to
                            the commons. Let's see how people use it. I am a
                            friend of the archive community and large libraries
                            everywhere. An ideal situation is one in which,
                            should Unscroll go away entirely, nothing that was
                            shared with the public would be lost, and
                            individuals would still have full records of their
                            private events, timelines, notes, and notebooks.
                        </p>

                        <h2>There's no business model.</h2>

                        <p>
                            There are tons of business models and not-business
                            models. Right now it has one user and this thing
                            would need to get many thousands of committed daily
                            users before it cost more than a couple hundred
                            bucks to run per month. I mean this thing could be
                            good for lawyers, or be something that groups can
                            use. Let's see what happens.
                        </p>

                        <h2>That has nothing to do with the blockchain.</h2>

                        <p>
                            I guess it would be nice, some day, to auto-publish
                            Timeline hashes into a blockchain so that people can
                            be relatively assured that history has not been
                            manipulated. Let's see what happens.
                        </p>

                        <h2>
                            The mobile experience is wonky. No one uses desktop
                            computers.
                        </h2>

                        <p>
                            I spent a lot of time on mobile but mobile web,
                            it's...well. Life. Let's see what happens.
                        </p>

                        <h2>This has nothing to do with machine learning.</h2>

                        <p>
                            I don't know, imagine what you could do with lots of
                            public events some of which have been tagged and
                            annotated as a side-effect of the writing process.
                            Of course none of that is real yet. Let's see what
                            happens.
                        </p>

                        <h2>
                            This is just another centralized effort designed to
                            own other people's creative work. It should be a
                            federated, decentralized timeline-writing tool.
                        </h2>

                        <p>
                            {' '}
                            Maybe! Have you ever tried to coordinate large
                            numbers of services to create great experiences,
                            though? Me neither. I don't really want to own time
                            or culture. I want people to feel safe and protected
                            and like they have the tools they need to do good
                            work, starting with me.
                        </p>

                        <p>
                            It is nice to imagine a federated service, used to
                            index HTML microformats, blog posts, and tweets at
                            the time of their authorship. On the other hand,
                            humans love convenience so maybe a centralized
                            service is best. The goal is to help. This thing
                            only has one user so it doesn't really matter. Let's
                            see what happens.
                        </p>

                        <h2>
                            The approach to date-time parsing and processing is
                            utterly half-assed.
                        </h2>

                        <p>
                            Yes, it's terrible. Extracting a date from, say,
                            where it's embedded in a filename on an MP3 on
                            archive.org and turning it into a realistic calendar
                            moment is pretty hard. There's a lot to learn here.
                            Frankly you could be looking at a clay pot from
                            Sicily that's circa 1500 and not know whether it's
                            circa 1500 Greenwich Mean Time or circa 1500 Eastern
                            Standard Daylight. Anwyway right now I'm winging it
                            and just pretending timezones aren't real. I'm sure
                            it will bite me. Let's see what happens.
                        </p>

                        <h2>
                            This is not how history is done/there's more to
                            history than chronology.
                        </h2>

                        <p>
                            Yes, agreed. It's a writing tool that keeps the
                            vaguest chronology in view. Let's see what happens.
                        </p>

                        <h2>The events show all kinds of bias.</h2>

                        <p>
                            They sure do. The resources in the commons that I'm
                            importing are definitely biased towards the
                            conventionally-funded western-dominated metric of
                            what's important.
                        </p>

                        <p>
                            If doing this has taught me anything (it's taught me
                            like 1,000 things which is why I did it) it's that
                            archives are totally biased in favor of consensus
                            rich-and-powerful-people history, around who made
                            the news, who had the fame, and who had the money.
                            Because that's who makes archives. We archive (1)
                            fame; and (2) pain. Doing this project has made that
                            ridiculously obvious. Public data in the commons is
                            either about vast, anonymized groups of people (like
                            people who take cabs) or it's about expensive and
                            rare things (museum archives), or stories of great
                            success or failure of successful mainstream people
                            (media archives). Even when it's about
                            less-represented people it's often about their
                            suffering (like specific records around slavery or
                            lynching)
                        </p>

                        <p>
                            There are definitely exceptions but a lot of the
                            important archives around, say, Black history,
                            aren't digitized yet ($$$), and I don't want to
                            create records for artifacts where there isn't an
                            available source document. And I don't want to have
                            an archive that just contrasts success and suffering
                            based on skin color or gender identity and calls
                            itself done. That doesn't really help anyone. So
                            it's a big unsolved problem.
                        </p>

                        <p>
                            Neither fame nor pain are what interests me
                            personally all of the time, so I'm going to do my
                            best to add events about other kinds of people over
                            time. Also, the web has its own tractable history
                            now, running 25 years, with lots of voices
                            represented. For all that things suck, we're going
                            on decades of records of how normal humans interact,
                            talk, hook up, and cook things.
                        </p>

                        <p>
                            Anyway for the most part the public archives that
                            I'm importing don't represent regular people very
                            much. The Cooper Hewitt Design Museum does a little
                            better because everyone needs wallpaper.
                        </p>

                        <p>
                            Maybe that could change and it'd be a lot of fun and
                            worth the effort if this was a place where that
                            changed. There's only so much I personally can do
                            here, so I'll pay a reasonable hourly rate for
                            people who want to correct that and create timelines
                            around marginalized people's history. If you know
                            someone who should do that kind of work ping me and
                            I'll reach out to them. But please be a little
                            chill, it's just me and I have a day job, and by
                            offering this up it means I'm going to end up saying
                            no to lots of really good people. Things take a long
                            time. Credentialed people, grad students, people
                            with some experience, are what I need now (maybe not
                            forever but now). Let's see what happens.
                        </p>

                        <h2>How will I know if the events are accurate?</h2>

                        <p>
                            I thought hard about this one. This sounds simple
                            but it actually veers into foundational
                            philosophical challenges about the nature of truth
                            in about five minutes. Short answer is, you can't.
                        </p>

                        <p>
                            Even when you import really well-regarded
                            sources--museum collections, for example--it's hard
                            to know when something happened, and often utterly
                            ambiguous. Dealing with that ambiguity led me to
                            come up with a "guideline of the last possible
                            moment." For example if something is identified as
                            being "circa 1880-1889" the datestamp I assign to it
                            is December 31st 1889 one second before midnight.
                            Let's see what happens. This is because the problem
                            I've found when writing about things that happened
                            is almost always that you put them too soon, not too
                            late. So I err on the side of the last possible
                            moment and keep the original text of the date/time
                            around.
                        </p>

                        <p>
                            Here's a hedge for you: A community, should one form
                            (doubtful), will define the culture here, and the
                            software would support the community's definition of
                            accuracy. Otherwise it'll just be me blogging. Which
                            would be great, I'm actually an excellent blogger
                            and I am well known on many important blogging
                            platforms. Let's see what happens.
                        </p>

                        <h2>
                            What about griefers / Nazis / racists / sexists /
                            anti-Semites / goofballs / trolls / men?
                        </h2>

                        <p>
                            Right now I'm the only one here. If exhausting
                            people, bad actors, griefers, and so forth show up
                            we'll set limits, hire people, charge money, shut it
                            down shut it all down all of it. It's not a social
                            network.
                        </p>

                        <p>
                            Anyway if history has shown us anything it's that
                            the world is big and difficult and most likely no
                            one will care and this will be just another dead
                            website. Except there'll be a lot of JSON files on
                            Archive.org in memoriam.
                        </p>

                        <p>It's interesting though.</p>

                        <p>Let's see what happens.</p>

                        <h2>You've already failed in so many ways!</h2>

                        <p>And there's more to come!</p>

                        <p>Or maybe nothing will happen. It's an experiment.</p>

                        <p>
                            It wouldn't hurt you to be a little positive and
                            encouraging. I know that the Internet has let you
                            down recently. Me too. I'm building this as a place
                            that won't always let people down, where you can sit
                            in bed and look at the past and think about the
                            future and write little essays.
                        </p>

                        <p>
                            You don't have to run to the thread on your
                            microblog messageboard and poop all over this site
                            today. Give it two weeks, then poop on it. I'll hold
                            my breath.
                        </p>

                        <p>
                            I know this thing is a big mess but I worked hard on
                            it. I'm doing it because I love the commons and I
                            have ideas and want to share them, and want to make
                            room for other people's ideas. I know that the web
                            doesn't work that way any more. I still have faith
                            though, like a sucker.
                        </p>

                        <p>Let's see what happens.</p>
                    </div>
                </Scrollbars>
            </div>
        );
    }
}

export default About;
