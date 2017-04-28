(function($) {
    $.fn.isAfter = function(sel){
        return this.prevAll().filter(sel).length !== 0;
    };

    $.fn.isBefore= function(sel){
        return this.nextAll().filter(sel).length !== 0;
    };
})(jQuery);

$(document).ready(function() {

    const max = 200;
    const dec = 10;
    var ctr = max;
    const timeBeforePatch = 10000; // milliseconds
    const timeBeforeRefresh = 5000; // milliseconds
    function decmax() {
        ctr = ctr - dec;
        return ctr;
    }

    var NOTEBOOK = {
        moving:false,
        selectedItems:[]
    };

    function timeSince(lastPatch, lastRefresh) {
        var d = new Date().getTime();
        var deltaRefresh = d - lastRefresh;
        var deltaPatch = d - lastPatch;    
        var shouldRefresh = deltaRefresh > timeBeforeRefresh;
        var shouldPatch = deltaPatch > timeBeforePatch;
        return {now:d,
                shouldRefresh:shouldRefresh,
                shouldPatch:shouldPatch};
    }
    
    function makeNotebookItem(event, convertFunction, note) {
        var lastPatch = new Date().getTime();
        var lastRefresh = new Date().getTime();
        
        var eventHTML = convertFunction(event);

        var editor = $('<textarea></textarea>');

        var moveButton = $('<div></div>', {'class':'move-button'}).html('M');
        
        var notebookView = $('<div></div>', {class:'nb-item'})
            .append(eventHTML)
            .append(moveButton)
            .append(editor);

        var textView = $('<div></div>', {'class':'view-item'})
            .append(editor.val());

        editor.on('input', function(ev) {
            var td = timeSince(lastPatch, lastRefresh);
            console.log('timeDelta', td);
            lastChanged = td.now;
            if (td.shouldRefresh) {
                lastRefresh = new Date().getTime();
                textView.text(editor.val()).fadeIn();
            }
            if (td.shouldPatch) {
            }            

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
        // UPON AJAX SUCCESS
      
        var item = makeNotebookItem({title:'The title of the event'}, makeEvent, {});
        $('#notebook').append(item.notebookView);
        $('#essay').append(item.textView);            
        console.log('TODO: SAVE NEW ITEM TO SERVER');
    }

    addNote();
});
