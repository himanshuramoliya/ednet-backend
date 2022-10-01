var fs = require('fs'); 
var parse = require('csv-parse');

var csvData=[];
fs.createReadStream(req.file.path)
    .pipe(parse({delimiter: ':'}))
    .on('data', function(csvrow) {
        console.log(csvrow);
        
        csvData.push(csvrow);        
    })
    .on('end',function() {
     
      console.log(csvData);
    });
