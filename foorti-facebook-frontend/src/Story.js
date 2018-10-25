import React, { Component } from 'react';
import { Link } from 'react-router-dom'

import { Container, Grid } from 'semantic-ui-react';

import ListStories from './components/ListStories';

class Story extends Component {

	render() {

		return (

			<div>
				<div className="banner">
					Stories || <Link to="/poll">Polls</Link>
				</div>
				<div className="wrapper">
					<Container fluid>
						<Grid>
							<Grid.Row >
								<Grid.Column className="txtbox" only="computer" width={4} stretched>
									the<br />foorti<br />radio<br />frontend
								</Grid.Column>
								<Grid.Column width={12} stretched textAlign="left">
									<ListStories />
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</Container>
				</div>
			</div >
		);
	}
}

export default Story;
