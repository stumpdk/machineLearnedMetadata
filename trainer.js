
	var natural = require('natural'),
  	fs = require('fs'),
  	classifier = new natural.BayesClassifier();

  	var MLtrainer = function() {};

  	const IRRELEVANT = 'ikke relevant';
  	const RELEVANT = 'relevant';
  	const pathToKnowledge = 'classifier.json';

	//Log training events
	classifier.events.on('trainedWithDocument', function (obj) {
	   console.log(obj.index);
	   /* {
	   *   total: 23 // There are 23 total documents being trained against
	   *   index: 12 // The index/number of the document that's just been trained against
	   *   doc: {...} // The document that has just been indexed
	   *  }
	   */ 
	});

  	var addMaterial = function(classifier, documents)
  	{
  		console.log(documents.length);
  		for(var i = 0; i < documents.length; i++)
  		{
  			classifier.addDocument(documents[i][0], documents[i][1]);
  		}
  	};

  	var train = function(classifier)
  	{
  		classifier.train();
  		classifier.save(pathToKnowledge, function(err, classifier) {
		    // the classifier is saved to the classifier.json file!
		});
  	};
  	
  	var test = function(text, resultCollection){
  		classify(text).then(function(result){
  			  			console.log('classified');
  			resultCollection.push(result);
  		});
  	};
  	
  	MLtrainer.prototype.classifyArray = function(texts)
  	{
  		results = [];
  		for(var i = texts; i<texts.length; i++){
  			test(text[i], results);
  		}
  		console.log('after');
  		return results;
  	}

  	var getMaterialFromFile = function()
  	{
		//var input = '#Welcome\n"1","2","3","4"\n"a","b","c","d"';
		//output.should.eql([ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ] ]);

		var csvInput = fs.readFileSync('trainingMaterial.csv', 'utf8');
		var documents = [];

		var learningMaterial = csvInput.split("\n");
		for(var i = 0; i < learningMaterial.length; i = i + 2)
		{
			learningMaterial[i] = learningMaterial[i].replace("relevant\"", "relevant");
			documents.push(learningMaterial[i].split("\",\""));
		}

		return documents;
  	};

  	MLtrainer.prototype.trainFromSourceFile = function()
	{
	  	var documents = getMaterialFromFile();
	  //	console.log(documents);
	  	addMaterial(classifier, documents);
	  	train(classifier);

	  	console.log(classifier.classify(documents[0][0]));
  	};

  	MLtrainer.prototype.trainByExample = function(textToClassify, classification)
  	{
  		//Load existing knowledge
  		natural.BayesClassifier.load(pathToKnowledge, null, function(err, classifier) {
		    //Add document and train
		    classifier.addDocument(textToClassify, classification);
		    classifier.train();
		    //Save the updated knowledge
		    classifier.save(pathToKnowledge);
		});
  	};

  	MLtrainer.prototype.classify = function(textToClassify){
  		
  		promise = new Promise(function(resolve, reject){
  		natural.BayesClassifier.load(pathToKnowledge, null, function(err, loadedClassifier) {
				var classification = loadedClassifier.classify(textToClassify);
				resolve(classification);
			});
  		});

  		return promise;
  	};

  	module.exports = MLtrainer;