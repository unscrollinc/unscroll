import React from 'react';
import { Form, Text, TextArea, Checkbox } from 'react-form';
import axios from 'axios';
import update from 'immutability-helper';
const SCROLL_API='http://127.0.0.1:8000/scrolls/';

// This is kind of an experiment in re-localizing some remote state
// and local state management. I still need context for the user
// information and basic auth but it relies much less on the context
// manager and keeps things local.

class TimelistTitleEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditing:false,
            isSaved:true,
            isSaving:false,            
            scroll:undefined
        };
        console.log('EDITOR', props);

	this.sweep = () => {
            const _this = this;
            console.log('sweeping');
            if (!this.state.isSaved) {
                console.log('not saved!', this);
                // save it. Set the saved State to 
                this.setState(
                    {isSaving:true},
                    ()=>{
                        const s = this.state.scroll;
                        axios({
	                    method:'put',
	                    url:this.state.scroll.url,
	                    headers:{Authorization: `Token ${this.props.context.state.user.authToken}`},
	                    data:{title:s.title,
                                  description:s.description,
                                  citation:s.citation,
                                  link:s.link,
                                  is_public:s.is_public}
	                })
	                    .then(resp => {_this.setState({isSaved:true, isSaving:false});})
                            .catch(err => {console.log(err);});
                        ;
                    });
            }
        };

        setInterval(this.sweep, 1000 * 5);
    }

    scrollChange(k, v) {
        this.setState({isSaved:false, scroll:update(this.state.scroll, {$merge: {[k]:v}})}, ()=>{console.log(this.state);});
    }

    getScroll() {
        if (this.props.uuid) {
            const _this = this;
            const url = SCROLL_API + '?uuid=' + this.props.uuid;
	    axios.get(url)
	        .then(resp => {
                    _this.setState({scroll:resp.data.results[0]}, ()=>{console.log(this.state);});
	        }).catch(err => {
	        console.log('Error', err.response.status);
	        });
        }
    }

    componentDidMount() {
        this.getScroll();
    }

    makeTitle() {
        return (
            <div>
              <h1>{this.state.scroll.title}</h1>
              <p>Created: {this.state.scroll.when_created}</p>
              <p>Modified: {this.state.scroll.when_modified}</p>              
              <p>By: {this.state.scroll.by_user}</p>
              <p>{this.state.scroll.link}</p>
              <p>{this.state.scroll.citation}</p>
              <p>{this.state.scroll.description}</p>
            </div>
        );
    }
    
    makeForm() {
        return (
            <Form key={'form-' + this.props.uuid} defaultValues={this.state.scroll}>
              {(form) => {
                  // title, description, is_public, is_fiction, is_deleted, citation, link, with_thumbnail
                  return (
                      <form>
                        
                        <div key='title'>
                          Title: <Text
                                   field="title"
                                   onChange={(e)=>this.scrollChange('title', e)}
                            placeholder='Title' />
                        </div>
                        
                        <div key='citation'>
                          Citation: <Text
                                      field="citation"
                                      onChange={(e)=>this.scrollChange('citation', e)}
                            placeholder='Citation' />
                        </div>
                        <div key='link'>
                          Link: <Text
                                  field="link"
                                  onChange={(e)=>this.scrollChange('link', e)}
                            placeholder='Link' />
                        </div>                                                                                                                              
                        <div key='description'>
                          Description:
                          <TextArea
                            field="description"
                            onChange={(e)=>this.scrollChange('description', e)}
                            placeholder='Description' />
                        </div>
                        <div key='public'>Public?
                          <Checkbox
                            field="is_public"
                            onChange={(e)=>this.scrollChange('is_public', e)}
                            />
                        </div>
                      </form>
                  );
              }}
            </Form>
        );
    }

    newEvent() {
        console.log('I am making a new event');
    }
    editButton() {
        return (
            <div>
              <button key='edit' onClick={()=>{this.setState({isEditing:!this.state.isEditing})}}>+ Edit</button>
              <button key='new' onClick={this.newEvent}>+ New</button>              
            </div>
        );
    }
    render() {
        
        if (this.state.scroll && this.state.isEditing) {
            return [this.editButton(), this.makeForm()];
        }
        else if (this.state.scroll) {
            return [this.editButton(), this.makeTitle()];
        }
        return null;
    }
}


export default TimelistTitleEditor;
