/*
  Scrape Chapter Contributors
  Read: *-contributors/*.html
  Write: *-contributors/data.csv

  Dependencies (to install with npm):
  artoo-js, cheerio, glob

  Run (from the script folder, with Node.js):
  node scrape-chapter-contributors.js

  Background Story:
  https://github.com/medea-project/ipcc-database/issues/36
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

var empty = function(){ return ""; };
var emptyLine = {
  "Chapter": "",
  "Title": "",
  "Role": "",
  "Name": "",
  "Institution": "",
  "Country": ""
};

function getHeaders(){
  return [
    "Chapter",
    "Title",
    "Role",
    "Name",
    "Institution",
    "Country"
  ];
}

function trimText($){
  return $(this).text().trim();
}

/*
  Extract the end of a string after given substring

  Parameters:
    string - string, the string from which to extract the end
    substring - string, the substring to look for

  Returns:
    string, the end of the string after the first occurrence of given substring
    or the empty string when the substring is not found in the string.

  Note:
    When the substring is the empty string, the whole string is returned.
*/
function substringAfter( string, substring ) {
  var position = string.indexOf( substring );
  if ( position === -1 ) {
    return "";
  }
  return string.slice( position + substring.length );
}

var authorBox = {
  "Chapter": function($){
    return $(this).prevAll('h1').last().text().trim();
  },
  "Title": function($){
    return $(this).prevAll('h3').text().trim();
  },
  "Role": function($){
    return $(this).prevAll('h1').first().text().trim().slice(0,-1);
  },
  "Name": {sel:"p:nth-of-type(1) > strong", method:trimText},
  "Institution": {sel:"p:nth-of-type(2)", method:trimText},
  "Country": {sel:"p:nth-of-type(3)", method:trimText}
};

var authorItem = {
  "Chapter": function($){
    return $(this).parent().prevAll('h1').last().text().trim();
  },
  "Title": function($){
    return $(this).parent().prevAll('h3').text().trim();
  },
  "Role": function($){
    return $(this).parent().prevAll('h1').first().text().trim().slice(0,-1);
  },
  "Name": {sel:"strong", method:trimText},
  "Institution": empty,
  "Country": {method:function($){
    return substringAfter( $(this).text(), "– ")
  }}
};

// Add empty lines between groups of authors
// with different roles
function addEmptyLines( authors ) {
  var
    result = [],
    currentRole;

  if ( authors.length === 0 ) {
    console.log("ERROR: No author found.");
    return result;
  }

  currentRole = authors[0].Role;
  authors.forEach( function(author) {
    if ( author.Role !== currentRole ) {
      currentRole = author.Role;
      result.push(emptyLine);
    }
    result.push(author);
  });

  return result;
}

function getData(){
  var authors = artoo.scrape(
    '#content > .listing > .author',
    authorBox
  ).concat(
    artoo.scrape(
      '#content > .listing > ul.contributing > li',
      authorItem
    )
  );

  return addEmptyLines(authors);
}

glob("*-contributors/*.html", function(err,matches){
  matches.forEach(function(inputFileName){
    console.log("Read: "+inputFileName);
    var fileText = fs.readFileSync(inputFileName,{encoding:'utf8'});

    console.log("Parse: "+fileText.slice(0,50)+"...");
    var $ = cheerio.load(fileText);
    artoo.setContext($);

    var csv = artoo.helpers.toCSVString(
      getData(),
      {
        order: getHeaders()
      }
    );
    console.log("Scraped: "+csv);

    var outputFileName = path.dirname(inputFileName)+path.sep+'data.csv';
    console.log("Save: "+outputFileName);
    fs.writeFileSync(outputFileName,csv,{encoding:'utf8'});
  });
  console.log("Complete");
});
