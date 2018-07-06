import React from 'react';
import EventNoteButton from '../Event/EventNoteButton';
import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

class Event extends React.Component {
    constructor(props) {
	super(props);
        this.state = {
            mightFit:true,
            top:this.props.top,
            left:this.props.left,
            width:this.props.width,
            height:this.props.height
        };
	this.myRef = React.createRef();
    }
    
    getImage(e) {
        if (e.with_thumbnail) {
            return 'http://localhost/'+ e.with_thumbnail;
        }
        if (e.scroll_with_thumbnail) {
            return 'http://localhost/'+ e.scroll_with_thumbnail;
        }
	return null;
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

    componentDidMount() {
	const r = this.myRef.current.getBoundingClientRect();
        const b = window.innerHeight;        
        const h = Math.ceil(((r.height/b) * 100) / this.props.cell.height, 10);
        const w = 3;
        
        const wh =  {
            width:w,
            height:h
        };
        const res = this.props.doReservation(this.props.left,0,w,h);
        if (res.success) {
            this.setState({
                width:res.w * this.props.cell.width + '%',
                height:res.h * this.props.cell.height + '%',
                left:res.x * this.props.cell.width + '%',
                top:7.5 + (0.9 * (res.y * this.props.cell.height)) + '%'
            });
        }
        else {
            this.setState({mightFit:false});
        }
    }

    render() {
        if (this.state.mightFit) {
            return(
                <div key={this.props.event.uuid} style={{
                         width:this.state.width,
                         height:this.state.height,
                         left:this.state.left,
                     top:this.state.top}}
		     ref={this.myRef}
		     className='event'>
	          <div className='event-inner'>
		    <TimelinePanelEventEditButton
		      event={this.props.event}/>
                    <EventNoteButton event={this.props.event}/>
                    {this.makeImage(this.props.event)}
                    <div>{this.props.event.when_happened}</div>
		    <h3><a href={this.props.event.content_url} target="_blank">{this.props.event.title}</a></h3>
		    <p>{this.props.event.text}</p>
	          </div>
                </div>
            );
        }
        return null;
    }
}

export default Event;

