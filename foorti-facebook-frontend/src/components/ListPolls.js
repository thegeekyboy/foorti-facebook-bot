import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import axios from 'axios';
// import io from 'socket.io-client';

import PollCard from './PollCard';

class ListPolls extends Component {

	constructor(props) {

		super(props);

		this.state = {

			polls: []
		}
	}

	componentDidMount() {

		axios.get('https://thecodeninjas.net:5001/polls').then(response => this.setState({ polls: response.data }));
	}

	render() {

		return (

			<Card.Group centered >
				{this.state.polls.map(x => <PollCard key={x.pollid} data={x} />)}
			</Card.Group>
		);
	}
};

export default ListPolls;