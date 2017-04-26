(function($) {
    $.fn.isAfter = function(sel){
        return this.prevAll().filter(sel).length !== 0;
    };

    $.fn.isBefore= function(sel){
        return this.nextAll().filter(sel).length !== 0;
    };
})(jQuery);

$(document).ready(function() {
    var max = 100.0;
    const SUBTRACT = -1;
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
	
	
	mover.on('click', function(ev) {
	    if(!moving) {
		ev.stopPropagation();
		el.addClass('selected');
		$('.mover')
		    .html('R')
		    .on('click', function(ev) {
			ev.stopPropagation();
			var p = $(this).parent();
			if (elToMove.isBefore(p)) {
			    elsToMove = [$(elToMove)];
			    var els = $(elToMove)
				.nextUntil(p)
				.add(p)
				.addBack()
				.addClass('selected');
			    elsToMove.push.apply(elsToMove, els);
			}
			if (p.isBefore(elToMove)) {
			    elsToMove = [$(elToMove)];			    
			    $(p)
				.nextUntil(elToMove)
				.add(p)
				.addBack()			    
				.addClass('selected');
			    elsToMove.push.apply(els, elsToMove);
			    addUnselect(elsToMove);			    
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
	    if (moving) {
		if (item.hasClass('selected')) {
		    $('.selected').removeClass('selected');
		    console.log('all good, all done');
		    elsToMove = [];
		    elToMove = undefined;
		}
		else {
		    var ct = elsToMove.length;
		    if (ct > 0) {
			var rightBefore = item.prev().data('order');
			var rightAfter = item.data('order');
			console.log('count is', ct);
			for (var i = 0; i<ct; i++) {
			    var el = $(elsToMove[i]);
			    var between = rightBefore + ((i + 1) * ((rightAfter - rightBefore)/(1 + ct)));
			    old_order = el.data('order');
			    el.data('order', between);
			    el.children('p.no').remove();
			    el.prepend('<p class="no"><b>X' + between + '</b></p>');
			    el.insertBefore(item);
			    el.removeClass('selected');
			    
			    console.log('EACH: PATCH this note with ID X with an update that the order',
					old_order, 'is now', between);
			    
			}
			
			$('.mover').html('M');			
			moving = false;		
			elToMove = undefined;
			elsToMove = [];
		    }
		    else {
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
			elToMove.removeClass('selected');
			$('.mover').html('M');
			$('.mover').html('M');			
			moving = false;		
			elToMove = undefined;
			elsToMove = [];			
			
			console.log('PATCH this note with ID X with an update that the order', old_id, 'is now', between);
		    }
		}

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
	console.log("#"+((1<<24)* Math.random()|0));
	var item = $('<div></div>',
		     {'class':cssClass})
		     .html(text)
	    .css({'background':"#"+((1<<24) * Math.random()|0)
		  .toString(16)});
	item.data('order', max);
	if (cssClass!=='nb-final') {
	    item.append(moveMaker(item));
	}
	addClicker(item);
	item.hover(
	    function(e){
		if (moving) {
		    item.css({cursor:'hand'});
		}
	    },
	    function(e){
		item.css({cursor:'pointer'});
	    }
	);
        $('#notebook').prepend(item);
        max += SUBTRACT;
    }
    $('#insert').on('click', function(e) {insertItem();});
    insertFinal();
    for (var i = 0; i<20; i++) {
	insertItem();
    }

});
