"use strict";
(function($, MediumEditor) {
    $(document).ready(function() {



        const REFRESH_INTERVAL = 2000; // milliseconds
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
        var Notebook = function(id) {

	    
            const max = 200;
            const dec = 10;
            var ctr = max;

	    function makeInsertionTemplate() {
		return {moving:false, from:undefined, to:undefined, target:undefined };
	    }
            
            this.decmax = function() {
                ctr = ctr - dec;
                return ctr;
            }

	    
	    
            var nb = this;

            this.id = id;

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

            this.needsCreated = this.id ? false : true;
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

	    this.reorderItems = function(from, to) {
		var replace = new Array();
		
		for (var i = 0; i<this.items.length; i++) {
		    if (this.items[i] == from) {
		    }
		    else if (this.items[i] == to) {
			var ci = this.items[i];
			if (i==0) {
			    from.order = ci.order - dec;
			}
			else {
			    var oneback = this.items[i-1];
			    from.order = oneback.order + (ci.order - oneback.order)/2;
			}
			replace.push(from);
			replace.push(this.items[i]);
		    }
		    else {
			replace.push(this.items[i]);			
		    }
		}
		return replace;
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

	    this.getRange = function(insertion) {
		console.log(insertion);
		var span = new Array();
		var _from = insertion.from;
		var _to = insertion.to;
		if (_from.order > _to.order) {
		    _from = _to;
		    _to = _from;
		}
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

            this.makePatch = function(item) {
                return {
                    needsUpdated:item.needsUpdated,
		    order:item.order,
		    text:item.text,
		    title:item.title,
                    id:Math.random(),
                    html:item.medium.getContent()};
            }

            this.makeItem = function(kind, event, note) {
                var item = new NotebookItem(kind, event, note);
                this.dom_nb.prepend(item.notebookView);
                this.dom_essay.prepend(item.textView);
		item.order = this.decmax();
		
		var mover = $('<span></span>',
			      {class:'button mover'})
		    .html('MV');

		item.notebookView.children('.top, .editable').on('click', function(ev){
		    if (nb.insertion.moving) {
			ev.stopImmediatePropagation();
			ev.preventDefault();
			var from = nb.insertion.from;
			var to = item;
			
			var nb_from = from.notebookView;
			var nb_to = $(item.notebookView);
			nb_to.before(nb_from);
			
			var text_from = from.textView;
			var text_to = $(item.textView);			
			text_to.before(text_from);

			nb.items = nb.reorderItems(from, to);
			from.buttons.children('.mover').removeClass('active');
			from.needsUpdated = true;
			$('.mover').html('MV');
			nb.insertion = makeInsertionTemplate();
		    }
		});
		
		item.notebookView.hover(
		    function(ev) {
			if (nb.insertion.moving == true
			    && item != nb.insertion.from) {
			    var el = $(item.notebookView);
			    el.children()
				.css({background:'lightgray',
				      cursor:'hand'})
			}
		    },
		    function(ev) {
			console.log(nb.moving);
			if (!nb.moving) {
			    var el = $(item.notebookView)			
			    el.children().css({background:'white',
					       cursor:'default'
					      });
			}
		    });
		
		mover.on('click', function(ev) {
		    if (nb.insertion.moving) {
			if (item == nb.insertion.from) {
			    mover.removeClass('active');
			    nb.insertion = makeInsertionTemplate();
			}
			else {
			    nb.insertion.to = item;
			    var range = nb.getRange(nb.insertion);
			    for (i in range) {
				console.log(range[i].buttons.children('.mover').addClass('active'));
			    }
			    console.log(range);
			}
		    }
		    else {
			nb.insertion.moving = true;
			mover.addClass('active');
			$('.mover').not('.active').each(function(pos, el) {
			    $(el).html('SET RANGE');
			});
			nb.insertion.from = item;
		    }
		})
		item.buttons.append(mover);
		this.items.unshift(item);
            }
	    
            // every X seconds look through this.items for items that have changed
            this.scanner = function () {
		// THIS NEEDS LOVE AND SHOULDN'T BE AN ARRAY; SHOULD
		// BE HASH BY MD5 MAYBE
		
                var updated = new Array();
                var deleted = new Array();
                var created = new Array();		
                for (var i=0; i<nb.items.length; i++) {
                    if (nb.items[i].needsUpdated) {
                        updated.push(nb.items[i]);
                    }
		    if (nb.items[i].needsDeleted) {
                        deleted.push(nb.items[i]);			
		    }
		    if (nb.items[i].needsCreated) {
                        created.push(nb.items[i]);
		    }		    
                }

		if (updated.length > 0) {
                    var patch = $.map(updated, nb.makePatch);
                    console.log(JSON.stringify(patch));
                    for (var i=0; i<nb.items.length; i++) {
                        nb.items[i].needsUpdated = false;
                    }		    
		}
		
		if (created.length > 0) {
                    var patch = $.map(created, nb.makePatch);
                    console.log(JSON.stringify(patch));
                    for (var i=0; i<nb.items.length; i++) {
                        nb.items[i].needsCreated = false;
                    }		    
		}
		
		if (deleted.length > 0) {
		    console.log('gonna delete', deleted);
		    var success=true;
		    var newItems = new Array();
		    if (success) {
			for (var i=0; i<nb.items.length; i++) {			
			    if (!nb.items[i].needsDeleted) {
				newItems.push(nb.items[i]);
			    }			
			}
			nb.items = newItems;
			console.log(nb.items);
		    }
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
            this.render = function() {
		var d = $('<div></div>', {class:'top'});
                if (this.event) {
                    return d.html(event.title);
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
                    return d.html('note');
                }
            }
	    
            this.eventHTML = this.render();

	    if (this.kind == 'spacer') {

            }
	    
            this.editor = $('<div></div>', {class:'editable'});
            if (this.kind === 'spacer') {
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
                var nbv = undefined;
                return $('<div></div>',
			 {class:'nb-item ' + kind})
		    .append(this.buttons
			    .append(this.deleteButton))
                    .append(this.eventHTML)
                    .append(this.editor);
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

        var notebook = new Notebook('a');
	
	var lorem = 'Contrary to popular belief.';

	for (var i = 0; i<10; i++) {
            var item = notebook.makeItem('default',
					 {title:i + '. Brisket hell ipsum dolor est', html:i + '. ' + lorem}, {title:"PANTS"});
	}
    });
    
})(jQuery, MediumEditor);
