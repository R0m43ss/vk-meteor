import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
import { check } from 'meteor/check';
import { Groups } from '../api/groups.js';
import { Posts } from '../api/posts.js';
import './body.html';
import './post.js';

var length = 1, index = 0, interval_id;

Template.body.onCreated(function bodyOnCreated() {
	this.state = new ReactiveDict();
	this.state.set('Index', 0);
	index = this.state.get('Index');
	Meteor.subscribe('posts');
	Meteor.subscribe('groups', function(){
		length = Groups.find().count();
		updatePosts();
	});
});

Template.body.helpers({
	posts() {
		return Posts.find({});
	},
	groupInfo() {
		return VK.Widgets.Group("vk_groups",{redesign: 1, mode: 3, width: "auto", height: "auto", color1: 'FFFFFF', color2: '000000', color3: '5E81A8'},Groups.find().fetch()[Template.instance().state.get('Index')].group);
	},
});

Template.body.events({
	'click .prevButton'(){
		document.getElementById('vk_groups').innerHTML = "";
		if(Template.instance().state.get('Index') == 0)
			Template.instance().state.set('Index', length - 1);
		else {
			var oldIndex = Template.instance().state.get('Index');
			Template.instance().state.set('Index', oldIndex - 1);
		}
		index = Template.instance().state.get('Index');
		updatePosts();
		document.getElementById('gid').value = Groups.find().fetch()[Template.instance().state.get('Index')].group;
		document.getElementById('count').value = Groups.find().fetch()[Template.instance().state.get('Index')].postsCount;
		document.getElementById('upd').value = Groups.find().fetch()[Template.instance().state.get('Index')].updTime;
	},
	'click .nextButton'(){
		document.getElementById('vk_groups').innerHTML = "";
		if(Template.instance().state.get('Index') == length - 1)
			Template.instance().state.set('Index', 0);
		else {
			var oldIndex = Template.instance().state.get('Index');
			Template.instance().state.set('Index', oldIndex + 1);
		}
		index = Template.instance().state.get('Index');
		updatePosts();
		document.getElementById('gid').value = Groups.find().fetch()[Template.instance().state.get('Index')].group;
		document.getElementById('count').value = Groups.find().fetch()[Template.instance().state.get('Index')].postsCount;
		document.getElementById('upd').value = Groups.find().fetch()[Template.instance().state.get('Index')].updTime;
	},
	'click .editButton'(){
		if(document.getElementById('groupForm').style.display === "none") {
			document.getElementById('groupForm').style.display = "block";
			document.getElementById('gid').value = Groups.find().fetch()[Template.instance().state.get('Index')].group;
			document.getElementById('count').value = Groups.find().fetch()[Template.instance().state.get('Index')].postsCount;
			document.getElementById('upd').value = Groups.find().fetch()[Template.instance().state.get('Index')].updTime;
		}
		else {
			document.getElementById('groupForm').style.display = "none";
			document.getElementById('gid').value = "";
			document.getElementById('count').value = "";
			document.getElementById('upd').value = "";
		}
	},
	'click .saveEditButton'(){
		var g_id = Groups.find().fetch()[Template.instance().state.get('Index')]._id;
		check(parseInt(document.getElementById('gid').value, 32), Number);
		check(parseInt(document.getElementById('count').value, 32), Number);
		check(parseInt(document.getElementById('upd').value, 32), Number);
		var gid = document.getElementById('gid').value;
		var num = document.getElementById('count').value;
		var updTime = document.getElementById('upd').value;
		Groups.update(g_id, { $set: { group: gid, postsCount: num, updTime: updTime } });
		index = Template.instance().state.get('Index');
		updatePosts();
		document.getElementById('vk_groups').innerHTML = "";
		document.getElementById('groupForm').style.display = "none";
	},
});

function updatePosts() {
	if(Meteor.isClient) {
		var id = Groups.find().fetch()[index].group;
		var count = Groups.find().fetch()[index].postsCount;
		var upd = Groups.find().fetch()[index].updTime;
		Meteor.call('posts.removeAll');
		Meteor.call('posts.get', id, count, function(err, res) {
			var str, post, pic;
			for(var i=1; i < $.parseJSON(res.content).response.length; i++) {
				str = $.parseJSON(res.content).response[i].text.replace(/<br>/g,"\n");
				post = $.parseJSON(res.content).response[i].id;
				pic="";
				if($.parseJSON(res.content).response[i].attachment) {
					if($.parseJSON(res.content).response[i].attachment.type=="photo")
						pic = $.parseJSON(res.content).response[i].attachment.photo.src_big;
				}
				Posts.insert({ text: str , url: 'http://vk.com/feed?w=wall' + id*(-1) + '_' + post, img: pic, });
			}
		});
		Meteor.clearInterval(interval_id);
		interval_id = Meteor.setInterval(function() { updatePosts(); console.log("upd"); }, upd*60000);
	}
}