import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import { Container, Grid } from 'semantic-ui-react';

import ListPolls from './components/ListPolls';

class Poll extends Component {

	render() {

		return (

			<div>
				<div className="banner">
					<Link to="/">Stories</Link> || Polls
				</div>
				<div className="wrapper">
					<Container fluid>
						<Grid>
							<Grid.Row >
								<Grid.Column className="txtbox" only="computer" width={4} stretched>
									the<br />foorti<br />radio<br />frontend
								</Grid.Column>
								<Grid.Column width={12} stretched textAlign="left">
									<ListPolls />
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</Container>
				</div>
			</div >
		);
	}
}

export default Poll;
