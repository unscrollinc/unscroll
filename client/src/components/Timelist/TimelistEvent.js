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
                return(<tr className="dtsince"><td colSpan="3">+ {ct} months </td></tr>);
            }
        }
        return undefined;
    }

    getImage(e) {
        return 'http://localhost/'+ e.thumb_image;
    }

    getImageUrl(e) {
        return 'url('+ this.getImage(e) + ')';
    }

    makeImage(e) {
        if (e.thumb_image) {
            return(
                <a href={e.content_url} target="_blank">
                  <img className="timelist-image"
                       src={this.getImage(e)}/>
                </a>
            );
        }
        else {
            return undefined;
        }
    }
    makeWhen(e) {
        if (e.when_original) {
            return (<div title={'Date parsed as: ' + e.when_happened}>{e.when_original}</div>);
        }
        return e.when_happened;
    }

    render() {
        let e = this.state.event;
        return(
	    <React.Fragment>

	      {this.showWhenHappened(this.state.lastTime, e.when_happened)}
	      
	      <tr className="timelist">
                
		<td className="meta">
                  <div className="dt">{this.makeWhen(e)}</div>
                  <a className="title" href={`/search/?scroll:${e.scroll_title}`}>
                    {e.scroll_title}
		  </a>             	  
		  <div><a className="title" href={`/search/?by:${e.username}`}>{e.username}</a></div>
		  <div><EventNoteButton event={this.props.event}/></div>
		</td>
		
		<td className="content">
                  <a href={e.content_url} target="_blank">
		    <div className="event-title" dangerouslySetInnerHTML={{__html: e.title}}/>
                  </a>
                  <div className="text" dangerouslySetInnerHTML={{__html: e.text}}/>
		</td>
		 
		<td className="image">
		  {this.makeImage(e)}
		</td>
		
	      </tr>
	    </React.Fragment>

        );
    }
}

export default TimelistEvent;
