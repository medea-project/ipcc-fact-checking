/*
  Scrape CA profiles
  Read: chapter*-ca*-profile/*.html
  Write: chapter*-ca*-profile/data.csv

  Dependencies (to install with npm):
  artoo-js, cheerio, glob

  Run (from the script folder, with Node.js):
  node scrape-ca-profiles.js

  Background Story:
  https://github.com/medialab/artoo/issues/166
*/

var artoo = require('artoo-js');
(function(){
  // export artoo to global context
  this.artoo = artoo;
})();
// load additional methods in artoo.helpers
// including artoo.helpers.toCSVString()
require('artoo-js/src/artoo.helpers.js');

var glob = require('glob');
var fs = require('fs');
var cheerio = require('cheerio');
var path = require('path');

glob("chapter*-ca*-profile/*.html", function(err,matches){
  matches.forEach(function(inputFileName){
    console.log("Read: "+inputFileName);
    var fileText = fs.readFileSync(inputFileName,{encoding:'utf8'});

    console.log("Parse: "+fileText.slice(0,50)+"...");
    var $ = cheerio.load(fileText);
    artoo.setContext($);

    var data = artoo.scrape("#content",{
      "Name": {sel:"h1"},
      "Organization": {sel:"div.person_content p:nth-of-type(1) span"},
      "Affiliation": {sel:"div.person_content p:nth-of-type(2) span"},
      "Citizenship": {sel:"div.person_content p:nth-of-type(3) span"}
    });
    var csv = artoo.helpers.toCSVString(data);
    console.log("Scraped: "+csv);

    var outputFileName = path.dirname(inputFileName)+path.sep+'data.csv';
    console.log("Save: "+outputFileName);
    fs.writeFileSync(outputFileName,csv,{encoding:'utf8'});
  });
  console.log("Complete");
});
