(function($, MediumEditor) {
    $.fn.isAfter = function(sel){
        return this.prevAll().filter(sel).length !== 0;
    };
    $.fn.isBefore= function(sel){
        return this.nextAll().filter(sel).length !== 0;
    };

    $(document).ready(function() {
        const REFRESH_INTERVAL = 10000; // milliseconds
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

        var NotebookListItem = function() {
            this.load = function() {};
            this.render = function() {};
        }
        
        var NotebookList = function() {
            this.dom_nblist = $('#notebook-list');
            this.notebooks = new Array();

            this.load = function() {};
            this.render = function() {};
        };
        
        var Notebook = function(id) {

            const max = 200;
            const dec = 10;
            var ctr = max;
            
            this.decmax = function() {
                ctr = ctr - dec;
                return ctr;
            }
            
            var nb = this;

            this.id = id;

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
                    nb.makeItem(undefined, undefined, 'spacer');
                });
            
            this.dom_nb_list = $('#notebook-list-button');            

            this.needsCreated = this.id ? false : true;
            this.needsUpdated = false;
            this.needsDeleted = false;
            
            this.title = undefined;

            this.items = new Array();


            
            this.titleEditor = $('<div></div>', {class:'editable'});
            this.medium = new MediumEditor(this.titleEditor, {
                disableReturn: true,
                disableDoubleReturn: false,
                disableExtraSpaces: true,
                targetBlank: true                
            });
            
            this.ajaxPackage = {};

            this.makePatch = function(item) {
                return {
                    item:item.needsUpdated,
                    id:Math.random(),
                    html:item.medium.getContent()};
            }

            this.makeItem = function(event, note, kind) {
                var item = new NotebookItem(event, note, kind);
                this.dom_nb.prepend(item.notebookView);
                this.dom_essay.prepend(item.textView);
                this.items.push(item);
            }
            
            // every X seconds look through this.items for items that have changed
            this.scanner = function () {
                var changed = new Array();
                for (var i=0; i<nb.items.length; i++) {
                    if (nb.items[i].needsUpdated) {
                        changed.push(nb.items[i]);
                    }
                }
                var success = true;
                if (success) {
                    if (changed.length > 0) {
                        var patch = $.map(changed, nb.makePatch);
                        console.log(JSON.stringify(patch));
                        for (var i=0; i<changed.length; i++) {
                            nb.items[i].needsUpdated = false;
                        }
                    }
                    else {
                        console.log('Nothing needs to be saved.');
                    }
                }
            }
            
            setInterval(this.scanner, REFRESH_INTERVAL);
        };
        
        var NotebookItem = function(event, note, kind) {
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

            this.needsCreated = note ? true : false;
            this.needsUpdated = note ? false : true;
            this.needsDeleted = false;

            this.render = function() {
                if (this.event) {
                    return $('<div></div>').html(event.title);
                }
                else if (this.kind=='spacer') {
                    return $('<div></div>').append(
                        $('<span></span>', {class:'button'}).html('[2]')
                            .on('click', function() { nbitem.medium.setContent('<br/><br/>');}),
                        '|',
                        $('<span></span>', {class:'button'}).html('&mdash;')
                            .on('click', function() { nbitem.medium.setContent('<hr></hr>');})                        
                    );                    
                }
                else {
                    return $('<div></div>').html('No event');                
                }
            }
            this.eventHTML = this.render();
            this.editor = $('<div></div>', {class:'editable'});
            if (this.kind === 'spacer') {
                this.editor.html($('<br/><br/>'));
            }            
            this.medium = new MediumEditor(this.editor, {
                disableReturn: true,
                disableDoubleReturn: false,
                disableExtraSpaces: true,
                targetBlank: true                
            });

            
            this.textView = $('<span></span>',
                              {'class':'view-item'})
                .on('click', function() {});

            this.changed = function() {
                this.needsUpdated = true;
            };
            
            this.moveButton = $('<div></div>',
                                {'class':'move-button'})
                .html('M')
                .on('click', function(ev) {
                    console.log(ev, nbitem);
                });


            this.makeNotebookView = function() {
                var nbv = undefined;
                return $('<div></div>',
			 {class:'nb-item ' + kind})
                    .append(this.eventHTML)
                    .append(this.editor)
                    .append(this.moveButton);
                
            }
            
            this.notebookView = this.makeNotebookView();
            this.textView.html(this.medium.getContent());
           
	    this.medium.subscribe('editableInput', function (event, editor) {
                nbitem.changed();              
                nbitem.textView.html(nbitem.medium.getContent());
                nbitem.textView.append(' ');
	    });
        }

        var notebook = new Notebook('a');
        var item = notebook.makeItem(event);
    });
    
})(jQuery, MediumEditor);
