import React from 'react';
import { DateTime, Interval } from 'luxon';
import ReactCursorPosition from 'react-cursor-position';
import WheelReact from './wheel-react.js';
import data from './data.json';
import './index.css';


class QueryCache {
    constructor() {
        this.cache = {};
    }
    add(val) {
        this.cache[val]=true;
    }
    check(val) {
        return this.cache[val];
    }
}

let qc = new QueryCache();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorOn:false
        };
    }

    handleEditButtonClick = () => {
        this.setState(prevState => ({
            editorOn: !prevState.editorOn
        }));
    }

    renderEditButton() {
        return(
            <button onClick={this.handleEditButtonClick}>
              {this.state.editorOn ? 'Turn off Editor' : 'Turn on Editor'}
            </button>            
        );
    }

   
    render() {
        return (
            <div className="App">
              <div className="Nav">
                {this.renderEditButton()}
              </div>
              <ReactCursorPosition>
                <Timeline/>
              </ReactCursorPosition>
              <Editor status={this.state.editorOn}/>
            </div>
        );
    }
}

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
        let _interval_iso = _interval.toISO()
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
        console.log('Did mount', this);
    }

    componentWillUnmount() {
        WheelReact.clearTimeout();
    }    
}

class Panel extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            center:props.center,
            span:props.span,
            offset:props.offset            
        };
    }
    
    renderColumn(parent, i) {
        return(
            <Column
              count={i}
              parent={parent}
              key={parent + '-' + i}
              />
        );
    }
    
    componentDidMount() {
        fetch(`http://unscroll.com/events/?start=2017-02-01T00:00:00-05:00&before=2017-03-01T00:00:00-05:00`)
            .then(function(response){
                console.log(response);
            });
        console.log('Init HTTP request for', this.props.span);
    }
    
    componentWillReceiveProps(nextProps) {
        if (this.props.center !== nextProps.center) {
            console.log(this.props.center, nextProps.center);
            if (!qc.check(this.props.span, {mode:'no-cors'})) {
                console.log('I will get the HTTP request for', this.props.span);
                qc.add(this.props.span);
            }
        }
        this.setState({
            center: nextProps.center,
            offset: nextProps.offset
        });
    }
    componentDidUpdate() {
    }


    render() {
        let span = Interval.fromISO(this.props.span);
        let title = this.props.title
        
        let ela = [];
        for (var i=1;i<13;i++) {
            ela.push(this.renderColumn(title, i));
        }
        let left = `${((this.state.center * 100) + this.state.offset)}%`;
        return (
            <div className="Panel"
                 id={this.props.center}
                 style={{
                     float:'left',
                     position:'absolute',
                     width:'100%',
                     left:left
                 }}>
              <h1><a href="">{title}</a></h1>
              {ela}       
            </div>
        );
    }
}


class Column extends React.Component {
    render() {
        return (
            <div className="column"
                 style={{float:'left',
                         height:'90%',
                         width:100/12 + '%'
                 }}
                 >
              <a href={'whatever-' + (this.props.count)}>{this.props.count}</a></div>
        );
    }
}

class Editor extends React.Component {
    render() {
        return (
            <div style={{display:this.props.status? 'block' : 'none'}}
                 className="Editor">
              Editor
            </div>
        );
    }
}

export default App;
