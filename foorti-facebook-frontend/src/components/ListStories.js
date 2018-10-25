import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import axios from 'axios';
import io from 'socket.io-client';

import StoryCard from './StoryCard';

class ListStories extends Component {

	constructor(props) {

		super(props);

		const socket = io('https://thecodeninjas.net:5001');

		this.state = {

			story: [],
			socket: socket
		}
	}

	componentDidMount() {

		this.refreshData();

		this.state.socket.on('PUSH_STORY', (data) => {

			let tmp = this.state.story;
			tmp.push(data)
			this.setState({ ...this.state, story: tmp });
		});

		this.state.socket.on('POP_STORY', (data) => {

			let tmp = this.state.story.filter(bit => !(bit.id === data));
			this.setState({ ...this.state, story: tmp });
		});
	}

	refreshData = () => {

		axios.get('https://thecodeninjas.net:5001/story').then(response => this.setState({ ...this.state, story: response.data }));
	}

	render() {

		return (

			<Card.Group centered >
				{this.state.story.map(x => <StoryCard key={x.id} data={x} socket={this.state.socket} />)}
			</Card.Group>
		);
	}
};

export default ListStories;