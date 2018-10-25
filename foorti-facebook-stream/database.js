import mysql from 'mysql';
import {
	MYSQL_HOST,
	MYSQL_PORT,
	MYSQL_DATABASE,
	MYSQL_USERNAME,
	MYSQL_PASSWORD
} from '../config.js';

class Database {

	constructor() {

		this.connection = mysql.createConnection({

			host: MYSQL_HOST,
			port: MYSQL_PORT,
			user: MYSQL_USERNAME,
			password: MYSQL_PASSWORD,
			database: MYSQL_DATABASE
		});
	}

	query(sql, args) {

		return new Promise((resolve, reject) => {

			this.connection.query(sql, args, (err, rows) => {

				if (err)
					return reject(err);

				resolve(rows);
			});
		});
	}

	close() {

		return new Promise((resolve, reject) => {

			this.connection.end(err => {

				if (err)
					return reject(err);

				this.connection.destroy();
				resolve();
			});
		});
	}
}

export default Database;