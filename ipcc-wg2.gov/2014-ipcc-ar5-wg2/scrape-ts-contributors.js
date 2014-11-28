/*
  Scrape TS Contributors
  Read: ts-contributors/*.html
  Write: ts-contributors/data.csv

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
  "Name": "",
  "Institution": "",
  "Citizenship": "",
  "Affiliation Country": ""
};

function getHeaders(){
  return [
    "Chapter",
    "Title",
    "Role",
    "Name",
    "Institution",
    "Citizenship",
    "Affiliation Country"
  ];
}

function trimText($){
  return $(this).text().trim();
}

var authorBox = {
  "Chapter": function(){
    return "TS";
  },
  "Title": function($){
    return $(this).parents('div').prevAll('h1').text().trim();
  },
  "Role": function($){
    return $(this).prevAll('h1').text().trim().slice(0,-1);
  },
  "Name": {sel:"h3", method:trimText},
  "Institution": {sel:"p:nth-of-type(1)", method:trimText},
  "Citizenship": {sel:"p:nth-of-type(2)>span", method:trimText},
  "Affiliation Country": {sel:"p:nth-of-type(3)>span", method:trimText}
};

var authorItem = {
  "Chapter": function(){
    return "TS";
  },
  "Title": function($){
    return $(this).parents('div').prevAll('h1').text().trim();
  },
  "Role": function($){
    return $(this).parent().prevAll('h1').text().trim().slice(0,-1);
  },
  "Name": {sel:"b>span", method:trimText},
  "Institution": empty,
  "Citizenship": {sel:"b+span", method:trimText},
  "Affiliation Country": empty
};

function getData(){
  return artoo.scrape(
    '#content > .col1 > div:nth-of-type(1) > .person_box',
    authorBox
  ).concat(
    emptyLine
  ).concat(
    artoo.scrape(
      '#content > .col1 > div:nth-of-type(2) > .person_box',
      authorBox
    )
  ).concat(
    emptyLine
  ).concat(
    artoo.scrape(
      '#content > .col1 > div:nth-of-type(3) > .person_box',
      authorBox
    )
  ).concat(
    emptyLine
  ).concat(
    artoo.scrape(
      '#content > .col1 > div:nth-of-type(4) > ul > li',
      authorItem
    )
  )
}

glob("ts-contributors/*.html", function(err,matches){
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
