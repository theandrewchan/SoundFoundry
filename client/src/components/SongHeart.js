import React, { Component, PropTypes } from "react";
import { loginUser, toggleLike } from "../actions/AuthedActions";
import Popover from "../components/Popover";

const propTypes = {
    authed: PropTypes.object,
    className: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    isLiked: PropTypes.bool,
    songId: PropTypes.number.isRequired
};

class SongHeart extends Component {
    constructor() {
        super();
        this.login = this.login.bind(this);
        this.toggleLike = this.toggleLike.bind(this);
    }

    login(e) {
        e.preventDefault();
        const { dispatch } = this.props;
        dispatch(loginUser(false));
    }

    toggleLike(e) {
        e.preventDefault();
        const { dispatch } = this.props;
        dispatch(toggleLike(songId));
    }

    render() {
        const { authed, className, isLiked } = this.props;
        if (!authed.user) {
            //if no logged in user, make the like button ask for a login
            return (
                <Popover className={`song-heart ${className}`}>
                    <i className="icon ion-ios-heart" />
                    <div className="song-heart-popover popover-content">
                        <ul className="nav-user-popover-list">
                            <li className="nav-user-popover-item">
                                <a href="#" className="button orange block" onClick={this.login}>
                                Sign into Soundcloud
                                </a>
                            </li>
                        </ul>
                    </div>
                </Popover>
            );
        }

        return (
            <a
                className={`song-heart ${className} ${isLiked ? "liked" : ""}`}
                href="#"
                onClick={this.toggleLike}
            >
                <i className="icon ion-ios-heart" />
            </a>
        );
    }
}

SongHeart.propTypes = propTypes;

export default SongHeart;
