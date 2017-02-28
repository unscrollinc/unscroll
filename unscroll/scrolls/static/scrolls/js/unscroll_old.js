
function makeCells(grid, cellWidth, cellHeight) {
    var divs = [];
    for (var y = 0; y<grid.length;y++) {
	for (var x = 0; x<grid[y].length; x++) {
	    var div = $('<div></div>', {class:'cell'})
		.css({
		    width:cellWidth+'px',
		    height:cellHeight+'px',			      
		    marginLeft:x*cellWidth+'px',
		    marginTop:y*cellHeight+'px'
		})
		.html(x+'x'+y);
	    divs.push(div);
	}
    }
    return divs;
}
