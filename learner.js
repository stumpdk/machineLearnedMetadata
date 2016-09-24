
	var natural = require('natural'),
  	parse = require('csv-parse'),
  	fs = require('fs'),
  	classifier = new natural.BayesClassifier();

	//Log training events
	classifier.events.on('trainedWithDocument', function (obj) {
	   console.log(obj);
	   /* {
	   *   total: 23 // There are 23 total documents being trained against
	   *   index: 12 // The index/number of the document that's just been trained against
	   *   doc: {...} // The document that has just been indexed
	   *  }
	   */ 
	});

  	var addMaterial = function(classifier, documents)
  	{
  		for(var i = 0; i < document.length; i++)
  		{
  			classifier.addDocument(documents[i].input, documents[i].expectedResult);
  		}
  	};

  	var train = function(classifier, documents)
  	{
  		classifier.train();
  		classifier.save('classifier.json', function(err, classifier) {
		    // the classifier is saved to the classifier.json file!
		});
  	};

  	var getMaterialFromFile = function()
  	{
		//var input = '#Welcome\n"1","2","3","4"\n"a","b","c","d"';
		//output.should.eql([ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ] ]);

		var csvInput = fs.readFileSync('trainingMaterial.csv', 'utf8');
		var documents = [];
		var learningMaterial = parse(csvInput);

		for(var i = 0; i < learningMaterial.length; i++)
		{
			documents.add(learningMaterial[i][0], learningMaterial[i][1]);
		}

		return documents;
  	};

  	getMaterialFromFile();