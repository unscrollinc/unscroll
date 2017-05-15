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
            }
        });
        GLOBAL.logout();
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
    'scrollGet':function(uuid, notenook) {
	if (GLOBAL.user.key) {
	    $.ajax({
                url:API + '/scrolls/?uuid=' + uuid,
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
		    GLOBAL.scroll = o.results[0];
		    GLOBAL.notebook.scroll = o.results[0];
		    GLOBAL.notebook.render();
                }
	    });
	}
	else {
	    console.log('You can only make notes if you\'re logged in.')
	}
    },	
    'scrollPost':function(data) {
	if (GLOBAL.user.key) {
	    $.ajax({
                url:API + '/scrolls/',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
		data:JSON.stringify(data),
                headers: {
		    'Authorization': 'Token ' + GLOBAL.user.key
                },
                failure:function(e) {
		    console.log('Failure: ' + e);
                },
                success:function(o) {
		    GLOBAL.scroll = o;
                }
	    });
	}
	else {
	    console.log('You can only make notes if you\'re logged in.')
	}
    },
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
    'passwordReset':API + '/rest-auth/password/reset/',
    'passwordResetConfirm':'/rest-auth/password/reset/confirm/',
    'passwordChange':'/rest-auth/password/change/',
    'userRegister':'/rest-auth/registration/',
    'userRegisterVerify':'/rest-auth/registration/verify-email/'
};
