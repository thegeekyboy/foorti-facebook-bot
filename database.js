import Sequelize from 'sequelize';
import { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD } from './config.js';

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD, {

	host: MYSQL_HOST,
	port: MYSQL_PORT,
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		idle: 10000
	},
	define: {
		freezeTableName: false
	},
	logging: false
});

sequelize.authenticate()
	.then(() => console.log(`[DEBUG] Connection established with ${MYSQL_DATABASE}`))
	.catch((err) => console.log(`[ERROR] There was an error connecting to the database : ${err}`));

module.exports.User = sequelize.define('userinfo', {

	status: Sequelize.FLOAT,
	pageid: { type: Sequelize.STRING, primaryKey: true },
	userid: { type: Sequelize.STRING, primaryKey: true },
	first_name: Sequelize.STRING,
	last_name: Sequelize.STRING,
	gender: Sequelize.STRING,
	profile_pic: Sequelize.STRING,
	timezone: Sequelize.INTEGER,
	locale: Sequelize.STRING,
	phone: Sequelize.STRING
});

module.exports.Location = sequelize.define('location', {

	pageid: Sequelize.STRING,
	userid: Sequelize.STRING,
	latitude: Sequelize.STRING,
	longitude: Sequelize.STRING
});

module.exports.Request = sequelize.define('request', {

	pageid: Sequelize.STRING,
	userid: Sequelize.STRING,
	status: Sequelize.INTEGER,
	details: Sequelize.STRING
});

module.exports.Checkin = sequelize.define('checkin', {

	pageid: Sequelize.STRING,
	userid: Sequelize.STRING,
	status: Sequelize.INTEGER,
	details: Sequelize.STRING
});

module.exports.Poll = sequelize.define('poll', {

	status: Sequelize.INTEGER,
	details: Sequelize.STRING,
	options: Sequelize.STRING
});

module.exports.Story = sequelize.define('story', {

	pageid: Sequelize.STRING,
	userid: Sequelize.STRING,
	status: Sequelize.INTEGER,
	details: Sequelize.STRING,
	storytype: Sequelize.INTEGER
});

module.exports.Vote = sequelize.define('vote', {

	pageid: Sequelize.STRING,
	userid: Sequelize.STRING,
	vote: Sequelize.INTEGER,
	pollid: {
		type: Sequelize.INTEGER,
		references: {
			model: 'polls',
			key: 'id'
		}
	}
});

sequelize.sync({ force: false });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

//module.exports = db;
// module.exports = Poll;
// module.exports = Vote;
//export default db;

module.exports.query = (sql, bindvar, querytype, model) => {

	return sequelize.query(
		sql,
		{
			replacements: bindvar,
			type: querytype || sequelize.QueryTypes.SELECT
		}
	);

	return;
};