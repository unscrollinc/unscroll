import React from 'react';
import 'react-virtualized/styles.css';
import {DateTime, Interval} from 'luxon';
import EventNoteButton from '../Event/EventNoteButton';


class TimelistEvent extends React.Component {

    constructor(props) {
        super(props);
        this.state = props;
    }

    showWhenHappened(then, now) {
        if (then)  {
            let thenISO = DateTime.fromISO(''+then);
            let nowISO = DateTime.fromISO(''+now);            
            let dur = Interval.fromDateTimes(thenISO, nowISO);
            let ct = dur.count('months') - 1;
            if (ct > 0) {
                return(<div className="dtsince">+ {ct} months </div>);
            }
        }
        return undefined;
    }

    makeImage(e) {
        if (e.thumb_image) {
            return(
                <a href={e.content_url} target="_blank">
                  <img className="timelist-image" src={'http://localhost/' + e.thumb_image}/>
                </a>
            );
        }
        else {
            return undefined;
        }
        

    }
    
    render() {
        let e = this.state.event;
        return(
            <div className="timelist-event-wrapper">
              {this.makeImage(e)}                  
              
              {this.showWhenHappened(this.state.lastTime, e.when_happened)}
	      <div className="timelist-event">
		<EventNoteButton event={this.props.event}/>
	        
                <div className="event-meta">
                  <a className="title" href={`/search/?scroll:${e.scroll_title}`}>
                {e.scroll_title}
                  </a>
                  <br/>
                  <a className="title" href={`/search/?by:${e.username}`}>
                    {e.username}
                  </a>
                </div>                
                <div className="dt">{e.when_happened}</div>             
                <div>
                <a href={e.content_url} target="_blank">
                <div dangerouslySetInnerHTML={{__html: e.title}}/>
                </a>
                </div>
                <div dangerouslySetInnerHTML={{__html: e.text}}/>
                
              </div>
            </div>
        );
    }
}

export default TimelistEvent;
