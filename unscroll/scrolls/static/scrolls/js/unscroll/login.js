$(document).ready(function() {
    var user = {auth_token:undefined};

    const AUTH = 'http://127.0.0.1:8000/auth';

    var UserBindings = function() {
	var _bindings = this;

	this.uxbox = $('#uxbox');
	this.navbox = $('#navbox');	
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
		console.log(_data);
            });
            
        
            _wrap.append(_help,_input);
            return _wrap;
	}
	
	this.wire = function(_s) {
	    console.log(_s, _nav);
	    var _d = $('<div></div>',
		       {id:_s,
			class:'user-box wrapper'});
	    _d
		.html(_s)
		.on('click', function(ev) {
		    var el = _bindings[_s].makeEl();
		    _ux.children().detach();
		    _ux.append(el);
		});
	    _bindings[_s].el = _d;
	    _nav.append(_d);
	};
	
	this.error = function(e, msg) {
	    var notice = '';	    
	    if (e) {
		var k = Object.keys(e);
		for (var i=0;i<k.length;i++) {
		    notice += '<div class="error-def">' + k[i] + ': ' + e[k[i]] + '</div>';
		}
	    }
	    return $('<div></div>', {class:'error'})
		.html('Error: ' + msg + notice)
		.on('click', function(e) {
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
	
	this['Login'] = {
	    el:undefined,
	    makeEl:function() {
		return $('<div></div>', {class:'user-box login'})
		    .append(
			$('<h3></h3>').html('Login'),
			$('<div></div>').append(
			    _bindings.getField({name:'username', ruby:'Your username', type:'text', data:_bindings.data}),
			    _bindings.getField({name:'password', ruby:'Your password', type:'password', data:_bindings.data}),
			    _bindings.getField({name:'submit', type:'submit', data:_bindings.data})
				.on('click', function() {
				    _bindings['Login'].endpoint();
				})));
	    },
            endpoint:function(ev) {
		var data = _bindings.data;
		$.ajax({
	            url:AUTH + '/login/',
	            type:'POST',
                    data:{username:data.username, password:data.password},
	            error:function(e) {
			console.log('Failure: ', e.responseJSON);
	            },
	            failure:function(e) {
			console.log('Error: ' + e);
	            },                    
	            success:function(o) {
			$.extend(user,o);
			Cookies.set('session', user);                
			_bindings.uxbox.children().detach();
			_bindings['Login'].el.detach();
			_bindings['Register'].el.detach();
			_bindings['Logout'].el = _bindings['Logout'].makeEl();
			_bindings.navbox.append(_bindings['Logout'].el);
			_bindings.data = {};
			
	            }
		});
            }
	};
        this['Register'] = {
	    el:undefined,	    
	    makeEl:function() {
		return $('<div></div>', {class:'user-box register'})
		    .append(
			$('<h3></h3>').html('Register'),        
			$('<div></div>').append(
			    _bindings.getField({name:'username', ruby:'Your username', type:'text', data:_bindings.data}),
			    _bindings.getField({name:'email', ruby:'Your email', type:'text', data:_bindings.data}),
			    _bindings.getField({name:'password', ruby:'Your password', type:'password', data:_bindings.data}),
			    _bindings.getField({name:'register', type:'submit', data:_bindings.data})            
				.on('click', function() {
				    _bindings['Register'].endpoint();
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
		return $('<div></div>', {class:'user-box logout'})   
		    .append(
			$('<span></span>')
			    .html('Logout')
			    .on('click', _bindings['Logout'].endpoint));
	    },
	    endpoint:function(ev) {
		var data = _bindings.data;
		$.ajax({
	            url:AUTH + '/logout/',
	            type:'POST',
                    headers: {
			'Authorization': 'Token ' + user.auth_token
                    },            
	            error:function(e) {
			console.log('Failure: ', e.responseJSON);
	            },
	            failure:function(e) {
			console.log('Error: ' + e);
	            },                    
	            success:function(o) {
			Cookies.remove('session');
			Cookies.remove('csrftoken');
			_bindings['Logout'].el.detach();
			$('#navbox').append(_bindings['Login'].el);
			$('#navbox').append(_bindings['Register'].el);			
			console.log(o);
			_bindings.data = {};			
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
			'Authorization': 'Token ' + user.auth_token
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
	}
    }
    
    var _ux = $('#uxbox');
    var _nav = $('#navbox');
    var _b = new UserBindings();
    _b.wire('Login');
    _b.wire('Register');
    
    _nav.css({position:'fixed', top:'0px', left:'75%'});
    _ux.css({position:'fixed', top:'55px', left:'75%'});    
    


 
});
