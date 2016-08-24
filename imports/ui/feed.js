import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Posts } from '../api/posts.js';
import './feed.html';
import './post.js';

const options = {redesign: 1, mode: 3, width: "auto", height: "auto", color1: 'FFFFFF', color2: '000000', color3: '5E81A8'};	// Options for VK widget

Template.feed.onCreated(function feedOnCreated(){
	this.state = new ReactiveDict();
	this.state.set("Interval", null);
	Meteor.subscribe('posts');
});

Template.feed.onDestroyed(function (){
	Meteor.clearInterval(Template.instance().state.get("Interval"));
});

Template.feed.helpers({
	posts(){
		let id = this._id;
		let gid = this.group;
		let count = this.postsCount;
		let time = this.updTime;
		Meteor.call('posts.get', id, gid, count);
		let interval_id = Meteor.setInterval(function(){  
			Meteor.call('posts.get', id, gid, count);
		}, time*60000);
		Template.instance().state.set("Interval", interval_id);
		return Posts.find({owner: this._id});
	},
	widget() {
		$("#vk_groups" + this._id).html("");
		return VK.Widgets.Group("vk_groups" + this._id, options, this.group);
	},
	count() {
		return Posts.find({owner: this._id}).count();
	},
});

Template.feed.events({
	// Open/close form for editing community data
	'click .editGroupButton'(){
		if($("#groupForm" + this._id).css("display") === "none")
			$("#groupForm" + this._id).css("display", "block");
		else
			$("#groupForm" + this._id).css("display", "none");
	},
	'click .deleteGroupButton'() {
		Meteor.call('groups.remove',this._id);
	},
	// Save changes of community data
	'click .saveChanges'(){
		let gid = $("#gid" + this._id).val();
		let num = $("#count" + this._id).val();
		let updTime = $("#upd" + this._id).val();
		Meteor.call('groups.update', this._id, gid, num, updTime);
		Meteor.clearInterval(Template.instance().state.get("Interval"));
		$("#groupForm" + this._id).css("display", "none");
		$("#gid" + this._id).val(this.group);
		$("#count" + this._id).val(this.postsCount);
		$("#upd" + this._id).val(this.updTime);
	},
	// Open/close posts list
	'click .showPosts'(){
		if($("#postList" + this._id).css("display") === "none")
			$("#postList" + this._id).css("display", "block");
		else
			$("#postList" + this._id).css("display", "none");
	},
	//Close posts list
	'click .closeList'(){
		$("#postList" + this._id).css("display", "none");
	},
});