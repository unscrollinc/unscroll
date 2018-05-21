        this.sequenceNotes = (notesMap) => {
            let notes = notesMap;
            console.log('[@sequenceNotes(notesMap)]', notesMap);
            let sequenced = new Map();
            let yesNext = new Set();
            let noNext = new Set();            
            let es = Array.from(notes.entries());


            // Make a set of all the uuid_next
            es.map((k, v)=>{
                if (v.uuid_next) {
                    yesNext.add(k);
                }
                else {
                    noNext.add(k);
                }
            });

            console.log('[@sequenceNotes:hasNext,noNext]',yesNext, noNext);
            // This does the resequencing
            function go (k) {
                if (k) {
                    let v = notes.get(k);
                    if (v && v.uuid_next) {
                        sequenced.set(k, v);
                        go(v.uuid_next);
                    }
                }
            }
            function rest(i) {
                if (es.length > i + 1) {
                    let prev = es[i][1];
                    let next = es[i+1][1];
                    if (notesMap.get(next.uuid)) {
                        prev.uuid_next = next.uuid;
                        prev.isSaved = false;
                    }
                    sequenced.set(prev.uuid, prev);
                }
            }
            
            // The first one is the first one we find where
            es.map(([k,v], i)=>{
                if (sequenced.size == 0  // there's nothing sequenced
                    && yesNext.has(k)    // it's uuid doesn't show up in any `uuid_next`s
                    && v.uuid_next       // it has a `uuid_next` itself
                    && !v.deleted) {     // and it hasn't been deleted
                    go(k, i);
                }
                else {
                    if (!sequenced.get(k)) {
                        rest(i);
                    }
                }
            });
            console.log('[@sequenceNotes:sequenced]', sequenced);
            return sequenced;
        };
