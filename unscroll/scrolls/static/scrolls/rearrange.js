$(document).ready(function() {
    var max=2000000000.0;      
    var moving = false;
    var beenHere = false;
    var dropHere = $('<div></div>', {class:'prepend'}).html('Drop Here');
    
    function moveMaker(el) {
	var ranger = $('<div></div>', {'class': 'ranger'}).html('Start Move');
	ranger.on('click', function(x) {
	    $(el).css({'background':'yellow'});
	    moving = true;
	});
	el.append(ranger);
	return el;
    }
    
    function insertItem() {
	var item = $('<div></div>',
		     {'class':'nb-item',
		      'id':'nb-' + max})
	    .html('<p><b>' + max + '</b></p>');
	item.on('hover', function(){
	    if (moving && !beenHere) {
		console.log('mousein moving', moving, 'beenHere', beenHere);
		item.prepend(dropHere);
		beenHere = true;
	    }
	});
	item.on('mouseout', function(){
	    console.log('mouseout moving', moving, 'beenHere', beenHere);	    
	});
	
	var movable_item = moveMaker(item);
        $('#notebook').prepend(item);
        max += -10000;
    }
    $('#insert').on('click', insertItem);
    
    insertItem();
    insertItem();
    insertItem();
    insertItem();
    insertItem();
    insertItem();            
});
