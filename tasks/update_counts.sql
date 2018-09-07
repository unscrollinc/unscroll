UPDATE scroll

SET    meta_event_count = x.meta_event_count,
       meta_first_event = x.meta_first_event,
       meta_last_event = x.meta_last_event
       
       FROM (SELECT in_scroll_id AS id,
	     COUNT(*) AS meta_event_count,
	     MIN(when_happened) AS meta_first_event,
	     MAX(when_happened) AS meta_last_event
       	     FROM event
	     GROUP BY in_scroll_id) AS x
	     
    WHERE scroll.id = x.id;
       
