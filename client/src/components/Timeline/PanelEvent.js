import React from 'react';
import { Link } from 'react-router-dom';
import EventNoteButton from '../Event/EventNoteButton';
// import TimelinePanelEventEditButton from './TimelinePanelEventEditButton';

const goodWidthDivisor = 3;
class Event extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mightFit: true,
            left: props.left,
            width:
                Math.floor(
                    (this.props.columnCount / goodWidthDivisor) *
                        this.props.cell.width
                ) + '%'
        };
        this.myRef = React.createRef();
    }

    getImage(e) {
        if (e.with_thumbnail_image) {
            return '//' + e.with_thumbnail_image;
        }
        if (e.scroll_with_thumbnail) {
            return '//' + e.scroll_with_thumbnail;
        }
        return null;
    }

    makeImage(e) {
        if (e.with_thumbnail_image || e.scroll_with_thumbnail) {
            return (
                <a href={e.content_url} target="_blank">
                    <img
                        alt=""
                        className="timeline-image"
                        src={this.getImage(e)}
                    />
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
        return this.props.whenTitle;
    }

    componentDidMount() {
        const r = this.myRef.current.getBoundingClientRect();
        const b = window.innerHeight;
        // MAGIC NUMBERS! BEWARE!!!!!!!
        const h = Math.ceil(
            ((r.height / b) * 121) / this.props.cell.height,
            10
        );
        const w = Math.floor(this.props.columnCount / goodWidthDivisor, 10);
        const res = this.props.doReservation(this.props.left, 0, w, h);

        if (res.success) {
            this.setState({
                width: res.w * this.props.cell.width + '%',
                height: res.h * this.props.cell.height + '%',
                left: res.x * this.props.cell.width + '%',
                top: 7.5 + res.y * this.props.cell.height + '%'
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
                        top: this.state.top,
                        left: this.state.left
                    }}
                    ref={this.myRef}
                    className="event"
                >
                    <div className="event-inner">
                        <div className="event-actual">
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
                                                    dangerouslySetInnerHTML={{
                                                        __html: e.title
                                                    }}
                                                />
                                            </h3>
                                            {this.renderText(e)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td colSpan="3">
                                            <a
                                                href={`/timelines/${
                                                    e.in_scroll_user
                                                }/${
                                                    e.in_scroll_slug
                                                }?view=horizontal`}
                                            >
                                                {e.scroll_title}
                                            </a>{' '}
                                            <a
                                                href={e.source_url}
                                                target="_new"
                                            >
                                                (Via)
                                            </a>{' '}
                                            (
                                            <Link to={'/users/' + e.username}>
                                                {e.username}
                                            </Link>
                                            )<EventNoteButton event={e} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }
}

export default Event;
