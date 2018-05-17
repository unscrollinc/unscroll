import React from 'react';
import cookie from 'js-cookie';
import update from 'immutability-helper';
import uuidv4 from 'uuid/v4';
import axios from 'axios';

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

const SWEEP_DURATION_SECONDS = 5;
const API = 'http://127.0.0.1:8000/';
export const AppContext = React.createContext();

export class AppProvider extends React.Component {
    constructor(state, context) {
        super(state, context);
        let c = cookie.get();        

        this.state = this.makeState(c);

        this.sequenceNotes = () => {
            let notes = this.state.notebook.notes;
            let sequenced = Map();
            let uuids = Set();
            let es = notes.entries();

            // Make a set of all the uuid_next
            es.map((k, v)=>{uuids.add(v.uuid_next)});

            // This does the resequencing
            function go (k) {
                if (k) {
                    let v = notes.get(k);
                    sequenced.set(k, v);
                    go(v.uuid_next);
                }
            }
            
            // The first one is the first one we find where
            es.map((k,v)=>{
                if (sequenced.size == 0  // there's nothing sequences
                    && !uuids.has(k) // it's uuid doesn't show up in any `uuid_next`s
                    && v.uuid_next   // it has a `uuid_next` itself
                    && !v.deleted) { // and it hasn't been deleted
                    go(k,v);
                }
            });
            return sequenced;
        };
	this.sweep = () => {
	    console.log("[Checking Notebook]");
	    if (!this.state.notebook.isSaved) {
		if (this.state.notebook.url)  {
		    this.putNotebook();
		}
                else if (!this.state.notebook.title) {
                    console.log(this.state.notebook);
                    console.log("NO TITLE, FIX THIS");
                }
		else {
		    this.saveNotebook();
		}
	    }
	    console.log("[Checking Notes]");
	    this.state.notebook.notes.forEach((v,k,m) => {
		if (!v.isSaved) {
		    if (!v.url) {
		        this.saveNote(v);
                    }
                    else {
                        this.patchNote(v);
                    }
		}
	    });
	}

	this.sweepPeriodically = () => {
	    setInterval(this.sweep, 1000 * SWEEP_DURATION_SECONDS);
	}
        
	this.sweepPeriodically();
    }

    modifyNote(uuid, o) {
	this.setState(
            {notebook:
	     update(this.state.notebook,
		    {$merge: {
                        notes: update(
                            this.state.notebook.notes,
			    {$add: [[uuid,
				     update(this.state.notebook.notes.get(uuid),
					    {$merge: o})]]})}})},
		    () => {
                        console.log('modified note', uuid, o);
                    }
		);        
    }

    reseq(current, next) {
    }
    
    cutNotes(from, to, targetBefore) {
        let _notes = this.state.notebook.notes;
        

    }
    patchNote(note) {
        let _this = this;
        axios({
	    method:'patch',
	    url:note.url,
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:{text:note.text,
                  order:note.order,
                  kind:note.kind}
	})
            .then(function(resp) {
		console.log("[@patchNote()]", resp.data);
                _this.modifyNote(note.uuid, {isSaved:true});
	    })
            .catch(error => {
                console.log(error, _this.state);
            });
        
    }
    saveNote(note) {
        let _this = this;
        axios({
	    method:'post',
	    in_notebook:this.state.notebook.url,
	    url:API+'notes/',
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:note
	})
            .then(function(resp) {
		console.log("[@saveNote()]", resp);
                let _uuid = resp.data.uuid;
                _this.modifyNote(_uuid, {url:resp.data.url,
                                         isSaved:true});
	    })
            .catch(error => {
                console.log('[!saveNote()]', error, _this.state);
            });
	
    }
    
    saveNotebook() {
        let _this = this;
        axios({
	    method:'post',
	    url:API+'notebooks/',
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:update(this.state.notebook, {$unset: ['notes']})
	})
            .then(function(resp) {
                _this.loadNotebookList();
		_this.setState(
		    {notebook: update(
			_this.state.notebook, {$merge: {
		            isSaved: true,
		            notes:new Map(),
		            ...resp.data}})
		    });
            })
            .catch(error => {
                console.log(`saveNotebook: There is already a notebook by you with that name! ${error}`);
            });
    }

