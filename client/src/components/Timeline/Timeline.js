import React from 'react';
import { DateTime, Duration, Interval } from 'luxon';
import WheelReact from '../../ext/wheel-react';
import Panel from './Panel';
import TimeFrames from './TimeFrames';

class Timeline extends React.Component {
    constructor(props, context) {
	super(props, context);
        const start = props.start
              ? DateTime.fromISO(props.start)
              : DateTime.local().startOf('month');

        const before = props.start
              ? DateTime.fromISO(props.before)
              : DateTime.local().endOf('month');        
	const interval = Interval.fromDateTimes(start, before);

	this.state = this.initialize(interval);
	
        }
    
    initialize(interval) {
        const timeframes = new TimeFrames(interval);
        const frame = timeframes.getTimeFrameObject();
	const adjusted = frame.getAdjustedDt(interval);
        const title = frame.getTitle(adjusted);
	const width = frame.getColumnCount(interval);
        return {
            title:title,
            frame:frame,
            span:adjusted,
	    width:width,
	    height:6,	    
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
        if (e.buttons > 0) {
            const delta = this.getXPercentage() - this.state.atMouseDown;
            const center = 0 - Math.round(this.state.offset/100);
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
	console.log('calling toSPan');
	return `start=${interval.start.toISO()}&before=${interval.end.toISO()}`;
    }

    toProps(num) {
	return {center:this.state.center + num,
		span:this.state.span,
		frame:this.state.frame,
		width:this.state.width,
		height:this.state.height,
		offset:this.state.offset};
    }
    
    toProps2(num) {
	const newCenter = this.state.center + num;
        const {title, interval} = this.state.frame.offset(this.state.span, newCenter);
        const props = {
            columnCount:this.state.frame.getColumnCount(interval),
            center:newCenter,
            frame:this.state.frame,
            title:title,
	    width:this.state.width,
	    height:this.state.height,	    
            interval:interval,
            timeSpan:this.toSpan(interval),
            offset:this.state.offset
        };
	return props;
    }


    shouldComponentUpdate(nextProps, nextState) {
	const s = this.state.mouseDown;
	return s;
    }    

    
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.start !== this.props.start
            && prevProps.before !== this.props.before) {
	    const start = DateTime.fromISO(this.props.start);
	    const before = DateTime.fromISO(this.props.before);
            const interval = Interval.fromDateTimes(start, before);
            this.setState(this.initialize(interval));

        }
    }
    
    componentDidMount() {
        // console.log('Did mount', this);
    }

    componentWillUnmount() {
        WheelReact.clearTimeout();
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
                <Panel key={this.state.center - 1} {...this.toProps(-1)} />
                <Panel key={this.state.center} {...this.toProps(0)} />
                <Panel key={this.state.center + 1} {...this.toProps(1)} />
                </div>
              </div>
        );
    }
    
}

export default Timeline;
