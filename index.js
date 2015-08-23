"use strict";

require("dotenv").load();

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

github.issues.getAllMilestones({user: "growkudos", repo: "growkudos"}, function (err, milestones) {

  milestones.filter(milestoneFilter).forEach(function (milestone) {
		github.issues.repoIssues({user: "growkudos", repo: "growkudos", milestone: milestone.number, state: 'all'}, function (err, issues) {
			var milestoneStoryPoints = 0;
			var milestoneStoryPointsClosed = 0;
			var milestoneStoryPointsOpen = 0;
			var unestimatedIssues = [];

			console.log('# [' + milestone.title + '](' + milestone.html_url + ')');
			console.log(milestone.description + '\n');

			issues.forEach(function (issue) {
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
					issueLabels = ' (' + issueLabels.map(makePreformatted).join(',') + ')';
				} else {
					issueLabels = '';
				}

				console.log("* [#" + issue.number + "](" + issue.html_url + "): " + issue.title + issueLabels);
			});

			console.log('\n');

			console.log('#### Sprint summary');
			console.log('* ' + issues.length + ' issues (' + milestone.open_issues + ' open, ' + milestone.closed_issues + ' closed, ' + parseFloat((milestone.closed_issues / issues.length) * 100).toFixed(PERCENTAGE_PRECISION) + '% complete).');
			console.log('* ' + milestoneStoryPoints + ' story points estimated (' + milestoneStoryPointsOpen + ' points open, ' + milestoneStoryPointsClosed + ' points closed, ' + parseFloat((milestoneStoryPointsClosed / milestoneStoryPoints) * 100).toFixed(PERCENTAGE_PRECISION) + '% complete).');
			console.log('* ' + unestimatedIssues.length + ' unestimated issues (' + unestimatedIssues.map(extractsIssueNumberWithLink).join(',')  + ').');

			console.log('\n');
		})
  })
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
