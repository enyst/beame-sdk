/**
 * Created by zenit1 on 09/08/2016.
 */
var gulp  = require('gulp');
var jsdoc = require('gulp-jsdoc3');


gulp.task('doc', function (cb) {

	var config = {
		"opts": {
			"destination": '../beame-sdk-manual/'
		},
		"templates":{
			"theme" : "cerulean"
		}
	};

	gulp.src(['JSDOC_README.md', './src/cli/crypto.js', './src/cli/creds.js', './src/services/BaseHttpsServer.js'], {read: true})
		.pipe(jsdoc(config, cb));
});