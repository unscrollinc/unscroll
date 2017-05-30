"use strict";

(function($, Cookies, MediumEditor) {

    /* 
       ________________________________________
       ┏━╸╻  ┏━┓┏┓ ┏━┓╻  ┏━┓
       ┃╺┓┃  ┃ ┃┣┻┓┣━┫┃  ┗━┓
       ┗━┛┗━╸┗━┛┗━┛╹ ╹┗━╸┗━┛
    */
    const API = '';
    const AUTH = API + '/rest-auth';
    const GRIDHEIGHT = 8;
    const ACTIVEHEIGHT = 0.95;          
    const REFRESH_INTERVAL = 4000; // milliseconds
    const timeBeforeRefresh = 10; // milliseconds

    /*
      ________________________________________
      ╻ ╻╺┳╸╻╻  ╻╺┳╸╻┏━╸┏━┓
      ┃ ┃ ┃ ┃┃  ┃ ┃ ┃┣╸ ┗━┓
      ┗━┛ ╹ ╹┗━╸╹ ╹ ╹┗━╸┗━┛
    */

    const elMaker = function (elType, className, kids) {
        var el = undefined;
        if (className) {
            el = $('<'+elType+'></'+elType+'>', {class:className});
        }
        else {
            el = $('<div></div>');
        }
        if (kids) {
            el.append(kids);
        }
        return el;
    };
    const d = function (className, kids) { return elMaker('div', className, kids); };
    const s = function (className, kids) { return elMaker('span', className, kids); };
    const tr = function (className, kids) { return elMaker('tr', className, kids); };
    const td = function (className, kids) { return elMaker('td', className, kids); };
    const th = function (className, kids) { return elMaker('th', className, kids); };                

    const i = function (className, value) {
        return $('<input></input>', {value:value,
                                     class:className});
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
		    var notebooklist = new NotebookList(_user);
		    var notebook = new Notebook(notebooklist.first().data, _user);
		    _user.currentNotebook = notebook;                    
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

     */
    var Search = function(timeline, user) {
	var _search = this;

	this.timeline = timeline;
	this.user = user;
	this.input = undefined;
	this.query = {
	    scroll:undefined,
	    term:undefined
	};
	
	this.initialize = function() {
	    _search.initializeDOM();
	}

        this.alert = function(html) {
            var alert = d('alert').html(html);
            _search.alertDOM(alert)
        };

        this.alertDOM = function(alert) {
            $('#search-alert').empty().append(alert).show().delay(4000).fadeOut();
        };

        this.success = function(html) {
            var alert = d('alert').html(html);
            _search.successDOM(alert)
        };

        this.successDOM = function(alert) {
            $('#search-alert').empty().append(alert).show().delay(4000).fadeOut();
        }
        
	this.parseQuery = function(qs) {
	    console.log('query is', qs)
	    _search.query.term = qs;
	};

        this.preSearch = function() {
	    _search.parseQuery(_search.input.val());
            
            $.ajax({
                type: 'GET',                
                url: API + '/events/maxmin/',
                data: {q:_search.query.term},
                contentType: 'application/json',
                dataType: 'json',                
                failure: function(e) {
		    console.log('Failure: ' + e);
                },
                success: function(o) {
                    console.log('Success: ' + o);
                    if (o.count > 0) {
                        _search.success('Found ' + o.count + ' results from ' + moment(o.last_event).year() + ' to ' + moment(o.first_event).year());
		        _search.timeline.search = _search.query;
		        _search.timeline.initialize(moment(o.first_event),
                                                    moment(o.last_event));
                    }
                    else {
                        _search.alert('No results.');
                        
                    }
                    return false;                    
                }
            });
            return false;
        }
	
	this.initializeDOM = function() {
	    this.input = $('#search-input');
	    
	    _search.input.focus(function (ev) {
		_search.input.val('');
	    });
                    
	    _search.input.submit(function (ev) {
                ev.preventDefault();
            });
            
	    _search.input.keypress(function (ev) {
		if (ev.which == 13) {
                    ev.preventDefault();
                    _search.preSearch();
		    return false; 
		}
	    });
	}	
	this.initialize();
	
    };
    
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
            return 2;
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
	    var url = '/?start='
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
	    if (_panel.timeline.search.term) {
                url = url
                    + '&q='
                    + _panel.timeline.search.term;
	    }
            else if (_panel.timeline.user.currentScroll
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
        this.notebook = panel.timeline.user.currentNotebook;

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
	    noteButton.on('click', _event.makeNote)
	    
            var thumb = undefined;
            if (_d.thumb_image) {
                thumb = $('<img></img>', {class:'thumb',
                                  style:'height:'+_d.thumb_height+';width:'+_d.thumb_width,
                                  src:_d.thumb_image})
            }
            _event.el.append(
                d('inner').append(
                    d('scroll-title').html(_d.scroll_title),
                    d('datetime').html(_event.formatByResolution()),
                    thumb,
                    d('title').append(
			a(_event.data.content_url, 'title').html(_d.title)),
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
            console.log(_event);
	    var notebook = _event.notebook;
            notebook.makeItem('default', _event.data, undefined);
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
        
        this.pos = {};
	this.search = {};
	
        this.initialize = function(start, end) {
            var _start = start;
            var _end = end;

            if (!_start || !_end) {
	        _end = moment();
	        _start = _end.clone().subtract(1, 'month');
            }                                
            
            _timeline.pos = {
                lastOffset:0,
                offset:0
            };
            _timeline.el.css({marginLeft:'0%'});
            _timeline.timeframe = _timeline.getTimeFrame(_start, _end);
	    _timeline.start = _timeline.timeframe.adjust(_start);
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

        if (scroll) {
	    this.data = scroll;
        }
        else {
	    this.data = {};            
        }

	this.newMoveStatus = function() {
	    return {
		fromNote:{el:undefined, pos:undefined},
		throughNote:{el:undefined, pos:undefined},
		toBeforeNote:{el:undefined, pos:undefined}
	    }
	}

	this.moveStatus = this.newMoveStatus();

	this.convertMoveStatus = function() {
	    var from = _notebook.moveStatus.fromNote.pos;
	    var to = _notebook.moveStatus.throughNote.pos;
	    var target = _notebook.moveStatus.toBeforeNote.pos;
	    
	    if (!to) {
		to = from;
	    }

	    if (to < from) {
		var _to = from;
		var _from = to;
		to = _to;
		from = _from;
	    }
	    return {from:from, to:to, target:target};
	}
	
	this.rearrange = function() {
	    _notebook.tagRanges();

	    var itemsKids = _notebook.itemsEl.children();
	    var essayKids = _notebook.essayEl.children();		
	    
	    var newItems = new Array();
	    var splice = new Array();

	    var movePositions = _notebook.convertMoveStatus();
	    var from = movePositions.from;
	    var to = movePositions.to;
	    var target = movePositions.target;
	    
	    console.log('from', from, 'to', to, 'target', target);
	    if (from > -1 && to > -1 && target > -1) {
		$.each(_notebook.items, function(i, e) {
		    if (i >=from && i <= to) {
			splice.push(e);
		    }
		});

		var reorderEnd = _notebook.items[target].data.order;
		var reorderBegin = undefined;

		if (target==0) {
		    reorderBegin = reorderEnd - 100;
		}
		else {
		    reorderBegin = _notebook.items[target - 1].data.order;
		}

		var multiplier = (reorderEnd - reorderBegin)/(splice.length + 1)
		
		$.each(_notebook.items, function(i, e) {
		    if (i >=from && i <= to) {
			//do nothing; this is the splice
		    }
		    else if (i == target) {
			$.each(splice, function(j, f) {
			    f.needsUpdated = true;
			    f.data.order = reorderBegin + ((j + 1) * multiplier);
			    newItems.push(f);
			    f.editized.formView.insertBefore(itemsKids[i]);
			    f.editized.essayView.insertBefore(essayKids[i]);			    
			});
			newItems.push(e);			
		    }
		    else {
			newItems.push(e);
		    }
		});
	    }
	    _notebook.items = newItems;
	    _notebook.moveStatus = _notebook.newMoveStatus();

	    $('.in-range').removeClass('in-range');
	    $('.button.move').show();
	    $('.button.range').hide();
	    $('.button.drop').hide();		
	    $('.button.delete').show();
	}
	
	this.tagRanges = function() {
	    $.each(_notebook.items, function(i, e) {
		if (e == _notebook.moveStatus.fromNote.el) {
		    _notebook.moveStatus.fromNote.pos = i;					    
		}
		if (e == _notebook.moveStatus.toBeforeNote.el) {
		    _notebook.moveStatus.toBeforeNote.pos = i;		    
		}
		if (e == _notebook.moveStatus.throughNote.el) {
		    _notebook.moveStatus.throughNote.pos = i;			
		}
	    });	    
	}
	
	this.setRange = function() {
	    _notebook.tagRanges();
	    var movePositions = _notebook.convertMoveStatus();
	    console.log(_notebook.moveStatus, movePositions);
	    var from = movePositions.from;
	    var to = movePositions.to;
	    var target = movePositions.target;
	    console.log('setRange', from, to, target);
	    $.each(_notebook.items, function(i, e) {
		if (i >=from && i <= to) {
		    e.editized.formView.addClass('in-range');
		}
	    });
	    $('.button.move').hide();
	    $('.button.range').show();
	    $('.button.drop').show();		
	    $('.button.delete').hide();
	    
	}

	// Utility function for producing interactive text els
	var editize = function(o) {

	    var fieldName = o.fieldName;
            var fieldTitle = o.fieldTitle;
            var isRichText = o.isRichText;
	    var isNote = o.isNote;
	    var caller = o.caller;
	    var data = caller.data;
	    var patch = caller.patch;

	    var formField = d('field');
	    
	    var el = undefined;
	    var essayChild = undefined;
	    
	    if (isNote) {
		essayChild = s('note essay ' + fieldName);
	    }
	    else {
		essayChild = d('header essay ' + fieldName);
	    }

            if (isRichText) {
                el = d('field-input scroll-'
                       + fieldName
                       + ' '
                       + fieldName)
                    .html(data[fieldName]);

                essayChild.html(data[fieldName]);
		
		var medium = new MediumEditor(el, {disableReturn: true});
		
		medium.subscribe('editableInput', function (event, editor) {
                    caller.needsUpdated = true;
		    data[fieldName] = medium.getContent();
                    essayChild.html(medium.getContent() + ' ');
		});
            }
            else {
                el = i('field-input scroll-'
                       + fieldName
                       + ' '
                       + fieldName, data[fieldName]);
		
                essayChild.text(data[fieldName]);
		
                el.on('input', function(ev) {
                    patch[name] = el.val();
                    essayChild.text(el.val());
                });
            }

	    if (isNote) {
		var buttons = d('buttons');
		buttons.append(
		    s('button move').text('Move')
			.on('click', function(ev) {
			    _notebook.moveStatus.fromNote.el = caller;
			    _notebook.setRange();
			}),

		    s('button range').text('Range')
			.on('click', function(ev) {
			    _notebook.moveStatus.throughNote.el = caller;
			    _notebook.setRange();			    
			}),

		    s('button drop').text('Drop')
			.on('click', function(ev) {
			    _notebook.moveStatus.toBeforeNote.el = caller;
			    _notebook.rearrange();   
			}),
		    
		    s('button delete').text('Delete')
			.on('click', function(ev) {
			    caller.needsDeleted = true;
			    caller.editized.essayView.remove();
			    caller.editized.formView.remove();			    
			}));
		el.prepend(buttons);
	    }

            var eventEl = undefined;
            
	    if (caller.event) {
                var _d = caller.event;

                var thumb = undefined;
                if (_d.thumb_image) {
                    thumb = $('<img></img>', {class:'thumb',
                                              style:'height:'+_d.thumb_height+';width:'+_d.thumb_width,
                                              src:_d.thumb_image});
                }
                eventEl = d('note-event', [
                    d('event-datetime').html(moment(_d.datetime).format()),
                    thumb,                    
                    a(_d.content_url, 'event-link').append(
                        d('event-title').html(_d.title),
                    ),
                    d('event-text').html(_d.text),
                ]);
            }            
                
	    formField.append(buttons, d('field-title').html(fieldTitle), eventEl, el);
            
	    return {
		formView: formField,
		essayView: essayChild
	    };
	};
	
	this.user = user;
	this.user.currentScroll = scroll;
	this.patch = {};

	this.items = new Array();
	this.itemsEl = undefined;
	this.essayEl = undefined;
	
        this.needsCreated = scroll ? false : true;
        this.needsUpdated = false;
        this.needsDeleted = false;

        this.networkOperationInProgress = false;

	this.initialize = function() {
	    if (_notebook.needsCreated) {
                _notebook.create();
	    }
	    else {
		_notebook.loadScroll();
		_notebook.loadNotes();
	    }
	    _notebook.initializeDOM();
	};

        this.makeItem = function(kind, event, note) {
            var item = new NotebookItem(kind, event, note, _notebook);
	    if (!item.data.order) {
		item.data.order = this.decmin();
	    }
	    var text = note ? note.text : '';
            
            if (item.event) {
	        item.editized = editize({fieldName:'text',
				         fieldTitle:'Event',
				         isRichText:true,
				         isNote:true,
				         caller:item});
            }
            else {
	        item.editized = editize({fieldName:'text',
				         fieldTitle:'Note',
				         isRichText:true,
				         isNote:true,
				         caller:item});                
            }

            // Add to actual array
	    _notebook.items.unshift(item);

            // Add to left notebook
            _notebook.itemsEl.prepend(item.editized.formView);

            // Add to right notebook
            _notebook.essayEl.prepend(item.editized.essayView);
            
	    return item;
	}
	
        
	this.initializeDOM = function() {
    
	    _notebook.itemsEl = $('#notebook-items');
	    _notebook.essayEl = $('#notebook-essay');
            
            $('#note-default-create-button')
                .off()
		.on('click', function(ev) {
                    ev.preventDefault();
		    console.log('Clicked on default create button');
                    _notebook.makeItem('default', undefined, undefined);
		});


	    $('#notebook-create-button')
	        .on('click', function(ev) {
                    _notebook.create();
                    
	        });
            
            $('#insert-space')
                .off()
		.on('click', function(ev) {
                    ev.preventDefault();
                    _notebook.makeItem('spacer');
		});
	
            $('#insert-image')
                .off()
		.on('click', function(ev) {
                    ev.preventDefault();                    
                    _notebook.makeItem('image');
		});
	};

        this.editor = function() {
	    this.editorDOM();
	};
        
	this.editorDOM = function() {

	    var title = editize({
		fieldName:'title',
		fieldTitle:'Notebook title',
		isRichText:true,
		caller:_notebook
	    });
	    
	    var subtitle = editize({
		fieldName:'subtitle',
		fieldTitle:'Subtitle',
		isRichText:true,
		caller:_notebook		
	    });

	    var description = editize({
		fieldName:'description',
		fieldTitle:'Description',
		isRichText:true,
		caller:_notebook				
	    });

            $('#notebook-items').empty();
            $('#notebook-essay').empty();            

	    $('#scroll-header')
                .empty()
                .append(title.formView, subtitle.formView, description.formView);
	    
	    $('#scroll-header-essay')
                .empty()
                .append(title.essayView, subtitle.essayView, description.essayView);

	}

        this.loadScroll = function() {
            var start = _notebook.data.first_event ? moment(_notebook.data.first_event) : undefined ;
            var before = _notebook.data.last_event ? moment(_notebook.data.last_event) : undefined ;
            _notebook.read();
            _notebook.loadScrollDOM();
            _notebook.user.timeline.initialize(start, before, _notebook.user);
	};

        this.loadScrollDOM = function() {
            $('#notebook-items').empty();
            $('#notebook-essay').empty();            
        }

	this.loadNotes = function() {
	    _notebook.notesRead();
	}

	this.read = function() {
	    $.ajax({
                url:_notebook.data.url,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json',
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

        this.create = function() {
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

        this.delete = function(ev) {
            ev.preventDefault();
	    $.ajax({
		url:_notebook.data.url,
		type: 'DELETE',
		headers: {
		    'Authorization': 'Token ' + _event.user.data.key
		},
		failure:function(e) {
		    console.log('Failure: ' + e);
		},
		success:function(o) {
                    _event.el.remove();
		}
	    });
        };
        
        this.notesRead = function() {
	    $.ajax({
                url:_notebook.data.url + 'notes/',
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json',
                headers: {
		    'Authorization': 'Token ' + _notebook.user.data.key
                },
                failure:function(e) {
		    console.log('Failure: ' + e);
                },
                success:function(o) {
		    for (var i=o.length - 1;i>=0;i--) {
                        var nbItem = o[i];
                        _notebook.makeItem(nbItem.kind, nbItem.event_full, nbItem);
		    }
                }
	    });
        };
        
	this.notesPost = function(data, items) {
	    $.ajax({
                url:API + '/notes/',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
		data:JSON.stringify(data),
                context:items,
                headers: {
		    'Authorization': 'Token ' + _notebook.user.data.key
                },
                failure:function(e) {
		    console.log('Failure: ' + e);
                },
                success:function(o) {
		    for (var i=0;i<o.length; i++) {
			items[i].needsCreated = false;
                        $.extend(items[i].data, o[i]);
		    }
                }
	    });
	};
        
	this.notesPut = function(data, items) {
	    $.ajax({
                url:API + '/notes/',
                type: 'PUT',
                contentType: 'application/json',
                dataType: 'json',
		data:JSON.stringify(data),
                context:items,
                headers: {
		    'Authorization': 'Token ' + _notebook.user.data.key
                },
                failure:function(e) {
		    console.log('Failure: ' + e);
                },
                success:function(o) {
		    for (var i=0;i<o.length; i++) {
                        items[i].needsUpdated = false;                            
		    }
                }
	    });
	};
	
        this.notesDelete = function(items)  {
	    for (var i = 0; i<items.length; i++) {
		$.ajax({
		    url:items[i].data.url,
		    type: 'DELETE',
		    context:items[i],
		    headers: {
			'Authorization': 'Token ' + _notebook.user.data.key
		    },
		    failure:function(e) {
			console.log('Failure: ' + e);
		    },
		    success:function(o) {
                        this.needsDeleted = false;                            
		    }
                });
	    }
	};
        	
        this.update = function() {
            _notebook.networkOperationInProgress = true;
	    $.ajax({
                url:_notebook.data.url,
                type: 'PUT',
                contentType: 'application/json',
                dataType: 'json',
		data:JSON.stringify(_notebook.data),
                headers: {
		    'Authorization': 'Token ' + _notebook.user.data.key
                },
                failure:function(e) {
                    _notebook.networkOperationInProgress = false;
		    console.log('Failure: ' + e);
                    },
                success:function(o) {
                    _notebook.networkOperationInProgress = false;
		    _notebook.needsUpdated = false;
                        $.extend(_notebook.data, o);
		    var notebookList = new NotebookList(_notebook.user);                        
                }
	    });
        }
	
        this.notebookScanner = function() {
            if (!_notebook.networkOperationInProgress && _notebook.needsUpdated) {
                _notebook.update();                
            }  
	};
        setInterval(this.notebookScanner, REFRESH_INTERVAL);	

	this.noteScanner = function() {
	    var toCreate = $.grep(_notebook.items, function(e) {return e.needsCreated;});
	    if (toCreate.length > 0) {
		var posts = $.map(toCreate, function(e) {
		    return $.extend(e.data, {scroll:_notebook.data.url});
		});
                _notebook.notesPost(posts, toCreate);
	    }

	    var toPut = $.grep(_notebook.items, function(e) {
		return (e.needsUpdated && !e.needsCreated);
	    });
	    if (toPut.length > 0) {
		var puts = $.map(toPut, function(e) {
		    return $.extend(e.data, {scroll:_notebook.data.url});		    
		});
                _notebook.notesPut(puts, toPut);
	    }
	    
	    var toDelete = $.grep(_notebook.items, function(e) {
		return (e.needsDeleted && !e.needsCreated && !e.Updated);		
	    });
	    if (toDelete.length > 0) {
		_notebook.notesDelete(toDelete);
	    }

	}
        setInterval(this.noteScanner, REFRESH_INTERVAL);		
	
        this.title = undefined;
        this.items = new Array();
	

	this.initialize();

    };

    /* 
       ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏ ╻╺┳╸┏━╸┏┳┓
       ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓┃ ┃ ┣╸ ┃┃┃
       ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹╹ ╹ ┗━╸╹ ╹
    */
    var NotebookItem = function(kind, event, note, notebook) {
	var _notebookitem = this;

        this.kind = kind ? kind : 'default';
        this.event = event;
	this.notebook = notebook;
        var event_url = this.event ? this.event.url : undefined;
        this.data = $.extend(note, {kind:kind, event:event_url});
        this.needsCreated = note ? false : true;
        this.needsUpdated = false;
        this.needsDeleted = false;
	this.editized = undefined;
    };   
    
    /*
      ________________________________________
      ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏ ╻  ╻┏━┓╺┳╸
      ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓┃  ┃┗━┓ ┃
      ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹┗━╸╹┗━┛ ╹      
     */
    var NotebookList = function(user) {

	var _notebooklist = this;
	this.user = user;
        this.el = $('#notebook-listing');
	this.scrolls = new Array();
	
	this.first = function() {
	    return this.scrolls[0];
	}
	
        this.initialize = function() {
	    _notebooklist.scrolls = $.map(user.data.full_scrolls,
					  function(s) {
					      return new NotebookListItem(s, _notebooklist);});
	    var els = $.map(_notebooklist.scrolls, function(s) {return s.el});
	    _notebooklist.initializeDOM(els);
	};
	
	this.initializeDOM = function(scrolls) {
            _notebooklist.el.append($('<table></table>')
                                    .append(
                                        tr('notebook-list-item header')
                                            .append(
                                                th('when').text('Created'),
                                                th('title').text('Title'),
                                                th('username').text('Creator'),
                                                th('public').text('Public?')),
                                        scrolls));
	    $('#notebook-list-button')
		.on('click', function (ev) {
                    _notebooklist.el.toggle();
		});
	}
	
	this.initialize();
    };

    /*
      ________________________________________
      ┏┓╻┏━┓╺┳╸┏━╸┏┓ ┏━┓┏━┓╻┏ ╻  ╻┏━┓╺┳╸╻╺┳╸┏━╸┏┳┓
      ┃┗┫┃ ┃ ┃ ┣╸ ┣┻┓┃ ┃┃ ┃┣┻┓┃  ┃┗━┓ ┃ ┃ ┃ ┣╸ ┃┃┃
      ╹ ╹┗━┛ ╹ ┗━╸┗━┛┗━┛┗━┛╹ ╹┗━╸╹┗━┛ ╹ ╹ ╹ ┗━╸╹ ╹
    */
    var NotebookListItem = function(item, notebooklist, user) {
	var _notebooklistitem = this;

	this.data = item;
	this.notebooklist = notebooklist;
	this.user = notebooklist.user;
	this.el = undefined;
	
	this.initialize = function() {
	    _notebooklistitem.el = _notebooklistitem.initializeDOM();
	}
	
        this.initializeDOM = function() {
	    var line =
		tr('notebook-list-item')
		.append(
		    td('notebook-list-date').text(moment(_notebooklistitem.data.created).fromNow()),
		    td('notebook-list-title').html(_notebooklistitem.data.title),
		    td('notebook-list-username').html(_notebooklistitem.user.data.username),                    
		    td('notebook-list-public').text(_notebooklistitem.data.public ? 'Public' : 'Private'));
	    line.on('click', function(ev) {
		var notebook = new Notebook(_notebooklistitem.data, _notebooklistitem.user);
		_notebooklistitem.user.currentNotebook = notebook;
                _notebooklistitem.notebooklist.el.toggle();
	    });
	    return line;
	};

	this.initialize();
    }
    
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
	var search = new Search(timeline, user);
	

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
