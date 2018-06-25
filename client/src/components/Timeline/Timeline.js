import React from 'react';
import { DateTime, Duration, Interval } from 'luxon';
import WheelReact from '../../ext/wheel-react';
import Panel from './Panel';
import TimeFrames from './TimeFrames';

class Timeline extends React.Component {
    constructor(props, context) {

	super(props, context);
	
	let dt = DateTime.local();
	this.interval = Interval.fromDateTimes(dt, dt.plus({months:5}));
	this.timeframe = new TimeFrames(this.interval);
        this.frame = this.timeframe.getTimeFrameObject();
	this.adjusted = this.frame.getAdjustedDt(this.interval);
	console.log('TIMEFRAME IS', this.timeframe, this.frame, this.adjusted);
        this.state = {
            title:this.frame.getTitle(this.adjusted),
            span:this.frame.adjusted,
            offset:0,
            center:0,
            atMouseDown:undefined,
            mouseDown:false
        };
    }

    getXPercentage() {
        return this.props.position.x / this.props.elementDimensions.width;
    }
    
    handleMouseMove(e) {
        // console.log('EEEEEEEEEEEEEEEEEEE',e);
        if (e.buttons > 0) {
            let delta = this.getXPercentage() - this.state.atMouseDown;
            let center = 0 - Math.round(this.state.offset/100);
            this.setState({
                offset:this.state.offset + (50 * delta),
                center:(center !== this.state.center) ? center : this.state.center
            });
        }
    };
    
    handleMouseDown(e) {
        this.setState({
            mouseDown:true,
            atMouseDown:this.getXPercentage()
        });        
    }

    handleMouseUp(e) {
        this.setState({
            mouseDown:false,
            atMouseDown:undefined
        });
    }

    widen() {
        console.log('-1 timeframe');
    }

    narrow() {
        console.log('+1 timeframe');        
    }

    toSpan(interval) {
	return `start=${interval.start.toISO()}&before=${interval.end.toISO()}`;
    }
    
    toProps(num) {
	const newCenter = this.state.center + num;
        const {title, interval} = this.frame.offset(this.adjusted, newCenter);
        const props = {
            center:newCenter,
            frame:this.frame,
            title:title,
            timeSpan:this.toSpan(interval),
            offset:this.state.offset
        };
	return props;
    }
    
    render() {
        WheelReact.config({
            left: (e) => {
                console.log('wheel left detected.');
            },
            right: (e) => {
                console.log('wheel right detected.');
            },
            up: (e) => {
                this.widen();
            },
            down: (e) => {
                this.narrow();
            }
        });
        return (
		<div className="Timeline"
                   style={{position:'fixed'}}
                   {...WheelReact.events}
                   onMouseDown={this.handleMouseDown.bind(this)}
                   onMouseUp={this.handleMouseUp.bind(this)}                 
                   onMouseMove={this.handleMouseMove.bind(this)}
                   >            
                <div id="Panels">
                  <Panel {...this.toProps(-1)} />
                  <Panel {...this.toProps(0)} />
                  <Panel {...this.toProps(1)} />
                </div>
              </div>
        );
    }

    componentDidMount() {
        // console.log('Did mount', this);
    }

    componentWillUnmount() {
        WheelReact.clearTimeout();
    }    
}

export default Timeline;
