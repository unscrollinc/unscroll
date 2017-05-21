"use strict";

(function($, Cookies, MediumEditor) {
    
    const API = 'http://127.0.0.1:8000';
    const AUTH = API + '/rest-auth';
    const GRIDHEIGHT = 6;
    const ACTIVEHEIGHT = 0.95;          

    var d = function (className) {
        if (className) {
            return $('<div></div>', {class:className});
        }
        else {
            return $('<div></div>');
        }
    };
    
    var s = function (className) {
        if (className) {
            return $('<span></span>', {class:className});
        }
        else {
            return $('<span></span>');
        }
    };
    
    var a = function (href, className) {
        if (className) {
            return $('<a></a>', {class:className,
                                 target:'_new',
                                 href:href});
        }
        else {
            return $('<a></a>',
                     {href:href,
                      target:'_new'});
        }
    }    
    
    /*
      ________________________________________
      ╻ ╻┏━┓┏━╸┏━┓
      ┃ ┃┗━┓┣╸ ┣┳┛
      ┗━┛┗━┛┗━╸╹┗╸
    */
    
    var User = function() {
        /* The User class:

           - Should be a SINGLETON, but isn't.

           - RELIES on the Cookie class and JQuery.

           - MANAGES data about user status and scrolls that were
             created by the user. In general, this class tracks the
             user through the application.

           - CREATES new users on the server.

           - READS user objects from the server.

           - UPDATES the user's profile on the server.

           - UPDATES the "login" section of the DOM.

           - DELETES nothing. There's no concept of deleting a user
             yet.

        */
        
        var _user = this;

        this.data = {};
        this.timeline = undefined;
        
        this.initialize = function() {
            var _session = Cookies.getJSON('session');
            if (_session) {
                $.extend(_user.data, _session);
            }
            this.initializeDOM();
        };
        
        this.initializeDOM = function() {
            if (_user.data.key) {
	        //$('#notebook').toggle();                
            }
            
            $('#account-login').on('click', function(){
                $('#login-box').toggle();
            });
            
            $('#login-submit').on('click', function(e) {
                e.preventDefault();
                _user.login({'username':$('#login-handle').val(),
                             'password':$('#login-password').val()});
            });

	    $('#user-logout')
                .text('Logout')
                .on('click',
		    function(e) {
                        _user.logout();
                    });
        };

        this.login = function(data) {
            var d = $.extend({}, _user.data);
            delete d.scrolls;
	    Cookies.set('session', d);
	
	    /* These show up when we browse the browseable API, and they
	       get us in trouble. For now, we blow them away and just go
	       with a single session auth token. */
	    
	    $.post({
		url:AUTH + '/login/',
		data:data,
		failure:function(e) {
		    console.log('Failure: ' + e);
		},
                
		error: function(e) {
		    if (e.status === 400) {
			console.log('[ERROR] ' + e.responseJSON.non_field_errors[0]);
		    }
		    else {
			console.log('[ERROR] ' + 'Uncaught error condition: ', e);
		    }
		},
                
		success:function(o) {
                    $.extend(_user.data, o);
                    console.log('USER', _user);
                    _user.getProfile();
                    Cookies.set('session', _user.data);
                }
            });
        };

        this.loginDOM = function() {
    	    $('#account-login').text('You are: ' + _user.data.username);
            $('#notebook').toggle();
            $('#login-box').toggle();
            $('#account-create').toggle();
            $('#user-logout').toggle();            
        }
        
        this.getProfile = function() {
            $.get({
		url:API + '/users/',
		headers: {
                    'Authorization': 'Token ' + _user.data.key
		},
		failure:function(e) {
                    console.log('Failure: ' + e);
		},
		success:function(o) {
                    $.extend(_user.data, o.results[0]);
                    _user.loginDOM();
//		    GLOBAL.updateUserScrolls();		 
		}
            });            
        };
        
        this.logoutDOM = function() {
            $('#account-login')
                .text('Login');
            $('#account-create').toggle();
            $('#user-logout').toggle();
        };
        
        this.logout = function() {
            $.post({
		url:AUTH + '/logout/',
		headers: {
                    'Authorization': 'Token ' + _user.data.key
		},
		failure:function(e) {
                    console.log('Failure: ' + e);
		},
		success:function(e) {
                    _user.data = {};
	            Cookies.remove('sessionid');
	            Cookies.remove('session');
	            Cookies.remove('csrftoken');
                    console.log('Logged out.');
                    _user.logoutDOM();
		}
            });
        };
        
        this.initialize();
    }

    /* 
       ________________________________________
      ╺┳╸╻┏┳┓┏━╸┏━╸┏━┓┏━┓┏┳┓┏━╸
       ┃ ┃┃┃┃┣╸ ┣╸ ┣┳┛┣━┫┃┃┃┣╸
       ╹ ╹╹ ╹┗━╸╹  ╹┗╸╹ ╹╹ ╹┗━╸
    */
    
    var TimeFrame = function() {
        this.resolutions = {
            'seconds':0,
            'minutes':1,
            'hours':2,
            'days':3,
            'months':4,
            'years':5,
            'decades':6,
            'centuries':7
        }
        
	this.add = undefined;
	this.columnStepper = undefined;
	this.columnAdd = undefined;
	this.getColumns = undefined;
	this.getPeriod = undefined;
	this.getOffset = undefined;
	this.getEventWidth = undefined;
	this.getTarget = undefined;
    }

    var MinutesTimeFrame = function() {
        TimeFrame.call(this);
	this.add = function(datetime, no) {
	    return datetime.clone().add(no, 'minutes');
	};
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start).add(1 * i, 'minutes');
	    var spanEnd = moment(start).add(1 * i, 'minutes');
	    var _r = {
		start:spanStart,
		end:spanEnd,
		text:spanStart.format('h:mma')
	    };
	    return _r;
	};
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no, 'minutes');
	};    
	this.getColumns = function(count, start, end) {
	    return 10;
	};
	this.getPeriod = function(start) {
	    return makePeriod(start.format('MMM D, YYYY h:mm:ss')
			      + ' - '
			      + moment(start).add(9, 'minutes').add('59', 'seconds').format('h:mm:ssa'),
			      start.clone().startOf('hour'),
			      start.clone().endOf('hour'));
	};
	this.getOffset = function(datetime, resolution) {
            if (resolutions[resolution] >= resolutions['minutes']) {
                return Math.floor(10 * Math.random());
            }
	    else {
                return datetime.minutes() - 10;
            }
	};
	this.getEventWidth = function(columns, len) {
	    return Math.floor(2 + Math.random() * columns/5);
	};
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var pointerFocus = start.clone().add(pointerInteger, 'minutes');
	    var columns = 10;
	    var target = pointerFocus.clone().add(
		Math.floor( pointerMantissa * columns ),
		'hours');
	    return {
		columns:columns,
		target:target
	    };
	}
    };
    var HoursTimeFrame = function() {
        TimeFrame.call(this);    
	this.add = function(datetime, no) {
	    return datetime.clone().add(no, 'hours');
	};
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start).startOf('hour').add(10 * i, 'minutes');
	    var spanEnd = moment(spanStart).add(10 * i, 'minutes');
	    var _r = {
		start:spanStart,
		end:spanEnd,
		text:spanStart.format('h:mma')
	    };
	    return _r;
	};
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no, 'minutes');
	};	    
	this.getColumns = function(count, start, end) {
	    return 6;
	};
	this.getPeriod = function(start) {
	    return makePeriod(start.format('MMMM D, YYYY h:mm')
			      + ' - '
			      + moment(start).add(59, 'minutes').format('h:mma'),
			      start.clone().startOf('day'),
			      start.clone().endOf('day'));
	};
	this.getOffset = function(datetime, resolution) {
            if (resolutions[resolution] >= resolutions['hours']) {
                return Math.floor(10 * Math.random());
            }
	    else {
                return datetime.minutes() - 10;
            }
	};
	this.getEventWidth = function(columns, len) {
	    return Math.floor(2 + Math.random() * columns/5);
	};
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var pointerFocus = start.clone().add(pointerInteger, 'minutes');
	    var columns = 6;
	    var target = pointerFocus.clone().add(
		Math.floor( pointerMantissa * columns ),
		'hours');
	    return {
		columns:columns,
		target:target
	    };
	}
    };
    
    var DaysTimeFrame = function() {
        TimeFrame.call(this);
	this.add = function(datetime, no) {
	    return datetime.clone().add(no, 'days');		
	};
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start.startOf('day')).add(i,'hours');
	    var spanEnd = moment(spanStart).endOf('hour');
	    return {
		start:spanStart,
		end:spanEnd,
		text:spanEnd.format('ha')
	    };
	};
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no, 'hours');		
	};	    
	this.getColumns = function(count, start, end) {
	    return 24;
	};
	this.getPeriod = function(start) {
	    return makePeriod(start.format('MMMM D, YYYY'),
			      start.clone().startOf('month'),
			      start.clone().endOf('month'));
	};
	this.getOffset = function(datetime, resolution) {
            if (resolutions[resolution] >= resolutions['days']) {
                return Math.floor(24 * Math.random());
            }
	    else {
                return datetime.hours() - 1;
            }
	};
	this.getEventWidth = function(columns, len) {
	    return Math.floor(4 + Math.random() * columns/5);
	};
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
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
    };

    var MonthsTimeFrame = function() {
        TimeFrame.call(this);
        var _frame = this;
        
	this.add = function(datetime, no) {
	    return datetime.clone().add(no, 'months');		
	};
        
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start.startOf('month')).add(i,'days');
	    var spanEnd = moment(spanStart).endOf('day');
	    return {
		start:spanStart,
		end:spanEnd,
		text:spanEnd.format('D')
	    };
	};
        
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no, 'days');		
	};
	
	this.getColumns = function(start) {
	    return start.daysInMonth();
	};
        
	this.getPeriod = function(start) {
	    return makePeriod(start.format('MMMM YYYY'),
			      start.clone().startOf('year'),
			      start.clone().endOf('year'));
	};
        
	this.getOffset = function(datetime, resolution) {
            if (_frame.resolutions[resolution] >= _frame.resolutions['months']) {
                return Math.floor(28 * Math.random());
            }
	    else {
		return datetime.date() - 1;
	    }
	};
        
	this.getEventWidth = function(columns, len) {
	    return Math.floor(3 + Math.random() * 3);
	};
        
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
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
    };
    MonthsTimeFrame.prototype = new TimeFrame();    

    
    var YearsTimeFrame = function() {
        TimeFrame.call(this);
        var _frame = this;
	this.add = function(datetime, no) {
	    return datetime.clone().add(no, 'years');		
	};
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no, 'months');		
	};	    	    
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start.startOf('month')).add(i,'months');
	    var spanEnd = moment(spanStart).endOf('month');
	    return {start:spanStart,
		    end:spanEnd,
		    text:spanEnd.format('MMM')};
	};
	this.getColumns = function(count) {
	    return 12;
	};
	this.getPeriod = function(start) {
	    var year = start.year()/10;
	    var from = moment((10 * Math.floor(year))+'-01-01');
	    var to = moment(from).add(10, 'years')
	    return makePeriod(start.year(),
			      from,
			      to);
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.month();
	};
	this.getEventWidth = function(width, len) {
	    return 2;
	};	    
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var pointerFocus = start.clone().add(pointerInteger, 'years');
	    var columns = 12;
	    var target = pointerFocus.clone().add(Math.floor( pointerMantissa * columns ), 'months');
	    return {
		columns:columns,
		target:target
	    };
	}	   	    
    };
    YearsTimeFrame.prototype = new TimeFrame();        
    
    var DecadesTimeFrame = function() {
        TimeFrame.call(this);
        
	this.add = function(datetime, no) {
	    return datetime.clone().add(no * 10, 'years');
	};
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no, 'years');		
	};	    	    	    
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start).startOf('year').add(i,'years');
	    var spanEnd = moment(spanStart).endOf('year');
	    return {
		start:spanStart,
		end:spanEnd,
		text:spanStart.format('Y')
	    };		
	};
	this.getColumns = function(count) {
	    return 10;
	};
	this.getPeriod = function(start) {
	    var year = start.year()/100;
	    return makePeriod(start.year() + '-' + moment(start).add(9,'years').year(),
			      moment((100 * Math.floor(year))+'-01-01'),
			      moment((100 * Math.ceil(year))+'-01-01'));
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.year() - 10 * Math.floor(datetime.year()/10);
	};
	this.getEventWidth = function(width, len) {
	    return Math.floor(Math.random() * width/10);
	};	    	    
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var pointerFocus = start.clone().add(10 * pointerInteger, 'years');
	    var columns = 10;
	    var target = pointerFocus.clone().add(10 * Math.floor( pointerMantissa * columns ), 'years');
	    return {
		columns:columns,
		target:target
	    };
	}	   	    	    
    };
    
    var CenturiesTimeFrame = function() {
        TimeFrame.call(this);
	this.add = function(datetime, no) {
	    return datetime.clone().add(no * 100, 'years');
	};
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no * 10, 'years');		
	};
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start.startOf('year')).add(10 * i,'years');
	    var spanEnd = moment(spanStart).endOf('decade');
	    return {
		start:spanStart,
		end:spanEnd,
		text:spanEnd.format('Y') + '-' + spanEnd.add(9, 'years').format('Y')
	    };		
	};
	this.getColumns = function(count) {
	    return 10;
	};
	this.getPeriod = function(start) {
	    var year = start.year()/1000;
	    var from = moment((1000 * Math.floor(year))+'-01-01');
	    var to = moment(from).add(1000, 'years');
	    return makePeriod(start.year() + '-' + (start.year() + 99),
			      from,
			      to);
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.year() - 100 * Math.floor(datetime.year()/100);
	};
	this.getEventWidth = function(width, len) {
	    return Math.floor(Math.random() * width/10);
	};
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var pointerFocus = start.clone().add(100 * pointerInteger, 'years');
	    var columns = 10;
	    var target = pointerFocus.clone().add(100 * Math.floor( pointerMantissa * columns ), 'years');
	    return {
		columns:columns,
		target:target
	    };
	}	 	    	    	    
    };
    
    var MillenniaTimeFrame = function() {
        TimeFrame.call(this);
	this.add = function(datetime, no) {
	    return datetime.clone().add(no * 1000, 'years');
	};
	this.columnAdd = function(datetime, no) {
	    return datetime.clone().add(no * 100, 'years');		
	};
	this.columnStepper = function(i, start) {
	    var spanStart = moment(start.startOf('year')).add(100 * i,'years');
	    var spanEnd = moment(spanStart).endOf('decade');
	    return {
		start:spanStart,
		end:spanEnd,
		text:spanEnd.format('Y') + '-' + spanEnd.add(99, 'years').format('Y')
	    };		
	};
	this.getColumns = function(count) {
	    return 10;
	};
	this.getPeriod = function(start) {
	    var year = start.year()/10000;
	    var from = moment((10000 * Math.floor(year))+'-01-01');
	    var to = moment(from).add(10000, 'years');
	    return makePeriod(start.year() + '-' + (start.year() + 999),
			      from,
			      to);
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.year() - 1000 * Math.floor(datetime.year()/1000);
	};
	this.getEventWidth = function(width, len) {
	    return Math.floor(Math.random() * width/100);
	};
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var pointerFocus = start.clone().add(1000 * pointerInteger, 'years');
	    var columns = 100;
	    var target = pointerFocus.clone().add(1000 * Math.floor( pointerMantissa * columns ), 'years');
	    return {
		columns:columns,
		target:target
	    };
	}	 	    	    	    
    }	
    
    
    
    /*
      ________________________________________
      ┏━┓┏━┓┏┓╻┏━╸╻
      ┣━┛┣━┫┃┗┫┣╸ ┃
      ╹  ╹ ╹╹ ╹┗━╸┗━╸
      
      A timeline is made up of panels.
    */

    var Panel = function(offset, el, timeline) {
        var _panel = this;

        this.start = timeline.timeframe.add(timeline.start, offset);
        this.end = timeline.timeframe.add(timeline.end, offset);
        this.el = el;
        this.offset = offset;
        this.timeline = timeline;
        this.response = {};
        this.grid = undefined;
        this.list = false;
        this.columns = undefined;
        this.buffer = $('#buffer');
        this.cellWidth = undefined;
        this.cellHeight = undefined;
        this.columnWidth = undefined;
        
        this.initialize = function() {
            // kick off server calls
            _panel.load();
            _panel.columns = _panel.timeline.timeframe.getColumns(_panel.start);
            _panel.columnWidth = _panel.timeline.window.width/_panel.columns;            
	    _panel.cellWidth = _panel.timeline.window.width/_panel.columns;
	    _panel.cellHeight = _panel.timeline.window.height/(GRIDHEIGHT * ACTIVEHEIGHT);
            _panel.grid = _panel.makeGrid();            
            _panel.initializeDOM();
        }

        this.makeColumnsHTML = function() {
            var columns = new Array();
            for (var i=0;i<_panel.columns;i++) {
                var first = i==0 ? ' first' : '';
	        var columnData = _panel.timeline.timeframe.columnStepper(i, _panel.start);
	        var column = d('column nav'  + first)
	            .css({width:_panel.columnWidth,
		          left:_panel.columnWidth * i})
	            .append(
		        $('<a></a>', {class:'head',
			              href:'/?begin='
			              + columnData.start.format()
			              + '&end='
			              + columnData.end.format()
			             })
		            .html(columnData.text)
		            .on('click', function(e) {
			        e.preventDefault();
			        _panel.timeline = new Timeline(columnData.start, columnData.end, _panel.timeline.user);
		            }));
                columns.push(column);
            }
            return columns;
        }
        
        this.initializeDOM = function() {
            _panel.el.css({marginLeft:(100 * (_panel.offset + 1)) + '%'});
            var h = _panel.makeColumnsHTML();
            _panel.el.append(h);
        }
        
        this.makeUrl = function() {
            var url = API
                + '/events/?start='
                + _panel.start.format()
                + '&before='
                + _panel.end.format();
            if (_panel.timeline.scroll_uuid) {
                url = url
                    + '&scroll='
                    + _panel.timeline.scroll_uuid;
            }
            return url;
        }
        
        this.makeGrid = function() {
	    // Expects an integer, which is hard to check for.
	    var grid = new Array(GRIDHEIGHT);
	    for (var i = 0; i < GRIDHEIGHT; i++) {
	        var row = [];
	        for (var j = 0; j < _panel.columns; j++) {
		    row.push(false);
	        }
	        grid[i] = row;
	    }
	    return grid;
        }

        this.makeReservation = function(x, y, w, h) {
	    // A grid is an array of arrays. The goal is to put as many
	    // rectangles on the screen as possible while still honoring
	    // chronology. The way we do that is we look for empty blocks
	    // of space that are wide enough, and tall enough, for HTML
	    // blocks.  This is a purposefully sloppy application of
	    // JavaScript scoping; since `grid` is an array it's
	    // pass-by-reference which means that we mutate it if we find
	    // a match.

	    var success = undefined;
	    var ymax = _panel.grid.length;
	    var xmax = _panel.grid[0].length;

            // measure once
	    for (var _y = y; _y < y + h; _y++) {
	        for (var _x = x; _x < x + w; _x++) {
		    if (_y < ymax
		        && _x < xmax) {
		        if (_panel.grid[_y][_x]) {
			    return _panel.makeReservation(x, y + 1, w, h);
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
		        _panel.grid[_y][_x] = true;
		    }
	        }
	    }
            
	    return {success:success,
		    x:x,
		    y:y,
		    w:w,
		    h:h};
        }

        this.render = function() {
            if (_panel.list) {
                var list = new Array();
                $.each(_panel.response.results, function(i, e) {
                    var eHTML = d().html(e.title);
                    list.push(eHTML);
                });
                _panel.el.append(list);           
            }
            else {
                var es = $.map(_panel.response.results, function(event) {
                    return new Event(event);
                });

	        $.each(es, function(i, e) {
                    var el = e.el;
                    e.width = _panel.timeline.timeframe.getEventWidth();
                    e.offset = _panel.timeline.timeframe.getOffset(e.datetime, e.data.resolution);
	            _panel.buffer.append(el);
	            el.css({width:e.width * _panel.columnWidth});
	            e.height = Math.ceil(el.height()/_panel.cellHeight);
	            var reservation = _panel.makeReservation(e.offset, 0, e.width, e.height);
	            if (reservation.success) {
		        _panel.el.append(e.el.css({
		            marginLeft:(reservation.x * _panel.cellWidth) + 'px',
		            marginTop:(reservation.y * _panel.cellHeight) + 'px'}));
	            }
                    else {
                        console.log("reservation failed");
                    }
	        });
                
                _panel.el.append(es);
            }
        }
        
        this.load = function() {
            var url = _panel.makeUrl();
            $.ajax({
                url:url,
                failure:function(e) {
                    console.log('Failure: ' + e);
                },
                success:function(response) {
                    $.extend(_panel.response, response);
                    _panel.render();
                }                
            });        
        }

        this.initialize();
        console.log(this);
    }

/* 
________________________________________
┏━╸╻ ╻┏━╸┏┓╻╺┳╸
┣╸ ┃┏┛┣╸ ┃┗┫ ┃
┗━╸┗┛ ┗━╸╹ ╹ ╹
*/
    var Event = function(data) {
        var _event = this;
        this.data = data;
        this.el = $('<div></div>', {class:'event'});
        this.datetime = moment(data.datetime);
        this.needsUpdated = false;
        this.needsCreated = false;
        this.needsDeleted = false;
        this.offset = undefined;
        this.height = undefined;
        this.width = undefined;
        
        this.initialize = function() {
            if (data) {
                this.render();
            }
        }

        this.render = function() {
            var _d = _event.data;
            _event.el.append(
                d('inner').append(
                    a(_event.data.content_url, 'title').html(_d.title + '&mdash;'),
                    s('scroll').html(_d.scroll_title),
                    s('datetime').html(_event.datetime.format('M')),
                    a('', 'button').html('+[Note]'),
                    a('', 'button').html('+[Edit]')
                ));
        };

        this.editor = function() {
        };

        this.initialize();

    }
    
    /*
________________________________________
╺┳╸╻┏┳┓┏━╸╻  ╻┏┓╻┏━╸
 ┃ ┃┃┃┃┣╸ ┃  ┃┃┗┫┣╸
 ╹ ╹╹ ╹┗━╸┗━╸╹╹ ╹┗━╸
    */
    
    var Timeline = function(start, end, user) {
        
        var _timeline = this;

        const minute = 60 * 1000;
        const hour = minute * 60;
        const day = hour * 24;
        const week = day * 7;
        const month = day * 31;
        const year = day * 365;
        const decade = year * 10;
        const century = year * 100;
        const millennium = year * 1000;

        /* 
           `start`: an instance of Moment

           `end`: an instance of Moment

           `user`: an instance of the User object
        */

        this.start = start;
        this.end = end;
	this.user = user;
        this.el = $('#timeline');        
        
        this.timeframe = undefined;
	this.panels = undefined;
        this.window = undefined;
        
        this.gridHeight = 6;
        this.activeHeight = 0.95;
        
        this.pos = {
            lastOffset:0,
            offset:0
        };
        
        this.initialize = function(start, end) {
            _timeline.start = start;
            _timeline.end = end;
            _timeline.getTimeFrame();
            _timeline.panels = new Array();
            _timeline.initializeDOM();          
        };
        
	this.initializeDOM = function() {
            _timeline.window = {
	        width:$(window).width(),
	        height:$(window).height()
            };

            // You always want to drop these into the right part of
            // the DOM in the right order. If you tie the creation of
            // elements into loading from the server it'll get out of
            // order and you'll get sad.
            for (var i = -1; i<2; i++) {
                var el = d('panel');
                $('#timeline').append(el);
                _timeline.panels.push(i);
                _timeline.makePanel(i, el);
            }
            
            var touching = false;
            var _tl = _timeline.el;
	    var _pos = _timeline.pos;
            
	    _tl.on('mousedown touchstart', function(e) {
                if ($(e.target).prop("tagName") !== 'SPAN') {
	            _timeline.pos.touching = true;
                    $('div').addClass('noselect');
                }
	    });
	    
	    _tl.on('mouseup touchend', function(e) {
	        _timeline.pos.touching = false;
                $('div').removeClass('noselect');
	    });
            
	    _tl.on('touchend', function(e) {
	        _timeline.pos.lastDragX = null;
                _timeline.pos.lastOffset = _timeline.pos.offset;	    
	        timeline.css({cursor:'initial'});
	    });            
            
	    _tl.on('mousemove touchmove', function(e){
                if (e.touches !== undefined) {
	            _timeline.pos.pageX = e.touches[0].pageX ;
	            _timeline.pos.pageY = e.touches[0].pageY ;
                }
                else {
	            _timeline.pos.pageX = e.pageX;
	            _timeline.pos.pageY = e.pageY;
                }
                
	        if (_timeline.pos.touching)  {
		    // get percentage of drag
		    if (_timeline.pos.lastDragX !== null) {
		        _timeline.pos.dragX = 100 * (_timeline.pos.pageX - _timeline.pos.lastDragX)/_timeline.window.width;				    
		    }
		    else {
		        _timeline.pos.dragX = 0;
		    }
		    
		    _timeline.pos.offset = _timeline.pos.lastOffset + _timeline.pos.dragX;
		    _timeline.pos.lastDragX = _timeline.pos.pageX;
		    _timeline.pos.lastOffset = _timeline.pos.offset;
                    var val = {marginLeft:(_timeline.pos.offset - 100) + '%', cursor:'move'};
		    _tl.css(val);
                    
	        }
	        else {
		    _timeline.pos.lastDragX =_timeline.pos.pageX;
		    _timeline.pos.lastOffset =_timeline.pos.offset;
		    _timeline.pos.touching = false;                    
                    _tl.css({cursor:'initial'});		
	        }
	        
	        _timeline.pos.timelineOffset = (0 - _timeline.pos.offset)/100;
	        _timeline.pos.mouseOffset = _timeline.pos.timelineOffset + _timeline.pos.pageX/_timeline.window.width;
	        _timeline.pos.pointerInteger = Math.floor(_timeline.pos.mouseOffset);
	        var tmpMantissa = _timeline.pos.mouseOffset % 1;
	        _timeline.pos.pointerMantissa = tmpMantissa < 0 ? 1 + tmpMantissa : tmpMantissa ;
	        _timeline.pos.x =_timeline.pos.pageX/_timeline.window.width * 100;
                _timeline.pos.y =_timeline.pos.pageY/_timeline.window.height * 100;
                
	        var gt = _timeline.timeframe.getTarget(_timeline.start,_timeline.pos.pointerInteger,_timeline.pos.pointerMantissa);
	        _timeline.pos = $.extend({}, _timeline.pos, gt);
                	      
	        // Are we heading left, into the past?
	        if (_timeline.panels[0] > _timeline.pos.timelineOffset) {
	            _timeline.panels.pop();

                    var prev = _timeline.panels[0] - 1;
		    _timeline.panels.unshift(prev);
                    _timeline.el.children().last().remove();

                    var el = d('panel');
                    _timeline.el.prepend(el);
                    _timeline.makePanel(prev, el);
                }

	        // Are we heading right, into the future?
	        else if (_timeline.panels[2] < _timeline.pos.timelineOffset) {
		    _timeline.panels.shift();

                    var next = _timeline.panels[1] + 1;
		    _timeline.panels.push(next);
                    _timeline.el.children().first().remove();
                    
                    var el = d('panel');
                    _timeline.el.append(el);
                    _timeline.makePanel(next, el); 
                }});
                        
        };
        
        this.makePanel = function(offset, el) {
            var panel = new Panel(offset, el, _timeline)
        }

        this.getTimeFrame = function() {
	    // Expects two instances of Moment, sets a "timeframe object"

            var span = _timeline.end - _timeline.start;
            
	    if (span >= millennium * 0.75) {
	        this.timeframe = new MillenniaTimeFrame();
	    }		
	    else if (span >= century * 0.75) {
	        this.timeframe = new CenturiesTimeFrame();
	    }	
	    else if (span >= decade * 0.75) {
	        this.timeframe = new DecadesTimeFrame();
	    }
	    else if (span >= year * 0.75) {
	        this.timeframe = new YearsTimeFrame();
	    }
	    else if (span >= month * 0.75) {
	        this.timeframe = new MonthsTimeFrame();
	    }
	    else if (span >= week * 0.75) {
	        this.timeframe = new WeeksTimeFrame();                
	    }
	    else if (span >= day * 0.75) {
	        this.timeframe = new DaysTimeFrame();                                
	    }
	    else if (span >= hour * 0.75) {
	        this.timeframe = new HoursTimeFrame();
	    }
	    else if (span >= minute * 0.75) {
	        this.timeframe = new MinutesTimeFrame();
	    }
            else {
                this.timeframe = undefined;
            }
	    return null;
        };

        
	this.initialize(start, end);

    }
    
    $(document).ready(function() {
        // Who am I?
        var user = new User();
        // What should the timeline show?
	var start = moment('2001-04-01T00:00:00');
	var end = start.clone().add(1, 'years');
        var timeline = new Timeline(start, end, user);

        /* 
	$('#notebook-create-button')
	    .on('click', function(ev) {
		var data = {
		    title:'untitled',
		    user:GLOBAL.user.url
		};
		Endpoints.scrollPost(data);
	    });
	
	$('#notebook-list-button').on('click', function(ev) {
	    $('#notebook-listing').toggle();
	});
	

        
        GLOBAL.timeline = new Timeline(start, end);
        GLOBAL.start = start;
        GLOBAL.end = end;
        
	document.body.addEventListener('touchmove', function(event) {
	    event.preventDefault();
	}, false);



        

        
        $('#notebook-toggle').on('click', function() {
            if (GLOBAL.user.username) {
                $('#notebook').toggle();
            }
        });
	
        $(document).keyup(function(e) {
            if (GLOBAL.user.username) {            
                if (e.keyCode === 27) $('#notebook').toggle();
            }
        });       
*/ 
    });
    
    var GLOBAL = {
        timeline:undefined,
        notebook:undefined,
	scroll:undefined,
        scroll_uuid:undefined,
        pos:undefined,
        start:undefined,
        end:undefined
    };

    GLOBAL.updateUserScrolls = function() {
	var makeScrollListing = function(scroll) {
	    return $('<tr></tr>',
		     {class:'scroll-listing'})
		.on('click', function (ev) {
		    GLOBAL.scroll_uuid = scroll.uuid;
		    GLOBAL.notebook = new Notebook(scroll.uuid);
		    GLOBAL.notebook.load();
                    new Timeline(GLOBAL.start, GLOBAL.end);
		    
		})
		.append(
		    $('<td></td>').html(scroll.title),
		    $('<td></td>').html(scroll.public ? 'Public' : 'Private'),
		    $('<td></td>').html(moment(scroll.created).format('M/D/YYYY h:mma')));
	}
	$('#notebook-listing')
	    .css({})
	    .append(
		$('<table></table>', {class:'scroll-listing'})
		    .append($.map(GLOBAL.user.scrolls, makeScrollListing)));	
    }

    
       
    function makePeriod(text, start, end) {
	return $('<a></a>', {class:'period nav',
			     href:'/?begin='
			     + start.format()
			     + '&end='
			     + end.format()
			    })
	    .html(text)
	    .click(function(e) {
		e.preventDefault();		
                GLOBAL.timeline = new Timeline(start, end);
	    });
    }
    
    
    
    var OLDEvent = function(data, frame, columns) {
        var event = this;
	this.frame = frame;
	this.columns = columns;
	$.extend(event, data);

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
	    'text/wikipedia':function(event) {}
        }
        
        players['audio/mp3'] = players['audio/mpeg'];
        players['text/html'] = players['text/html']
	
	this.meta = undefined;
        this.cacheMeta = function() {
            var _dt = moment(event.datetime);

            function getLink() {
                if (players[event.mediatype]) {
                    return $('<a></a>', {class:'play'})
	                .html('&#9654;')
	                .on('click', function(e) {
		            players[event.mediatype](event);
	                });
                }
                else {
                    return $('<a></a>', {class:'link',
                                         href:event.content_url}).html('LINK ');
                }
            }
            
	    function getThumbnail() {
	        if (event.thumbnail) {
		    return $('<div></div>', {'class':'thumb'})
		        .append($('<img></img>',
			          {'class':'thumb',
			           'width':event.thumb_width,
			           'height':event.thumb_height,
			           'src':event.thumb_image,
			           'title':'Thumbnail image'
			          }));
	        }
	    }
            
	    function getScrollThumbnail() {
	        if (event.scroll_thumb_image) {
		    return $('<div></div>', {'class':'thumb'})
		        .append($('<img></img>',
			          {'class':'thumb',
			           'src':event.scroll_thumb_image,
			           'title':''
			          }));
	        }
	    }
	    function getEditLink() {
		if (event.user == GLOBAL.user.url) {
		    return $('<span></span>',
			     {class:'asnote button'})
			.html('[+Edit]').on('click', function(e) {
			    console.log(event);
			    event.editor();
			});
		}
	    }
	    event.meta = {
	        div: $('<div></div>', {class:'event'}).append(
		    $('<div></div>', {class:'inner'}).append(
		        getLink(event),
			getEditLink(event),
		        getThumbnail(event),
                        $('<span></span>', {class:'asnote button'})
                            .html('[+Note]').on('click', (function(e) {
                                event.eventToNotebook(event, event.frame);
                            })),
		        $('<span></span>', {class:'datetime'})
			    .html(_dt.format('D MMM, \'YY')),
                        
		        $('<div></div>', {class:'title'})
			    .html(event.title),
		        
		        $('<div></div>', {class:'text'})
			    .html(),		    
                        
		        $('<div></div>', {class:'scroll-title'})
	    		    .html(event.scroll_title)
                            .on('click', function(e) {
                                $('#search-input').val('scroll:\"'+event.scroll+'"');
                                GLOBAL.scroll_uuid = event.scroll_uuid;
                                new Timeline(GLOBAL.start, GLOBAL.end);
                            })
			    .append(getScrollThumbnail(event))
		    ))
		    .mousemove(function(event) {
		        // Don't move if over event (cut and paste, click, etc);
		    }),
	        width:event.frame.getEventWidth(event.columns, event.title.length),
	        offset:event.frame.getOffset(_dt, event.resolution)
	    };
        }	
	this.cacheMeta();

	
	this.editor = function() {
	    var makeInput = function(name, title, is_rich) {
		var vals = {class:'event-input',
			    name:name,
			    value:event[name]};
		var editor =  $('<input></input>', vals);
		var medium = undefined;
		if (is_rich) {
		    editor = $('<div></div>', vals)
			.addClass('rte')
			.append(event[name]);
		    medium = new MediumEditor(editor, {
			disableDoubleReturn: false,
			targetBlank: true                
		    });
		}
		return $('<p>')
		    .append(
			$('<div></div>', {class:'description'})
			    .append(title),
			$('<div></div>', {class:'input'})
			    .append(editor));
	    }
	    var newEvent = $('<div></div>',
			     {class:'editable-event'})
		.append(
		    $('<div></div>').append(
			$('<div></div>', {class:'scroll-title'}).html('Scroll: ' + event.scroll_title),
			makeInput('title', 'Event title'),
			makeInput('datetime', 'Date/time'),
			makeInput('content_url', 'Link'),
			makeInput('text', 'Event description', true),
			makeInput('source_date', 'Source Name (optional)'),
			makeInput('source_url', 'Source Link (optional)'),
			$('<input></input>', {class:'submit',
					      type:'submit',
					      value:'save',
					      name:'save'})
			    .on('click', function (ev) {
				console.log(event);
			    })));
	    $('#notebook').show();
	    $('#notebook-event').show();
	    $('#notebook-event').append(newEvent);
	    return newEvent;
	}

	
	this.getData = function() {
	    return {
		title:event.title,
		datetime:event.datetime,
		source_name:event.source_name,
		source_url:event.source_url
	    }
	}
        
        this.eventToNotebook = function(event, frame) {
            GLOBAL.notebook.makeItem('default', event);
        }


    }
    
    var makeUrl = function(env, panel_no, scroll) {
        var url = API
            + '/events/?start='
            + env.frame.add(env.start, panel_no).format()
            + '&before='
            + env.frame.add(env.end, panel_no).format();
        if (GLOBAL.scroll_uuid) {
            url = url + '&scroll=' + GLOBAL.scroll_uuid;
        }
        return url;
    }
    
    var loadPanel = function(env, panel_no, f) {
        var url = makeUrl(env, panel_no);
        $.ajax({
            url:url,
            context:env,
            failure:function(e) {
                console.log('Failure: ' + e);
            },
            success:function(events) {
                var panel_div = new Panel(panel_no,
					  this.frame.add(this.start, panel_no),
					  this.frame.add(this.end, panel_no),
					  this,
					  events);
                f(panel_no, panel_div);
            }                
        });        
    }

