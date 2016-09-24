var express = require('express');
var app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.get('/', function (req, res) {
   res.render('index', { title: 'Hey', message: 'Hello there!'});
});


//Get comment from Facebook and send it to user for rating
app.get('/getcomment', function (req, res) {
  	
  	var MLtrainer = require('./trainer.js');
	var FBharvest = require('./facebook.js');
    var harvest = new FBharvest();
  	var trainer = new MLtrainer();

  	postOffset = req.query.post_offset || 0;
	commentOffset = req.query.comment_offset || 0;

    //Get post
    harvest.getPostsForGroup()
    //Get comments
    .then(function(resultPost){
    	return harvest.getCommentsForPost(resultPost.data[0].id, commentOffset).then(function(res){
    		return {"post": resultPost, "comment": res};
    	});
    })
    //Classify comment
    .then(function(resultComment){
		return trainer.classify(resultComment.comment.data[0].message).then(function(res){
			resultComment.classification = res;
			return resultComment;
		});
    })
    //Render and display
    .then(function(postCommentClassification){
    	//console.log(postCommentClassification);
    	
    	var url = 'http://localhost:3000/ratecomment?classification=relevant&post_id=' + postCommentClassification.post.data[0].id + '&comment_id=' + postCommentClassification.comment.data[0].id + '&comment_offset=' + commentOffset + '&post_offset=' + postOffset;
console.log('rul');
    	var templateData = {
    		title: 'rate comment',
    		message: postCommentClassification.post.data[0].message,
    		comment: postCommentClassification.comment.data[0].message,
    		imgSrc: postCommentClassification.post.data[0].picture,
    		link: postCommentClassification.post.data[0].link,
    		suggestion: postCommentClassification.classification,
    		relevant: url + '&classification=relevant',
    		irrelevant: url + '&classification=irrelevant'
		};

    	res.render('show_post', templateData);
	});
});

app.get('/test', function(req, res){
	var FBharvest = require('./facebook.js');
    var harvest = new FBharvest();
	harvest.getPostAndComments(109602915873899).then(function(result){console.log(result);});
});

//Get comment rating from user and get next comment and/or post
app.get('/ratecomment', function (req, res) {
  	var MLtrainer = require('./trainer.js');
	var FBharvest = require('./facebook.js');
    var harvest = new FBharvest();
  	var trainer = new MLtrainer();

  	textToClassify = harvest.getCommentsForPost(req.query.post_id, req.query.comment_offset).then(function(resolve){
	  console.log('before trained' + resolve.data[0].message);  	  
	  trainer.trainByExample(resolve.data[0].message, req.query.classification);
	  console.log('trained');
	  
	  //There are more comments. Get them!
	//  console.log(resolve.data);
	  if(resolve.data.paging && resolve.data.paging.cursors.next){
		  	harvest.getPostsForGroup(false, req.query.post_offset+1).then(function(result){
	  				res.redirect('/getcomment?post_id=' + req.query.post_id + '&comment_id=' + result.data[0].id);
	  		});
	  }
	  else{
	  	console.log('new post');
	  	harvest.getPostsForGroup(false, req.query.post_offset+1).then(function(result){
	  		res.redirect('/getcomment?post_id=' + result.data[0].id);
	  	});
	  }
  });
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});