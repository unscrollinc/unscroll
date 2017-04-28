(function($, Quill) {
    $.fn.isAfter = function(sel){
        return this.prevAll().filter(sel).length !== 0;
    };

    $.fn.isBefore= function(sel){
        return this.nextAll().filter(sel).length !== 0;
    };

$(document).ready(function() {

    const max = 200;
    const dec = 10;
    var ctr = max;
    const timeBeforePatch = 10000; // milliseconds
    const timeBeforeRefresh = 10; // milliseconds
    function decmax() {
        ctr = ctr - dec;
        return ctr;
    }

    var NOTEBOOK = {
        moving:false,
        selectedItems:[]
    };

    function timeSince(STATUS) {
	var lastPatch = STATUS.lastPatch;
	var lastRefresh	= STATUS.lastRefresh;
        var d = new Date().getTime();
        var deltaRefresh = d - lastRefresh;
        var deltaPatch = d - lastPatch;    
        var shouldRefresh = deltaRefresh > timeBeforeRefresh;
        var shouldPatch = deltaPatch > timeBeforePatch;
        return {now:d,
                shouldRefresh:shouldRefresh,
                shouldPatch:shouldPatch};
    }

    function sweepAndSave() {
	$('.');
    }
    function makeNotebookItem(event, convertFunction, note) {
	var STATUS = {};
	STATUS.lastPatch = new Date().getTime();
        STATUS.lastRefresh = new Date().getTime();
	STATUS.saved = false;
	STATUS.timeoutId = undefined;

	var _note = note;
	
        var eventHTML = convertFunction(event);

	var editor = $('<div></div>', {class:'editable'});

	var quill = new Quill('.editable', {
	    modules: {
		toolbar: '#toolbar'
	    },
	    theme: 'snow'
	});

	console.log(quill);
        var textView = $('<div></div>', {'class':'view-item'});  	
        var moveButton = $('<div></div>', {'class':'move-button'}).html('M');
        var saveState = $('<div></div>',
		      {'class':'save-state'})
	    .html('*');
	
	function setSaved(state) {
	    saveState
		.removeClass(''+!state)
		.addClass(''+state);
	}
	setSaved(false);
	
        var notebookView = $('<div></div>',
			     {class:'nb-item'})
            .append(eventHTML)
            .append(editor)
            .append(moveButton)
            .append(saveState);	



	m.subscribe('editableInput', function (event, editor) {
	    textView.html(m.getContent())
	    console.log();
	    // Do some work
	});
	
        moveButton.on('click', function(ev) {
            if (NOTEBOOK.moving) {
            }
            NOTEBOOK.moving = true;
        });

        return { order:decmax(),
                 event:undefined,
                 text:event.text,
                 notebookView:notebookView,
                 textView:textView,
                 lastSave:undefined
               };
    }


    function makeEvent(event) {
        return $('<div></div>').html(event.title);
    }

    function addNote(event) {
        // Post a new note and get ID, etc. Then make it from the event.
        // UPON AJAX SUCCESS
        console.log('TODO: SAVE NEW ITEM TO SERVER');      
        var item = makeNotebookItem({title:'The title of the event'}, makeEvent, {});
        $('#notebook').append(item.notebookView);
        $('#essay').append(item.textView);            
    }

    addNote();
    addNote();
    addNote();
    
});

})(jQuery, Quill);
