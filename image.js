import axios from 'axios';
import sharp from 'sharp';

module.exports.imageResize = ({ userid, profile_pic }) => {

	axios(profile_pic, { responseType: 'arraybuffer' })
		.then(response => {

			const imgdata = new Buffer(response.data, 'binary');

			sharp(imgdata)
				.resize(290, 290)
				.toFile(`/var/www/html/fb-img/${userid}.jpg`, (err, info) => console.log(`[DEBUG] format: ${info.format}, size: ${info.size}`));
		});
}