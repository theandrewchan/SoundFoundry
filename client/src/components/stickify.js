import React, { Component } from "react";

/*
Gives the input InnerComponent a "sticky" flag that turns on when the user scrolls below a given threshold.
*/
export default function(InnerComponent, scrollHeight) {
    class StickyComponent extends Component {
        constructor(props) {
            super(props);
            this.onScroll = this.onScroll.bind(this);
            this.state = { sticky: false };
        }

        componentDidMount() {
            window.addEventListener("scroll", this.onScroll, false);
        }

        componentWillUnmount() {
            window.removeEventListener("scroll", this.onScroll, false);
        }

        onScroll() {
            if (window.scrollY >= scrollHeight && !this.state.sticky) {
                this.setState({ sticky: true });
            } else if (window.scrollY < scrollHeight && this.state.sticky) {
                this.setState({ sticky: false });
            }
        }

        render() {
            return <InnerComponent {...this.props} sticky={this.state.sticky} />;
        }
    }

    return StickyComponent;
}
