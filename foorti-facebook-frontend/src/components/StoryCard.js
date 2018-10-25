import React, { Component } from 'react';
import { Transition, Card, Icon, Image } from 'semantic-ui-react';
import dateformat from 'dateformat';

class StoryCard extends Component {

	constructor(props) {

		super(props);

		this.state = {

			done: false,
			visible: true
		}
	}

	uMount = () => {

		this.setState({
			...this.state,
			done: true
		});

		this.setState({ visible: !this.state.visible });
		setTimeout(() => this.props.socket.emit('DEL_STORY', this.props.data.id), 300);
	}

	render() {

		const { visible } = this.state;
		const data = this.props.data;
		const profile_pic = `https://thecodeninjas.net/fb-img/${data.userid}.jpg`;
		const eventdate = dateformat(new Date(data.createdAt), 'dddd, mmmm dS, yyyy, h:MM:ss TT');

		return (

			<Transition visible={visible} animation='scale' duration={200}>
				<Card color='purple'>
					<Image src={profile_pic} />
					<Card.Content>
						<Card.Header>
							{data.first_name} {data.last_name}
							{(data.gender === 'male') ? <Icon name='man' /> : <Icon name='woman' />}
						</Card.Header>
						<Card.Meta>
							<span className='date'>
								{eventdate}
							</span>
						</Card.Meta>
						<Card.Description>
							{data.details}
						</Card.Description>
					</Card.Content>
					<Card.Content extra>
						{(this.state.done) ? <Icon name='checkmark' color='green' /> : <Icon name='wait' color='orange' onClick={this.uMount} />}
						{(data.storytype === 0) ? <span>Music Request</span> : <span>Shout Out</span>}
					</Card.Content>
				</Card>
			</Transition>
		);
	}
};

export default StoryCard;