import React from 'react';
import { DateTime, Interval } from 'luxon';
import WheelReact from '../wheel-react.js';
import Panel from './Panel.js';
// import { Interval } from 'luxon';

class Timeline extends React.Component {
    constructor(props, context) {
        super(props, context);
        let span = this.asYear(DateTime.local());
        this.frames = {
            millennium:{
                dur:1000,
                getInterval:(dt) => {
                    return Interval.fromDateTimes(dt.startOf('year'), dt.endOf('year')).toISO();
                }
            },
            century:100,
            decade:10,
            year:{
                dur:1000,
                getInterval:(dt) => {
                    return Interval.fromDateTimes(dt.startOf('year'), dt.endOf('year')).toISO();
                },
                getTitle:(dt) => {
                    return dt.year;
                }
            },
            month:1/12,
            day:1/365,
            hour:1/(365*24),
            minute:1/(365*24*60)
        };
      
        this.state = {
            title:'X',
            frame:'year',
            span:span,
            offset:0,
            center:0,
            atMouseDown:undefined,
            mouseDown:false
        };
    }

    asYear(dt) {
        return Interval.fromDateTimes(dt.startOf('year'), dt.endOf('year')).toISO();
    }
    
    adjust(toAdd) {
        let _span = Interval.fromISO(this.state.span);
        let o = {};
        o[this.state.frame]=this.state.center + toAdd;
        let _interval = Interval.fromDateTimes(
            _span.start.plus(o),
            _span.end.plus(o));
        let _title = this.frames[this.state.frame].getTitle(_interval.start);
        let _interval_iso = _interval.toISO();
        return [_title, _interval_iso];
    }

    getXPercentage() {
        return this.props.position.x / this.props.elementDimensions.width;
    }
    
    handleMouseMove(e) {
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
        console.log('widening');
    }

    narrow() {
        console.log('narrowing');        
    }

    toProps(num) {
        let [title, span] = this.adjust(num);
        return {
            center:this.state.center + num,
            frame:this.state.context,
            title:title,
            span:span,
            offset:this.state.offset
        };
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
