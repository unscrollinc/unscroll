"use strict";
(function( $, MediumEditor) {
    const api = 'http://127.0.0.1:8000/api/0/';
    const gridHeight = 8;
    const activeHeight = 0.9;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 31;
    const year = day * 365;
    const decade = year * 10;
    const century = year * 100;

    function makeId() {
        return Math.round(new Date().getTime() + (Math.random() * 1000000));
    }

    var getTimeFrame = function(start, end) {
	// Expects two instances of Moment, returns a "timeframe"
	var span = end - start;
	if (span >= decade * 0.75) {
	    return 'decades';
	}
	else if (span >= year * 0.75) {
	    return 'years';
	}
	else if (span >= month * 0.75) {
	    return 'months';
	}
	else if (span >= week * 0.75) {
	    return 'weeks';
	}
	else if (span >= day * 0.75) {
	    return 'days';
	}
	else if (span >= hour * 0.75) {
	    return 'hours'; }
	else if (span >= minute * 0.75) {
	    return 'minutes';
	}
	return null;
    }
    
    var timeFrames = {
	days: {
	    add: function(datetime, no) {
		return datetime.clone().add(no, 'days');		
	    },
	    columnStepper: function(i, start) {
		var spanStart = moment(start.startOf('day')).add(i,'hours');
		var spanEnd = moment(spanStart).endOf('hour');
		return {
		    start:spanStart,
		    end:spanEnd,
		    text:spanEnd.format('H')
		};
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'hours');		
	    },	    
	    getColumns: function(count, start, end) {
		return 24;
	    },
	    getPeriod: function(start) {
		return makePeriod(start.format('MMMM DD, YYYY'),
				  start.clone().startOf('month'),
				  start.clone().endOf('month'));
	    },
	    getOffset: function(datetime) {
		return datetime.hours() - 1;
	    },
	    getEventWidth: function(columns, len) {
		return Math.floor(2 + Math.random() * columns/5);
	    },
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(pointerInteger, 'months');
		var columns = pointerFocus.daysInMonth();
		var target = pointerFocus.clone().add(
		    Math.floor( pointerMantissa * columns ),
		    'days');
		return {
		    columns:columns,
		    target:target
		};
	    }	   
	},
	months: {
	    add: function(datetime, no) {
		return datetime.clone().add(no, 'months');		
	    },
	    columnStepper: function(i, start) {
		var spanStart = moment(start.startOf('month')).add(i,'days');
		var spanEnd = moment(spanStart).endOf('day');
		return {
		    start:spanStart,
		    end:spanEnd,
		    text:spanEnd.format('D')
		};
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'days');		
	    },	    
	    getColumns: function(count, start, end) {
		return start.daysInMonth();
	    },
	    getPeriod: function(start) {
		return makePeriod(start.format('MMMM YYYY'),
				  start.clone().startOf('year'),
				  start.clone().endOf('year'));
	    },
	    getOffset: function(datetime) {
		return datetime.date() - 1;
	    },
	    getEventWidth: function(columns, len) {
		return Math.floor(2 + Math.random() * columns/5);
	    },
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(pointerInteger, 'months');
		var columns = pointerFocus.daysInMonth();
		var target = pointerFocus.clone().add(
		    Math.floor( pointerMantissa * columns ),
		    'days');
		return {
		    columns:columns,
		    target:target
		};
	    }	   
	},
	years: {
	    add: function(datetime, no) {
		return datetime.clone().add(no, 'years');		
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'months');		
	    },	    	    
	    columnStepper: function(i, start) {
		var spanStart = moment(start.startOf('month')).add(i,'months');
		var spanEnd = moment(spanStart).endOf('month');
		return {start:spanStart,
			end:spanEnd,
			text:spanEnd.format('MMM')};
	    },
	    getColumns: function(count) {
		return 12;
	    },
	    getPeriod: function(start) {
		var year = start.year()/10;
		return makePeriod(start.year(),
				  moment((10 * Math.floor(year))+'-01-01'),
				  moment((10 * Math.ceil(year))+'-01-01'));
	    },
	    getOffset: function(datetime) {
		return datetime.month();
	    },
	    getEventWidth: function(width, len) {
		return 1 + Math.floor(Math.random() * width/2);
	    },	    
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(pointerInteger, 'years');
		var columns = 12;
		var target = pointerFocus.clone().add(Math.floor( pointerMantissa * columns ), 'months');
		return {
		    columns:columns,
		    target:target
		};
	    }	   	    
	},
	decades: {
	    add: function(datetime, no) {
		return datetime.clone().add(no * 10, 'years');
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'years');		
	    },	    	    	    
	    columnStepper: function(i, start) {
		return moment(start).add(i,'years').format('YYYY');
	    },
	    getColumns: function(count) {
		return 10;
	    },
	    getPeriod: function(start) {
		var year = start.year()/100;
		var periodStart = moment((10 * Math.floor(start.year()/10))+'-01-01');
		var periodEnd = moment(9 + (10 * Math.floor(start.year()/10))+'-01-01');
		return makePeriod(periodStart.year() + '-' + periodEnd.year(),
				  moment((100 * Math.floor(year))+'-01-01'),
				  moment((100 * Math.ceil(year))+'-01-01'));
	    },
	    getOffset: function(datetime) {
		return datetime.year() - 10 * Math.floor(datetime.year()/10);
	    },
	    getEventWidth: function(width, len) {
		return Math.floor(Math.random() * width/10);
	    },	    	    
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(10 * pointerInteger, 'years');
		var columns = 10;
		var target = pointerFocus.clone().add(10 * Math.floor( pointerMantissa * columns ), 'years');
		return {
		    columns:columns,
		    target:target
		};
	    }	   	    	    
	},
	centuries: {
	    add: function(datetime, no) {
		return datetime.clone().add(no * 100, 'years');
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no * 10, 'years');		
	    },	    	    	    	    
	    columnStepper: function(i, start) {
		return moment(start).add(i*10,'years').format('YYYY');
	    },
	    getColumns: function(count) {
		return 10;
	    },
	    getPeriod: function(start) {
		var year = start.year()/1000;
		return makePeriod(start.year() + '-' + (start.year() + 100),
				  moment((1000 * Math.floor(year))+'-01-01'),
				  moment((1000 * Math.ceil(year))+'-01-01'));
	    },
	    getOffset: function(datetime) {
		return datetime.year() - 100 * Math.floor(dt.year()/100);
	    },
	    getEventWidth: function(width, len) {
		return Math.floor(Math.random() * width/10);
	    }
	},	
	years: {
	    add: function(datetime, no) {
		return datetime.clone().add(no, 'years');		
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'months');		
	    },	    	    
	    columnStepper: function(i, start) {
		var spanStart = moment(start.startOf('month')).add(i,'months');
		var spanEnd = moment(spanStart).endOf('month');
		return {start:spanStart,
			end:spanEnd,
			text:spanEnd.format('MMM')};
	    },
	    getColumns: function(count) {
		return 12;
	    },
	    getPeriod: function(start) {
		var year = start.year()/10;
		return makePeriod(start.year(),
				  moment((10 * Math.floor(year))+'-01-01'),
				  moment((10 * Math.ceil(year))+'-01-01'));
	    },
	    getOffset: function(datetime) {
		return datetime.month();
	    },
	    getEventWidth: function(width, len) {
		return 1 + Math.floor(Math.random() * width/2);
	    },	    
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(pointerInteger, 'years');
		var columns = 12;
		var target = pointerFocus.clone().add(Math.floor( pointerMantissa * columns ), 'months');
		return {
		    columns:columns,
		    target:target
		};
	    }	   	    
	},
	decades: {
	    add: function(datetime, no) {
		return datetime.clone().add(no * 10, 'years');
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'years');		
	    },	    	    	    
	    columnStepper: function(i, start) {
		return moment(start).add(i,'years').format('YYYY');
	    },
	    getColumns: function(count) {
		return 10;
	    },
	    getPeriod: function(start) {
		var year = start.year()/100;
		var periodStart = moment((10 * Math.floor(start.year()/10))+'-01-01');
		var periodEnd = moment(9 + (10 * Math.floor(start.year()/10))+'-01-01');
		return makePeriod(periodStart.year() + '-' + periodEnd.year(),
				  moment((100 * Math.floor(year))+'-01-01'),
				  moment((100 * Math.ceil(year))+'-01-01'));
	    },
	    getOffset: function(datetime) {
		return datetime.year() - 10 * Math.floor(datetime.year()/10);
	    },
	    getEventWidth: function(width, len) {
		return Math.floor(Math.random() * width/10);
	    },	    	    
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(10 * pointerInteger, 'years');
		var columns = 10;
		var target = pointerFocus.clone().add(10 * Math.floor( pointerMantissa * columns ), 'years');
		return {
		    columns:columns,
		    target:target
		};
	    }	   	    	    
	},
	centuries: {
	    add: function(datetime, no) {
		return datetime.clone().add(no * 100, 'years');
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no * 10, 'years');		
	    },	    	    	    	    
	    columnStepper: function(i, start) {
		return moment(start).add(i*10,'years').format('YYYY');
	    },
	    getColumns: function(count) {
		return 10;
	    },
	    getPeriod: function(start) {
		var year = start.year()/1000;
		return makePeriod(start.year() + '-' + (start.year() + 100),
				  moment((1000 * Math.floor(year))+'-01-01'),
				  moment((1000 * Math.ceil(year))+'-01-01'));
	    },
	    getOffset: function(datetime) {
		return datetime.year() - 100 * Math.floor(dt.year()/100);
	    },
	    getEventWidth: function(width, len) {
		return Math.floor(Math.random() * width/10);
	    }
	}
    }

    function sortByKey(array, key) {
	// From http://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value	
	return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
    }
    
    function makeGrid(xWidth) {
	// Expects an integer, which is hard to check for, alas.
	var grid = new Array(gridHeight);
	for (var i = 0; i < gridHeight; i++) {
	    var row = [];
	    for (var j = 0; j < xWidth; j++) {
		row.push(false);
	    }
	    grid[i] = row;
	}
	return grid;
    }
    
    function cacheEvents(start, end) {
/*	var filtered = events.filter(function(event) {
	    var m = moment(event.datetime);
	    return m >= start
		&& m <= end;
	});
	var sorted = sortByKey(filtered, 'datetime');
	var dated = sorted.map(function(e) {
	    e.datetime=moment(e.datetime);
	    return e;})
	return dated;
*/
    }
    
    function p(text) {
	return text + '%';
    }
    
    function statusBar(o) {
	var s = '';
	for (var key in o) {
	    if (typeof(o[key])==='number')
		s += key + ': ' + Math.round(100 * o[key])/100 + ' ';
	    else if (typeof(o[key])==='string') {
		s += key + ': ' + o[key].substring(0,10) + ' ';	    
	    }
	    else if (typeof(o[key])==='object' && o[key].constructor.name === 'Moment') {
		s += key + ': ' + o[key].format() + ' ';
	    }
	    else {
		s += key + ': [No string method for ' + o[key].constructor.name + ']';
	    }
	}
	return s;
    }
    
    function makeColumn(i, columnWidth, columnData) {
	return $('<div></div>', {class:'column'})
	    .css({width:columnWidth,
		  left:columnWidth * i})
	    .append(
		$('<div></div>', {class:'head'})
		    .html(columnData.text)
		    .on('click', function(e) {
                        console.log('clicked Column');
			makeTimeline(columnData.start, columnData.end);
		    })
	    );
    }
    
    function makePeriod(text, start, end) {
	return $('<div></div>', {class:'period'})
	    .html(text)
	    .click(function(event) {
                console.log('clicked Period');                
		makeTimeline(start, end);
	    });
    }
    
    function gridToText(grid) {
	var text = '';
	for (var i = 0; i<grid.length; i++) {
	    var line = '';
	    for (var j = 0; j<grid[i].length; j++) {
		if (grid[i][j]===true) {
		    text += '#|';
		}
		else {
		    text += '_|';
		}
	    }
	    text +='\n';
	}
	return text;
    }
    
    function makeReservation(grid, x, y, w, h) {
	// A grid is an array of arrays. The goal is to put as many
	// rectangles on the screen as possible while still honoring
	// chronology. The way we do that is we look for empty blocks
	// of space that are wide enough, and tall enough, for HTML
	// blocks.  This is a purposefully sloppy application of
	// JavaScript scoping; since `grid` is an array it's
	// pass-by-reference which means that we mutate it if we find
	// a match. We don't even
	var success = null;
	var ymax = grid.length;
	var xmax = grid[0].length;
	// measure once
	for (var _y = y; _y < y + h; _y++) {
	    for (var _x = x; _x < x + w; _x++) {
		if (_y < ymax
		    && _x < xmax) {
		    if (grid[_y][_x]) {
			return makeReservation(grid, x, y + 1, w, h);
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
	    for (var _y = y; _y < y + h; _y++) {
		for (var _x = x; _x < x + w; _x++) {
		    grid[_y][_x] = true;
		}
	    }
	}
	return {success:success,
		x:x,
		y:y,
		w:w,
		h:h
	       };
    }

    // application, audio, example, image, message, model, multipart, text, video
    var players = {
	'audio/mpeg':function(event) {
	    var player = $('<audio></audio>',
			   {src:event.content_url,
			    controls:'controls',
			    preload:'none',
			    autoplay:'autoplay',
			    class:'audioplayer'});
	    $('div#player').empty().append(player);
	},
	'video/youtube':function(event) {},
	'video/vimeo':function(event) {},
	'audio/soundcloud':function(event) {},
	'text/wikipedia':function(event) {},		
	'text/html':function(event) {},	
    }

    players['audio/mp3'] = players['audio/mpeg'];

    function eventToNotebook(event, frame) {
        var text = $('<div></div>',
                     {class:'notebook-span'}).html('Text');
        var editor = new MediumEditor(text);
        console.log(editor);
        return {'event':$('<div></div>', {class:'notebook-event'})
                .html(event.title)
                .append(text, editor)
                .on('click', function(e) {
                }),
                'text':text,
                'editor':editor
               };
    }

    function eventToMeta(event, frame, columns) {
        var _dt = moment(event.datetime);
	return {
	    div: $('<div></div>', {class:'event noselect'}).append(
		$('<div></div>', {class:'inner'}).append(
                    
                    $('<a></a>', {class:'play'})
	                .html('&#9654;')
	                .on('click', function(e) {
		            players[event.mediatype](event);
	                }),
                    
                    $('<span></span>', {class:'asnote'})
                        .html('+').on('click', (function(e) {
                            // $.ajax()
                            var notebookEntry = eventToNotebook(event, frame);
                            $('#notebook-events').prepend(notebookEntry.event);
                            $('#notebook-text').prepend('[]');
                            
                        })),
                    
		    $('<span></span>', {class:'datetime'})
			.html(_dt.format('D MMM, \'YY')),
                    
		    $('<span></span>', {class:'text'})
			.html(event.title + ' ')))
		.mousemove(function(event) {
		    // Don't move if over event (cut and paste, click, etc);
		}),
	    width:frame.getEventWidth(columns, event.title.length),
	    offset:frame.getOffset(_dt)
	};
    }

    function makeUrl(env, panel_no) {
        var url = api
            + 'events/?start='
            + env.frame.add(env.start, panel_no).format()
            + '&before='
            + env.frame.add(env.end, panel_no).format();
        return url;
    }
    
    function loadPanel(env, panel_no, f) {
        var url = makeUrl(env, panel_no);
        $.ajax({
            url:url,
            context:env,
            failure:function(e) {
                console.log('Failure: ' + e);
            },
            success:function(events) {
                var panel = makePanel(panel_no,
                                      this.frame.add(this.start, panel_no),
                                      this.frame.add(this.end, panel_no),
                                      this,
                                      events);
                f(panel);
            }                
        });        
    }
    
    function makePanel(count, start, end, env, events) {
	var buffer = $('#buffer');    
	var dur = end - start;
	// Make a panel, 1 screen wide, that will contain a duration.
	var panel = $('<div></div>', {'id':count,
				      'class':'panel'})
	    .css({marginLeft:p(100 * (count + 1))});

	var divs = [];
	var timeFrame = getTimeFrame(start, end);

	var frame = timeFrames[timeFrame];
	var columns = frame.getColumns(count, start, end);
	var grid = makeGrid(columns);
	var cellWidth = env.window.width/columns;
	var cellHeight = env.window.height/gridHeight * activeHeight;
	
	// Add the time period
	var period = frame.getPeriod(start);
	divs.push(period);
        
	// Add the columns
	var columnWidth = env.window.width/columns;
	var el = $(env.timeline.children()[1]);
	for (var i = 0; i<columns; i++) {
	    var columnData = frame.columnStepper(i, start);
	    divs.push(makeColumn(i, columnWidth, columnData));
	}
	// Add the events
	var eventMetas = [];
	for (var i in events.results) {
	    eventMetas.push(eventToMeta(events.results[i], frame, columns));
	}
	for (var i in eventMetas) {
	    var e = eventMetas[i];
	    e.div.css({width:e.width * columnWidth});
	    buffer.append(e.div);
	    e.height = Math.ceil(e.div.height()/cellHeight);
	    
	    var reservation = makeReservation(grid,
					      e.offset, 0,
					      e.width, e.height);
	    if (reservation.success) {
		panel.append(e.div.css({
		    marginLeft:(reservation.x * cellWidth) + 'px',
		    marginTop:(reservation.y * cellHeight) + 'px'
		}));
	    }
	}
	panel.append(divs);
	return panel;
    }

    function makeTimeline(start, end) {
	console.log('Making timeline for',
		    start.format(),
		    ' to ',
		    end.format());
	// Reboot the timeline
	var timeline = $('#timeline');

        //remove children
	timeline.children().remove();

        //unregister handlers
        timeline.off();
        
	// A highly mutable array. This is where we are in the number
	// line of time.

	var panels = [-1, 0, 1];

	var timeframe = getTimeFrame(start, end)
	var frame = timeFrames[timeframe];	
	var env = {
	    window: {
		width:$(window).width(),
		height:$(window).height()
	    },
            start:start,
            end:end,
	    timeline:timeline,
	    timeframe:timeframe,
	    frame:frame
	};
	
	// Let's get this kicked off.
	var els = [];
	for (var i in panels) {
            loadPanel(env, panels[i], function(x) {$('#timeline').append(x)});
        }
	
	// Whatever

	var testing = {
	    pageX:0,
	    pageY:0,
	    dragX:0,
	    lastDragX:0,
	    dragDist:0,
	    offset:0,
	    lastOffset:0,
	    mouseTime:0
	}
	
	var pageX = 0;
	var pageY = 0;
	var dragX = 0;
	var lastDragX = 0;
	var dragDist = 0;
	var offset = 0;
	var lastOffset = 0;
	var mouseTime = 0;
	
	var pos = {}
	
	$('#mousepos').html(statusBar(pos));
	
	// Watch the mouse and when the button is pressed move left to
	// right.

	var touching = false;
	
	timeline.on('mousedown touchstart', function(e) {
	    touching = true;
	});
	
	timeline.on('mouseup touchend', function(e) {
	    touching = false;
	});
	timeline.on('touchend', function(e) {
	    lastDragX = null;
	    lastOffset = offset;	    
	    timeline.css({cursor:'initial'});
	});
	timeline.on('mousemove touchmove', function(e){
	    pageX = e.pageX ? e.pageX : e.touches[0].pageX ;
	    pageY = e.pageY ? e.pageY : e.touches[0].pageY ;

	    if (touching)  {
		// get percentage of drag
		//		dragX = 100 * (pageX - lastDragX)/env.window.width;
		if (lastDragX!==null) {
		    dragX = 100 * (pageX - lastDragX)/env.window.width;				    
		}
		else {
		    dragX = 0;
		}

		offset = lastOffset + dragX;
		timeline
		    .css({marginLeft:p(offset - 100),
			  cursor:'move'});
		lastDragX = pageX;
		lastOffset = offset;		
	    }
	    else {
		lastDragX = pageX;
		lastOffset = offset;
		touching = false;
		timeline.css({cursor:'initial'});		
	    }
	    
	    var timelineOffset = (0 - offset)/100;

	    var mouseOffset = timelineOffset + pageX/env.window.width;
	    var pointerInteger = Math.floor(mouseOffset);
	    var tmpMantissa = mouseOffset % 1;
	    var pointerMantissa = tmpMantissa < 0 ? 1 + tmpMantissa : tmpMantissa ;

	    // time
	    pos = {
		x:pageX/env.window.width * 100,
		y:pageY/env.window.height * 100,
		drag:dragX,
		timelineOffset:timelineOffset,
		offset:offset
	    };
	    var gt = env.frame.getTarget(start, pointerInteger, pointerMantissa);
	    pos = $.extend({}, pos, gt);
	    
	    // reset the delta
	    // dragX = 0;	
	    
	    // update status bar 
	    $('#mousepos').html(statusBar(pos));

	    // Are we heading left, into the past?
	    if (panels[0] > pos.timelineOffset) {
		timeline.children().last().remove();	    	    
		panels.pop();
		var prev = panels[0] - 1;
		panels.unshift(prev);
                loadPanel(env, prev, function(x) {$('#timeline').prepend(x);});
	    }
	    
	    // Are we heading right, into the future?
	    else if (panels[2] < pos.timelineOffset) {
		timeline.children().first().remove();
		panels.shift();
		var next = panels[1] + 1;
		panels.push(next);
                loadPanel(env, next, function(x) {$('#timeline').append(x);});
	    }
	});
    }

    $(document).ready(function() {
	document.body.addEventListener('touchmove', function(event) {
	    event.preventDefault();
	}, false); 

	var start = moment('1941-01-01T00:00:00');
	var end = start.clone().add(1, 'month');
        makeTimeline(start, end);
    });
    
}(jQuery, MediumEditor));
