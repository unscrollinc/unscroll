import React from 'react';
import Column from './Column';
import Event from './PanelEvent';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import axios from 'axios';
import cachios from 'cachios';
// import { frames } from './TimeFrames';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

/*

THERE IS A BIG BAD GLOBAL VARIABLE IN HERE CALLED GRID.
            _     _
  __ _ _ __(_) __| |
 / _` | '__| |/ _` |
| (_| | |  | | (_| |
 \__, |_|  |_|\__,_|
 |___/


I wanted you to know about that.

*/


class Panel extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.buffer = document.getElementById('buffer');
        this.grid = this.makeGrid();
	this.state = this.initialize(props);
    }
    
    initialize(props) {
        const {title, interval} = props.frame.offset(props.span, props.center);
        const breadcrumbTitle = title.map((o, i, a) => {
		const breadSpacer = ((i+1)<a.length) ? ' ▶ ' : '';
		return (
		    <span key={i}>
		      <Link to={`/timelines?${o.timeSpan}`}>
			{o.title}
		      </Link>
		      {breadSpacer}
		    </span>);
	});
        const columns= [...Array(props.width).keys()].map((ct)=>this.makeColumn.bind(this)(ct, interval));
        return {
	    grid:{
                width:props.width,
                height:props.height
	    },
	    frame:props.frame,
	    title:breadcrumbTitle,
	    interval:interval,
	    events:[],
	    cell: {
		width:100/props.width,
		height:100/props.height
	    },
            columns:columns
	};
    }

    toSpan(interval) {
	return `start=${interval.start.toISO()}&before=${interval.end.toISO()}`;
    }
    
    makeGrid() {
        const w = this.props.width;
        const h = this.props.height;
        // Makes an associative array of false values that is
	// `this.state.grid.height` long and each value is an array
	// `this.state.grid.height` wide. I.e. a 2D bitmap.
        
	var grid = new Array(h);
	for (var i = 0; i < h; i++) {
	    var row = [];
	    for (var j = 0; j < w; j++) {
		    row.push(false);
	    }
	    grid[i] = row;
	}
	return grid;
    }

    doReservation(x, y, w, h) {

        // Answers the question: If I've got an object `w` wide and
        // `h` high, can you put it (1) on the x axis at position `x`
        // exactly and (2) position `y` or greater? Lightly recursive.
                
	let success = undefined;
	let xmax = this.state.grid.width;
	let ymax = this.state.grid.height;
        
        // measure once
	for (let _y = y; _y < y + h; _y++) {
	    for (let _x = x; _x < x + w; _x++) {
		if (_y < ymax && _x < xmax) {
		    if (this.grid[_y][_x]) {
			return this.doReservation(x, y + 1, w, h);
		    }
		    else {
			success = true;
		    }
		}
		else {
		    success = false;
		}
	    }
	}
        
	if (success) {
	    for (let _y = y; _y < y + h; _y++) {
		for (let _x = x; _x < x + w; _x++) {
                    this.grid[_y][_x] = true;
		}
	    }
	}
        
	return {
            success:success,
	    x:x,
	    y:y,
	    w:w,
	    h:h
        };
    }

    makeEl(event) {
	const dt = DateTime.fromISO(event.when_happened);
        const left = this.state.frame.elOffset(dt);
        return (<Event
                key={event.uuid}
                width={2 * this.state.cell.width + '%'}
                cell={this.state.cell}
                dt={dt}
                doReservation={this.doReservation.bind(this)}
                left={left}
	        event={event}
	        />);
    }
    makeEls(data) {
        return ;
    }

    getSpan() {
        let _this = this;
        _this.grid = this.makeGrid();
        
	cachios.get('http://127.0.0.1:8000/events/?limit=25&'+this.toSpan(this.state.interval))
	    .then(resp => {
                _this.setState({events: resp.data.results});
            })
            .catch(err => {
	        console.log('Error', err);
	    });
    }
    
    componentDidMount() {
        this.getSpan();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.timeSpan !== this.props.timeSpan) {
	    this.setState(this.initialize(this.props), this.getSpan);
        }
    }
    
    makeColumn(ct, interval) {
	// Avoiding destructuring to keep ESLint happy.
	const columnLink = this.props.frame.getColumnLink(interval, ct);
	const span = columnLink.span;
	const title = columnLink.title;	
        return(
                <Column
                  width={100/this.props.width + '%'} 
	          span={span}
                  title={title}
                  key={ct}/>
        );
    }

    render() {
        const left = (this.props.center * 100) + this.props.offset + '%';

        return (
            <div className="Panel" id={this.props.center} style={{left:left}}>
		<h1>{this.state.title}</h1>
		{this.state.columns}
                {this.state.events.map(this.makeEl.bind(this))}
            </div>);
    }
}
export default Panel;
