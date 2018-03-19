import React from 'react';
import Column from './TimelinePanelColumn.js';
import Event from './TimelinePanelEvent.js';

// import { Interval } from 'luxon';

class Panel extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.buffer = document.getElementById('buffer');        
        
        this.state = {
            center:props.center,
            span:props.span,
            offset:props.offset,
            grid:{
                width:12,
                height:10
            },
            events:[]
        };
        
        this.bitsGrid = this.makeGrid(this.state.grid.height);

        this.state.cell = {
            width:100/this.state.grid.width,
            height:100/this.state.grid.height
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

    makeGrid() {

        // Makes an associative array of false values that is
	// `this.state.grid.height` long and each value is an array
	// `this.state.grid.height` wide. I.e. a 2D bitmap.
        
	var grid = new Array(this.state.grid.height);
	for (var i = 0; i < this.state.grid.height; i++) {
	    var row = [];
	    for (var j = 0; j < this.state.grid.width; j++) {
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
		    if (this.bitsGrid[_y][_x]) {
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
                    this.bitsGrid[_y][_x] = true;
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
    
    bufferEl(props) {

        // This is an ironic function.
        //
        // React uses a virtual DOM and so it can't see the real size
        // of things.
        //
        // This makes a real version and drops it into an invisible
        // buffer to get its real sizing.

        let d = document.createElement('div');
        d.className='event';
        d.innerHTML = `<button>Note</button>
                       <h3>${props.month}/${this.props.title}</h3>
                       <p>${props.numbers}</p>
                       `;
                         
        d.style.width = (props.width * this.state.cell.width) + '%';        
        this.buffer.append(d);
        var b = window.innerHeight;
        var r = d.getBoundingClientRect();
        var h = Math.ceil(((r.height/b) * 90) / this.state.cell.height, 10);

        return {
            width:props.width,
            height:h
        };
    }
    
    getFakeEls(nextProps) {
        let color = "#"+((1<<24)*Math.random()|0).toString(16);
        let els = [];
        for (var i=0;i<15;i++) {

            let month = parseInt(Math.random() * 12, 10);
            
            let numbers =
                [...Array(parseInt(Math.random() * 50, 10))
                 .keys()].map((x)=>{
                     return `${x} `;
                 }).join(" ");
            
            let buffered =
                this.bufferEl(
                    {ranking:i,
                     numbers:numbers,
                     title:nextProps.title,
                     width:3 + parseInt(Math.random() * 3, 10),
                     month:month,
                     color:color}
                );
            
            let res =
                this.doReservation(
                    month,
                    0,
                    buffered.width,
                    buffered.height
                );

            if (res.success) {
                let el = (
                    <Event
                      key={Math.random()}

                      width={res.w * this.state.cell.width + '%'}
                      left={res.x * this.state.cell.width + '%'}

                      height={res.h * this.state.cell.height + '%'}
                      top={10 + res.y * this.state.cell.height + '%'}

                      month={month + 1}
                      color={color}
                      text={`${buffered.height}::${res.h} 
                      // ${numbers}`}
                      title={nextProps.title}/>);
                els.push(el);
            }
        }
        return els;
    }
    
    componentDidMount() {
        this.setState(prevState => ({
            events: this.getFakeEls(this.props)            
        }));        

        /* 
           fetch(`http://unscroll.com/events/?start=2017-02-01T00:00:00-05:00&before=2017-03-01T00:00:00-05:00`)
           .then(function(response){
           console.log(response);
           }); 
        */
    }
    
    componentWillReceiveProps(nextProps) {
        this.bitsGrid = this.makeGrid(this.state.grid.height);        
        if (this.props.center !== nextProps.center) {
            this.setState({
                events: this.getFakeEls(nextProps)
            });
        }
        this.setState({
            center: nextProps.center,
            offset: nextProps.offset
        });
    }

    componentDidUpdate() {

    }

    render() {
        // let span = Interval.fromISO(this.props.span);
        let title = this.props.title;
        let columns = [];
        for (var i=1;i<13;i++) {
            columns.push(this.renderColumn(title, i));
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
              <h1><a href="{title}">{title}</a></h1>
              {columns}
              {this.state.events}
            </div>
        );
    }
}
export default Panel;
