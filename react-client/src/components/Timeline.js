import React from 'react';
import { DateTime, Interval } from 'luxon';
import WheelReact from '../ext/wheel-react.js';
import Panel from './Panel.js';

class Timeline extends React.Component {
    constructor(props, context) {
        super(props, context);
        
        let span = this.asYear(DateTime.local());


        this.timeFrames = [
            {
                frame: 'millennium',
                getTitle:()=>{
                    return 'MILLENNIUM';
                },
                getDuration:()=> {
                    return 1000;
                },
                getAdjusted:(dt) => {
                    let beginYear = 1000*Math.floor(dt.year()/1000, 10);
                    let endYear = beginYear + 1000 - 1;
                    let span = `${beginYear}-01-01T00:00:00/${endYear}-12-31T23:59:59`;
                },
                getColumnCount:()=>{
                    return 10;
                },
                getColumnSpan:(begin, ct)=>{
                    let beginYear = begin + (ct * 100); // years;
                    let endYear = beginYear + 99;
                    let span = `${beginYear}-01-01T00:00:00/${endYear}-12-31T23:59:59`;
                },
                getInterval:(dt) => {
                    return Interval.fromDateTimes(
                        dt.startOf('year'),
                        dt.endOf('year')
                    ).toISO();
                }
            },

            {
                frame:'century',
                getDuration:()=> {return 100;},
            },

            {
                frame:'decade',
                getDuration:()=> {return 10;},
            },

            {
                frame:'year',
                getDuration:()=>{
                    return 1;
                },
                getInterval:(dt) => {
                    return Interval.fromDateTimes(
                        dt.startOf('year'), dt.endOf('year')
                    ).toISO();
                },
                getTitle:(dt) => {
                    return dt.year;
                }
            },

            {
                frame:'month'
            },

            {
                frame:'day'
            },

            {
                frame:'hour'
            },

            {
                frame:'minute'
            }
        ];

        // The above but `key`ed by `frame`.
        this.frames = this.timeFrames.reduce(function(allFrames, frame) {
            allFrames[frame.frame]=frame;
            return allFrames;
        },{});


        var frame = 'year';
        var dt = DateTime.local();

        this.state = {
            title:this.frames[frame].getTitle(dt),
            frame:'year',
            span:span,
            offset:0,
            center:0,
            atMouseDown:undefined,
            mouseDown:false
        };
    }

    asYear(dt) {
        return Interval.fromDateTimes(
            dt.startOf('year'),
            dt.endOf('year')
        ).toISO();
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
        console.log('-1 timeframe');
    }

    narrow() {
        console.log('+1 timeframe');        
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
                <Panel addNote={this.props.addNote}
                       {...this.toProps(-1)} />
                <Panel addNote={this.props.addNote}
                       {...this.toProps(0)} />
                <Panel addNote={this.props.addNote}
                       {...this.toProps(1)} />                
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
