import React from 'react';
import 'react-virtualized/styles.css';
import {DateTime, Interval} from 'luxon';
import EventNoteButton from '../Event/EventNoteButton';

class TimelistEvent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {edit:false};
        
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
        if (e.with_thumbnail) {
            return 'http://localhost/'+ e.with_thumbnail;
        }
        if (e.scroll_with_thumbnail) {
            return 'http://localhost/'+ e.scroll_with_thumbnail;
        }        
    }

    getImageUrl(e) {
        return 'url('+ this.getImage(e) + ')';
    }

    makeImage(e) {
        if (e.with_thumbnail || e.scroll_with_thumbnail) {
            return(
                <a href={e.content_url} target="_blank">
                    <img alt=''
                         className="timelist-image"
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

    
    renderEditor() {
        const e = this.props.event;
        return (
	    <tr className="timelist">
	      <td colSpan="2">
		{this.makeImage(e)}
                <input type="file"/>

                {e.scroll_title}
                
                <div className="eventNoteButton">
                  <button onClick={()=>this.setState({edit:false})}>Done</button>                  
                </div>                
                <div>url <input type="text" value={e.content_url}/></div>
                <div>title <input type="text" value={e.title}/></div>
                <div>text <textarea>{e.text}</textarea></div>

	      </td>
	    </tr>
        );
    }
    
    renderEvent() {
        const e = this.props.event;
        return(
	    <React.Fragment>

	      {this.showWhenHappened(this.props.lastTime, e.when_happened)}
	      
	      <tr className="timelist">
                
		<td className="meta">
		  {this.makeImage(e)}                  
		  <div className="collection">
                    
                    <div className="scroll-title">
                      <a className="title" href={`/search/?scroll:${e.scroll_uuid}`}>
                        {e.scroll_title}
	              </a>
                    </div>
                    
                    <div className="author">
                      <a className="title" href={`/search/?by:${e.username}`}>@{e.username}</a>
                    </div>
                    
                  </div>
                  
		</td>
	    
		<td className="content">
                  <div className="eventNoteButton">
                    <EventNoteButton event={this.props.event}/>
                    <button onClick={()=>this.setState({edit:true})}>Edit</button>
                  </div>                
                  
                  <div className="dt">{this.makeWhen(e)}</div>
                  
                  <a href={e.content_url} target="_blank">
		    <div className="event-title" dangerouslySetInnerHTML={{__html: e.title}}/>
                  </a>
                  <div className="text" dangerouslySetInnerHTML={{__html: e.text}}/>

		</td>
	      </tr>
	    </React.Fragment>

        );
    }
    render() {
        if (this.state.edit === true) {
            return this.renderEditor();            
        }
        return this.renderEvent();
    }
}

export default TimelistEvent;
