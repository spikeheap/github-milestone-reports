"use strict";

require("dotenv").load();

var markdown = require( "markdown" ).markdown;
var GitHubApi = require("github");

var github = new GitHubApi({
  version: "3.0.0",
  //debug: true
});

github.authenticate({
    type: "oauth",
    token: process.env.GITHUB_PERSONAL_TOKEN
});

var user = 'growkudos';
var repo = 'growkudos';
var ignoredMilestones = ['Product Backlog', 'Support'];
var PERCENTAGE_PRECISION = 0; // number of decimal places

//the output markdown, as an array of lines
var outputMarkdown = [];
outputMarkdown.push('# Sprint report');
outputMarkdown.push('');

new Promise(function(resolve){
	github.issues.getAllMilestones({user: "growkudos", repo: "growkudos"}, function (err, milestones) {
		if(err) { throw err; } 
		resolve(milestones);
	});
}).then(function (milestones) {
	var milestonePromises = milestones.filter(milestoneFilter).map(function (milestone) {
		return new Promise(function (resolve) {
			github.issues.repoIssues({user: "growkudos", repo: "growkudos", milestone: milestone.number, state: 'all'}, function (err, issues) {
				if(err) { throw err; } 
				milestone.issues = issues;
				resolve(milestone);
			});
		});
	});
	return Promise.all(milestonePromises)
}).then(function (milestones) {
	milestones.forEach(function (milestone) {
		var milestoneStoryPoints = 0;
		var milestoneStoryPointsClosed = 0;
		var milestoneStoryPointsOpen = 0;
		var unestimatedIssues = [];

		outputMarkdown.push('## [' + milestone.title + '](' + milestone.html_url + ')');
		outputMarkdown.push(milestone.description);
		outputMarkdown.push('');

		milestone.issues.forEach(function (issue) {
			var issueLabels = issue.labels.filter(isNotAStoryPointLabel).map(extractName);

			var issueStoryPoints = issue.labels
				.filter(isAStoryPointLabel)
				.map(extractStoryPointValue)
				.reduce(addTogether, 0);

			if(issueStoryPoints == 0){
				unestimatedIssues.push(issue);
			}else{
				milestoneStoryPoints += issueStoryPoints;
				if(issue.state === 'open'){
					milestoneStoryPointsOpen += issueStoryPoints;
				}else{
					milestoneStoryPointsClosed += issueStoryPoints;
				}
			}

			// wrap issue labels in parentheses
			if(issueLabels.length > 0) {
				issueLabels = ' (' + issueLabels.map(makePreformatted).join(', ') + ')';
			} else {
				issueLabels = '';
			}

			outputMarkdown.push("* [#" + issue.number + "](" + issue.html_url + "): " + issue.title + issueLabels);
		});

		outputMarkdown.push('');
		outputMarkdown.push('#### Sprint summary');
		outputMarkdown.push('* ' + milestone.issues.length + ' issues (' + milestone.open_issues + ' open, ' + milestone.closed_issues + ' closed, ' + parseFloat((milestone.closed_issues / milestone.issues.length) * 100).toFixed(PERCENTAGE_PRECISION) + '% complete).');
		outputMarkdown.push('* ' + milestoneStoryPoints + ' story points estimated (' + milestoneStoryPointsOpen + ' points open, ' + milestoneStoryPointsClosed + ' points closed, ' + parseFloat((milestoneStoryPointsClosed / milestoneStoryPoints) * 100).toFixed(PERCENTAGE_PRECISION) + '% complete).');
		outputMarkdown.push('* ' + unestimatedIssues.length + ' unestimated issues (' + unestimatedIssues.map(extractsIssueNumberWithLink).join(', ')  + ').');
		outputMarkdown.push('');
	});

	return outputMarkdown.join('\n')
}).then(function (markdownText) {
	console.log('<!DOCTYPE html>');
	console.log('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">');
	console.log('<div class="container">');
	console.log('<div class="row">');
	console.log('<div class="col-xs-12">');
	console.log(markdown.toHTML(markdownText));
	console.log('</div>');
	console.log('</div>');
	console.log('</div>');
}).catch(function (err) {
	console.log('ERROR', err);
});

// Private functions
//

var STORY_POINT_REGEX = /sprint estimation - (\d+) unit/;

function milestoneFilter (milestone) {
	return ignoredMilestones.indexOf(milestone.title) == -1;
}
function isAStoryPointLabel (label) {
	return label.name.match(STORY_POINT_REGEX);
}

function isNotAStoryPointLabel (label) {
	return !isAStoryPointLabel(label);
}

function extractName(label) {
	return label.name;
}

function extractsIssueNumberWithLink (issue) {
	return '[#' + issue.number + '](' + issue.html_url + ')';
}

function extractStoryPointValue (label) {
	if(!label.name){
		return 0;
	}
	return new Number(label.name.match(STORY_POINT_REGEX)[1]);
}

function addTogether (previousValue, currentValue) {
	return previousValue + currentValue;
}

function makePreformatted (text) {
	return '`' + text + '`';
}
