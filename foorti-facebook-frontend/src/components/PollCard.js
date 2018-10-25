import React, { Component } from 'react';
import { Card } from 'semantic-ui-react';
import { PieChart } from 'react-easy-chart';
import { isMobile } from 'react-device-detect';

class PollCard extends Component {

	constructor(props) {

		super(props);

		this.state = {

			piesize: 260
		}
	}

	componentWillMount() {

		//axios.get('https://thecodeninjas.net:5001/polls/' + this.props.data).then(response => this.setState({ data: response.data }));

		if (isMobile)
			this.setState({ piesize: 230 });
	}

	render() {

		//const values = this.state.data.stats || [];
		const values = this.props.data.stats || [];

		return (

			<Card color='red'>
				<Card.Content>
					<PieChart
						labels
						size={this.state.piesize}
						data={values}
					/>
				</Card.Content>
				<Card.Content extra>
					{this.props.data.details}
				</Card.Content>
			</Card>
		);
	}
};

export default PollCard;