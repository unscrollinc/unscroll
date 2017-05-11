"use strict";
(function($, Cookies, MediumEditor) {

    var newUser = function() {
        return {username:undefined,
                email:undefined,
                key:undefined
	       };
    }

    var GLOBAL = {
        user:newUser(),
        timeline:undefined,
        notebook:undefined,
	scroll:undefined,
        scroll_id:undefined,
        pos:undefined,
        start:undefined,
        end:undefined
        
    };

    $(document).ready(function() {
	var start = moment('2001-04-01T00:00:00');
	var end = start.clone().add(1, 'months');        
        
        GLOBAL.timeline = new Timeline(start, end);
        GLOBAL.start = start;
        GLOBAL.end = end;
        GLOBAL.notebook = new Notebook('a');
	GLOBAL.notebook.makeItem('closer');
        GLOBAL.setUserNameAndLogin = function() {
	    $('#account-login').text('You are: ' + GLOBAL.user.username);
	    $('#account-create')
                .text('Logout')
                .on('click',
		    function(e) {ENDPOINTS.userLogout();});
        }
        
        var session = Cookies.getJSON('session');
	
        if (session) {
            GLOBAL.user = session;
            GLOBAL.setUserNameAndLogin();
	    ENDPOINTS.getUserProfile();
	    $('#notebook').toggle();
        }
        
	document.body.addEventListener('touchmove', function(event) {
	    event.preventDefault();
	}, false);
        
        $('#account-login').on('click', function(){
            $('#login-box').toggle();
        });
        
        $('#login-submit').on('click', function(e) {
            e.preventDefault();
            ENDPOINTS.userLogin(
                {'username':$('#login-handle').val(),
                 'password':$('#login-password').val()});
        });
        
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
        });

    GLOBAL.updateUserScrolls = function() {
	var makeScrollListing = function(scroll) {
	    return $('<tr></tr>',
		     {class:'scroll-listing'})
		.on('click', function (ev) {
		    GLOBAL.scroll_id = scroll;
		    console.log(GLOBAL.scroll_id);
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
    const API = 'http://127.0.0.1:8000';
    const AUTH = API + '/rest-auth';

    const ENDPOINTS = {

        'userLogin': function(data) {


	    Cookies.set('session', GLOBAL.user);
	    
	    /* These show up when we browse the browseable API, and they
	       get us in trouble. For now, we blow them away and just go
	       with a single session auth token. */
//	    Cookies.remove('sessionid');
//	    Cookies.remove('csrftoken');

	    
	    $.post({
                url:AUTH + '/login/',
                data:data,
                context:data,
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
		    GLOBAL.user.key = o.key;
		    GLOBAL.user.username = this.username;
                    Cookies.set('session', GLOBAL.user);
		    console.log('Logged in user: ' + GLOBAL.user.username + '.');
                    $('#notebook').toggle();
                    GLOBAL.setUserNameAndLogin();                    
                    ENDPOINTS.getUserProfile();
                }
            });
        },
        'userLogout': function() {
            $.post({
                url:AUTH + '/logout/',
                headers: {
                    'Authorization': 'Token ' + GLOBAL.user.key
                },
                failure:function(e) {
                    console.log('Failure: ' + e);
                },
                success:function(e) {
                    GLOBAL.user = newUser();
		    Cookies.remove('sessionid');
		    Cookies.set('session');
		    Cookies.set('csrftoken');
                    $('#account-login').text('login');
                    $('#account-create').text('create account');
                    console.log('Logged out.');

                }
            });
        },
        'schema': function() {
            $.get({
                url:API + '/schema/',
                headers: {
                    'Authorization': 'Token ' + GLOBAL.user.key
                },
                failure:function(e) {
                    console.log('Failure: ' + e);
                },
                success:function(o) {
                    console.log(o);
                }
            });
        },
        'getUserProfile':function () {
            $.get({
                url:API + '/users/',
                headers: {
                    'Authorization': 'Token ' + GLOBAL.user.key
                },
                failure:function(e) {
                    console.log('Failure: ' + e);
                },
                success:function(o) {
                    $.extend(GLOBAL.user, o.results[0]);
		    console.log('The user is', GLOBAL.user);
		    GLOBAL.updateUserScrolls();

                }
            });
        },
        'userScrollsGet':function () {
            $.get({
                url:API + '/scrolls/',
                headers: {
                    'Authorization': 'Token ' + GLOBAL.user.key
                },
                failure:function(e) {
                    console.log('Failure: ' + e);
                },
                success:function(o) {
                    $.extend(GLOBAL.user, o);
                }
            });
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
                            console.log(this[i]);
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
        'passwordReset':API + '/rest-auth/password/reset/',
        'passwordResetConfirm':'/rest-auth/password/reset/confirm/',
        'passwordChange':'/rest-auth/password/change/',
        'userRegister':'/rest-auth/registration/',
        'userRegisterVerify':'/rest-auth/registration/verify-email/'
    };
    
    const gridHeight = 6;
    const activeHeight = 0.95;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 31;
    const year = day * 365;
    const decade = year * 10;
    const century = year * 100;
    const millennium = year * 1000;

    function makeId() {
        return Math.round(new Date().getTime() + (Math.random() * 1000000));
    }

    var resolutions = {
        'seconds':0,
        'minutes':1,
        'hours':2,
        'days':3,
        'months':4,
        'years':5,
        'decades':6,
        'centuries':7
    }
    
    var getTimeFrame = function(start, end) {
	// Expects two instances of Moment, returns a "timeframe"
	var span = end - start;
	if (span >= millennium * 0.75) {
	    return 'millennia';
	}		
	else if (span >= century * 0.75) {
	    return 'centuries';
	}	
	else if (span >= decade * 0.75) {
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
	    return 'hours';
	}
	else if (span >= minute * 0.75) {
	    return 'minutes';
	}
	return null;
    }
    
    var timeFrames = {
	minutes: {
	    add: function(datetime, no) {
		return datetime.clone().add(no, 'minutes');
	    },
	    columnStepper: function(i, start) {
		var spanStart = moment(start).add(1 * i, 'minutes');
		var spanEnd = moment(start).add(1 * i, 'minutes');
		var _r = {
		    start:spanStart,
		    end:spanEnd,
		    text:spanStart.format('h:mma')
		};
		return _r;
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'minutes');
	    },	    
	    getColumns: function(count, start, end) {
		return 10;
	    },
	    getPeriod: function(start) {
		return makePeriod(start.format('MMM D, YYYY h:mm:ss')
				  + ' - '
				  + moment(start).add(9, 'minutes').add('59', 'seconds').format('h:mm:ssa'),
				  start.clone().startOf('hour'),
				  start.clone().endOf('hour'));
	    },
	    getOffset: function(datetime, resolution) {
                if (resolutions[resolution] >= resolutions['minutes']) {
                    return Math.floor(10 * Math.random());
                }
		else {
                    return datetime.minutes() - 10;
                }
	    },
	    getEventWidth: function(columns, len) {
		return Math.floor(2 + Math.random() * columns/5);
	    },
	    getTarget: function(start, pointerInteger, pointerMantissa) {
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
	},		
	hours: {
	    add: function(datetime, no) {
		return datetime.clone().add(no, 'hours');
	    },
	    columnStepper: function(i, start) {
		var spanStart = moment(start).startOf('hour').add(10 * i, 'minutes');
		var spanEnd = moment(spanStart).add(10 * i, 'minutes');
		var _r = {
		    start:spanStart,
		    end:spanEnd,
		    text:spanStart.format('h:mma')
		};
		return _r;
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'minutes');
	    },	    
	    getColumns: function(count, start, end) {
		return 6;
	    },
	    getPeriod: function(start) {
		return makePeriod(start.format('MMMM D, YYYY h:mm')
				  + ' - '
				  + moment(start).add(59, 'minutes').format('h:mma'),
				  start.clone().startOf('day'),
				  start.clone().endOf('day'));
	    },
	    getOffset: function(datetime, resolution) {
                if (resolutions[resolution] >= resolutions['hours']) {
                    return Math.floor(10 * Math.random());
                }
		else {
                    return datetime.minutes() - 10;
                }
	    },
	    getEventWidth: function(columns, len) {
		return Math.floor(2 + Math.random() * columns/5);
	    },
	    getTarget: function(start, pointerInteger, pointerMantissa) {
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
	},	
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
		    text:spanEnd.format('ha')
		};
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no, 'hours');		
	    },	    
	    getColumns: function(count, start, end) {
		return 24;
	    },
	    getPeriod: function(start) {
		return makePeriod(start.format('MMMM D, YYYY'),
				  start.clone().startOf('month'),
				  start.clone().endOf('month'));
	    },
	    getOffset: function(datetime, resolution) {
                if (resolutions[resolution] >= resolutions['days']) {
                    return Math.floor(24 * Math.random());
                }
		else {
                    return datetime.hours() - 1;
                }
	    },
	    getEventWidth: function(columns, len) {
		return Math.floor(4 + Math.random() * columns/5);
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
	    getOffset: function(datetime, resolution) {
                if (resolutions[resolution] >= resolutions['months']) {
                    return Math.floor(28 * Math.random());
                }
		else {
		    return datetime.date() - 1;
		}
	    },
	    getEventWidth: function(columns, len) {
		return Math.floor(4);
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
		var from = moment((10 * Math.floor(year))+'-01-01');
		var to = moment(from).add(10, 'years')
		return makePeriod(start.year(),
				  from,
				  to);
	    },
	    getOffset: function(datetime, resolution) {
		return datetime.month();
	    },
	    getEventWidth: function(width, len) {
		return 1 + Math.floor(Math.random() * 3);
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
		var spanStart = moment(start).startOf('year').add(i,'years');
		var spanEnd = moment(spanStart).endOf('year');
		return {
		    start:spanStart,
		    end:spanEnd,
		    text:spanStart.format('Y')
		};		
	    },
	    getColumns: function(count) {
		return 10;
	    },
	    getPeriod: function(start) {
		var year = start.year()/100;
		return makePeriod(start.year() + '-' + moment(start).add(9,'years').year(),
				  moment((100 * Math.floor(year))+'-01-01'),
				  moment((100 * Math.ceil(year))+'-01-01'));
	    },
	    getOffset: function(datetime, resolution) {
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
		var spanStart = moment(start.startOf('year')).add(10 * i,'years');
		var spanEnd = moment(spanStart).endOf('decade');
		return {
		    start:spanStart,
		    end:spanEnd,
		    text:spanEnd.format('Y') + '-' + spanEnd.add(9, 'years').format('Y')
		};		
	    },
	    getColumns: function(count) {
		return 10;
	    },
	    getPeriod: function(start) {
		var year = start.year()/1000;
		var from = moment((1000 * Math.floor(year))+'-01-01');
		var to = moment(from).add(1000, 'years');
		return makePeriod(start.year() + '-' + (start.year() + 99),
				  from,
				  to);
	    },
	    getOffset: function(datetime, resolution) {
		return datetime.year() - 100 * Math.floor(datetime.year()/100);
	    },
	    getEventWidth: function(width, len) {
		return Math.floor(Math.random() * width/10);
	    },
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(100 * pointerInteger, 'years');
		var columns = 10;
		var target = pointerFocus.clone().add(100 * Math.floor( pointerMantissa * columns ), 'years');
		return {
		    columns:columns,
		    target:target
		};
	    }	 	    	    	    
	},
	millennia: {
	    add: function(datetime, no) {
		return datetime.clone().add(no * 1000, 'years');
	    },
	    columnAdd: function(datetime, no) {
		return datetime.clone().add(no * 100, 'years');		
	    },
	    columnStepper: function(i, start) {
		var spanStart = moment(start.startOf('year')).add(100 * i,'years');
		var spanEnd = moment(spanStart).endOf('decade');
		return {
		    start:spanStart,
		    end:spanEnd,
		    text:spanEnd.format('Y') + '-' + spanEnd.add(99, 'years').format('Y')
		};		
	    },
	    getColumns: function(count) {
		return 10;
	    },
	    getPeriod: function(start) {
		var year = start.year()/10000;
		var from = moment((10000 * Math.floor(year))+'-01-01');
		var to = moment(from).add(10000, 'years');
		return makePeriod(start.year() + '-' + (start.year() + 999),
				  from,
				  to);
	    },
	    getOffset: function(datetime, resolution) {
		return datetime.year() - 1000 * Math.floor(datetime.year()/1000);
	    },
	    getEventWidth: function(width, len) {
		return Math.floor(Math.random() * width/100);
	    },
	    getTarget: function(start, pointerInteger, pointerMantissa) {
		var pointerFocus = start.clone().add(1000 * pointerInteger, 'years');
		var columns = 100;
		var target = pointerFocus.clone().add(1000 * Math.floor( pointerMantissa * columns ), 'years');
		return {
		    columns:columns,
		    target:target
		};
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
	return $('<div></div>', {class:'column nav'})
	    .css({width:columnWidth,
		  left:columnWidth * i})
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
			GLOBAL.timeline = new Timeline(columnData.start, columnData.end);
		    }));
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

    var Event = function() {
        var my = this;
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
        
        this.eventToNotebook = function(event, frame) {
            GLOBAL.notebook.makeItem('default', event);
        }
        
        this.eventToMeta = function(event, frame, columns) {
            var _dt = moment(event.datetime);
            
            function getLink(event) {
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
            
	    function getThumbnail(event) {
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
            
	    function getScrollThumbnail(event) {
	        if (event.scroll_thumb_image) {
		    return $('<div></div>', {'class':'thumb'})
		        .append($('<img></img>',
			          {'class':'thumb',
			           'src':event.scroll_thumb_image,
			           'title':''
			          }));
	        }
	    }
	    
	    return {
	        div: $('<div></div>', {class:'event'}).append(
		    $('<div></div>', {class:'inner'}).append(
                        
		        getLink(event),
                        
		        getThumbnail(event),
		        
                        $('<span></span>', {class:'asnote button'})
                            .html('[+Note]').on('click', (function(e) {
                                my.eventToNotebook(event, frame);
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
                                GLOBAL.scroll_id = event.scroll_id;
                                new Timeline(GLOBAL.start, GLOBAL.end);
                            })
			    .append(getScrollThumbnail(event))
		    ))
		    .mousemove(function(event) {
		        // Don't move if over event (cut and paste, click, etc);
		    }),
	        width:frame.getEventWidth(columns, event.title.length),
	        offset:frame.getOffset(_dt, event.resolution)
	    };
        }
    }

    var makeUrl = function(env, panel_no, scroll) {
        var url = API
            + '/events/?start='
            + env.frame.add(env.start, panel_no).format()
            + '&before='
            + env.frame.add(env.end, panel_no).format();
        if (GLOBAL.scroll_id) {
            url = url + '&scroll=' + GLOBAL.scroll_id;
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
                var panel_div = makePanel(panel_no,
                                      this.frame.add(this.start, panel_no),
                                      this.frame.add(this.end, panel_no),
                                      this,
                                      events);
                f(panel_no, panel_div);
            }                
        });        
    }
    
    var makePanel = function(count, start, end, env, events) {
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
            var e = new Event();
	    eventMetas.push(e.eventToMeta(events.results[i], frame, columns));
	}
        
        var grid = makeGrid(columns);

	for (var i in eventMetas) {
	    var e = eventMetas[i];
	    e.div.css({width:e.width * columnWidth});
	    buffer.append(e.div);
	    e.height = Math.ceil(e.div.height()/cellHeight);

	    var reservation = makeReservation(grid,
					      e.offset,
                                              0,
					      e.width,
                                              e.height);
	    if (reservation.success) {
		panel.append(e.div.css({
		    marginLeft:(reservation.x * cellWidth) + 'px',
		    marginTop:(reservation.y * cellHeight) + 'px'
		}));
	    }
            else {
                console.log("reservation failed");
            }
	}
	panel.append(divs);
	return panel;
    }

    var Timeline = function(start, end) {
	console.log('Making timeline for',
		    start.format(),
		    ' to ',
		    end.format());
	// Reboot the timeline
        $('#timeline').remove();
        $('body').append($('<div></div>', {id:'timeline'}));
	var timeline = $('#timeline');
        timeline.append(
            $('<div></div>', {id:'-1'}),
            $('<div></div>', {id:'0'}),
            $('<div></div>', {id:'1'}));
                
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
        $('#timeline').append()
	for (var i = 0; i<panels.length;i++) {
            var pos = panels[i];
            loadPanel(env, pos,
                      function(panel_no, panel_div) {
                          $('#'+panel_no).replaceWith(panel_div);
                      }
                     );
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
        var selectable = true;	
	var pos = {}
	
	$('#mousepos').html(statusBar(pos));
	
	// Watch the mouse and when the button is pressed move left to
	// right.

	var touching = false;

        timeline.on('dblclick', function() {
            var newEvent = $('<div></div>',
                             {id:'new-event'})
                .append(
                    $('<input></input>',
                      {name:'datetime',
                       value:GLOBAL.pos.target.format()}),
                    $('<input></input>',
                      {name:'text',
                       value:'XXXXXXX'})
                );
            console.log('DOUBLE CLICKED', GLOBAL.pos.target.format());
            $('body').append(newEvent);
        })
        
	timeline.on('mousedown touchstart', function(e) {
            if ($(e.target).prop("tagName") !== 'SPAN') {
	        touching = true;
                $('div').addClass('noselect');
            }
	});

	timeline.on('mouseup touchend', function(e) {
	    touching = false;
            $('div').removeClass('noselect');
	});
        
	timeline.on('touchend', function(e) {
	    lastDragX = null;
	    lastOffset = offset;	    
	    timeline.css({cursor:'initial'});
	});
        
	timeline.on('mousemove touchmove', function(e){
            if (e.touches !== undefined) {
                console.log(e.touches);
	        pageX = e.touches[0].pageX ;
	        pageY = e.touches[0].pageY ;
            }
            else {
	        pageX = e.pageX;
	        pageY = e.pageY;
            }
            
	    if (touching)  {
		// get percentage of drag
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

            GLOBAL.pos = pos;
	    
	    // reset the delta
	    // dragX = 0;	
	    
	    // update status bar 
//	    $('#mousepos').html(statusBar(pos));

	    // Are we heading left, into the past?
	    if (panels[0] > pos.timelineOffset) {
		panels.pop();
		var prev = panels[0] - 1;
		panels.unshift(prev);
                
                timeline.children().last().remove()
                timeline.prepend($('<div></div>', {id:prev}));

                loadPanel(env, prev, function(panel_no, panel_div) {
                    $('#'+panel_no).replaceWith(panel_div);
                });
            }
	                  
	    // Are we heading right, into the future?
	    else if (panels[2] < pos.timelineOffset) {
		panels.shift();
		var next = panels[1] + 1;
		panels.push(next);
                
                timeline.children().first().remove();                
                timeline.append($('<div></div>', {id:next}));

                loadPanel(env, next, function(panel_no, panel_div) {
                    $('#'+panel_no).replaceWith(panel_div);                    
                });
	    }
	});
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
        };

        /* ############################## */	
        var Notebook = function(url) {
            const max = 200;
            const dec = 10;
            var ctr = max;

	    function makeInsertionTemplate() {
		return {moving:false, from:undefined, to:undefined};
	    }
            
            this.decmin = function() {
                ctr = ctr - dec;
                return ctr;
            }

            var nb = this;
            this.url = url;
            
	    /* Get our DOM objects */
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

            this.needsCreated = this.url ? false : true;
            this.needsUpdated = false;
            this.needsDeleted = false;

	    this.insertion = makeInsertionTemplate();
	    
            this.title = undefined;
            this.items = new Array();
            this.savingItems = new Array();	    
            this.titleEditor = $('<div></div>', {class:'editable'});
            this.medium = new MediumEditor(this.titleEditor, {
                disableReturn: true,
                disableDoubleReturn: false,
                disableExtraSpaces: true,
                targetBlank: true                
            });

	    // This is where we reorder items.
	    this.reorderItems = function(target) {
		var replace = new Array();
		
		var ordered = this.fixOrder(this.insertion);
		
		console.log(ordered);

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
	    
            // every X seconds look through this.items for items that have changed
            this.scanner = function () {
		// THIS NEEDS LOVE AND SHOULDN'T BE AN ARRAY; SHOULD
		// BE HASH BY MD5 MAYBE

                var makePost = function(item) {
                    var event = undefined;
                    var data = {
		        order:item.order,
		        text:item.medium.getContent()
                    };
                    if (item.event && item.event.url) {
                        data['event'] = item.event.url;
                    }
                    if (item.url) {
                        data['url'] = item.url;
                    }
                    if (item.id) {
                        data['id'] = item.id;
                    }                
                    return data;
                }

                var makeDelete = function(item) {
                    var data = {};
                    console.log(item);
                    if (item.id) {
                        data['id'] = item.id;
                    }
                    if (item.url) {
                        data['url'] = item.url;
                    }
                    console.log('DATA IS', data);
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
                    ENDPOINTS.notePost($.map(created, makePost),
                                       created);
		}

		if (updated.length > 0) {
                    ENDPOINTS.notePut($.map(updated, makePost),
                                      updated);
		}

		if (deleted.length > 0) {
                    ENDPOINTS.noteDelete($.map(deleted, makeDelete),
                                      deleted);
		}
	    }
            setInterval(this.scanner, REFRESH_INTERVAL);
        };
        
        var NotebookItem = function(kind, event, note) {
            var creationTime = new Date().getTime();
            var nbitem = this;
            this.event = event;
            
            this.kind = kind ? kind : 'default';
            this.note = note;
            this.url = undefined;
            if (this.note) {
                this.url = this.note.url;
            }
            this.id = undefined;
            if (this.note) {
                this.id = this.note.id;
            }            
	    this.lastPatch = creationTime;
            this.lastRefresh = creationTime;
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
                    return d.html('Notecard');
                }
            }
	    
            this.eventHTML = this.render();
	    
	    if (this.kind == 'spacer') {

            }
	    
            this.editor = $('<div></div>', {class:'editable'});
            if (this.kind == 'spacer') {
                this.editor.html($('<br/><br/>'));
            }
	    else if (event && event.html) {
		this.editor.html(event.html)
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
		    + $(nbitem.textView).position().top - 100;
		
		$('#notebook-essay').animate({
		    scrollTop: scrollTop
		});

	    });
	    this.medium.subscribe('editableInput', function (event, editor) {
                nbitem.changed();              
                nbitem.textView.html(nbitem.medium.getContent());
                nbitem.textView.append(' ');
	    });
        }
    

    
}(jQuery, Cookies, MediumEditor));
