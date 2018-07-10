import React from 'react';
import cookie from 'js-cookie';
import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';
import axios from 'axios';
import utils from './Util/Util';

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

const SWEEP_DURATION_SECONDS = 10;

export const AppContext = React.createContext();

const randomString = () => {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
}

export class AppProvider extends React.Component {
	
    makeState(c) {
	const hasAuth = (c && c.authToken && c.username);
        const authToken = hasAuth ? c.authToken : null;
        const username = hasAuth ? c.username : null; 	
        //Note = uuid, edits, note
        return {
	    username:username,
	    authToken:authToken,
	    notebook:null,
            notebookEdits:{},
            notebookIsSaved:null,
	    notes:[],
            // Maybe that's a hash by UUID, IDK.
	    moveFrom:undefined,
	    targetNote:undefined,            
	    events:[]
        }
    }
    
    constructor(state, context) {
        super(state, context);
        const c = cookie.get();        

	this.state = this.makeState(c);

	this.sweep = () => {
	    if (this.state.notebook && !this.state.notebookIsSaved) {
		if (this.state.notebook.url)  {
		    this.putNotebook();
		}
		else {
		    this.postNotebook();
		}
	    }
	    this.state.notes.forEach((v,k,m) => {
		if (!v.__isSaved) {
		    if (!v.url) {
		        this.postNote(v,k);
                    }
                    else {
                        this.patchNote(v,k);
                    }
		}
	    });
	}

        // Periodically (SWEEP_DURATION_SECONDS) sweep the notebook
        // and notes and see what needs to be saved.
	setInterval(this.sweep, 1000 * SWEEP_DURATION_SECONDS);
    }
    
    markNoteSaved(i) {
        // const _this = this;
	const notes = this.state.notes;
	const note = notes[i];
	const updatedNote = update(note,
				   {$merge: {__edits:{},
					     __isSaved:true}});

	const updatedNotes = update(notes, {[i]: { $set: updatedNote}});
	    
	this.setState({notes:updatedNotes});

    }

    cutNotes(from, to, targetBefore) {
        const _notes = this.state.notebookNotes;
        return _notes;
    }
    
    patchNote(note, i) {
        const _this = this;
	console.log(i, this.__edits);
        axios({
	    method:'patch',
	    url:note.url,
	    headers:this.makeAuthHeader(this.state.authToken),
	    data:note.__edits
	})
            .then(function(resp) {
		console.log("[@patchNote()]", resp.data);
                _this.markNoteSaved(i);
	    })
            .catch(error => {
                console.log('[!patchNote()]', error, _this.state);
            });
        
    }
    
    postNote(note, i) {
        console.log('[@postNote(note)]', note);
	const that = this;
        const noFullEventNote = update(note, {$unset: ['event']});
	utils.webPromise(this, 'POST', 'notes', noFullEventNote)
	    .then(resp=>{
		const updatedNote = update(note, {$merge: {__isSaved:true,
							   __edits:{},
							   ...resp.data}});
                const manyNotes = update(that.state.notes, {[i]: {$set: updatedNote}});
		that.setState({notes:manyNotes});
	    })
            .catch(error => {
                console.log('[!postNote()]', {error:error, note:note, i:i});
            });
	
    }
    
    postNotebook() {
        const _this = this;
        axios({
	    method:'post',
	    url:utils.getAPI('notebooks'),
	    headers:this.makeAuthHeader(this.state.authToken),
	    data:update(this.state.notebook, {$unset: ['notes']})
	})
            .then(function(resp) {
                
		_this.setState(
		    {notebookIsSaved:true,
                     notebook: update(
			 _this.state.notebook, {$merge: {...resp.data}})
		    });
            })
            .catch(error => {
                console.log(`postNotebook: There is already a notebook by you with that name! ${error}`);
            });
    }

