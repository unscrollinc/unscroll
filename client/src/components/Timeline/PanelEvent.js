import React from 'react';
import EventNoteButton from '../Event/EventNoteButton';
import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

class Event extends React.Component {

    getImage(e) {
        if (e.with_thumbnail) {
            return 'http://localhost/'+ e.with_thumbnail;
        }
        if (e.scroll_with_thumbnail) {
            return 'http://localhost/'+ e.scroll_with_thumbnail;
        }        
    }

    makeImage(e) {
        if (e.with_thumbnail || e.scroll_with_thumbnail) {
            return(
                <a href={e.content_url} target="_blank">
                    <img alt=''
                         className="timeline-image"
                         src={this.getImage(e)}/>
                </a>
            );
        }
        else {
            return undefined;
        }
    }

    render() {
        return(
            <div style={{
                     width:this.props.width,
                     height:this.props.height,
                     left:this.props.left,
                     top:this.props.top
                 }}
                 className='event'>
              <TimelinePanelEventEditButton
                event={this.props.event}/>
                <EventNoteButton event={this.props.event}/>
                {this.makeImage(this.props.event)}
                <div>{this.props.event.when_happened}</div>
	      <h3><a href={this.props.event.content_url} target="_blank">{this.props.month}/{this.props.title}</a></h3>
              <p>{this.props.text}</p>
            </div>
        );
    }
}

export default Event;

