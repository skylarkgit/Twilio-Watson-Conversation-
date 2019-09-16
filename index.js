var express = require('express');
var AssitantV1 = require('ibm-watson/assistant/v1');

var app = express();

var contexts = [];

// localhost:3000/smssent?Body=Hi&From=9911991199&To=9911991199
app.get('/smssent', function (req, res) {
  var message = req.query.Body;
  var number = req.query.From;

  var context = null;
  var index = 0;
  var contextIndex = 0;
  contexts.forEach(function(value) {
    if (value.from == number) {
      context = value.context;
      contextIndex = index;
    }
    index = index + 1;
  });

  console.log(number,': ', message);

  var conversation = new AssitantV1({
    disable_ssl_verification: true,
    iam_apikey: "<iam_apikey>",
    url: "<api_url>",
    version: '2018-02-16'
  });

  conversation.message({
    input: { text: message },
    workspace_id: '<workspace_id>',
    context: context
   }, function(err, response) {
       if (err) {
         console.error(err);
       } else {
         console.log('WATSON:', response.output.text[0]);
         if (context == null) {
           contexts.push({'from': number, 'context': response.context});
         } else {
           contexts[contextIndex].context = response.context;
         }

         var intent = response.intents[0] && response.intents[0].intent;
        //  console.log(intent);
         if (intent == "done") {
           //contexts.splice(contexts.indexOf({'from': number, 'context': response.context}),1);
           contexts.splice(contextIndex,1);
           // Call REST API here (order pizza, etc.)
         }

       }
  });

  res.send('');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
