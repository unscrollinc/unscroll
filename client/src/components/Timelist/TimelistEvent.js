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
                return(<tr className="dtsince"><td>+ {ct} months </td></tr>);
            }
        }
        return undefined;
    }

    makeImage(e) {
        if (e.thumb_image) {
            return(
                <a href={e.content_url} target="_blank">
                  <div className="timelist-image"
                       style={{
                           backgroundSize: 'cover',
                           backgroundImage:'url(http://localhost/'+e.thumb_image+')'
                       }}>
                  </div>
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
	    <React.Fragment>

	      {this.showWhenHappened(this.state.lastTime, e.when_happened)}
	      
	      <tr>

		<td>
                  <div>{e.when_happened}</div>
                  <a className="title" href={`/search/?scroll:${e.scroll_title}`}>
                    {e.scroll_title}
		  </a>             	  
		  <div><a className="title" href={`/search/?by:${e.username}`}>{e.username}</a></div>
		  <div><EventNoteButton event={this.props.event}/></div>
		</td>
		
		<td>
                  <h3>
                    <a href={e.content_url} target="_blank">
		      <div className="title" dangerouslySetInnerHTML={{__html: e.title}}/>
		    </a>
		  </h3>
                  <div className="text" dangerouslySetInnerHTML={{__html: e.text}}/>
		</td>
		
		<td>
		  {this.makeImage(e)}
		</td>
		
	      </tr>
	    </React.Fragment>

        );
    }
}

export default TimelistEvent;
