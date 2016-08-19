import { ReactiveDict } from 'meteor/reactive-dict';
import { Template } from 'meteor/templating';
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
	// Go to the previous item of communities list
	'click .prevButton'(){
		document.getElementById('vk_groups').innerHTML = "";
		if(Template.instance().state.get('Index') == 0)
			// If it's the beginning of list, go to the last item
			Template.instance().state.set('Index', length - 1);
		else {
			// Otherwise go to the previous item
			var oldIndex = Template.instance().state.get('Index');
			Template.instance().state.set('Index', oldIndex - 1);
		}
		index = Template.instance().state.get('Index');
		updatePosts();
		document.getElementById('gid').value = Groups.find().fetch()[Template.instance().state.get('Index')].group;
		document.getElementById('count').value = Groups.find().fetch()[Template.instance().state.get('Index')].postsCount;
		document.getElementById('upd').value = Groups.find().fetch()[Template.instance().state.get('Index')].updTime;
	},
	// Go to the next item of community list
	'click .nextButton'(){
		document.getElementById('vk_groups').innerHTML = "";
		if(Template.instance().state.get('Index') == length - 1)
			// If it's the end of list, go to the first item
			Template.instance().state.set('Index', 0);
		else {
			// Otherwise go to the next item
			var oldIndex = Template.instance().state.get('Index');
			Template.instance().state.set('Index', oldIndex + 1);
		}
		index = Template.instance().state.get('Index');
		updatePosts();
		document.getElementById('gid').value = Groups.find().fetch()[Template.instance().state.get('Index')].group;
		document.getElementById('count').value = Groups.find().fetch()[Template.instance().state.get('Index')].postsCount;
		document.getElementById('upd').value = Groups.find().fetch()[Template.instance().state.get('Index')].updTime;
	},
	// Open/close form for editing community data
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
	// Save changes of community data
	'click .saveEditButton'(){
		if(!parseInt(document.getElementById('gid').value,10) || !parseInt(document.getElementById('count').value,10) || !parseInt(document.getElementById('upd').value,10))
		{
			throw new Meteor.Error("Wrong data format");
		}
		var g_id = Groups.find().fetch()[Template.instance().state.get('Index')]._id;
		var gid = Math.abs(parseInt(document.getElementById('gid').value,10));
		var num = Math.abs(parseInt(document.getElementById('count').value,10));
		var updTime = Math.abs(parseInt(document.getElementById('upd').value,10));
		if(gid != Groups.findOne(g_id).group || num != Groups.findOne(g_id).postsCount || updTime != Groups.findOne(g_id).updTime){
			document.getElementById('vk_groups').innerHTML = "";
		}
		Meteor.call('groups.update', g_id, gid, num, updTime);
		index = Template.instance().state.get('Index');
		updatePosts();
		document.getElementById('groupForm').style.display = "none";
	},
});

// Update posts list
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
		interval_id = Meteor.setInterval(updatePosts, upd*60000);
	}
}