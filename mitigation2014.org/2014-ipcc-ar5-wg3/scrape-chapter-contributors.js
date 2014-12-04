/*
  Scrape Chapter Contributors
  Read: chapter*-contributors/*.html
  Write: chapter*-contributors/data.csv
  Write: chapter*-authors/data.csv

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

function getHeaders2(){
  return [
    "#",
    "Chapter",
    "Role",
    "Name (Country)"
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
    return $(this).parents('div').prevAll('h1').text().trim();
  },
  "Title": function($){
    return $(this).parent().prevAll('h2').text().trim();
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
  "Chapter": function($){
    return $(this).parents('div').prevAll('h1').text().trim();
  },
  "Title": function($){
    return $(this).parent().parent().prevAll('h2').text().trim();
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

function getShortCountry( country ){
  switch( country ){
    case "United States":
      return "USA";
    case "United Kingdom":
      return "UK";
    default:
      return country;
  }
}

function getData2(){
  return getData().map(function(line){
    if ( line === emptyLine ) {
      return {};
    }

    var citizenship = getShortCountry(line["Citizenship"]);
    var affiliationCountry = getShortCountry(
      line["Affiliation Country"]
    );

    if (
      affiliationCountry !== "" &&
      affiliationCountry !== citizenship
    ) {
      country = citizenship+"/"+affiliationCountry;
    } else {
      country = citizenship;
    }

    return {
      '#': substringAfter(line.Chapter,' '),
      'Chapter': line.Title,
      'Role': line.Role,
      'Name (Country)': line.Name+' ('+country+')'
    };
  });
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

    var directory = path.dirname(inputFileName);
    var outputFileName = directory+path.sep+'data.csv';
    console.log("Save: "+outputFileName);
    fs.writeFileSync(outputFileName,csv,{encoding:'utf8'});

    var csv2 = artoo.helpers.toCSVString(
      getData2(),
      {
        order: getHeaders2()
      }
    );
    console.log("Scraped: "+csv2);

    var outputFileName2 =
      directory.replace(/-contributors$/,'-authors')+path.sep+'data.csv';
    console.log("Save: "+outputFileName2);
    fs.writeFileSync(outputFileName2,csv2,{encoding:'utf8'});
  });
  console.log("Complete");
});