    putNotebook() {
        const _this = this;
        axios({
	    method:'put',
	    url:this.state.notebook.url,
	    headers:this.makeAuthHeader(this.state.authToken),
	    data:update(this.state.notebook,
			{$unset: ['notes', 'isOnServer', 'isSaved']})
	})
            .then(function(resp) {
		_this.setState({
                    notebookIsSaved:true})
            })
            .catch(error => {
                console.log(`postNotebook: There is already a notebook by you with that name! ${error}`);
            });
    }

    deleteNotebook(uuid) {
        console.log('[@deleteNotebook:uuid]', uuid);
        const nb = this.state.notebookList.get(uuid);
        console.log(nb);
        axios({method:'delete',
               url:nb.url,
               headers: this.makeAuthHeader(this.state.authToken)               
              })
            .then(response=>{
                this.setState({
                    user:
                      update(this.state.user,
                             {$merge:
                              {notebookList:
                               update(this.state.notebookList,
                                      {$remove:
                                       [uuid]})                                                             
                              }})}, ()=>console.log(this.state.user))})
            .catch(error=>{
                console.log("ERROR!!!!!", error);
            });
    }
    
    
    sequenceNotes(notes) {
        console.log('[@sequenceNotes:notes]', notes);
        return new Map(
            Array.from(notes).map((v, i) => {
                if (i!==v.order) {
                    return [v.uuid, update(v, {$merge: {isSaved:false, order:i}})];
                }
                else {
                    return [v.uuid, update(v, {$merge: {isSaved:true}})];
                }
            }));
    }

    
    sortNotes(notes) {
        const _sorted =
              Array.from(notes)
              .sort((a,b) => {
                  if (a.order > b.order) {
                      return 1;
                  }
                  else if (a.order < b.order) {
                      return -1;
                  }
                  return 0;
              });
        return _sorted;
    }
    
    makeAuthHeader(token) {
        if (token) {
            return {Authorization: `Token ${token}`};
        }
        return null;
    }
    