//    var makePanel = function(count, start, end, env, events) {	
    var XPanel = function(count, start, end, env, events) {

	var panel = this;
	this.buffer = $('#buffer');
	this.dur = end - start;
	// Make a panel, 1 screen wide, that will contain a duration.
	this.panelHTML = $('<div></div>',
		       {'id':count,
			'class':'panel'})
	    .css({marginLeft:p(100 * (count + 1))});
	
	this.divs = [];
	this.timeFrame = getTimeFrame(start, end);
	this.frame = Timeframes[this.timeFrame];
	
	this.columns = this.frame.getColumns(count, start, end);
	this.cellWidth = env.window.width/this.columns;
	this.cellHeight = env.window.height/gridHeight * activeHeight;
	// Add the time period
	this.period = this.frame.getPeriod(start);
	
	this.divs.push(this.period);
        
	// Add the columns
	this.columnWidth = env.window.width/this.columns;
	this.el = $(env.timeline.children()[1]);
	for (var i = 0; i<this.columns; i++) {
	    var columnData = this.frame.columnStepper(i, start);
	    this.divs.push(makeColumn(i, this.columnWidth, columnData));
	}
	// Add the events
	this.clientEvents = $.map(events.results, function(e) {return new Event(e, panel.frame, panel.columns);});
	

	this.panelHTML.append(this.divs);
	return this.panelHTML;
    }
    
    
    const REFRESH_INTERVAL = 5000; // milliseconds
    const timeBeforeRefresh = 10; // milliseconds
    
    function timeSince(STATUS) {
	var lastPatch = STATUS.lastPatch;
	var lastRefresh = STATUS.lastRefresh;
        var d = new Date().getTime();
        var deltaRefresh = d - lastRefresh;
        var deltaPatch = d - lastPatch;    
        var shouldRefresh = deltaRefresh > timeBeforeRefresh;
        var shouldPatch = deltaPatch > timeBeforePatch;
        return {now:d,
                shouldRefresh:shouldRefresh,
                shouldPatch:shouldPatch};
    }
    
    /* ############################## */
    var NotebookListItem = function() {
        this.load = function() {};
        this.render = function() {};
    }
    
    /* ############################## */
    var NotebookList = function() {
        this.dom_nblist = $('#notebook-list');
        this.notebooks = new Array();
	
        this.load = function() {};
        this.render = function() {};
        this.remove = function() {};

        this.needsUpdated = false;
        this.needsCreated = false;
        this.needsDeleted = false;
    };
    
    /* 
       ________________________________________
       ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏
       ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓
       ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹
    */
    var Notebook = function(uuid) {
        /* 
           A Scroll is a bag of events and notes.

           A Notebook is a note-centric view of a scroll.

           Notes have an arbitrary order. Rather than try to keep them
           all in sequence we just use floats and when a note needs a
           new number, we look at the note above and the note below,
           divide, and that's the number of the note.

           We start at two billion and count down in intervals of 100.

           This is all pretty speculative and will take some fixing.

           This is a tiny function that counts down. 
         */
        const max = 2000000000;
        const dec = 100;
        var ctr = max;
        this.decmin = function() {
            ctr = ctr - dec;
            return ctr;
        }
        
	var makeInsertionTemplate = function() {
	    return {
                moving:false,
                  from:undefined,
                to:undefined
            };
	}

        var nb = this;

        this.uuid = uuid;
	this.scroll = undefined;
        
        this.needsCreated = this.uuid ? false : true;
        this.needsUpdated = false;
        this.needsDeleted = false;

        this.dom_title = $('#notebook-title')
        this.dom_nb = $('#notebook-items');
        this.dom_nb_listing = $('#notebook-listing');            
        this.dom_essay = $('#notebook-essay');
        this.dom_insert = $('#insert-button')
            .on('click', function(ev) {
                nb.makeItem();
            });
        
        this.dom_spacer = $('#insert-space')
            .on('click', function(ev) {
                nb.makeItem('spacer');
            });
	
        this.dom_spacer = $('#insert-image')
            .on('click', function(ev) {
                nb.makeItem('image');
            });	    
        
        this.dom_nb_list = $('#notebook-list-button');
        
        
        this.load = function() {
	    if (this.uuid) {
		Endpoints.scrollGet(this.uuid, this);
                Endpoints.notesGet(this.uuid, nb);
	    }
	    else {
		console.log('[Error] No uuid is defined');
	    }
	}
        
	this.render = function() {
	    nb.dom_nb_listing.hide();
            nb.dom_title.empty();
            nb.dom_nb.empty();
            nb.dom_essay.empty();
            
	    var title = 'Untitled';
	    if (this.scroll.title) {
		title = this.scroll.title;
	    }
            
	    var editor = $('<div></div>', {class:'notebook-title-editor'})
		.html(title);
	    var medium = new MediumEditor(editor, {
		disableReturn: true,
		targetBlank: true
            });

	    $('#notebook-title').append(editor);
            
            medium.subscribe('editableInput', function (event, editor) {
                nb.needsUpdated = true;
                nb.title = medium.getContent();
	    });
            
	}
        this.scanner = function() {
            if (nb.needsUpdated) {
                var payload = {
                    title:nb.title
                };
                console.log('Will save: ', payload);
                Endpoints.scrollPatch(nb.scroll.url, payload, nb);
            }

        }
        setInterval(this.scanner, REFRESH_INTERVAL);	
        
	/* Get our DOM objects */

	
	this.insertion = makeInsertionTemplate();
	
        this.title = undefined;
        this.items = new Array();
	
	// This is where we reorder items.
	this.reorderItems = function(target) {
	    var replace = new Array();
	    
	    var ordered = this.fixOrder(this.insertion);
	    
	    var to_loc = undefined;
	    var from_loc = undefined;		
	    var target_loc = undefined;
	    
	    for (var i = 0; i<this.items.length; i++) {
		if (this.items[i] == ordered.from) {
		    from_loc = i;
		}
		if (this.items[i] == ordered.to) {
		    to_loc = i;
		}
		if (this.items[i] == target) {
		    target_loc = i;
		}		    		    
	    }
	    // If to is undefined we have a range of one
	    if (!ordered.to) {
		to_loc = from_loc;
	    }
	    
	    for (var i = 0; i<this.items.length; i++) {
		if (i == target_loc) {
		    // Paste them in here
		    if (i==0) {
			for (var j = to_loc; j>=from_loc; j--) {
			    this.items[j].order = this.decmin();
			}
		    }
		    else {
			var oneback = this.items[i-1];
			for (var j = from_loc; j<=to_loc; j++) {
			    var between = this.items[i].order - oneback.order;
			    var div = to_loc - from_loc + 2;
			    this.items[j].order = oneback.order + between/div;
			    
			}
		    }
		    
		    for (var j=from_loc; j<=to_loc; j++) {
			this.items[j].needsUpdated = true;
			$(target.notebookView).before(this.items[j].notebookView);
			$(target.textView).before(this.items[j].textView);
			replace.push(this.items[j]);
		    }
		    replace.push(this.items[i]);
		}
		else if (i >= from_loc && i <= to_loc) {
		    // nothing
		}
		else {
		    replace.push(this.items[i]);
		}
		
	    }
	    this.insertion = makeInsertionTemplate();
	    this.items = replace;
	}
	
	this.getNext = function(item) {
	    for (var i = 0; i<this.items.length; i++) {
		if (this.items[i] == item) {
		    return this.items[i+1];
		}
	    }
	}
	this.getPrev = function(item) {
	    for (var i = 0; i<this.items.length; i++) {
		if (this.items[i] == item) {
		    return this.items[i-1];
		}
	    }
	}
	
	// You can select a range bottom up. If that happens
	// switch "from" and "to".
	this.fixOrder = function(insertion) {
	    var _from = insertion.from;
	    var _to = insertion.to;
	    
	    if (_to) {
		if (_from.order > _to.order) {
		    _from = _to;
		    _to = _from;
		}
	    }
	    
	    return {from:_from, to:_to}
	}
	
	// You can move a range of notes at once.
	this.getRange = function(insertion) {
	    var span = new Array();
	    var ordered = this.fixOrder(insertion);
	    var _from = ordered.from;
	    var _to = ordered.to;
	    var started = false;
	    var finished = false;
	    for (var i = 0; i<this.items.length; i++) {
		if (!finished) {
		    if (this.items[i] == _from) {
			span.push(this.items[i]);
			started = true;
		    }
		    else if (this.items[i] == _to) {
			span.push(this.items[i]);
			finished = true;
		    }
		    else if (started) {
			span.push(this.items[i]);			    
		    }
		}
	    }
	    return span;
	}
	
        this.ajaxPackage = {};
	
	
        this.makeItem = function(kind, event, note) {
            var item = new NotebookItem(kind, event, note);
            this.dom_nb.prepend(item.notebookView);
            this.dom_essay.prepend(item.textView);
	    item.order = this.decmin();
	    
	    item.mover = $('<span></span>',
			   {class:'button mover'})
		.html('MV');
	    
	    item.notebookView.children('.top, .editable').on('click', function(ev){
		if (nb.insertion.moving) {
		    ev.stopImmediatePropagation();
		    ev.preventDefault();
		    
		    nb.insertion.from.buttons.children('.mover').removeClass('active');
		    
		    nb.reorderItems(item);
		    $('.mover').html('MV');
		}
	    });
	    
	    item.notebookView.hover(
		function(ev) {
		    if (nb.insertion.moving == true
			&& item != nb.insertion.from) {
			var el = $(item.notebookView);
			el.children()
			    .css({cursor:'hand'});
		    }
		},
		function(ev) {
		    if (!nb.moving) {
			var el = $(item.notebookView)			
			el.children().css({cursor:'default'});
		    }
		});
	    
	    item.mover.on('click', function(ev) {
		if (nb.insertion.moving) {
		    if (item == nb.insertion.from) {
			item.mover.removeClass('active');
			nb.insertion = makeInsertionTemplate();
		    }
		    else {
			nb.insertion.to = item;
			var range = nb.getRange(nb.insertion);
			for (i in range) {
			    range[i].buttons.children('.mover').addClass('active');
			}
		    }
		}
		else {
		    nb.insertion.moving = true;
		    item.mover.addClass('active');
		    $('.mover').not('.active').each(function(pos, el) {
			$(el).html('SET RANGE');
		    });
		    nb.insertion.from = item;
		}
	    })
	    
	    item.buttons.prepend(item.mover);
	    this.items.unshift(item);
        }


        this.scanner = function () {
	    // If we don't have a scroll URL then we can't make a REST query.
	    if (!nb.scroll) {
		console.log('[Error] No scroll URL, can\'t save anything', nb);
	    }
	    else {
		var makePost = function(nbItem) {
                    var event = undefined;
                    
                    var data = {
			order:nbItem.order,
                        kind:nbItem.kind,
			scroll:nb.scroll.url,
			text:nbItem.medium.getContent()
                    };
                    if (nbItem.event && nbItem.event.url) {
			data['event'] = nbItem.event.url;
                    }
                    if (nbItem.url) {
			data['url'] = nbItem.url;
                    }
                    if (nbItem.id) {
			data['id'] = nbItem.id;
                    }
                    if (nbItem.uuid) {
			data['uuid'] = nbItem.uuid;
                    }
                    return data;
		}
		
		var makeDelete = function(nbItem) {
                    var data = {};
                    if (nbItem.id) {
			data['id'] = nbItem.id;
                    }
                    if (nbItem.url) {
			data['url'] = nbItem.url;
                    }
                    return data;
		}
		
		var updated = new Array();
		var deleted = new Array();
		var created = new Array();
		
		for (var i=0; i<nb.items.length; i++) {
		    if (nb.items[i].needsCreated) {
			created.push(nb.items[i]);
		    }
                    else {
			// Avoid update or delete before create---if
			// it needs created then let that happen first
			// on a subsequent pass.
			
			if (nb.items[i].needsUpdated) {
                            updated.push(nb.items[i]);
			}
			if (nb.items[i].needsDeleted) {
                            deleted.push(nb.items[i]);
			}
		    }
		}
		
		if (created.length > 0) {
                    Endpoints.notePost($.map(created, makePost),
                                       created);
		}
		
		if (updated.length > 0) {
                    Endpoints.notePut($.map(updated, makePost),
                                      updated);
		}
		
		if (deleted.length > 0) {
                    Endpoints.noteDelete($.map(deleted, makeDelete),
					 deleted);
		}
	    }
	}
        setInterval(this.scanner, REFRESH_INTERVAL);
	    
    };
    
    var NotebookItem = function(kind, event, note) {
	var nbitem = this;
        this.event = event;
        this.kind = kind ? kind : 'default';
        this.note = note;
        this.uuid = undefined;
        if (this.note) {
            this.uuid = this.note.url;
        }
        this.id = undefined;
        if (this.note) {
            this.id = this.note.id;
        }            

        this.data = {};
	this.order = undefined;
	
        this.needsCreated = note ? false : true;
        this.needsUpdated = false;
        this.needsDeleted = false;
	
	this.buttons = $('<div></div>', {class:'buttons'});
	this.mover = undefined;
	
        this.render = function() {
	    var d = $('<div></div>', {class:'top'});
            if (this.kind == 'default' && this.event) {
                return d.html(event.title);
            }
            else if (this.kind=='closer') {
		return d.html('&mdash; FIN &mdash;')
            }
	    else if (this.kind=='spacer') {
		this.buttons.append(
		    $('<span></span>', {class:'button'}).html('Space &times; 2')
			.addClass('active')
			.on('click', function() {
			    nbitem.buttons.children('span.button')
                                .removeClass('active');
			    $(this).addClass('active');
			    nbitem.medium.setContent('<br/><br/>');}),
		    $('<span></span>', {class:'button'}).html('&mdash;')
			.on('click', function() {
			    nbitem.buttons.children('span.button')
                                .removeClass('active');
			    $(this).addClass('active');				
			    nbitem.medium.setContent('<hr></hr>');
			}));
		return d;
            }
            else if (this.kind=='image') {
                return d.html('image');
            }		
            else {
                return d.html('Card');
            }
        }
	
        this.eventHTML = this.render();
	
	if (this.kind == 'spacer') {
	    
        }
	
        this.editor = $('<div></div>', {class:'editable'});
        if (this.kind == 'spacer') {
            this.editor.html($('<br/><br/>'));
        }
	else if (note && note.text) {
	    this.editor.html(note.text);
	}
	
        this.medium = new MediumEditor(this.editor, {
            disableReturn: true,
            disableDoubleReturn: false,
            disableExtraSpaces: true,
            targetBlank: true                
        });
	
        this.textView = $('<span></span>',
                          {'class':'view-item'})
            .on('click', function() {
	    });
	
        this.changed = function() {
            this.needsUpdated = true;
        };
	
        this.deleteButton = $('<span></span>',
                              {'class':'button'})
            .html('X')
            .on('click', function(ev) {
                nbitem.needsDeleted = true;
		nbitem.notebookView.remove();
		nbitem.textView.remove();		    
            });	    
	
        this.makeNotebookView = function() {
	    if (this.kind != 'closer') {
                return $('<div></div>',
			 {class:'nb-item ' + kind})
		    .append(this.buttons
			    .append(this.deleteButton))
		    .append(this.eventHTML)
		    .append(this.editor);
	    }
	    else {
                return $('<div></div>',
			 {class:'nb-item ' + kind})
		    .append(this.eventHTML);
	    }
        }
        
        this.notebookView = this.makeNotebookView();
        this.textView.html(this.medium.getContent() + ' ');
	this.medium.subscribe('focus', function (event, editor) {
	    $('span.view-item').removeClass('focused');
	    nbitem.textView.addClass('focused');
	    var scrollTop = $('#notebook-essay').scrollTop()
		+ $(nbitem.textView).position().top
		- 100;
	    $('#notebook-essay').animate({
		scrollTop: scrollTop
	    });
	});
	this.medium.subscribe('editableInput', function (event, editor) {
            nbitem.changed();              
            nbitem.textView.html(nbitem.medium.getContent());
            nbitem.textView.append(' ');
	});
    };   

}(jQuery,
  Cookies,
  MediumEditor));

/*
	window.history.replaceState(
	    {},
	    'Unscroll: From X to Y',
	    '/static/scrolls/index.html?start='
		+ start.format()
		+ '&before='
		+ end.format());
*/
