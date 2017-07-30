var fs = require('fs');
var express = require('express');
var parser = require('ua-parser');
var app = express();

var results, ipAddress, language, software;


if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
    console.log(req)
		  res.sendFile(process.cwd() + '/views/index.html');
    })

app.route('/api/whoami')
    .get(function(req, res) {

    //ipAddress = ip.address();
    // uses ua-agent module to get the software details
    var OS = parser.parseOS(req.headers['user-agent'].toString());
    software = OS.family;
    
    // gets IP address from x-forwarded-for
    var ipArr = req.headers['x-forwarded-for'].split(',');
    ipAddress = ipArr[0];
  
    language = req.headers["accept-language"];
    // splits language string into array to allow including just the first part in results
    var languageArr = language.split(',');
      
      results = { 
        "ipaddress": ipAddress,
        "language": languageArr[0],
        "software": software
        };
      res.json(results);    
    });



// Respond not found to all the wrong routes
app.use(function(req, res, next){
    results = { 
        "ipaddress": null,
        "language": null,
        "software": null
        };
      res.json(results);   
  res.status(404);

});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

/*
  $.getJSON("https://ipinfo.io/geo",function(ipData){
    console.log(ipData);
*/