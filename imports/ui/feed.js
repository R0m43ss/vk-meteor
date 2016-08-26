import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Posts } from '../api/posts.js';
import './feed.html';
import './post.js';

Template.feed.onCreated(function feedOnCreated(){
	this.state = new ReactiveDict();
	this.state.set("Timer", null);
	this.state.set("isReady", true);
	this.state.set("Show", false);
	Meteor.subscribe('posts');
});

Template.feed.onDestroyed(function (){
	clearTimeout(Template.instance().state.get("Timer"));
});

Template.feed.helpers({
	posts(){
		if(Template.instance().state.get("isReady")){
			let temp = Template.instance();
			let _this = this;
			Meteor.call('posts.get', this._id, this.group, this.postsCount);
			let timer_id = setTimeout(function upd(){  
				Meteor.call('posts.get', _this._id, _this.group, _this.postsCount);
				let timer = setTimeout(upd, _this.updTime*60000);
				temp.state.set("Timer", timer);
			}, this.updTime*60000);
			Template.instance().state.set("Timer", timer_id);
		}
		return Posts.find({owner: this._id});
	},
	count() {
		return Posts.find({owner: this._id}).count();
	},
	show(){
		return Template.instance().state.get("Show");
	},
});

Template.feed.events({
	// Open/close form for editing community data
	'click .editGroupButton'(){
		let sh = Template.instance().state.get("Show");
		Template.instance().state.set("Show", !sh);
	},
	// Delete feed
	'click .deleteGroupButton'() {
		clearTimeout(Template.instance().state.get("Timer"));
		Meteor.call('groups.remove',this._id);
	},
	// Save changes of community data
	'click .saveChanges'(){
		let gid = $("#gid" + this._id).val();
		let num = $("#count" + this._id).val();
		let updTime = $("#upd" + this._id).val();
		let temp = Template.instance();
		temp.state.set("isReady", false);
		Meteor.call('groups.update', this._id, gid, num, updTime, function(err, res){
			if(!err) {
				clearTimeout(temp.state.get("Timer"));
				temp.state.set("isReady", true);
			}
			else
				temp.state.set("isReady", true);
		});
		Template.instance().state.set("Show", false);
		$("#gid" + this._id).val(this.group);
		$("#count" + this._id).val(this.postsCount);
		$("#upd" + this._id).val(this.updTime);
	},
});