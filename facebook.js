var FB = require('fb');

var harvestOptions = {
    groupid: "109602915873899",	
	groupName: "Gamle København",
	numberOfRecords: 10,
	appId: '1136850856375164',
	appSecret: '0be50668a856a0eafec60f1babc2fb66'
};

var requestAccessToken = function(harvestOptions)
{
	var newPromise = new Promise(function(resolve, reject){
			FB.api('oauth/access_token', {
		    client_id: harvestOptions.appId,
		    client_secret: harvestOptions.appSecret,
		    grant_type: 'client_credentials'
		}, function (res) {
		    if(!res || res.error) {
		        console.log(!res ? 'error occurred' : res.error);
		        reject();
		        return;
		    }
		    else{
		    	resolve(res);
		    }
		});
	});	

	return newPromise;
}

var harvestPost = function (harvestOptions)
{
	FB.api('/' + harvestOptions.groupid + '/feed?fields=id,message,link,created_time,picture,object_id&limit=' + harvestOptions.numberOfRecords, function (res) {
	    if(res && res.error) {
	        if(res.error.code === 'ETIMEDOUT') {
	            console.log('request timeout');
	        }
	        else {
	            console.log('error', res.error);
	        }
	    }
	    else {
	    	console.log('Got data from feed');
	        console.log(res);
	    }
	});
};

var harvestComments = function( commentId ) {
	FB.api('/' + commentId + '/comments?summary=true&limit=1000&order=chronological', function (res) {
	    if(res && res.error) {
	        if(res.error.code === 'ETIMEDOUT') {
	            console.log('request timeout');
	        }
	        else {
	            console.log('error', res.error);
	        }
	    }
	    else {
	    	console.log('Got data from comment');
	        console.log(res);
	    }
	});
};

requestAccessToken(harvestOptions).then(function(res){
	FB.setAccessToken(res.access_token);
	harvestPost(harvestOptions);
});