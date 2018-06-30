import React from 'react';
import Column from './Column';
import Event from './PanelEvent';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import axios from 'axios';
import cachios from 'cachios';
import { frames } from './TimeFrames';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

class Panel extends React.Component {

    // THERE IS A BIG GLOBAL VARIABLE IN HERE CALLED GRID.

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

    bufferEl(event, dt, month) {

        // This is an ironic function.
        //
        // React uses a virtual DOM and so it can't see the real size
        // of things.
        //
        // This makes a real version and drops it into an offscreen
        // buffer to get its real sizing.
        //
        // Then we re-make it virtually.
        let d = document.createElement('div');
        d.className='event';
        d.innerHTML = `<button>Note</button><button>Edit</button>
                       <h3>${month}/${event.title}</h3>
                       <p>${event.text}</p>
                       `;
        
        d.style.width = (2 * this.state.cell.width) + '%';
        this.buffer.append(d);
        var b = window.innerHeight;
        var r = d.getBoundingClientRect();
        var h = Math.ceil(((r.height/b) * 100) / this.state.cell.height, 10);
        var w = 2;
        this.buffer.removeChild(d);
        return {
            width:w,
            height:h
        };
    }

    // Figure out how to do this with https://www.npmjs.com/package/html-react-parser    
    makeEls(data) {
        const shuffle = (a) => {
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };
        
        let els = [];
        const jels = data.results;
        for (var i=0;i<jels.length;i++) {
	    let event = jels[i];
	    let dt = DateTime.fromISO(event.when_happened);
            let left = this.state.frame.elOffset(dt);
            

            let buffered = this.bufferEl(event, dt, left);

            let res = this.doReservation(
                left,
                0,
                buffered.width,
                buffered.height
            );

            if (res.success) {
                let el = (
                    <Event
                      key={event.uuid}
		      
                      width={res.w * this.state.cell.width + '%'}
                      height={res.h * this.state.cell.height + '%'}

                      left={(res.x) * this.state.cell.width + '%'}
                      top={10 + (0.9 * (res.y * this.state.cell.height)) + '%'}

                      dt={dt}
		      event={event}
		      title={event.title}
		      text={event.text}/>);
		
                els.push(el);
            }
        }
        return els;
    }

    getSpan() {
        let _this = this;
        _this.grid = this.makeGrid();
        
	cachios.get('http://127.0.0.1:8000/events/?limit=50&'+this.toSpan(this.state.interval))
	    .then(resp => {
                const els = _this.makeEls(resp.data);
                _this.setState(prevState => ({
		    events: els
                }));
	    }).catch(err => {
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
        const { span, _interval, title } = this.props.frame.getColumnLink(interval, ct);
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
                {this.state.events}
            </div>
        );
    }
}
export default Panel;
