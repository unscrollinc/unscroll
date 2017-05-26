
        this.render = function() {
	    console.log(_notebookitem.event);
	    var div = d('top');
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
		    s('button').html('Space &times; 2')
			.addClass('active')
			.on('click', function() {
			    _notebookitem.buttons.children('span.button')
                                .removeClass('active');
			    $(this).addClass('active');
			    _notebookitem.medium.setContent('<br/><br/>');}),
		    s('button').html('&mdash;')
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




this.render = function() {
	    console.log(_notebookitem.event);
	    var div = d('top');
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
		    s('button').html('Space &times; 2')
			.addClass('active')
			.on('click', function() {
			    _notebookitem.buttons.children('span.button')
                                .removeClass('active');
			    $(this).addClass('active');
			    _notebookitem.medium.setContent('<br/><br/>');}),
		    s('button').html('&mdash;')
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
