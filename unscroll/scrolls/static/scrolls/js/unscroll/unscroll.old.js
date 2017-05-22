    var GLOBAL = {
        timeline:undefined,
        notebook:undefined,
	scroll:undefined,
        scroll_uuid:undefined,
        pos:undefined,
        start:undefined,
        end:undefined
    };

    GLOBAL.updateUserScrolls = function() {
	var makeScrollListing = function(scroll) {
	    return $('<tr></tr>',
		     {class:'scroll-listing'})
		.on('click', function (ev) {
		    GLOBAL.scroll_uuid = scroll.uuid;
		    GLOBAL.notebook = new Notebook(scroll.uuid);
		    GLOBAL.notebook.load();
                    new Timeline(GLOBAL.start, GLOBAL.end);
		    
		})
		.append(
		    $('<td></td>').html(scroll.title),
		    $('<td></td>').html(scroll.public ? 'Public' : 'Private'),
		    $('<td></td>').html(moment(scroll.created).format('M/D/YYYY h:mma')));
	}
	$('#notebook-listing')
	    .css({})
	    .append(
		$('<table></table>', {class:'scroll-listing'})
		    .append($.map(GLOBAL.user.scrolls, makeScrollListing)));	
    }

    
       
    function makePeriod(text, start, end) {
	return $('<a></a>', {class:'period nav',
			     href:'/?begin='
			     + start.format()
			     + '&end='
			     + end.format()
			    })
	    .html(text)
	    .click(function(e) {
		e.preventDefault();		
                GLOBAL.timeline = new Timeline(start, end);
	    });
    }
    
    
    

	                .on('click', function(e) {
		            players[event.mediatype](event);
	                });
                }
                else {
                    return $('<a></a>', {class:'link',
                                         href:event.content_url}).html('LINK ');
                }
            }
            
	    function getThumbnail() {
	        if (event.thumbnail) {
		    return $('<div></div>', {'class':'thumb'})
		        .append($('<img></img>',
			          {'class':'thumb',
			           'width':event.thumb_width,
			           'height':event.thumb_height,
			           'src':event.thumb_image,
			           'title':'Thumbnail image'
			          }));
	        }
	    }
            
	    function getScrollThumbnail() {
	        if (event.scroll_thumb_image) {
		    return $('<div></div>', {'class':'thumb'})
		        .append($('<img></img>',
			          {'class':'thumb',
			           'src':event.scroll_thumb_image,
			           'title':''
			          }));
	        }
	    }
	    function getEditLink() {
		if (event.user == GLOBAL.user.url) {
		    return $('<span></span>',
			     {class:'asnote button'})
			.html('[+Edit]').on('click', function(e) {
			    console.log(event);
			    event.editor();
			});
		}
	    }

event.meta = {
	        div: $('<div></div>', {class:'event'}).append(
		    $('<div></div>', {class:'inner'}).append(
		        getLink(event),
			getEditLink(event),
		        getThumbnail(event),
                        $('<span></span>', {class:'asnote button'})
                            .html('[+Note]').on('click', (function(e) {
                                event.eventToNotebook(event, event.frame);
                            })),
		        $('<span></span>', {class:'datetime'})
			    .html(_dt.format('D MMM, \'YY')),
                        
		        $('<div></div>', {class:'title'})
			    .html(event.title),
		        
		        $('<div></div>', {class:'text'})
			    .html(),		    
                        
		        $('<div></div>', {class:'scroll-title'})
	    		    .html(event.scroll_title)
                            .on('click', function(e) {
                                $('#search-input').val('scroll:\"'+event.scroll+'"');
                                GLOBAL.scroll_uuid = event.scroll_uuid;
                                new Timeline(GLOBAL.start, GLOBAL.end);
                            })
			    .append(getScrollThumbnail(event))
		    ))
		    .mousemove(function(event) {
		        // Don't move if over event (cut and paste, click, etc);
		    }),
	        width:event.frame.getEventWidth(event.columns, event.title.length),
	        offset:event.frame.getOffset(_dt, event.resolution)
	    };
        }	
	this.cacheMeta();

	


    }
    
//    var makePanel = function(count, start, end, env, events) {	
    var XPanel = function(count, start, end, env, events) {

	var panel = this;
	this.buffer = $('#buffer');
	this.dur = end - start;
	// Make a panel, 1 screen wide, that will contain a duration.
	this.panelHTML = $('<div></div>',
		       {'id':count,
			'class':'panel'})
	    .css({marginLeft:p(100 * (count + 1))});
	
	this.divs = [];
	this.timeFrame = getTimeFrame(start, end);
	this.frame = Timeframes[this.timeFrame];
	
	this.columns = this.frame.getColumns(count, start, end);
	this.cellWidth = env.window.width/this.columns;
	this.cellHeight = env.window.height/gridHeight * activeHeight;
	// Add the time period
	this.period = this.frame.getPeriod(start);
	
	this.divs.push(this.period);
        
	// Add the columns
	this.columnWidth = env.window.width/this.columns;
	this.el = $(env.timeline.children()[1]);
	for (var i = 0; i<this.columns; i++) {
	    var columnData = this.frame.columnStepper(i, start);
	    this.divs.push(makeColumn(i, this.columnWidth, columnData));
	}
	// Add the events
	this.clientEvents = $.map(events.results, function(e) {return new Event(e, panel.frame, panel.columns);});
	

	this.panelHTML.append(this.divs);
	return this.panelHTML;
    }
