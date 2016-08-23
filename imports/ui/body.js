import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { Groups } from '../api/groups.js';
import { Posts } from '../api/posts.js';
import './body.html';
import './post.js';

var index = 0, interval_id;
const options = {redesign: 1, mode: 3, width: "auto", height: "auto", color1: 'FFFFFF', color2: '000000', color3: '5E81A8'};	// Options for VK widget

Template.body.onCreated(function bodyOnCreated() {
	this.state = new ReactiveDict();
	this.state.set('Index', 0);
	index = this.state.get('Index');
	Meteor.subscribe('posts');
	Meteor.subscribe('groups', function(){
		Meteor.call('groups.data');
		updatePosts();
	});
});

Template.body.helpers({
	posts() {
		return Posts.find({});
	},
	groupInfo() {
		let group_id = Groups.find().fetch()[Template.instance().state.get('Index')].group;
		return VK.Widgets.Group("vk_groups", options, group_id);
	},
});

Template.body.events({
	// Go to the previous item of communities list
	'click .prevButton'(){
		$("#vk_groups").html("");
		if(Template.instance().state.get('Index') == 0)
			// If it's the beginning of list, go to the last item
			Template.instance().state.set('Index', Groups.find().count() - 1);
		else {
			// Otherwise go to the previous item
			let oldIndex = Template.instance().state.get('Index');
			Template.instance().state.set('Index', oldIndex - 1);
		}
		index = Template.instance().state.get('Index');
		updatePosts();
		$("#gid").val(Groups.find().fetch()[index].group);
		$("#count").val(Groups.find().fetch()[index].postsCount);
		$("#upd").val(Groups.find().fetch()[index].updTime);
	},
	// Go to the next item of community list
	'click .nextButton'(){
		$("#vk_groups").html("");
		if(Template.instance().state.get('Index') == Groups.find().count() - 1)
			// If it's the end of list, go to the first item
			Template.instance().state.set('Index', 0);
		else {
			// Otherwise go to the next item
			let oldIndex = Template.instance().state.get('Index');
			Template.instance().state.set('Index', oldIndex + 1);
		}
		index = Template.instance().state.get('Index');
		updatePosts();
		$("#gid").val(Groups.find().fetch()[index].group);
		$("#count").val(Groups.find().fetch()[index].postsCount);
		$("#upd").val(Groups.find().fetch()[index].updTime);
	},
	// Open/close form for editing community data
	'click .editButton'(){
		if($("#groupForm").css("display") === "none") {
			let i = Template.instance().state.get('Index');
			$("#groupForm").css("display", "block");
			$("#gid").val(Groups.find().fetch()[i].group);
			$("#count").val(Groups.find().fetch()[i].postsCount);
			$("#upd").val(Groups.find().fetch()[i].updTime);
		}
		else {
			$("#groupForm").css("display", "none");
			$("#gid").val("");
			$("#count").val("");
			$("#upd").val("");
		}
	},
	// Save changes of community data
	'click .saveEditButton'(){
		let g_id = Groups.find().fetch()[Template.instance().state.get('Index')]._id;
		let gid = Math.abs(parseInt($("#gid").val(),10));
		let num = Math.abs(parseInt($("#count").val(),10));
		let updTime = Math.abs(parseInt($("#upd").val(),10));
		if(isNaN(gid) || (isNaN(num)) || isNaN(updTime)){
			throw new Meteor.Error("Wrong data format: Integer expected");
		}
		let g = Groups.findOne(g_id);
		if(gid != g.group || num != g.postsCount || updTime != g.updTime){
			$("#vk_groups").html("");
		}
		Meteor.call('groups.update', g_id, gid, num, updTime);
		index = Template.instance().state.get('Index');
		updatePosts();
		$("#groupForm").css("display", "none");
	},
});

// Update posts list
function updatePosts() {
	if(Meteor.isClient) {
		let id = Groups.find().fetch()[index].group;
		let count = Groups.find().fetch()[index].postsCount;
		let upd = Groups.find().fetch()[index].updTime;
		Meteor.call('posts.removeAll');
		Meteor.call('posts.get', id, count, function(err, res) {
			if(!err) {
				let ans = $.parseJSON(res.content);
				for(var i = 1; i < ans.response.length; i++) {
					let str = ans.response[i].text.replace(/<br>/g,"\n");
					let post = ans.response[i].id;
					let pic="";
					if(ans.response[i].attachment) {
						if(ans.response[i].attachment.type=="photo")
							pic = ans.response[i].attachment.photo.src_big;
					}
					Posts.insert({ text: str , url: 'http://vk.com/feed?w=wall' + id*(-1) + '_' + post, img: pic, });
				}
			}
			else {
				console.log(err);
			}
		});
		if(interval_id) {
			Meteor.clearInterval(interval_id);
		}
		interval_id = Meteor.setInterval(updatePosts, upd*60000);
	}
}