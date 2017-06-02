
$(document).ready(function() {
    var user = {auth_token:undefined};

    const AUTH = 'http://127.0.0.1:8000/auth';
    
    function field(o) {
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

    var data = {};

    var endpoints = {
        login:function(ev) {
            var data = this;
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
                    $('#uxbox').children().detach();
                    enclick('logout');
	        }
            });
        },
        register:function(ev) {
            var data = this;
	    $.ajax({
	        url:AUTH + '/register/',
	        type:'POST',
                data:data,
	        error:function(e) {
		    console.log('Failure: ', e.responseJSON);
	        },
	        failure:function(e) {
		    console.log('Error: ' + e);
	        },                    
	        success:function(o) {
                    $.extend(user,o);
                    console.log(o);
	        }
            });
        },
        logout:function(ev) {
            var data = this;
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
                    console.log(o);
	        }
            });
        }
    }

    var els = {
        login:$('<div></div>', {class:'user-box login'})
            .append(
                $('<h3></h3>').html('Login'),
                $('<div></div>').append(
                    field({name:'username', ruby:'Your username', type:'text', data:data}),
                    field({name:'password', ruby:'Your password', type:'password', data:data}),
                    field({name:'submit', type:'submit', data:data})
                        .on('click', endpoints.login.bind(data)))),
        register:$('<div></div>', {class:'user-box register'})
            .append(
                $('<h3></h3>').html('Register'),        
                $('<div></div>').append(
                    field({name:'username', ruby:'Your username', type:'text', data:data}),
                    field({name:'email', ruby:'Your email', type:'text', data:data}),
                    field({name:'password', ruby:'Your password', type:'password', data:data}),
                    field({name:'register', type:'submit', data:data})            
                        .on('click', endpoints.register.bind(data)))),
        logout:$('<div></div>', {class:'user-box logout'})        
            .append(
                $('<h3></h3>').html('Logout'),        
                $('<div></div>').append(
                    field({name:'logout', type:'submit', data:data})            
                        .on('click', endpoints.logout.bind(data))))
    };
    
    var _ux = $('#uxbox');
    
    var wire = function(_s) {
        $('#'+_s).on('click', function(ev) {
            _ux.children().detach();
            _ux.append(els[_s]);
        });
    };

    var enclick = function(_s) {
        $('#'+_s).on('click', endpoints[_s].bind(data));
    }


    wire('login');
    wire('register');    
 
});
