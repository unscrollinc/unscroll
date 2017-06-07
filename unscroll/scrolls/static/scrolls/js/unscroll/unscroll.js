"use strict";

(function($, Cookies, MediumEditor, URL) {

    /* 
       ________________________________________
       ┏━╸╻  ┏━┓┏┓ ┏━┓╻  ┏━┓
       ┃╺┓┃  ┃ ┃┣┻┓┣━┫┃  ┗━┓
       ┗━┛┗━╸┗━┛┗━┛╹ ╹┗━╸┗━┛
    */

    const API = '';
    const AUTH = API + '/auth';
    const GRIDHEIGHT = 10;
    const ACTIVEHEIGHT = 0.95;          
    const REFRESH_INTERVAL = 15000; // milliseconds
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
    const th = function (className, kids) { return elMaker('th', className, kids); };
    const tr = function (className, kids) { return elMaker('tr', className, kids); };
    const td = function (className, kids) { return elMaker('td', className, kids); };
    const i = function (className, value) {
        return $('<input></input>', {value:value,
                                     class:className});
    }        
    const a = function (href, className) {
        if (className) {
            return $('<a></a>', {class:className,
                                 target:'_blank',
                                 href:href});
        }
        else {
            return $('<a></a>',
                     {href:href,
                      target:'_new'});
        }
    }    

    var formatByResolution = function(res, dt) {
	var getRes = function() {
	    switch (res) {
	    case '4':
		return 'YYYY';
	    case '7':
		return 'MMM \'YY'
	    case '10':
		return 'ddd MMM D, YYYY';
	    default:
		return 'ddd MMM D, YYYY';
	    }
	}
	return moment(dt).format(getRes());
    }


    /*
      ╻ ╻┏━┓┏━╸┏━┓┏┓ ╻┏┓╻╺┳┓╻┏┓╻┏━╸┏━┓
      ┃ ┃┗━┓┣╸ ┣┳┛┣┻┓┃┃┗┫ ┃┃┃┃┗┫┃╺┓┗━┓
      ┗━┛┗━┛┗━╸╹┗╸┗━┛╹╹ ╹╺┻┛╹╹ ╹┗━┛┗━┛
    */
    var UserBindings = function(user) {
	var _bindings = this;

	this.user = user;
	this.user.bindings = this;
	this.uxbox = $('#uxbox');
	this.navbox = $('#login');	
	this.data = {};
	
	this.getField = function(o) {
            var _name = o.name;
            var _ruby = o.ruby;
            var _type = o.type;
            var _data = o.data;
            var _wrap = $('<div></div>', {class:'user-form'});
            var _help = undefined;
	    
            if (_ruby) {
		_help = $('<div></div>', {class:'user-form-help ' + _name}).html(_ruby);
            }
	    
            var _input = $('<input></input>',
			   {class:'user-form-input ' + _name,
			    type:_type,
			    value:undefined})
            
            _input.on('input', function(e) {
		_data[_name] = $(this).val();
            });
            
            
            _wrap.append(_help,_input);
            return _wrap;
	}
	
	this.wire = function(_s) {
	    var _d = $('<span></span>',
		       {id:_s,
			class:'user-box wrapper'});
	    _d.html(_s)
		.on('click', function(ev) {
		    _bindings.uxbox.toggle();
		    
		    var el = _bindings[_s].makeEl();
		    _bindings.uxbox.children().detach();
		    _bindings.uxbox.append(el);
		});
	    _bindings[_s].el = _d;
	    _bindings.navbox.append(_d);
	    return d;
	};

	this.shim = function() {
	    _bindings.navbox.append(s('shim').text('//'));

	}
	this.error = function(e, msg) {
	    var notice = '';	    
	    if (e) {
		var k = Object.keys(e);
		for (var i=0;i<k.length;i++) {
		    notice += '<div class="error-def">' + k[i] + ': ' + e[k[i]] + '</div>';
		}
	    }
	    return $('<div></div>', {class:'error'})
		.html('Error: ' + msg + notice + '<p>Click to get rid of this.</p>')
		.on('click', function(e) {
		    _bindings.uxbox.fadeOut();
		    $(this).detach();
		});
	}
	
	this.notice = function(e, msg) {
	    return $('<div></div>', {class:'error'})
		.html('Notice: ' + msg + e)
		.on('click', function(e) {
		    $(this).detach();
		});	    
	}
	this['Username'] = {
	    el:undefined,
	    makeEl:function() {
		return s('username').html('You are: ' + _bindings.user.data.username);
	    }
	}
	
	this['Activate'] = {
	    el:undefined,
	    makeEl:function () {
		return _bindings.notice('', 'Welcome! You\'re activated.');
	    },
	    endpoint:function(data) {
		var url = new Url();
		$.ajax({
	            url:AUTH + '/activate/',
	            type:'POST',
                    data:{uid:data.uid, token:data.token},
	            error:function(e) {
			console.log('Error: ', e.responseJSON);
			_bindings.uxbox.append(_bindings.error('', e.responseJSON.detail));			
			_bindings.data = {};
			_bindings.uxbox.toggle();			
	            },
	            failure:function(e) {
			console.log('Failure: ' + e);
	            },                    
	            success:function(o) {
			console.log(o);
			_bindings['Activate'].el = _bindings['Activate'].makeEl();
			_bindings.uxbox.append(_bindings['Activate'].el);			
			_bindings.uxbox.show();
			_bindings.data = {};

	            }
		});
	    }
	}
	this['Notebook'] = {
	    el:undefined,
	    makeEl:function() {
		return s('action')
		    .html('Notebook')
		    .on('click', function() {
			if ($('#notebook').is(':visible')) {
			    $('#notebook').fadeOut('fast');
			    $(this).removeClass('active');
			}
			else {
			    $('#notebook').fadeIn('fast');
			    $(this).addClass('active');
			    $('#notebook-wrapper').fadeIn('fast');
			    
			}
		    });
	    }
	}
		
	this['Login'] = {
	    el:undefined,
	    makeEl:function() {
		return s('user-box login')
		    .append(
			$('<h3></h3>').html('Login to Unscroll'),
			$('<div></div>').append(
			    _bindings.getField({name:'username',
						ruby:'Your username',
						type:'text',
						data:_bindings.data}),
			    _bindings.getField({name:'password',
						ruby:'Your password',
						type:'password',
						data:_bindings.data}),
			    _bindings.getField({name:'Login',
						type:'submit',
						data:_bindings.data})
				.on('click', function() {
				    _bindings['Login'].endpoint();
				})));
	    },
            endpoint:function(ev) {
		var data = _bindings.data;
		$.ajax({
	            url:AUTH + '/login/',
	            type:'POST',
                    data:{username:data.username,
			  password:data.password},
	            error:function(e) {
			console.log('Failure: ', e.responseJSON);
	            },
	            failure:function(e) {
			console.log('Error: ' + e);
	            },                    
	            success:function(o) {
			$.extend(_bindings.user.data, o);
			_bindings.getProfile();
	            }
		});
            }
	};
        this['Register'] = {
	    el:undefined,	    
	    makeEl:function() {
		return s('user-box register')
		    .append(
			$('<h3></h3>').html('Register'),        
			$('<div></div>').append(
			    d('hello').html('Soon! Not now! But soon.')
			    //_bindings.getField({name:'username', ruby:'Your username', type:'text', data:_bindings.data}),
			    //_bindings.getField({name:'email', ruby:'Your email', type:'text', data:_bindings.data}),
			    //_bindings.getField({name:'password', ruby:'Your password', type:'password', data:_bindings.data}),
			    //_bindings.getField({name:'register', type:'submit', data:_bindings.data})            
				.on('click', function() {
				    //_bindings['Register'].endpoint();
				})))
	    },
	    endpoint:function(ev) {
		var data = _bindings.data;
		$.ajax({
		    url:AUTH + '/register/',
		    type:'POST',
		    data:_bindings.data,
		    error:function(e) {
			console.log('Error: ', e.responseJSON);
			_bindings.uxbox.append(_bindings.error(e.responseJSON, 'Something went wrong: '))
			
		    },
		    failure:function(e) {
			console.log('Failure: ' + e);
	            },                    
	            success:function(o) {
			$.extend(user,o);
			_bindings['Register'].el.detach();
			_bindings.uxbox.children().detach();
			_bindings.uxbox.append(_bindings.notice(e.responseJSON, 'Great, I sent you an email: '));
			console.log(o);
			_bindings.data = {};			
	            }
		});
            }
	},
        this['Logout'] = {
	    el:undefined,
	    makeEl:function() {
		return s('user-box logout')
		    .append(
			s('logout')
			    .html('Logout')
			    .on('click', _bindings['Logout'].endpoint));
	    },
	    endpoint:function(ev) {
		var data = _bindings.data;
		$.ajax({
	            url:AUTH + '/logout/',
	            type:'POST',
                    headers: {
			'Authorization': 'Token ' + user.data.auth_token
                    },            
	            error:function(e) {
			console.log('Failure: ', e.responseJSON);
	            },
	            failure:function(e) {
			console.log('Error: ' + e);
	            },                    
	            success:function(o) {
			_bindings.teardown();
	            }
		});
            }
	},
        this['Recover password'] = {
	    el:function() {
		$('<div></div>', {class:'user-box recover-password'})
		    .append(
			$('<h3></h3>').html('Recover password'),
			_bindings.getField({name:'email', ruby:'Your email', type:'text', data:_bindings.data}),
			$('<div></div>').append(
			    _bindings.getField({name:'logout', type:'submit', data:_bindings.data})            
				.on('click', function() {
				    _bindings['Recover password'].endpoint();				    
				})))
	    },
	    endpoint:function(ev) {
		var data = _bindings.data;
		$.ajax({
	            url:AUTH + '/password/reset/',
		    data:{email:data.email},
	            type:'POST',
                    headers: {
			'Authorization': 'Token ' + user.data.auth_token
                    },            
	            error:function(e) {
			console.log('Failure: ', e.responseJSON);
	            },
	            failure:function(e) {
			console.log('Error: ' + e);
	            },                    
	            success:function(o) {
			console.log(o);
			_bindings.data = {};			
	            }
		});	
	    }
	};

        this.getScrolls = function() {
            $.get({
		url:API + '/scrolls/?user__username=' + _bindings.user.data.username,
		headers: {
                    'Authorization': 'Token ' + _bindings.user.data.auth_token
		},
		failure:function(e) {
                    console.log('Failure: ' + e);
		},
		success:function(o) {
		    _bindings.user.data.scrolls = o.results;
		    var notebooklist = new NotebookList(_bindings.user);
		    $('#notebook-list-button').addClass('active');
                    notebooklist.el.fadeIn('fast');
		}
	    });
	};
	this.teardown = function() {
	    Cookies.remove('session');
	    Cookies.remove('csrftoken');
	    _bindings.navbox.children().detach();
	    _bindings.uxbox.children().detach();
	    _bindings.wire('Register')
	    _bindings.shim();
	    _bindings.wire('Login')	    
	    
	    
	}
	this.buildout = function(o) {
	    $.extend(_bindings.user.data, o);
	    Cookies.set('session', _bindings.user.data);
	    _bindings.navbox.children().detach();
	    _bindings.uxbox.children().detach();

 	    _bindings['Notebook'].el = _bindings['Notebook'].makeEl();
	    _bindings.navbox.append(_bindings['Notebook'].el);
	    _bindings.shim();	    	    
 	    _bindings['Username'].el = _bindings['Username'].makeEl();
	    _bindings.navbox.append(_bindings['Username'].el);
	    _bindings.shim();	    
	    _bindings['Logout'].el = _bindings['Logout'].makeEl();
	    _bindings.navbox.append(_bindings['Logout'].el);
	    
	    _bindings.data = {};
	    
	    _bindings.uxbox.hide();
	    
	};

	this.getProfile = function() {
            $.get({
		url:AUTH+ '/me/',
		headers: {
                    'Authorization': 'Token ' + _bindings.user.data.auth_token
		},
		error:function(e) {
                    console.log('Error: ' + e);
                    _bindings.teardown();
                },
		failure:function(e) {
                    console.log('Failure: ' + e);
                    _bindings.teardown();
                    
		},
		success:function(o) {
		    _bindings.buildout(o);
		    $.extend(_bindings.user.data, o);
		    _bindings.getScrolls();
		}
            });            
        };
	

	
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
	this.bindings = undefined;
        this.data = {};
        this.timeline = undefined;
        this.currentScroll = undefined;
	this.currentNotebook = undefined;
	this.notebook = undefined;
        this.initialize = function() {
            var _session = Cookies.getJSON('session');
            if (_session) {
                $.extend(_user.data, _session);
            }
            this.initializeDOM();
        };
        
        this.initializeDOM = function() {
	    var data = {};
	};

        this.loginDOM = function() {
        };


        
        this.logoutDOM = function() {
        };
	
	this.deleteCookies = function(e) {
	    console.log('Deleting cookies', Cookies.get(), e);
	    Cookies.remove('session');
	    Cookies.remove('csrftoken');
	    Cookies.set('sessionid', undefined, {});
	    console.log('Deleted cookies', Cookies.get(), e);	    

//	    window.location = location.href;
	};

        this.logout = function() {
            _user.data = {};
            _user.logoutDOM();
	    
	    if (_user.data.auth_token) {
		$.post({
		    url:AUTH + '/logout/',
		    headers: {
			'Authorization': 'Token ' + _user.data.auth_token
		    },
		    failure:function(e) {
			console.log('Failure: ' + e);
			_user.deleteCookies(e);
		    },
		    success:function(e) {
			_user.deleteCookies(e);		    
		    }
		});
	    }
	    else {
		_user.deleteCookies('no user key');
	    }
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
	    _search.query.term = encodeURIComponent(qs);
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
                        _search.success('Found '
					+ o.count
					+ ' results from '
					+ moment(o.first_event).year()
					+ ' to '
					+ moment(o.last_event).year());
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
            'seconds':19,
            'minutes':16,
            'hours':13,
            'days':10,
            'months':7,
            'years':4,
            'decades':3,
            'centuries':2,
            'millennia':1
        }
        this.timeline = timeline;
        this.makePeriod = function(text, start, end) {
            var href = '/?start='
		+ start.format()
		+ '&before='
		+ end.format();
	    var link = $('<a></a>', {class:'period nav',
			             href:href})
		.html(text)
		.click(function(e) {
		    e.preventDefault();
	            window.history.replaceState(
		        {},
		        'Unscroll: From X to Y',
		        href);
                   
                    _timeframe.timeline.initialize(start, end, _timeframe.timeline.user);
	        });
	    
	    return s('period', [link]);

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
	    var pointerFocus = start.clone().add(pointerInteger, 'hours');
	    var columns = 6;
	    var target = pointerFocus.clone().add(
		Math.floor( pointerMantissa * columns ),
		'minutes');
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
            if (_timeframe.resolutions[resolution] <= _timeframe.resolutions['days']) {
                return Math.floor(24 * Math.random());
            }
	    else {
		return datetime.date() - 1;
	    }	    
	};
	this.getEventWidth = function(width) {
	    return Math.floor(4 + Math.random() * _timeframe.getColumns()/5);
	};
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var pointerFocus = start.clone().add(pointerInteger, 'days');
	    var columns = 24;
	    var target = pointerFocus.clone().add(
		Math.floor( pointerMantissa * columns ),
		'hours');
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
            if (_timeframe.resolutions[resolution] <= _timeframe.resolutions['months']) {
                return Math.floor(28 * Math.random());
            }
	    else {
		return datetime.date() - 1;
	    }
	};
        
	this.getEventWidth = function(width) {
	    return Math.floor(5 + Math.random() * 3);
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
	    return 1;
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
	    var begin = moment((divisor * Math.floor(year))+'-01-01');
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
            return 1;
	};	    	    
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var columns = 10;
	    var years = 10;
	    var target = moment(start).add((years * pointerInteger) + Math.floor( pointerMantissa * years ), 'years');
	    
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
	    return Math.floor((datetime.year() - (100 * Math.floor(datetime.year()/100)))/10);
	};

        this.getEventWidth = function(width) {
	    return Math.round(1, Math.random());
	};

	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var columns = 10;
	    var years = 100;
	    var target = moment(start).add((years * pointerInteger) + (10 * Math.floor(pointerMantissa * years / 10)), 'years');
		// 
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
	    return Math.floor((datetime.year() - (1000 * Math.floor(datetime.year()/1000)))/100);            
	};
	this.getEventWidth = function(width) {
	    return 1;
	};
	this.getTarget = function(start, pointerInteger, pointerMantissa) {
	    var columns = 10;
	    var years = 1000;
	    var target = moment(start).add((years * pointerInteger) + (100 * Math.floor(pointerMantissa * years / 100)), 'years');
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
        this.columns = undefined;
        this.buffer = $('#buffer');
        this.cellWidth = undefined;
        this.cellHeight = undefined;
        this.columnWidth = undefined;
        this.listView = undefined;
	
        this.initialize = function() {
            // kick off server calls
            _panel.load();
            _panel.columns = _panel.timeline.timeframe.getColumns(_panel.start);
	    _panel.columnWidth = 100/_panel.columns;
	    _panel.cellWidth = 100/_panel.columns;
	    _panel.cellHeight = 100/GRIDHEIGHT * ACTIVEHEIGHT;
            _panel.grid = _panel.makeGrid();
            _panel.initializeDOM();
        }

        this.makeColumnsHTML = function() {
            var columns = new Array();
            for (var i=0;i<_panel.columns;i++) {
                var first = i==0 ? ' first' : '';
	        var columnData = _panel.timeline.timeframe.columnStepper(i, _panel.start);

                var f = function(ev) {
		    ev.preventDefault();
                    _panel.timeline.initialize(this.start, this.end, _panel.timeline.user);  
                }
                
	        var column = d('column nav'  + first)
	            .css({width:_panel.columnWidth + '%',
		          left:_panel.columnWidth * i + '%'})
	            .append(
		        $('<a></a>', {class:'head',
			              href:'/?start='
			              + columnData.start.format()
			              + '&before='
			              + columnData.end.format()
			             })
		            .html(columnData.text)
		            .on('click', f.bind(columnData)));
                columns.push(column);
            }
            return columns;
        }

        this.newEvent = function(ev) {
            var e = new Event({}, _panel);
	    $('#editor-event-wrapper').empty();
            e.editor();
        }
        
        this.initializeDOM = function() {
            _panel.el.css({marginLeft:(100 * (_panel.offset + 1)) + '%'});
            var h = _panel.makeColumnsHTML();
            var period = _panel.timeline.timeframe.getPeriod(_panel.start);
            _panel.el.append(period, h);

	    var timelineburger = '&#9776;';
	    var tableburger = '&#9783;';	    
	    var flipper = false;
	    var list = d('as-list').html(timelineburger)
		.on('click', function(ev) {
		    var t = $(this);
		    if (flipper) {
			t.html(timelineburger);
			_panel.listView.fadeOut();
		    }
		    else {
			t.html(tableburger);
			_panel.asList();
		    }
		    flipper = !flipper;
		});
	    
	    _panel.el.prepend(list);
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

	this.asList = function() {
	    if (_panel.response) {
		var es = _panel.response.results;
		es.sort(function(a,b) {return moment(a.datetime) - moment(b.datetime);})
		var trs = new Array();
		for (var i = 0; i<es.length;i++) {
		    let e = es[i];
		    var thumb = undefined;
		    if (e.thumb_image) {
			thumb = $('<img></img>', {class:'thumb',
						  style:'height:'+e.thumb_height+';width:'+e.thumb_width,
						  src:e.thumb_image})
		    }
		    var clicker = s('button')
			.html('+Note')
			.on('click', function(ev) {
			    var notebook = _panel.timeline.user.currentNotebook;
			    notebook.makeItem('default', e, undefined);		
			})

		    var el = tr('panel-list',
				[   td('panel-datetime').html(moment(e.datetime).format('M/D/YY')).append(clicker),
				    td('panel-title').html(a(e.content_url, 'panel-title').html(e.title)),
				    td('panel-text').html(e.text),
				    td('panel-creator').html(e.username),
				    td('panel-scroll').html(e.scroll_title),
				    td('panel-thumb').append(thumb)
				])
		    trs.push(el);
		}
	    }
	    _panel.asListDOM(trs);
	}

	this.asListDOM  = function(trs) {
	    var _th = tr('panel-list',
			[
			    th('panel-header datetime').text('Date'),
			    th('panel-header title').text('Title'),
			    th('panel-header text').text('Text'),
			    th('panel-header creator').text('Creator'),
			    th('panel-header scroll').text('Scroll'),
			    th('panel-header thumb').text('Thumb')
			]);
	    var l = d('panel-list').append($('<table></table>').append(_th, trs));
	    _panel.listView = l;
	    l.hide();
	    _panel.el.append(l);
	    l.fadeIn();
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
	    var window_height = $(window).height();
	    _panel.grid = _panel.makeGrid();
	    _panel.buffer.empty();
	    _panel.el.find('.event').remove();
	    
            var es = $.map(_panel.response.results, function(event) {
                return new Event(event, _panel);
            });

	    $.each(es, function(i, e) {
                var el = e.el;
                e.width = _panel.timeline.timeframe.getEventWidth(el.width());
                e.offset = _panel.timeline.timeframe.getOffset(e.datetime, e.data.resolution);
	        _panel.buffer.append(el);
	        el.css({width:e.width * _panel.columnWidth + '%'});

		e.height = Math.ceil(el.height()/window_height * GRIDHEIGHT)
	        var reservation = _panel.makeReservation(e.offset, 0, e.width, e.height);
	        if (reservation.success) {
		    //console.log({reservation:reservation.success, width: e.width, height:e.height,  offset:e.offset});
		    e.el.hide();
		    e.el.css({
		        marginLeft:(reservation.x * _panel.cellWidth) + '%',
		        marginTop:(reservation.y * _panel.cellHeight) + '%'})		    
		    _panel.el.append(e.el);
		    e.el.fadeIn();
	        }
                else {
                    console.log("reservation failed");
                }
	    });
                
            _panel.el.append(es);
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
	this.editorEl = undefined;
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
            var editButton = undefined;
            var deleteButton = undefined;
	    var noteButton = undefined;
	    if (_event.user.username == _d.username) {
                editButton = a('', 'button')
                    .html('+Edit')
                    .on('click', _event.editor);
                deleteButton = a('', 'button')
                    .html('-Delete')
                    .on('click', _event.delete);
		noteButton = a('', 'button')
		    .html('+Note')
		    .on('click', _event.makeNote)
            }
	    
            var thumb = undefined;
            if (_d.thumb_image) {
                thumb = $('<img></img>', {class:'thumb',
                                  style:'height:'+_d.thumb_height+';width:'+_d.thumb_width,
                                  src:_d.thumb_image})
            }

	    var title = undefined;
	    if (_d.content_url) {
		title = d('title').append(a(_d.content_url, 'title').html(_d.title));
	    }
	    else {
		title = d('title').html(_d.title);
	    }
	    
            _event.el.append(
	        d('inner').append(
                    d('datetime').html(formatByResolution(_d.resolution, _d.datetime)),
		    a(_event.data.content_url, 'title').append(thumb),
		    title,
                    // d('text').html(_d.text),
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
		    'Authorization': 'Token ' + _event.user.auth_token
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
		var vals = {class:name,
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
			.addClass(name)
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
                
		return d('field ' + name)
		    .append(
                        d('field-title').append(title),
			d('field-input').append(editor));
            }
            
	    var scrollTitle = undefined;
            var scrollUrl = undefined;
            
            if (exists) {
	        scrollUrl = _event.data.scroll;
                scrollTitle = _event.data.scroll_title;
            }
            else {
                if (_event.panel.timeline.user.currentScroll) {
                    scrollUrl = _event.panel.timeline.user.currentScroll.url;
                    scrollTitle = _event.panel.timeline.user.currentScroll.title;
                }
            }
            var newEvent = undefined;
	    if (scrollUrl) {
		_event.patch['scroll'] = scrollUrl

                var saveTop = s('event-save')
                    .html('Save')
                    .on('click', saveFunction);
                var saveBottom = s('event-save')
                    .html('Save')
                    .on('click', saveFunction);                
                var cancel = s('event-cancel')
                    .html('Cancel')
                    .on('click', function(ev) {
                        $('#event-editor-wrapper').empty().hide();
                    });
                
	        newEvent =
		    $('#event-editor-wrapper')
                    .empty()
                    .fadeIn('fast')
                    .append(
		        d('editable-event').append(
			    $('<div></div>').append(
                                d('scroll-title').html('Create a new event in: <br/><i>' + scrollTitle + '</i>')
                                    .append(d('event-buttons')
                                            .append(saveTop, cancel)),
			        makeInput('datetime', 'Date/time (required)',
                                          false, _event.panel.timeline.pos.target.format()),
			        makeInput('title', 'Event title (required)', true),
			        makeInput('text', 'Event description', true),
			        makeInput('content_url', 'Link', false, ''),
                                d('formset').append(
			            makeInput('resolution', 'Resolution', false,
                                              _event.panel.timeline.timeframe.resolution),
			            makeInput('media_type', 'Media Type', false, 'text/html'),
			            makeInput('content_type', 'Content Type', false, 'event')),
			        makeInput('source_date', 'Source Name'),
			        makeInput('source_url', 'Source Link'),
                                saveBottom)));
            }
            else {
		var warning = d('modal warning').append(
		    d('header').html('You need to select or create a Scroll first'),
		    d('explanation').html('You double-clicked, which lets you add events to the timeline. But&mdash;you need to put events somewhere so you can find them later. You need to add them <i>to a scroll</i>. You make a scroll by going to Notebook and clicking "+ Scroll," or by clicking List Scrolls and picking one from a list.'));
		    
		var ok = s('modal-button nodelete')
		    .html('Got it')
		    .on('click', function(ev) {
			warning.remove();
		    });
                
		var newScroll = s('modal-button nodelete')
		    .html('Make new scroll')
		    .on('click', function(ev) {
                        console.log(_event.panel.timeline.user);
                        if (!_event.panel.timeline.user.currentNotebook) {
                            var _notebook = new Notebook(undefined, _event.panel.timeline.user);
                            _notebook.create();                                                
                        }
                        else {
                            _event.panel.timeline.user.currentNotebook.create();
                        }
			$('#notebook').fadeIn('fast');                            
			warning.remove();
		    });                    
                
		warning.append(ok, newScroll);
		$('body').append(warning);
                _event.editorEl = warning;
            }
            
	    return newEvent;
        };

        this.editor = function(ev) {
            var exists = false;
            if (ev) {
                ev.preventDefault();
                exists = true;
            }
	    _event.editorEl = _event.makeEditor(exists);
	    $('body').append(_event.editorEl);
        }

        this.editorDOM = function(el) {
	    $('#notebook-event').show().empty().append(el);
        }
// ***
	this.editorPostSaveDOM = function() {
            _event.editorEl.fadeOut('fast').empty();
            var results = new Array();
            results.push(_event.data);
            var old = _event.panel.response.results;
            console.log(old, _event.data);
            for (var i=0;i<old.length;i++) {
                if (old[i].data.url !== _event.data.url) {
                    results.push(old[i]);
                }
            }
            _event.panel.response.results = results;            
            _event.panel.render();
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
		        'Authorization': 'Token ' + _event.panel.timeline.user.data.auth_token
		    },
		    failure:function(e) {
		        console.log('Failure: ' + e);
		    },
		    success:function(o) {
                        $.extend(_event.data, o);
                        _event.patch = {};
			_event.editorPostSaveDOM();
		    }
                });
            }
            else {
		_event.editorPostSaveDOM();                
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
		        'Authorization': 'Token ' + _event.panel.timeline.user.data.auth_token
		    },
		    failure:function(e) {
		        console.log('Failure: ' + e);
		    },
		    success:function(o) {
                        $.extend(_event.data, o);
                        _event.patch = {};
			_event.editorPostSaveDOM();
		    }
                });
            }
            else {
		_event.editorPostSaveDOM();                                
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
        
        this.gridHeight = 7;
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
            _timeline.el.css({marginLeft:'-100%'});
            var tf = _timeline.getTimeFrame(_start, _end);
	    if (!tf) {
		tf = new MonthsTimeFrame(_timeline);
	    }
	    _timeline.timeframe = tf;	    
	    _timeline.start = _timeline.timeframe.adjust(_start);
	    _timeline.end = _timeline.timeframe.add(moment(_timeline.start), 1);
            _timeline.panels = new Array();
            _timeline.initializeDOM();

        };

	this.resize = function() {
	    _timeline.window = {
	        width:$(window).width(),
	        height:$(window).height()
            };
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
                // *** 
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
	this.user = user;
	this.user.currentScroll = scroll;
        this.user.currentNotebook = this;
	this.patch = {};
	this.saveButton = undefined;

	this.items = new Array();
	this.itemsEl = undefined;
	this.essayEl = undefined;

        this.needsCreated = scroll ? false : true;
        this.needsUpdated = false;
        this.needsDeleted = false;

        this.networkOperationInProgress = false;

        
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
	    console.log('MOVESTATS', _notebook.moveStatus);
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

		var multiplier = (reorderEnd - reorderBegin)/(splice.length + 1);

		$.each(_notebook.items, function(i, e) {
		    if (i >=from && i <= to) {
			//do nothing; this is the splice
		    }
		    else if (i == target) {
			$.each(splice, function(j, f) {
			    f.needsUpdated = true;
			    f.data.order = reorderBegin + ((j + 1) * multiplier);
			    f.patch['order'] = f.data.order;
//			    console.log('----------------------------------------', f.data, f.data.order);
			    newItems.push(f);
			    f.editized.formView.insertBefore(itemsKids[i]);
			    f.editized.essayView.insertBefore(essayKids[i]);			    
			});
			newItems.push(e);			
		    }
		    else {
//			console.log(e.data, e.data.order);			
			newItems.push(e);
		    }
		});
	    }
	    $.each(newItems, function(i, e) {
		console.log(e.data.order);
		if (i==0) {
		    console.log(e.data.text, e.data.order - 0);		    
		} else
		{
		    console.log(e.data.order - newItems[i - 1].data.order);
		}
	    });
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
		console.log('XXXXX', e, _notebook.moveStatus.fromNote);
		
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
            var noteType = o.noteType;
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
            if (data[fieldName] == undefined && noteType == 'spacer') {
                data[fieldName] = '<br/><br/>';
            }
            
            if (isRichText) {
                el = d('field-input scroll-'
                       + fieldName
                       + ' '
                       + fieldName
                       + ' '
                       + noteType)
                    .html(data[fieldName]);

		var display = data[fieldName];
		if (!display) {
		    display='';
		}

                essayChild.html(display + ' ');

		el.on('keyup',function(ev) {
		    if (ev.keyCode==13) {
			if (caller.notebook) {
			    caller.notebook.makeItem('default', undefined, undefined, caller);
			}
		    };
		});
		el.on('blur', function() {
		    essayChild.removeClass('active');
		});
		el.on('focus', function() {
		    essayChild.addClass('active');
		})		
		var medium = new MediumEditor(el, {disableReturn: true});
		
		medium.subscribe('editableInput', function (event, editor) {
		    // this is balky but figure out if it's a notebook
		    // or a notebookitem
		    var nb = caller.notebook ? caller.notebook : caller;
		    nb.saveButton.removeClass('saved');
                    caller.needsUpdated = true;
		    data[fieldName] = medium.getContent();
		    patch[fieldName] = medium.getContent();		    
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
			    _notebook.saveButton.removeClass('saved');
			    _notebook.moveStatus.fromNote.el = caller;
			    _notebook.setRange();
			}),

		    s('button range').text('Range')
			.on('click', function(ev) {
			    _notebook.saveButton.removeClass('saved');			    			    
			    _notebook.moveStatus.throughNote.el = caller;
			    _notebook.setRange();			    
			}),

		    s('button drop').text('Drop')
			.on('click', function(ev) {
			    _notebook.saveButton.removeClass('saved');			    			    
			    _notebook.moveStatus.toBeforeNote.el = caller;
			    _notebook.rearrange();   
			}),
		    
		    s('button delete').text('Delete')
			.on('click', function(ev) {
			    _notebook.saveButton.removeClass('saved');			    			    
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
                    d('datetime').html(formatByResolution(_d.resolution, _d.datetime)),		    
                    thumb,                    
                    a(_d.content_url, 'event-link').append(
                        d('event-title').html(_d.title),
                    ),
                    d('event-text').html(_d.text),
                ]);
            }            

	    var fieldTitle = d('field-title').html(fieldTitle)
	    fieldTitle.append(buttons, eventEl);
	    formField.append(
		fieldTitle,
		el);
            
	    return {
		formView: formField,
		essayView: essayChild
	    };
	};
	

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

        this.makeItem = function(kind, event, note, insertAfterItem) {
            var item = new NotebookItem(kind, event, note, _notebook);

	    var text = note ? note.text : '';
            if (kind=='spacer') {
	        item.editized = editize({
                    noteType:kind,
                    fieldName:'text',
		    fieldTitle:'Vertical space',
		    isRichText:true,
		    isNote:true,
		    caller:item});
            }            
            else if (item.event) {
	        item.editized = editize({
                    noteType:kind,
                    fieldName:'text',
		    fieldTitle:'Event',
		    isRichText:true,
		    isNote:true,
		    caller:item});
            }
            else {
	        item.editized = editize(
                    {noteType:kind,
                     fieldName:'text',
		     fieldTitle:'Note',
		     isRichText:true,
		     isNote:true,
		     caller:item});                
            }

	    if (insertAfterItem) {
		var reorder = new Array();
		var lastOrder = undefined;
		for (var i=0; i<_notebook.items.length; i++) {
		    reorder.push(_notebook.items[i]);		    
		    if (_notebook.items[i] == insertAfterItem) {
			reorder.push(item);
			item.editized.formView.insertAfter(_notebook.items[i].editized.formView);
			item.editized.essayView.insertAfter(_notebook.items[i].editized.essayView);			
		    }
		    var lastOrder = item.data.order;
		}
		_notebook.items = reorder;
	    }
	    else if (!item.data.order) {
		item.data.order = this.decmin();
		// Add to actual array
		_notebook.items.unshift(item);

		// Add to edit notebook
		_notebook.itemsEl.prepend(item.editized.formView);
		
		// Add to essay notebook
		_notebook.essayEl.prepend(item.editized.essayView);	    
	    }
	    else {
		// We're loading itmes. add them.
		// Add to actual array
		_notebook.items.push(item);

		// Add to edit notebook
		_notebook.itemsEl.append(item.editized.formView);
		
		// Add to essay notebook
		_notebook.essayEl.append(item.editized.essayView);
	    }
	    return item;
	}
	
        
	this.initializeDOM = function() {
	    _notebook.itemsEl = $('#notebook-items');
	    _notebook.essayEl = $('#notebook-essay');
            

            $('#note-space-create-button')
                .off()
		.on('click', function(ev) {
                    ev.preventDefault();
		    console.log('Clicked on spacer button');
                    _notebook.makeItem('spacer');
		});

            $('#note-default-create-button')
                .off()
		.on('click', function(ev) {
                    ev.preventDefault();
		    console.log('Clicked on default create button');
                    _notebook.makeItem('default', undefined, undefined);
		});
    
	
            $('#note-media-create-button')
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
	    var saveButton = s('button save saved');
	    _notebook.saveButton = saveButton;
	    saveButton
		.html('Save')
		.on('click', function(ev) {
		    _notebook.notebookScanner();
		    _notebook.noteScanner();
		    _notebook.saveButton.addClass('saved');
		});
	    
	    var deleteButton = s('button delete');
	    deleteButton.html('Delete Scroll')
		.on('click', function(ev) {
		    var warning = d('modal warning').append(
			d('header').html('Really delete?'),
			d('explanation').html('Do you really want to delete this scroll? That will be the end of the scroll. All of the events will become disconnected and the notes will be lost. There is no going back or backup right now. I\'m sorry, but that is how it is.'));
		    
		    var yesDelete = s('modal-button delete')
			.html('Yes, delete forever')
			.on('click', function(ev) {
			    _notebook.delete();
			    warning.remove();
                            _notebook.user.bindings.getScrolls();
			});		    
		    
		    var noDelete = s('modal-button nodelete')
			.html('No, don\'t delete')
			.on('click', function(ev) {
			    warning.remove();
			});

		    warning.append(noDelete, yesDelete);

		    $('body').append(warning);
		});

	    var title = editize({
		fieldName:'title',
		fieldTitle:'Scroll title',
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
	    var author = d('essay-author').html('By ' + _notebook.user.data.username);
            $('#notebook-items').empty();
	    $('#notebook-essay').empty();            
	    var controls = d('notebook-controls').append(saveButton, deleteButton);
	    $('#scroll-header')
                .empty()
                .append(controls,
			title.formView,
			subtitle.formView,
			description.formView);
	    
	    $('#scroll-header-essay')
                .empty()
                .append(title.essayView, subtitle.essayView, description.essayView, author);

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
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
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
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
                },
                failure:function(e) {
		    console.log('Failure: ' + e);
                },
                success:function(o) {
		    $.extend(_notebook.data, o);
                    _notebook.user.bindings.getScrolls();
		    _notebook.editor();
                }
	    });
        }

        this.delete = function(ev) {
	    $.ajax({
		url:_notebook.data.url,
		type: 'DELETE',
		headers: {
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
		},
		failure:function(e) {
		    console.log('Failure: ' + e);
		},
		success:function(o) {
		    _notebook.user.bindings.getScrolls();		    
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
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
                },
                failure:function(e) {
		    console.log('Failure: ' + e);
                },
                success:function(o) {
		    $.each(o, function(i, item) {
			if (i==0) {
			    ctr = item.order;
			}
			// console.log(item, item.order);
			_notebook.makeItem(item.kind, item.event_full, item);
		    });
		    /*
		    // TODO right now I'm checking re-ordering here. There has to be a better way.
		    var lastOrder = undefined;
		    for (var i=o.length - 1;i>=0;i--) {
                        var nbItem = o[i];
			var order = nbItem.order;
//			console.log('Order', order, 'last', lastOrder, nbItem.text);
			if (order <= lastOrder) {
			    nbItem.order = lastOrder - 100;
			}
                        var itemInContext = _notebook.makeItem(nbItem.kind, nbItem.event_full, nbItem);
			if (order <= lastOrder) {
			    itemInContext.needsUpdated = true;
			}
			var lastOrder = nbItem.order;			
		    }
		    */
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
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
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
        
	this.notesPatch = function(data, items) {
	    $.ajax({
                url:API + '/notes/',
                type: 'PATCH',
                contentType: 'application/json',
                dataType: 'json',
		data:JSON.stringify(data),
                context:items,
                headers: {
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
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
	this.notesPut = function(data, items) {
	    $.ajax({
                url:API + '/notes/',
                type: 'PUT',
                contentType: 'application/json',
                dataType: 'json',
		data:JSON.stringify(data),
                context:items,
                headers: {
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
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
			'Authorization': 'Token ' + _notebook.user.data.auth_token
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
		    'Authorization': 'Token ' + _notebook.user.data.auth_token
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

		//TODO THIS COULD LEAD TO TOP HALF OF DOC GETTING
		//SAVED WHILE NOTES NOTE GETTING SAVED
		
		_notebook.saveButton.addClass('saved');
            }  
	};
        setInterval(this.notebookScanner, REFRESH_INTERVAL);	

	this.noteScanner = function() {
	    var lastOrder = undefined;	    
	    for (var i=0; i<_notebook.items.length; i++) {
		if (lastOrder && lastOrder >= _notebook.items[i].data.order) {
		    console.log(lastOrder, _notebook.items[i].data.order);
		    _notebook.items[i].data.order = lastOrder + 100;
		    _notebook.items[i].patch['order'] = _notebook.items[i].data.order;
		    _notebook.items[i].needsUpdated = true;
		}
		lastOrder = _notebook.items[i].data.order;		
	    }
	    

	    
	    var toCreate = $.grep(_notebook.items, function(e) {return e.needsCreated;});
	    if (toCreate.length > 0) {
		var posts = $.map(toCreate, function(e) {
		    return $.extend(e.data, {scroll:_notebook.data.url});
		});
                console.log(toCreate);
                _notebook.notesPost(posts, toCreate);
	    }

/*
	    var toPut = $.grep(_notebook.items, function(e) {
		return (e.needsUpdated && !e.needsCreated);
	    });
	    
	    if (toPut.length > 0) {
		var puts = $.map(toPut, function(e) {
		    return $.extend(e.data, {scroll:_notebook.data.url});		    
		});
                _notebook.notesPut(puts, toPut);
	    }
*/
	    var toPatch = $.grep(_notebook.items, function(e) {
		return (e.needsUpdated && !e.needsCreated);
	    });
	    
	    if (toPatch.length > 0) {
		var patches = $.map(toPatch, function(e) {
		    return $.extend(e.patch,
				    {id:e.data.id,
				     scroll:_notebook.data.url});		    
		});
                _notebook.notesPatch(patches, toPatch);
	    }	    
	    
	    var toDelete = $.grep(_notebook.items, function(e) {
		return (e.needsDeleted && !e.needsCreated && !e.Updated);		
	    });
	    if (toDelete.length > 0) {
		_notebook.notesDelete(toDelete);
	    }

	    //TODO THIS COULD LEAD TO TOP HALF OF DOC GETTING SAVED WHILE NOTES NOTE GETTING SAVED
	    _notebook.saveButton.addClass('saved');	    

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
	this.notebook = notebook;
        this.kind = kind ? kind : 'default';
        if (note && note.kind) {
            this.kind = note.kind;
        }
        this.event = event;
        var event_url = this.event ? this.event.url : undefined;
        this.data = $.extend(note, {kind:kind, event:event_url});
	this.patch = {};
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
	    _notebooklist.scrolls =
		$.map(user.data.scrolls,
		      function(s) {
			  return new NotebookListItem(s, _notebooklist);
		      });
	    var els = $.map(_notebooklist.scrolls, function(s) {return s.el});
	    _notebooklist.initializeDOM(els);
	};
	
	this.initializeDOM = function(scrolls) {
	    _notebooklist.el.empty();
            _notebooklist.el.append($('<table></table>')
                                    .append(
                                        tr('notebook-list-item header')
                                            .append(
                                                th('when').text('Created'),
                                                th('when').text('Changed'),						
                                                th('title').text('Title'),
                                                th('username').text('Creator'),
                                                th('public').text('Public?')),
                                        scrolls));
	    $('#notebook-list-button')
		.off()
		.on('click', function (ev) {
		    if (_notebooklist.el.is(':visible')) {
			_notebooklist.el.fadeOut('fast');
			$(this).removeClass('active');
		    }
		    else {
			_notebooklist.el.fadeIn('fast');
			$(this).addClass('active');			
		    }

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
		    td('notebook-list-modified').text(moment(_notebooklistitem.data.last_modified).fromNow()),		    
		    td('notebook-list-title').html(_notebooklistitem.data.title),
		    td('notebook-list-username').html(_notebooklistitem.user.data.username),                    
		    td('notebook-list-public').text(_notebooklistitem.data.public ? 'Public' : 'Private'));
	    line.on('click', function(ev) {
		var notebook = new Notebook(_notebooklistitem.data, _notebooklistitem.user);
		_notebooklistitem.user.currentNotebook = notebook;
                _notebooklistitem.notebooklist.el.hide();
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
	var _url = new Url;

        // Who am I?
        var _user = new User();
	
	var _b = new UserBindings(_user);

	if (_url.query.activate=='true') {
	    _b['Activate'].endpoint(_url.query);
	}

	if (_user.data.auth_token) {
	    _b.getProfile();
        }
	else {
	    _b.wire('Register');
	    _b.shim();
	    _b.wire('Login');
	}
	
	$('#scroll-create-button')
	    .on('click', function(ev) {
                console.log(ev);
                var _notebook = new Notebook(undefined, _user);
            });

        
        // What should the timeline show?
	var end = moment();
	var start = end.clone().subtract(1, 'month');

	var timeline = new Timeline(start, end, _user);
	var search = new Search(timeline, _user);
	
	$(window).resize(function(ev) {
	     timeline.resize();
	})
        // Escape key triggers Notebook
        $(document).keyup(function(e) {
            if (_user.data.username) {            
                if (e.keyCode === 27) $('#notebook-wrapper').toggle();
            }
        });
    });

    
}(jQuery,
  Cookies,
  MediumEditor,
  URL));