    putNotebook() {
        let _this = this;
	console.log(this.state.notebook);
        axios({
	    method:'put',
	    url:this.state.notebook.url,
	    headers:this.makeAuthHeader(this.state.user.authToken),
	    data:update(this.state.notebook, {$unset: ['notes']})
	})
            .then(function(resp) {
                _this.loadNotebookList();
		_this.setState({notebook: update(
                    _this.state.notebook, {$merge: {
		        isSaved: true,
		        notes:new Map(),
		        ...resp.data}})});
            })
            .catch(error => {
                console.log(`saveNotebook: There is already a notebook by you with that name! ${error}`);
            });
    }

    loadNotebook() {
        let _this = this;
        console.log(this.state.notebook);
        axios(
            {method:'get',
             url:this.state.notebook.id,
             headers:this.makeAuthHeader(this.state.user.authToken)})
            .then(function(resp) {
                console.log(resp);
            })
            .catch(error => {
                alert(`There is already a notebook by you with that name! ${error.response.data.detail}`);
            });
    }

    loadNotebookList() {
        let _this = this;	
        axios({method:'get',
	       url:'http://localhost:8000/users/notebooks/',
               headers: this.makeAuthHeader(_this.state.user.authToken)
	      })
	    .then(function(response) {
                let notebookMap = new Map(response.data.map((n)=>[n.uuid, n]));
		_this.setState(
                    {user: update(_this.state.user, {$merge: {notebookList:notebookMap}})},
		    ()=>{console.log(_this.state.user);}
		);
	    });
    }

    deleteNotebook(uuid) {
        console.log(`[Deleting ${uuid}]`);
        let nb = this.state.user.notebookList.get(uuid);
        console.log(nb);
        axios({method:'delete',
               url:nb.url,
               headers: this.makeAuthHeader(this.state.user.authToken)               
              })
            .then(response=>{
                console.log('DID IT', response);
                  this.setState({
                      user:
                      update(this.state.user,
                             {$merge:
                              {notebookList:
                               update(this.state.user.notebookList,
                                      {$remove:
                                       [uuid]})                                                             
                              }})}, ()=>console.log(this.state.user))})
            .catch(error=>{
                console.log("ERROR!!!!!", error);
            });
    }
    makeState(c) {
        let isLoggedIn = false;
        let authToken = undefined;
        let username = undefined;
    
        if (c && c.authToken && c.username) {
            isLoggedIn = true;
            authToken = c.authToken;
            username = c.username;
        }
	
        return {
            user: {
                isLoggedIn:isLoggedIn,
                id:undefined,
                authToken:authToken,
                username:username,
                password:undefined,
                profile:undefined,
                notebookCurrent:undefined,
                notebookList:new Map(),
                scrollList:new Map()
            },
            notebook: {
                isSaved:false,
                isOnServer:false,
		notes:new Map()
	    },
            eventEditor: {
                on:false,
                currentEvent:{}
            },
            timeline: {
                isHorizontal:true,
                search: {
                    showing:undefined,
                    from:undefined,
                    to:undefined,
                    creator:undefined,
                    scroll:undefined,
                    topic:undefined
                },
                frame:undefined,
                span:undefined,
                position:undefined
            }
        }
    }
    
    makeAuthHeader(token) {
        return {Authorization: `Token ${token}`};
    }
    
