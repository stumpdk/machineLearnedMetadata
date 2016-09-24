	var FB = require('fb');
    var FBharvest = function () {};

	//Private methods
	var harvestOptions = {
	    groupid: "109602915873899",	
		groupName: "Gamle København",
		numberOfRecords: 1,
		appId: '1136850856375164',
		appSecret: '0be50668a856a0eafec60f1babc2fb66'
	};

	var accessToken = null;

	var requestAccessToken = function(harvestOptions){
		var promise = new Promise(function(resolve, reject){
				if(accessToken){
					resolve(accessToken);
				}

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
				    	accessToken = res;
	    				FB.setAccessToken(res.access_token);
				    	resolve(res);
				    }
			});
		});	

		return promise;
	};

	var getGroupFeedFromGroup = function (offset)
	{
		var url = '/' + harvestOptions.groupid + '/feed?fields=id,message,link,created_time,picture,object_id&limit=1&offset=' + offset;

		return getFBData(url);
	};

	var getFBData = function(url){
		return requestAccessToken(harvestOptions).then(function(){
			promise = new Promise(function(resolve, reject){
				FB.api(url, function (res) {
				    if(res && res.error) {
				        if(res.error.code === 'ETIMEDOUT') {
				            console.log('request timeout');
				            reject(res.error);
				        }
				        else {
				            console.log('error getting data from fb: ' + res.error.message, url);
				            reject(res.error);
				        }
				    }
				    else {
				    	console.log('got data from fb');
				        resolve(res);
				    }
				});
			});

			return promise;	
		});
	};

	FBharvest.prototype.getCommentsForPost = function(postId, offset)
	{
		var url = '/' + postId + '/comments';

		if(offset)
		{
			url = url + '?limit=1&offset=' + offset;
		}

		return getFBData(url);
	}

	FBharvest.prototype.getPostsForGroup = function(groupId, offset)
	{
		var group = groupId || harvestOptions.groupid;

		var url = '/' + group + '/feed';

		if(offset)
		{
			url = url + '?limit=1&offset=' + offset;
		}

		return getFBData(url);
	}

	FBharvest.prototype.getComment = function(postId, offset) {
		var url;
		console.log(postId, offset);
		if(!postId)
			throw 'No post id given. Cannot load comments.';

		if(offset){
			url = '/' + postId + '/comments?limit=1&order=chronological&offset=' + offset;
		}
		else{
			url = '/' + postId + '/comments?limit=1&order=chronological';
		}
		
		return getFBData(url);
	};

    module.exports = FBharvest;