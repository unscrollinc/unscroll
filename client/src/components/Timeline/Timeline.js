import React from 'react';
import { DateTime, Duration, Interval } from 'luxon';
import WheelReact from '../../ext/wheel-react';
import Panel from './Panel';
import TimeFrames from './TimeFrames';

class Timeline extends React.Component {
    constructor(props, context) {
	super(props, context);
        console.log('PROPS', props);
        const start = props.start
              ? DateTime.fromISO(props.start)
              : DateTime.local().startOf('month');

        const before = props.start
              ? DateTime.fromISO(props.before)
              : DateTime.local().endOf('month');        
        
        this.state = this.initialize(start, before);
        }
    
    initialize(start, before) {
	const interval = Interval.fromDateTimes(start, before);
        const timeframes = new TimeFrames(interval);
        const frame = timeframes.getTimeFrameObject();
        console.log('Frame', frame);
	const adjusted = frame.getAdjustedDt(interval);
        const title = frame.getTitle(adjusted);
        return {
            title:title,
            frame:frame,
            span:adjusted,
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
	return `start=${interval.start.toISO()}&before=${interval.end.toISO()}`;
    }
    
    toProps(num) {
	const newCenter = this.state.center + num;
        const {title, interval} = this.state.frame.offset(this.state.span, newCenter);
        const props = {
            columnCount:this.state.frame.getColumnCount(interval),
            center:newCenter,
            frame:this.state.frame,
            title:title,
            interval:interval,
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

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.start !== this.props.start
            && prevProps.before !== this.props.before) {
            this.setState(this.initialize(this.props));

        }
    }
    
    componentDidMount() {
        // console.log('Did mount', this);
    }

    componentWillUnmount() {
        WheelReact.clearTimeout();
    }    
}

export default Timeline;