    render() {
        return (
            <AppContext.Provider value={{

                state:this.state,
                
                handleUsernameUpdate:(event) => {
                    this.setState({user: update(this.state.user, {username: {$set: event.target.value}})});
                },
                
                handlePasswordUpdate:(event) => {
                    this.setState({user: update(this.state.user, {password: {$set: event.target.value}})});                    
                },

                doLogout:() => {
                    let _this = this;
                    axios({method:'post',
                           url:API+'auth/logout/',
                           headers: this.makeAuthHeader(this.state.user.authToken)
                          })
                        .then(function(response) {
                            _this.setState(_this.makeState());
                        })
                        .catch(function(error) {
                            console.log(error);
                        })
                        .finally(function(x) {
                            cookie.remove('authToken');
                            cookie.remove('username');                            
                            _this.setState(_this.makeState());
                        });
                },
                
                doLogin:(event) => {
                    event.preventDefault();
                    let _this = this;
                    axios.post(
                        API + 'auth/login/',
                        {
                            username: this.state.user.username,
                            password: this.state.user.password
                        })
                        .then(function(response) {
                            let u1 = update(_this.state.user, {
				$merge: 
				{
				    authToken: response.data.auth_token,
                                    password: undefined,
                                    isLoggedIn: true
				}});
                            cookie.set('authToken', response.data.auth_token);
                            cookie.set('username', _this.state.user.username);
                            _this.setState({user: u1});
                        })
                        .catch(function(error) {
                            console.log('ERROR', error);
                        });
                },
                
                addNotebook:() => {
                    this.setState({notebook: {
                        on:true,
			isSaved:false,
                        title:'Untitled-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6),
                        subtitle:'Un-subtitled',
                        description:'Un-summarized',
                        notes:new Map()
                    }}, this.saveNotebook);
                },

                loadNotebook:(id)=>{
                    this.setState({notebook:update(this.state.notebook,
                                                   {$set: {id:id}})},
                                  this.loadNotebook);
                },

		listNotebooks:()=>{
		    this.loadNotebookList();
		},
                
                deleteNotebook:(uuid)=> {
                    this.deleteNotebook(uuid);
                },

                notebookChange:(field, event)=>{
                    this.setState(
                        {notebook:update(this.state.notebook,
                                         {$merge: {
                                             isSaved:false,
                                             [field]: event.target.value}})});
                    console.log(field, event.target.value);
                },
                
                addNote:(event) => {
		    console.log('[@addNote(event)', event);
		    let _newNote = {
			isSaved:false,
			id:undefined,
			url:undefined,
			uuid:undefined,
			uuid_next:undefined,
			with_event:undefined,
			order:0,
			text:undefined,
			kind:event ? 'event' : 'text',
			when_created:undefined,
			when_modified:undefined,
			is_deleted:false
		    };
		    let _uuid = uuidv4();
                    let _notes = update(this.state.notebook.notes,
                                        {$add:[[_uuid,
                                                {order:0,
						 uuid:_uuid,
						 text:'THE TEXT OF THE NOTE',
						 in_notebook:this.state.notebook.url,
                                                 event:event,
						 with_event: event.url}]]});

                    let _sorted = new Map([..._notes.entries()]
                                          .sort((a,b) => a.order > b.order ? 1 : a.order < b.order ? -1 : 0));
                    this.setState({
                        notebook:update(this.state.notebook, {$merge: { notes: _sorted }})
                    });
                },

                doEventEditor:(event) => {
                    
                },
                
                moveNoteRange:() => {
                    let notes = this.state.notebook.notes;
                    let entries = notes.entries();
                    let range = entries.filter(noteId => notes.get(noteId).statusIsRangerTarget);
                    let mover = entries.filter(noteId => notes.get(noteId).statusIsMoving);
                    let target = entries.filter(noteId => notes.get(noteId).statusIsMoveTarget);

                    /* 
                       then rewrite the entries by making two arrays:
                       - 1 one of the things to move,
                       - 2 one of what's left before the target
                       - 3 one of what's left after the target
                       - then make a new array from 2, 1, 3
                       - then make a new map in that order
                       - then run through the array and look if b.order > c.order
                       - if so give it a new order of (c.order - a.order)/2 and mark that one to be saved
                    */
                    
                },
                
                updateNote:(newState) => {
                    let _this = this;
                    _this.setState({
                        notebook:update(
                            _this.state.notebook,
                            {$merge:
                             {notes:
                              update(_this.state.notebook.notes,
                                     {$add:
                                      [[newState.uuid,
                                        update(_this.state.notebook.notes.get(newState.uuid),
                                               {$merge: {isSaved: false, ...newState}})]]})}})},
                                   ()=>{}
                                  );

                },
                
                editNote:(e) => {
                    this.setState({
                        eventEditor:{on:true, event:e}
                    });
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

                eventWindowClose:() => {
                    this.setState({eventEditor:{on:false, event:undefined}});
                },
                
                deleteNote:(uuid) => {
                    console.log('deleting note', uuid);
                    let _notes = this.state.notebook.notes;
                    _notes.delete(uuid);
                    console.log(_notes);
                    this.setState({
                        notebook:update(this.state.notebook, {$merge: { notes:  _notes}})
                    });
                }
            }}>
            {this.props.children}
            </AppContext.Provider>

        );
    }
}

export default AppContext;
