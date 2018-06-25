import React from 'react';
import AppContext from '../AppContext.js';
import { Form, Text, TextArea, Checkbox } from 'react-form';


class TitleEditor extends React.Component {

    render() {
	return (
            <AppContext.Consumer>
              {(context) => {
                  const nb = context.state.notebook;
                  if (nb.title!==undefined) {
                      return(
                          <Form defaultValues={context.state.notebook}>
                            {(form) => {
                                return (
                                    <form>
                                      <div>
                                        <Text
                                          field="title"
                                          onChange={(e)=>context.notebookTextFieldChange('title', e)}
                                          placeholder='Title' />
                                      </div>
                                      <div>
                                        <Text
                                          field="subtitle"
                                          onChange={(e)=>context.notebookTextFieldChange('subtitle', e)}
                                          placeholder='Subtitle' />
                                      </div>
                                      <div>
                                        <TextArea
                                          field="description"
                                          onChange={(e)=>context.notebookTextFieldChange('description', e)}
                                          placeholder='Description' />
                                      </div>
                                      <div>Public?
                                        <Checkbox
                                          field="is_public"
                                          onChange={(e)=>context.notebookChange('is_public', e)}
                                          />
                                      </div>
                                    </form>
                                );
                            }}
                          </Form>
                      );
                  }}
              }
            </AppContext.Consumer>                  
        );  
    }
}

export default TitleEditor;