    render() {
        return (
            <AppContext.Provider value={{

                state:this.state,

		setState:(o, f) => {
		    this.setState(o, f);
		},
                
                handleUsernameUpdate:(event) => {
                    this.setState({user: update(this.state.user, {username: {$set: event.target.value}})});
                },
                
                handlePasswordUpdate:(event) => {
                    this.setState({user: update(this.state.user, {password: {$set: event.target.value}})});                    
                },

                makeAuthHeader: (token) => { return this.makeAuthHeader(token) } ,
                
                addNotebook:() => {
                    this.setState({notebook: {
                        on:true,
			isSaved:false,
                        title:'Untitled-'
                            + randomString(),
                        subtitle:'Un-subtitled',
                        description:'Un-summarized',
                        uuid: uuidv4(),
                        notes:[]
                    }}, this.postNotebook);
                },

                loadNotebook:(notebook)=>{
                    const _this = this;
                    axios({method:'get',
	                   headers:this.makeAuthHeader(this.state.authToken),
                           url:`FAKE_API`
                          }).then((response) => {
                              this.setState({user: update(this.state.user,
                                                          {$merge: {notebookCurrent: notebook.uuid}})});
                              console.log('[@loadNotebook.response()]', response);
                              this.setState({notebook:
                                             {...response.data,
                                              movingNote:undefined,                                                 
                                              isSaved:true,
                                              isOnServer:true,
                                              notes:_this.sequenceNotes(_this.sortNotes(response.data.full_notes)),
                                             }}
                                            // , ()=>{console.log('[@this.state.notebook]', this.state.notebook)}
                                           )});
                },

		listNotebooks:()=>{
		    this.loadNotebookList();
		},
                
                deleteNotebook:(uuid)=> {
                    this.deleteNotebook(uuid);
                },

                notebookChange:(field, value)=>{
                    this.setState(
                        {notebook:update(this.state.notebook,
                                         {$merge: {
                                             isSaved:false,
                                             [field]: value}})});
                },

                addNote:(event) => {
		    console.log('[@addNote(event)]', event);
                    const newNote = {
                        uuid: uuidv4(),                    
			text: '',
                        order: 0,
			in_notebook: this.state.notebook.url,
			event:event,
                        with_event:event.url,
                        __isSaved:false,
                        __edits:{}
                    };
                    const notes = update(this.state.notes, {$unshift: [newNote]});
                    const sorted = notes.map((note, i)=>{
                        if (note.order!==i) {
                            const __edits = update(note.__edits, {$merge: {order:i}})
                            return update(note, {$merge: {order:i,
                                                          __isSaved:false,
                                                          __edits:__edits}});
                        }
                        return note;
                    });
                    this.setState({notes:sorted});
                },

                doEventEditor:(event) => {
                    
                },

                startMove:(uuid) => {
                    console.log('gonna start it now!!!!', uuid);
                    this.setState({notebook: update(this.state.notebook, {$merge: {moveFrom:uuid}})});
                },

                endMove:(uuid) => {
                    const nb = this.state.notebook;
                    const _keys = Array.from(nb.notes.keys());
                    const _from = _keys.indexOf(nb.moveFrom);
//                    const _to = _keys.indexOf(nb.moveFrom);                    
                    const _target = _keys.indexOf(uuid);

                    // https://stackoverflow.com/questions/2440700/reordering-arrays
                    function immutableMove(arr, from, to) {
                        return arr.reduce((prev, current, idx, self) => {
                            if (from === to) {
                                prev.push(current);
                            }
                            if (idx === from) {
                                return prev;
                            }
                            if (from < to) {
                                prev.push(current);
                            }
                            if (idx === to) {
                                prev.push(self[from]);
                            }
                            if (from > to) {
                                prev.push(current);
                            }
                            return prev;
                        }, []);
                    }
                    
                    const _reduced = immutableMove(_keys, _from, _target);
                    const _rebuilt = _reduced.map(u=>nb.notes.get(u))
                    const _resequenced = this.sequenceNotes(_rebuilt);
                    this.setState({notebook:update(this.state.notebook, {$merge:
                                                                         {moveFrom:undefined,
                                                                          notes: _resequenced}})});
                },
                
                updateNote:(newState) => {
                    const nb = this.state.notebook;
                    this.setState({
                        notebook:update(nb, {$merge: {currentNote:newState.uuid,
                                                      notes:update(nb.notes,
                                                                   {$add:
                                                                    [[newState.uuid,
                                                                      update(nb.notes.get(newState.uuid),
                                                                             {$merge: {isSaved: false, ...newState}})]]})}})},
                                  ()=>{}
                                  );

                },
                
                editNote:(e) => {
                    this.setState({
                        eventEditor:{on:true, event:e}
                    });
                },
                
                deleteNote:(note) => {
                    const _this = this;
                    axios({
                        method:'delete',
                        url:note.url,
	                headers:this.makeAuthHeader(this.state.authToken)})
                        .then(
                            (response)=> {
                                _this.setState({notebookNotes: update(_this.state.notebookNotes,
                                                                      { $remove: [note.uuid]})}
                                               // ,()=>{console.log(_this.state.notebook);}
                                              );
                            });
                },
                
                
                doEventSearch:(e, searchTerm) => {
                    e.preventDefault();
                    this.setState({timeline:
                                   update(this.state.timeline,
                                          {$merge: {search:
                                                    update(this.state.timeline.search, {$merge: {q:searchTerm}})}})},
                                  ()=>{console.log(this.state.timeline.search)});
                },

                editEvent:(e) => {
                    this.setState({
                        eventEditor:{on:true, event:e}
                    });
                },

                newEvent:(time) => {
                    this.setState({
                        eventEditor:{on:true, event:{id:uuidv4(), time:time}}
                    });
                },                                

                addScroll:() => {
                    console.log('OKAY', this);
                    this.setState({scroll: {
                        on:true,
			isSaved:false,
                        title:'Untitled-' + randomString(),
                        description:'Un-summarized',
                        uuid: uuidv4(),
                        events:[]
                    }}, this.saveScroll);
                },
                               
            }}>
            {this.props.children}
            </AppContext.Provider>

        );
    }
}

export default AppContext;

