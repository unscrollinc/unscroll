$(document).ready(function() {
    var max=2000000000.0;      
    var moving = false;
    var elToMove = undefined;
    var dropHere = $('<div></div>',
		     {class:'prepend'})
	.html('Drop Here');
    
    function moveMaker(el) {
	var ranger = $('<div></div>',
		       {'class': 'ranger'})
	    .html('Move');
	
	ranger.on('click', function(e) {
	    if(!moving) {
		e.stopPropagation();
		el.css({'opacity':'0.2'});
		elToMove = el;
		$('.ranger').html('Select range');
		moving = true;
	    }
	});
	return ranger;
    }
    
    function addClicker(item) {
	item.on('click', function(e){
	    if(moving) {
		e.preventDefault();

		var old_id = elToMove.data('order');
		var rightBefore = item.prev().data('order');
		var rightAfter = item.data('order');
		var between = rightBefore + (rightAfter - rightBefore)/2;			    
		if (rightBefore===undefined) {
		    between = rightAfter - 1;
		}
		elToMove.data('order', between);
		elToMove.children('p').remove();
		elToMove.prepend('<p><b>' + between + '</b></p>');
		elToMove.insertBefore(item);
		elToMove.css({'opacity':'1'});
		$('.ranger').html('Move');
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
	    text = '<p><b>' + count + '</b></p>';
	}
	var item = $('<div></div>',
		     {'class':cssClass})
	    .html(text);
	item.data('order', max);
	if (cssClass!=='nb-final') {
	    item.append(moveMaker(item));
	}
	addClicker(item);
	
	item.hover(
	    function(e){
		if(moving) {
		    item.css({background:'#ccc', cursor:'hand'});
		}
	    },
	    function(e){
		item.css({background:'#fff',
			  cursor:'pointer'});
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
