import React from 'react';
import { Link } from 'react-router-dom';

class Column extends React.Component {
    render() {
        return (
                <div className="column"
                 style={{width:100/this.props.columnCount + '%'}}
                >
                <Link to={`/timelines?${this.props.span}`}>{this.props.title}</Link>
            </div>
        );
    }
}
export default Column;
