import { Template } from 'meteor/templating';
import { Groups } from '../api/groups.js';
import './body.html';
import './feed.js';

Template.body.onCreated(function bodyOnCreated() {
	Meteor.subscribe('groups');
});

Template.body.events({
	'click .newGroup'(){
		if($("#newGroupForm").css("display") === "none")
			$("#newGroupForm").css("display", "block");
		else
			$("#newGroupForm").css("display", "none");
	},
	'click .addButton'(){
		let gid = $("#new_gid").val();
		let num = $("#new_count").val();
		let updTime = $("#new_upd").val();
		Meteor.call('groups.add', gid, num, updTime);
		$("#newGroupForm").css("display", "none");
		$("#new_gid").val("");
		$("#new_count").val("");
		$("#new_upd").val("");
	},
});

Template.body.helpers({
	groups() {
		return Groups.find({}, { sort: { date: -1 } });
	},
	groupsCount() {
		return Groups.find().count();
	},
});