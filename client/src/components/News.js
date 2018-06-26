import React from 'react';
import { Link } from 'react-router-dom' ;


class News extends React.Component {
    
    render() {
        return (
            <div className="Editor">
              <div className="About">
              <h1>Welcome to Unscroll!</h1>
              
              <p>Unscroll is an experimental website that is simultaneously a bunch of timelines and also a writing tool designed to make it easier to write clear, factual prose on deadline. It's brand new, full of bugs and quirks, and the work of one person named <a href="mailto:ford@unscroll.com">Paul Ford</a>. This is my side project. I'm a programmer (I programmed this), journalist (I write a lot about technology and even once won a National Magazine Award), and entrepreneur (CEO of a software company called Postlight.)</p>

              <p>You can <a href="/">sign up</a>, add timelines, and create notebooks.</p>

              <p>Here are some recently published notebooks:</p>
              

              <p>And some timelines to explore:</p>


              <p>I know that new things on the Internet are annoying. To that end, you can read a <Link to="/about">list of frequently anticipated objections.</Link></p>


              </div>
            </div>
        );
    }
}


export default News;

