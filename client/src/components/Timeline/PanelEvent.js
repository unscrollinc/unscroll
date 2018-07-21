import React from 'react';
import { Link } from 'react-router-dom';
import EventNoteButton from '../Event/EventNoteButton';
import { DateTime } from 'luxon';
import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mightFit: true,
      top: this.props.top,
      left: this.props.left,
      width: this.props.width,
      height: this.props.height
    };
    this.myRef = React.createRef();
  }

  getImage(e) {
    if (e.with_thumbnail_image) {
      return 'http://localhost/' + e.with_thumbnail_image;
    }
    if (e.scroll_with_thumbnail) {
      return 'http://localhost/' + e.scroll_with_thumbnail;
    }
    return null;
  }

  makeImage(e) {
    if (e.with_thumbnail_image || e.scroll_with_thumbnail) {
      return (
        <a href={e.content_url} target="_blank">
          <img alt="" className="timeline-image" src={this.getImage(e)} />
        </a>
      );
    } else {
      return undefined;
    }
  }

  makeWhen(e) {
    if (e.when_original) {
      return (
        <div title={'Date parsed as: ' + e.when_happened}>
          {e.when_original}
        </div>
      );
    }
    return this.props.frame.format(e.when_happened);
  }

  componentDidMount() {
    const r = this.myRef.current.getBoundingClientRect();
    const b = window.innerHeight;
    const h = Math.ceil(
      0.2 + ((r.height / b) * 100) / this.props.cell.height,
      10
    );
    const w = 5;
    const res = this.props.doReservation(this.props.left, 0, w, h);
    if (res.success) {
      this.setState({
        width: res.w * this.props.cell.width + '%',
        height: res.h * this.props.cell.height + '%',
        left: res.x * this.props.cell.width + '%',
        top: 10 + res.y * this.props.cell.height + '%'
      });
    } else {
      this.setState({ mightFit: false });
    }
  }
  renderText(e) {
    if (e.text) {
      return <p dangerouslySetInnerHTML={{ __html: e.text }} />;
    }
    return null;
  }
  render() {
    if (this.state.mightFit) {
      const e = this.props.event;
      return (
        <div
          key={e.uuid}
          style={{
            width: this.state.width,
            height: this.state.height,
            left: this.state.left,
            top: this.state.top
          }}
          ref={this.myRef}
          className="event"
        >
          <div className="event-inner">
            <table className="timeline-event">
              <tbody>
                <tr>
                  <td colSpan="3">
                    {this.makeImage(e)}
                    <div>{this.makeWhen(e)}</div>
                    <h3>
                      <a
                        href={e.content_url}
                        target="_blank"
                        dangerouslySetInnerHTML={{ __html: e.title }}
                      />
                    </h3>
                    {this.renderText(e)}
                  </td>
                </tr>

                <tr>
                  <td colSpan="3">
                    <a href={e.source_url} target="_new">
                      {e.source_name}
                    </a>{' '}
                    (<Link to={'/users/' + e.username}>{e.username}</Link>)
                    <EventNoteButton event={e} />
                    <TimelinePanelEventEditButton event={e} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return null;
  }
}

export default Event;
