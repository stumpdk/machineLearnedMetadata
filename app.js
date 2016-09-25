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

	var ranOffset = Math.floor((Math.random() * 2000) + 1);

	harvest.batch(ranOffset).then(function(result){
		return JSON.parse(result[1].body);
	})
    //Render and display
    .then(function(postComments){
    	console.log(postComments);

    	var url = 'http://localhost:3000/ratecomment?&post_id=' + postComments.data[0].id;
		

    	var templateData = {
    		title: 'rate comment',
    		message: postCommentClassification.post.data[0].message,
    		comments: postComments.shift(),
    		imgSrc: postCommentClassification.post.data[0].picture,
    		link: postCommentClassification.post.data[0].link,
    		suggestion: postCommentClassification.classification,
    		relevant: url + '&classification=relevant&comment_id=',
    		irrelevant: url + '&classification=irrelevant&comment_id='
		};

    	res.render('show_post', templateData);
	});
});

app.get('/test', function(req, res){
	var FBharvest = require('./facebook.js');
    var harvest = new FBharvest();
	harvest.batch(10).then(function(result){
		console.log(result[1].body);
		console.log(JSON.parse(result[1].body));
	});
	//harvest.getPostAndComments(109602915873899).then(function(result){console.log(result);});
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
	  
res.redirect('/getcomment');
	  //There are more comments. Get them!
	//  console.log(resolve.data);
	/*  if(resolve.data.paging && resolve.data.paging.cursors.next){
		  	harvest.getPostsForGroup(false, req.query.post_offset+1).then(function(result){
	  				res.redirect('/getcomment?post_id=' + req.query.post_id + '&comment_id=' + result.data[0].id);
	  		});
	  }
	  else{
	  	console.log('new post');
	  	harvest.getPostsForGroup(false, req.query.post_offset+1).then(function(result){
	  		res.redirect('/getcomment?post_id=' + result.data[0].id);
	  	});
	  }*/
  });
});

app.get('/train', function(req, res){
	var MLtrainer = require('./trainer.js');
  	var trainer = new MLtrainer();

  	var text = decodeURI(req.query.text);
  	var classification = req.query.classification;

  	trainer.trainByExample(text,classification);

  	res.send('trained');
});

app.get('/qualify', function(req, res){
	var MLtrainer = require('./trainer.js');
  	var trainer = new MLtrainer();

  	var text = decodeURI(req.query.text);

  	trainer.classify(text).then(function(result){
  		res.send({result: result});
  	})
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});