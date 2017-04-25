(function($) {
    $.fn.isAfter = function(sel){
        return this.prevAll().filter(sel).length !== 0;
    };

    $.fn.isBefore= function(sel){
        return this.nextAll().filter(sel).length !== 0;
    };
})(jQuery);

$(document).ready(function() {
    var max=2000000000.0;      
    var moving = false;
    var elToMove = undefined;
    var elsToMove = [];
    var dropHere = $('<div></div>',
		     {class:'prepend'})
	.html('Drop Here');
    
    function moveMaker(el) {
	var mover = $('<div></div>',
		      {'class': 'mover',
		       'title':'Rearrange notes'})
	    .html('M');
	
	mover.on('click', function(e) {
	    if(!moving) {
		e.stopPropagation();
		el.css({'opacity':'0.2'});
		$('.mover')
		    .html('R')
		    .on('click', function(ev) {
			ev.stopPropagation();
			var p = $(this).parent();

			if (elToMove.isBefore(p)) {
			    elsToMove = $(elToMove)
				.nextUntil(p)
				.add(p)
				.css({'opacity':0.4});
			}
			else {
			    elsToMove = $(p)
				.nextUntil(elToMove)
				.add(p)
				.css({'opacity':0.4});
			}
			
			console.log('Clicked on range. from:',
				    elToMove.data('order'),
				    'to: ',
				    p.data('order'),				    
				    'eltomove'
				   );

			    // .andSelf().add(p);
			    //
		    });
		elToMove = el;
		moving = true;
	    }
	});
	return mover;
    }
    
    function addClicker(item) {
	item.on('click', function(e){
	    if(moving) {
		if (elToMove !== item) {
		    var old_id = elToMove.data('order');
		    var rightBefore = item.prev().data('order');
		    var rightAfter = item.data('order');
		    var between = rightBefore + (rightAfter - rightBefore)/2;			    
		    if (rightBefore===undefined) {
			between = rightAfter - 1;
		    }
		    elToMove.data('order', between);
		    elToMove.children('p.no').remove();
		    elToMove.prepend('<p class="no"><b>' + between + '</b></p>');
		    elToMove.insertBefore(item);
		}
		elToMove.css({'opacity':'1'});
		$('.mover').html('M');
		moving = false;
		console.log('PATCH this note with ID X with an update that the order', old_id, 'is now', between);
	    }
	});
    }

    function insertFinal() {
	insertItem('nb-final', max, '&mdash;END&mdash;');
    }
    
    function insertItem(cssClass, count, text) {

	if (count===undefined) {
	    count = max;
	}
	if (cssClass===undefined) {
	    cssClass = 'nb-item';
	}
	if (text===undefined) {
	    text = '<p class="no"><b>' + count + '</b></p>';
	}
	var item = $('<div></div>',
		     {'class':cssClass})
		     .html(text)
	    .css({'background':"#"+((1<<24)*Math.random()|0).toString(16)});
	item.data('order', max);
	if (cssClass!=='nb-final') {
	    item.append(moveMaker(item));
	}
	addClicker(item);
	
	item.hover(
	    function(e){
		if(moving) {
		    item.css({cursor:'hand'});
		}
	    },
	    function(e){
		item.css({cursor:'pointer'});
	    }
	);
        $('#notebook').prepend(item);
        max += -100000;
    }
    
    $('#insert').on('click', function(e) {insertItem();});

    
    insertFinal();
    insertItem();
    insertItem();
    insertItem();
    insertItem();
    insertItem();
    insertItem();
});
