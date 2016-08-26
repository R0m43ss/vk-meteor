import { Template } from 'meteor/templating';
import { Groups } from '../api/groups.js';
import './body.html';
import './feed.js';

Template.body.onCreated(function bodyOnCreated() {
	this.state = new ReactiveDict();
	this.state.set("show", false);
	Meteor.subscribe('groups');
});

Template.body.events({
	'click .newGroup'(){
		let sh = Template.instance().state.get("show");
		Template.instance().state.set("show", !sh);
	},
	'click .addButton'(){
		let gid = $("#new_gid").val();
		let num = $("#new_count").val();
		let updTime = $("#new_upd").val();
		Meteor.call('groups.add', gid, num, updTime);
		$("#newGroupForm").trigger('reset');
		Template.instance().state.set("show", false);
	},
});

Template.body.helpers({
	groups(){
		return Groups.find({}, { sort: { date: -1 } });
	},
	groupsCount(){
		return Groups.find().count();
	},
	isShow(){
		return Template.instance().state.get("show");
	},
});