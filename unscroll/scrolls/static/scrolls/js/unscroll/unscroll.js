"use strict";

(function($, Cookies, MediumEditor) {
    
    const API = 'http://127.0.0.1:8000';
    const AUTH = API + '/rest-auth';
    const GRIDHEIGHT = 10;
    const ACTIVEHEIGHT = 0.95;          
    const REFRESH_INTERVAL = 25000; // milliseconds
    const timeBeforeRefresh = 10; // milliseconds

    // A few tiny utility methods for making elements (<div>s,
    // <span>s, <a>s)
    
    const d = function (className) {
        if (className) {
            return $('<div></div>', {class:className});
        }
        else {
            return $('<div></div>');
        }
    };
    
    const s = function (className) {
        if (className) {
            return $('<span></span>', {class:className});
        }
        else {
            return $('<span></span>');
        }
    };

    const tr = function (className) {
        return $('<tr></tr>', {class:className});
    }    
    
    const td = function (className) {
        return $('<td></td>', {class:className});
    }
    
    const a = function (href, className) {
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
        this.currentScroll = undefined;
	this.currentNotebook = undefined;
	
        this.initialize = function() {
            var _session = Cookies.getJSON('session');
            if (_session) {
                $.extend(_user.data, _session);
                
            }
            this.initializeDOM();
        };
        
        this.initializeDOM = function() {
            if (_user.data.key) {
                _user.getProfile();
                _user.loginDOM();
	        $('#notebook').toggle();
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
            $('#account-create').hide();            
            $('#notebook').show();
            $('#login-box').hide();
            $('#user-logout').show();
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
		    var notebookList = new NotebookList(_user);
		}
            });            
        };
        
        this.logoutDOM = function() {
            $('#account-login').text('Login');
            $('#account-create').show();
            $('#user-logout').hide();
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
    
    var TimeFrame = function(timeline) {
        var _timeframe = this;
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
        this.timeline = timeline;
        this.makePeriod = function(text, start, end) {
	    return $('<a></a>', {class:'period nav',
			         href:'/?start='
			         + start.format()
			         + '&before='
			         + end.format()
			        })
	        .html(text)
	        .click(function(e) {
		    e.preventDefault();
                    _timeframe.timeline.initialize(start, end, _timeframe.timeline.user);
	        });
        }
        this.resolution = undefined;
	this.add = undefined;
	this.columnStepper = undefined;
	this.columnAdd = undefined;
	this.getColumns = undefined;
	this.getPeriod = undefined;
	this.getOffset = undefined;
	this.getEventWidth = undefined;
	this.getTarget = undefined;
    }

    var MinutesTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;
        this.timeline = timeline;
        this.resolution = 'seconds';
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
	    return _timeframe.makePeriod(start.format('MMM D, YYYY h:mm:ss')
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
	this.getEventWidth = function(width) {
	    return Math.floor(2 + Math.random() * _timeframe.getColumns()/5);
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
    MinutesTimeFrame.prototype = new TimeFrame();
    
    var HoursTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;
        this.resolution = 'minutes';        

        this.timeline = timeline;

	this.adjust = function(datetime) {
	    var begin = moment(datetime.format('YYYY-MM-DD:HH:00'));
	    return begin;
	}		
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
	    return _timeframe.makePeriod(start.format('MMMM D, YYYY h:mm')
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
	this.getEventWidth = function(width) {
	    return Math.floor(2 + Math.random() * _timeframe.getColumns()/5);
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
    HoursTimeFrame.prototype = new TimeFrame();
    
    var DaysTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;

        this.timeline = timeline;        
        this.resolution = 'hours';
	this.adjust = function(datetime) {
	    var begin = moment(datetime.format('YYYY-MM-DD'));
	    return begin;
	}	
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
	    return _timeframe.makePeriod(start.format('MMMM D, YYYY'),
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
	this.getEventWidth = function(width) {
	    return Math.floor(4 + Math.random() * _timeFrame.getcolumns/5);
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
    DaysTimeFrame.prototype = new TimeFrame();
    
    var MonthsTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;

        this.timeline = timeline;        

        this.resolution = 'days';

	this.adjust = function(datetime) {
	    var begin = moment(datetime.format('YYYY-MM')+'-01');
	    return begin;
	}
	
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
	    return _timeframe.makePeriod(start.format('MMMM YYYY'),
			      start.clone().startOf('year'),
			      start.clone().endOf('year'));
	};
        
	this.getOffset = function(datetime, resolution) {
            if (_timeframe.resolutions[resolution] >= _timeframe.resolutions['months']) {
                return Math.floor(28 * Math.random());
            }
	    else {
		return datetime.date() - 1;
	    }
	};
        
	this.getEventWidth = function(width) {
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

    
    var YearsTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;

        this.timeline = timeline;        
        this.resolution = 'months';
	this.adjust = function(datetime) {
	    var begin = moment(datetime.format('YYYY-01-01'));
	    return begin;
	}	
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
	    return _timeframe.makePeriod(start.year(),
			      from,
			      to);
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.month();
	};
	this.getEventWidth = function(width) {
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
    
    var DecadesTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;

        this.timeline = timeline;
        this.resolution = 'years';
	this.adjust = function(datetime) {
	    var divisor = 10;
	    var year = datetime.year()/divisor;
	    var begin = moment(divisor + (divisor * Math.floor(year))+'-01-01');
	    return begin;
	}
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
	    return _timeframe.makePeriod(start.year() + '-' + moment(start).add(9,'years').year(),
			      moment((100 * Math.floor(year))+'-01-01'),
			      moment((100 * Math.ceil(year))+'-01-01'));
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.year() - 10 * Math.floor(datetime.year()/10);
	};
	this.getEventWidth = function(width) {
	    return Math.ceil(Math.random() * 2);
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
    DecadesTimeFrame.prototype = new TimeFrame();
    
    var CenturiesTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;

        this.timeline = timeline;
        this.resolution = 'decades';
	this.adjust = function(datetime) {
	    var divisor = 100;
	    var year = datetime.year()/divisor;
	    var begin = moment((divisor * Math.floor(year))+'-01-01');
	    return begin;
	}	
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
	    return _timeframe.makePeriod(start.year() + '-' + (start.year() + 99),
			      from,
			      to);
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.year() - 100 * Math.floor(datetime.year()/100);
	};
	this.getEventWidth = function(width) {
	    return Math.ceil(Math.random() * 2);
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
    CenturiesTimeFrame.prototype = new TimeFrame();
    
    var MillenniaTimeFrame = function(timeline) {
        TimeFrame.call(this);
        var _timeframe = this;

        this.timeline = timeline;
        this.resolution = 'centuries';
	this.adjust = function(datetime) {
	    var divisor = 1000;
	    var year = datetime.year()/divisor;
	    var begin = moment((divisor * Math.floor(year))+'-01-01');
	    return begin;
	}	
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
	    return _timeframe.makePeriod(start.year() + '-' + (start.year() + 999),
			      from,
			      to);
	};
	this.getOffset = function(datetime, resolution) {
	    return datetime.year() - 1000 * Math.floor(datetime.year()/1000);
	};
	this.getEventWidth = function(width) {
	    return 1;
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
    MillenniaTimeFrame.prototype = new TimeFrame();    
    
    
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
        this.end = timeline.timeframe.add(moment(this.start), 1);
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
			              href:'/?start='
			              + columnData.start.format()
			              + '&before='
			              + columnData.end.format()
			             })
		            .html(columnData.text)
		            .on('click', function(e) {
			        e.preventDefault();
			        _panel.timeline = new Timeline(columnData.start,
                                                               columnData.end,
                                                               _panel.timeline.user);
		            }));
                columns.push(column);
            }
            return columns;
        }

        this.newEvent = function() {
            var e = new Event({}, _panel);
            e.editor();
        }
        
        this.initializeDOM = function() {
            _panel.el.css({marginLeft:(100 * (_panel.offset + 1)) + '%'});
            var h = _panel.makeColumnsHTML();
            var period = _panel.timeline.timeframe.getPeriod(_panel.start);
            _panel.el.append(period, h);
            _panel.el.on('dblclick', _panel.newEvent);
        }
        this.makeLocation = function () {
	    var url = '/static/scrolls/index.html?start='
		+ _panel.start.format()
		+ '&before='
		+ _panel.end.format();
            if (_panel.timeline.user.currentScroll
		&&
		_panel.timeline.user.currentScroll.uuid) {		
                url = url
                    + '&scroll='
                    + _panel.timeline.user.currentScroll.uuid;
	    }
	    window.history.replaceState(
		{},
		'Unscroll: From X to Y',
		url);
	}
	
	
        this.makeUrl = function() {
            var url = API
                + '/events/?start='
                + _panel.start.format()
                + '&before='
                + _panel.end.format();
            if (_panel.timeline.user.currentScroll
		&&
		_panel.timeline.user.currentScroll.uuid) {		
                url = url
                    + '&scroll='
                    + _panel.timeline.user.currentScroll.uuid;
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
                    return new Event(event, _panel);
                });

	        $.each(es, function(i, e) {
                    var el = e.el;
                    e.width = _panel.timeline.timeframe.getEventWidth(el.width());
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
		    _panel.makeLocation();
                }                
            });        
        }

        this.initialize();
    }

    /* 
       ________________________________________
       ┏━╸╻ ╻┏━╸┏┓╻╺┳╸
       ┣╸ ┃┏┛┣╸ ┃┗┫ ┃
       ┗━╸┗┛ ┗━╸╹ ╹ ╹
    */
    var Event = function(data, panel) {
        var _event = this;
        this.data = data;
        this.panel = panel;
        this.user = panel.timeline.user.data;

        this.patch = {};        
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

	this.formatByResolution = function() {
	    var getRes = function() {
		switch (_event.data.resolution) {
		case 'years':
		    return 'YYYY';
		case 'months':
		    return 'MMM \'YY'
		case 'days':
		    return 'ddd MMM D, YYYY';
		}
	    }
	    return _event.datetime.format(getRes());
	}

        this.render = function() {
            var _d = _event.data;
            var editButton = undefined;
            var deleteButton = undefined;

	    if (_event.user.username == _d.username) {
                editButton = a('', 'button')
                    .html('+[Edit]')
                    .on('click', _event.editor);
                deleteButton = a('', 'button')
                    .html('[X]')
                    .on('click', _event.delete);                
            }
	    var noteButton = a('', 'button').html('+[Note]');
	    noteButton
		.on('click', _event.makeNote)
	    
            
            _event.el.append(
                d('inner').append(
                    d('datetime').html(_event.formatByResolution()),
                    d('title').append(
			a(_event.data.content_url, 'title').html(_d.title)),
                    d('scroll-title').html(_d.scroll_title),
		    noteButton,
                    editButton,
                    deleteButton
                ));
        };

        this.delete = function(ev) {
            ev.preventDefault();
	    $.ajax({
		url:_event.data.url,
		type: 'DELETE',
		headers: {
		    'Authorization': 'Token ' + _event.user.key
		},
		failure:function(e) {
		    console.log('Failure: ' + e);
		},
		success:function(o) {
                    _event.el.remove();
		}
	    });
        }
	this.makeNote = function(ev) {
	    ev.preventDefault();
	    var notebook = panel.timeline.user.currentNotebook;
            notebook.makeItem('default', _event);    
	}
	
        this.makeEditor = function(exists) {
            // This needs a config object and a lot of other stuff.
            var registerChange = function() {
                if (exists) {
                    _event.needsUpdated = true;
                }
                else {
                    _event.needsCreated = true;
                }
            }
            var saveFunction = exists ? _event.doPatch : _event.doPost;
	    var makeInput = function(name, title, is_rich, defaultValue) {
                var value = _event.data[name] ? _event.data[name] : defaultValue;
                if (!exists && defaultValue) {
                    _event.patch[name] = defaultValue;
                }
		var vals = {class:'event-input ' + name,
			    name:name,
			    value:value};
		var editor =  $('<input></input>', vals);
                editor.on('input', function() {
                    _event.patch[name] = editor.val();
                    registerChange();
                })
		var medium = undefined;
		if (is_rich) {
		    editor = $('<div></div>', vals)
			.addClass('rte')
			.append(_event.data[name]);
		    medium = new MediumEditor(editor, {
			disableDoubleReturn: false,
			targetBlank: true                
		    });
	            medium.subscribe('editableInput', function (event, editor) {
                        _event.patch[name] = medium.getContent();
                        registerChange();
	            });                    
		}
                
		return $('<p>')
		    .append(
                        d('description').append(title),
			d('input').append(editor));
            }
	    var newEvent =
		$('<div></div>',
		  {class:'editable-event'}).append(
		      $('<div></div>').append(
                          d('scroll-title').html('Scroll: ' + _event.data.scroll_title),
			  makeInput('title', 'Event title'),
			  makeInput('datetime', 'Date/time', false, _event.panel.timeline.pos.target.format()),
			  makeInput('resolution', 'Resolution', false, _event.panel.timeline.timeframe.resolution),
			  makeInput('content_url', 'Link', false, 'http://'),
			  makeInput('text', 'Event description', true),
			  makeInput('source_date', 'Source Name (optional)'),
			  makeInput('source_url', 'Source Link (optional)'),
			  $('<input></input>', {class:'submit',
					        type:'submit',
					        value:'save',
					        name:'save'})
			      .on('click', saveFunction)));
	    return newEvent;
	}

        this.editor = function(ev) {
            var exists = false;
            if (ev) {
                ev.preventDefault();
                exists = true;
            }
            var el = _event.makeEditor(exists);
            _event.editorDOM(el);
        }

        this.editorDOM = function(el) {
	    $('#notebook').show();
	    $('#notebook-event').show().empty().append(el);
        }

	this.editorPostSaveDOM = function() {
	    $('#notebook-event').empty().hide();
	}
        
	this.getData = function() {
	    return {
		title:event.title,
		datetime:event.datetime,
		source_name:event.source_name,
		source_url:event.source_url
	    }
	}
	
        this.doPost = function() {
            console.log(_event.patch);
            if (_event.needsCreated) {
                $.extend(_event.patch, {scroll:_event.user.currentScroll});
	        $.ajax({
		    url:API + '/events/',
		    type:'POST',
		    data:_event.patch,
		    headers: {
		        'Authorization': 'Token ' + _event.user.key
		    },
		    failure:function(e) {
		        console.log('Failure: ' + e);
		    },
		    success:function(o) {
                        $.extend(_event.data, o);
                        _event.patch = {};
		    }
                });
            }
            else {
                console.log('No changes seen, so I didn\'t save.');
            }
        }

	this.doPatch = function() {
            if (_event.needsUpdated) {
	        $.ajax({
		    url:_event.data.url,
		    type:'PATCH',
		    data:_event.patch,
		    headers: {
		        'Authorization': 'Token ' + _event.user.key
		    },
		    failure:function(e) {
		        console.log('Failure: ' + e);
		    },
		    success:function(o) {
                        $.extend(_event.data, o);
                        _event.patch = {};
			_event.editorPostSaveDOM;
		    }
                });
            }
            else {
                console.log('No changes seen, so I didn\'t save.');
            }
        }
        
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
        this.user.timeline = this;
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
            _timeline.timeframe = _timeline.getTimeFrame(start, end);
	    console.log('good so far');
	    
	    _timeline.start = _timeline.timeframe.adjust(start);
	    _timeline.end = _timeline.timeframe.add(moment(_timeline.start), 1);	    
            _timeline.panels = new Array();
            _timeline.initializeDOM();     
        };
        
	this.initializeDOM = function() {
	    _timeline.window = {
	        width:$(window).width(),
	        height:$(window).height()
            };
            $('#timeline').empty();
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
            var _el = _timeline.el;
	    var _pos = _timeline.pos;
            
	    _el.on('mousedown touchstart', function(e) {
                if ($(e.target).prop("tagName") !== 'SPAN') {
	            _timeline.pos.touching = true;
                    $('div').addClass('noselect');
                }
	    });
	    
	    _el.on('mouseup touchend', function(e) {
	        _timeline.pos.touching = false;
                $('div').removeClass('noselect');
	    });
            
	    _el.on('touchend', function(e) {
	        _timeline.pos.lastDragX = null;
                _timeline.pos.lastOffset = _timeline.pos.offset;	    
	        timeline.css({cursor:'initial'});
	    });            
            
	    _el.on('mousemove touchmove', function(e){
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
		    _el.css(val);
                    
	        }
	        else {
		    _timeline.pos.lastDragX =_timeline.pos.pageX;
		    _timeline.pos.lastOffset =_timeline.pos.offset;
		    _timeline.pos.touching = false;                    
                    _el.css({cursor:'initial'});		
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

        this.getTimeFrame = function(start, end) {
	    // Expects two instances of Moment, sets a "timeframe object"

            var span = end - start;
            
	    if (span >= millennium * 0.75) {
	        return new MillenniaTimeFrame(_timeline);
	    }		
	    else if (span >= century * 0.75) {
	        return new CenturiesTimeFrame(_timeline);
	    }	
	    else if (span >= decade * 0.75) {
	        return new DecadesTimeFrame(_timeline);
	    }
	    else if (span >= year * 0.75) {
	        return new YearsTimeFrame(_timeline);
	    }
	    else if (span >= month * 0.75) {
	        return new MonthsTimeFrame(_timeline);
	    }
	    else if (span >= week * 0.75) {
	        return new WeeksTimeFrame(_timeline);                
	    }
	    else if (span >= day * 0.75) {
	        return new DaysTimeFrame(_timeline);                                
	    }
	    else if (span >= hour * 0.75) {
	        return new HoursTimeFrame(_timeline);
	    }
	    else if (span >= minute * 0.75) {
	        return new MinutesTimeFrame(_timeline);
	    }
            else {
                return undefined;
            }
	    return null;
        };

	this.initialize(this.start, this.end);	
    }

    /*
      ________________________________________
      ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏ ╻  ╻┏━┓╺┳╸╻╺┳╸┏━╸┏┳┓
      ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓┃  ┃┗━┓ ┃ ┃ ┃ ┣╸ ┃┃┃
      ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹┗━╸╹┗━┛ ╹ ╹ ╹ ┗━╸╹ ╹
    */
    
    var NotebookListItem = function(item, user) {
	var _notebooklistitem = this;
	
        // this.load = function() {};
	this.item = item;
	this.user = user;
        this.render = function() {
	    var line =
		tr('notebook-list-item')
		.append(
		    td('notebook-list-date').text(moment(item.created).fromNow()),
		    td('notebook-list-title').html(item.title),
		    td('notebook-list-public').text(item.public ? 'Public' : 'Private'));
	    line.on('click', function(ev) {
		var notebook = new Notebook(item, _notebooklistitem.user);
		_notebooklistitem.user.currentNotebook = notebook;
	    });
	    return line;
	};
    }
    
    /*
      ________________________________________
      ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏ ╻  ╻┏━┓╺┳╸
      ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓┃  ┃┗━┓ ┃
      ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹┗━╸╹┗━┛ ╹      
     */
    var NotebookList = function(user) {

	var _notebooklist = this;
	this.user = user;

        this.initialize = function() {
	    var scrolls = $.map(user.data.full_scrolls,
				function(s) {
				    var v = new NotebookListItem(s, _notebooklist.user);
				    return v.render();
				});
	    _notebooklist.initializeDOM(scrolls);
	};
	
	this.initializeDOM = function(scrolls) {
	    var nbl = $('#notebook-listing');
		nbl.append(
		$('<table></table>').append(scrolls));
	    
	    $('#notebook-list-button')
		.on('click', function (ev) {
		    nbl.toggle();
		});
	    

	}
	
	this.initialize();
    };
    
    /* 
       ________________________________________
       ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏
       ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓
       ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹
    */
    var Notebook = function(scroll, user) {
        /* 
           A Scroll is a bag of events and notes.

           - Some events are children of the given scroll.
           - Some events are children of other scrolls.
           - All notes are children of the given scroll.

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

        var _notebook = this;
	
	this.scroll = scroll;
	this.user = user;
	this.user.currentScroll = scroll;
	this.data = {};
	this.patch = {};
	
	this.itemsEl = undefined;
	this.essayEl = undefined;
	
        this.needsCreated = this.scroll ? false : true;
        this.needsUpdated = false;
        this.needsDeleted = false;

	this.initialize = function() {
	    if (_notebook.needsCreated) {

		var title = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		for( var i=0; i < 6; i++ ) {
		    title += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		var data = {title:'Untitled ' + title, public:true}
		$.ajax({
                    url:API + '/scrolls/',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
		    data:JSON.stringify(data),
                    headers: {
			'Authorization': 'Token ' + _notebook.user.data.key
                    },
                    failure:function(e) {
			console.log('Failure: ' + e);
                    },
                    success:function(o) {
			$.extend(_notebook.data, o);
			_notebook.editor();
                    }
		});
	    }
	    else {
		_notebook.loadScroll();
		_notebook.loadNotes();
	    }
	    
	    _notebook.initializeDOM();
	}

	this.initializeDOM = function() {
	    
	    _notebook.itemsEl = $('#notebook-items');
	    _notebook.essayEl = $('#notebook-essay');	    
	    
            $('#insert-button')
		.on('click', function(ev) {
                    _notebook.makeItem('default');
		});
            
            $('#insert-space')
		.on('click', function(ev) {
                    _notebook.makeItem('spacer');
		});
	
            $('#insert-image')
		.on('click', function(ev) {
                    _notebook.makeItem('image');
		});
	}

        this.editor = function() {
	    this.editorDOM();
	}
	this.editorDOM = function() {
	    var editize = function(fieldName, fieldValue) {
		var el = d('field-input scroll-' + fieldName + ' ' + fieldName).html(_notebook.data[fieldName]);
		var medium = new MediumEditor(el, { disableReturn: true});
		medium.subscribe('editableInput', function (event, editor) {
                    _notebook.needsUpdated = true;
		    _notebook.patch[fieldName] = medium.getContent();
		    console.log(_notebook.patch);
		});
		return d('field').append(
		    d('field-title').html(fieldName),
		    el
		);
	    }
	    $('#scroll-header').append(
		editize('title', 'Notebook title'),
		editize('subtitle', 'Notebook subtitle'),
		editize('description', 'Notebook description')
	    );
	}


        this.loadScroll = function() {
            var start = moment(_notebook.scroll.first_event);
            var before = moment(_notebook.scroll.last_event);
            _notebook.user.timeline.initialize(start, before, _notebook.user);	    
	};

        this.loadNotes = function() {
	}

	this.load = function() {

	}

/*	
	'scrollPatch':function(url, data, notebook) {
	    if (GLOBAL.user.key) {
		$.ajax({
                    url:url,
                    type: 'PATCH',
                    contentType: 'application/json',
                    dataType: 'json',
		    data:JSON.stringify(data),
                    context:notebook,
                    headers: {
			'Authorization': 'Token ' + GLOBAL.user.key
                    },
                    failure:function(e) {
			console.log('Failure: ' + e);
                    },
                    success:function(o) {
			this.needsUpdated = false;
                    }
		});
	    }
	    else {
		console.log('You can only fav things if you\'re logged in.')
	    }
	},
	'notesGet':function(scroll_uuid, notebook) {
	    if (GLOBAL.user.key) {
		$.ajax({
                    url:API + '/notes/?scroll=' + scroll_uuid,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json',
                    context:notebook,
                    headers: {
			'Authorization': 'Token ' + GLOBAL.user.key
                    },
                    failure:function(e) {
			console.log('Failure: ' + e);
                    },
                    success:function(o) {
			for (var i=0;i<o.results.length; i++)
			{
                            var nbItem = o.results[i];
                            var nbi = this.makeItem(nbItem.kind, nbItem.event_full, nbItem);
			}
                    }
		});
	    }
	    else {
		console.log('You can only make notes if you\'re logged in.')
	    }
	},        
	'notePost':function(data, items) {
	    if (GLOBAL.user.key) {
		$.ajax({
                    url:API + '/notes/',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
		    data:JSON.stringify(data),
                    context:items,
                    headers: {
			'Authorization': 'Token ' + GLOBAL.user.key
                    },
                    failure:function(e) {
			console.log('Failure: ' + e);
                    },
                    success:function(o) {
			for (var i=0;i<o.length; i++) {
                            this[i].url = o[i].url;
                            this[i].id = o[i].id;                            
                            this[i].needsCreated = false;
			}
                    }
		});
	    }
	    else {
		console.log('You can only make notes if you\'re logged in.')
	    }
	},
	'notePut':function(data, items) {
	    if (GLOBAL.user.key) {
		$.ajax({
                    url:API + '/notes/',
                    type: 'PATCH',
                    contentType: 'application/json',
                    dataType: 'json',
		    data:JSON.stringify(data),
                    context:items,
                    headers: {
			'Authorization': 'Token ' + GLOBAL.user.key
                    },
                    failure:function(e) {
			console.log('Failure: ' + e);
                    },
                    success:function(o) {
			for (var i=0;i<o.length; i++) {
                            this[i].needsUpdated = false;                            
			}
                    }
		});
	    }
	    else {
		console.log('You can only fav things if you\'re logged in.')
	    }
	},
	'noteDelete':function(data, items) {
	    if (GLOBAL.user.key) {
		for (var i = 0; i<items.length; i++) {
		    $.ajax({
			url:API + '/notes/' + items[i].id,
			type: 'DELETE',
			context:items[i],
			headers: {
			    'Authorization': 'Token ' + GLOBAL.user.key
			},
			failure:function(e) {
			    console.log('Failure: ' + e);
			},
			success:function(o) {
                            this.needsDeleted = false;                            
			}
                    });
		}
	    }
	    else {
		console.log('You can only make notes if you\'re logged in.')
	    }
	},
*/
        
	this.render = function() {
	    _notebook.dom_nb_listing.hide();
            _notebook.dom_title.empty();
            _notebook.dom__notebook.empty();
            _notebook.dom_essay.empty();
            
	    var title = 'Untitled';
	    if (this.scroll.title) {
		title = this.scroll.title;
	    }
            
	    var editor = d('notebook-title-editor').html(title);
	    var medium = new MediumEditor(editor, {
		disableReturn: true,
		targetBlank: true
            });

	    $('#notebook-title').append(editor);
            
            medium.subscribe('editableInput', function (event, editor) {
                _notebook.needsUpdated = true;
                _notebook.title = medium.getContent();
	    });
	}
        this.scanner = function() {
            if (_notebook.needsUpdated) {
                var payload = {
                    title:_notebook.title
                };
                console.log('Will save: ', payload);
                Endpoints.scrollPatch(_notebook.scroll.url, payload, nb);
            }

        }
        setInterval(this.scanner, REFRESH_INTERVAL);	
        
	/* Get our DOM objects */

        
	var makeInsertionTemplate = function() {
	    return {
                moving:false,
                  from:undefined,
                to:undefined
            };
	}
	
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
	
        this.makeItem = function(kind, event, note) {
            var item = new NotebookItem(kind, event, note);
            _notebook.itemsEl.prepend(item.notebookView);
            _notebook.essayEl.prepend(item.textView);
	    item.order = this.decmin();
	    
	    item.mover = $('<span></span>',
			   {class:'button mover'})
		.html('MV');
	    
	    item.notebookView.children('.top, .editable').on('click', function(ev){
		if (_notebook.insertion.moving) {
		    ev.stopImmediatePropagation();
		    ev.preventDefault();
		    
		    _notebook.insertion.from.buttons.children('.mover').removeClass('active');
		    
		    _notebook.reorderItems(item);
		    $('.mover').html('MV');
		}
	    });
	    
	    item.notebookView.hover(
		function(ev) {
		    if (_notebook.insertion.moving == true
			&& item != _notebook.insertion.from) {
			var el = $(item.notebookView);
			el.children()
			    .css({cursor:'hand'});
		    }
		},
		function(ev) {
		    if (!_notebook.moving) {
			var el = $(item.notebookView)			
			el.children().css({cursor:'default'});
		    }
		});
	    
	    item.mover.on('click', function(ev) {
		if (_notebook.insertion.moving) {
		    if (item == _notebook.insertion.from) {
			item.mover.removeClass('active');
			_notebook.insertion = makeInsertionTemplate();
		    }
		    else {
			_notebook.insertion.to = item;
			var range = _notebook.getRange(_notebook.insertion);
			for (i in range) {
			    range[i].buttons.children('.mover').addClass('active');
			}
		    }
		}
		else {
		    _notebook.insertion.moving = true;
		    item.mover.addClass('active');
		    $('.mover').not('.active').each(function(pos, el) {
			$(el).html('SET RANGE');
		    });
		    _notebook.insertion.from = item;
		}
	    })
	    
	    item.buttons.prepend(item.mover);
	    this.items.unshift(item);
        }


        this.scanner = function () {
	    // If we don't have a scroll URL then we can't make a REST query.
	    if (!_notebook.scroll) {
		console.log('[Error] No scroll URL, can\'t save anything', _notebook);
	    }
	    else {
		var makePost = function(nbItem) {
                    var event = undefined;
                    
                    var data = {
			order:nbItem.order,
                        kind:nbItem.kind,
			scroll:_notebook.scroll.url,
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
		
		for (var i=0; i<_notebook.items.length; i++) {
		    if (_notebook.items[i].needsCreated) {
			created.push(_notebook.items[i]);
		    }
                    else {
			// Avoid update or delete before create---if
			// it needs created then let that happen first
			// on a subsequent pass.
			
			if (_notebook.items[i].needsUpdated) {
                            updated.push(_notebook.items[i]);
			}
			if (_notebook.items[i].needsDeleted) {
                            deleted.push(_notebook.items[i]);
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
	
	this.initialize();

    };
    
    /* 
       ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏ ╻╺┳╸┏━╸┏┳┓
       ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓┃ ┃ ┣╸ ┃┃┃
       ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹╹ ╹ ┗━╸╹ ╹
    */
    var NotebookItem = function(kind, event, note) {
	var _notebookitem = this;
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
	    console.log(_notebookitem.event);
	    var div = $('<div></div>', {class:'top'});
            if (_notebookitem.event && _notebookitem.event.data) {
                var el = div.append(
		    a(event.data.content_url, 'notebook-event-title')
			.append(d('notebook-event-title').html(event.data.title)),
		    d('notebook-event-datetime').html(event.data.datetime),
		    d('notebook-event-text').html(event.data.text)
		);
		return div;
            }
            else if (this.kind=='closer') {
		return div.html('&mdash; FIN &mdash;')
            }
	    else if (this.kind=='spacer') {
		this.buttons.append(
		    $('<span></span>', {class:'button'}).html('Space &times; 2')
			.addClass('active')
			.on('click', function() {
			    _notebookitem.buttons.children('span.button')
                                .removeClass('active');
			    $(this).addClass('active');
			    _notebookitem.medium.setContent('<br/><br/>');}),
		    $('<span></span>', {class:'button'}).html('&mdash;')
			.on('click', function() {
			    _notebookitem.buttons.children('span.button')
                                .removeClass('active');
			    $(this).addClass('active');				
			    _notebookitem.medium.setContent('<hr></hr>');
			}));
		return d;
            }
            else if (_notebookitem.kind=='image') {
                return div.html('image');
            }		
            else {
                return div.html('Card');
            }
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
	    disableExtraSpaces: false,
	    targetBlank: true                
        });
	
        this.textView = s('view-item').on('click', function() {});
        this.changed = function() {
	    this.needsUpdated = true;
        };
	
        this.deleteButton = s('button')
	    .html('[Del]')
	    .on('click', function(ev) {
                _notebookitem.needsDeleted = true;
		_notebookitem.notebookView.remove();
		_notebookitem.textView.remove();		    
	    });	    
	
        this.makeNotebookView = function() {
	    if (this.kind != 'closer') {
                return d('nb-item ' + kind)
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
	    _notebookitem.textView.addClass('focused');
	    var scrollTop = $('#notebook-essay').scrollTop()
		+ $(_notebookitem.textView).position().top
		- 100;
	    $('#notebook-essay').animate({
		scrollTop: scrollTop
	    });
	});
	this.medium.subscribe('editableInput', function (event, editor) {
            _notebookitem.changed();              
            _notebookitem.textView.html(_notebookitem.medium.getContent());
            _notebookitem.textView.append(' ');
	});
    };   

    /*
      ╺┳┓┏━┓┏━╸╻ ╻┏┳┓┏━╸┏┓╻╺┳╸ ┏━┓┏━╸┏━┓╺┳┓╻ ╻
       ┃┃┃ ┃┃  ┃ ┃┃┃┃┣╸ ┃┗┫ ┃  ┣┳┛┣╸ ┣━┫ ┃┃┗┳┛
      ╺┻┛┗━┛┗━╸┗━┛╹ ╹┗━╸╹ ╹ ╹ ╹╹┗╸┗━╸╹ ╹╺┻┛ ╹
    */    
    $(document).ready(function() {
        // Who am I?
        var user = new User();
        
        // What should the timeline show?
	var end = moment();
	var start = end.clone().subtract(1, 'month');
        var timeline = new Timeline(start, end, user);
	var n = new Notebook(undefined, user);

	$('#notebook-create-button')
	    .on('click', function(ev) {
		console.log(ev);
	    });
	

        // Escape key triggers Notebook
        $(document).keyup(function(e) {
            if (user.data.username) {            
                if (e.keyCode === 27) $('#notebook').toggle();
            }
        });
    });

    
}(jQuery,
  Cookies,
  MediumEditor));
