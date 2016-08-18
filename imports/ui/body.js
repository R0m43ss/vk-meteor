import { Template } from 'meteor/templating';
import { Groups } from '../api/groups.js';
import { Posts } from '../api/posts.js';
import './body.html';
import './post.js';

var index = 1;

Template.body.onCreated(function bodyOnCreated() {
	Meteor.subscribe('posts');
	Meteor.subscribe('groups', function(){
		updatePosts();
	});
});
Template.body.helpers({
	posts() {
		return Posts.find({});
	},
	groupInfo() {
		return VK.Widgets.Group("vk_groups", 
								{redesign: 1, mode: 3, width: "auto", height: "auto", color1: 'FFFFFF', color2: '000000', color3: '5E81A8'}, 
								Groups.find() && Groups.find().fetch()[index] && Groups.find().fetch()[index].group);
	},
});

function updatePosts() {
	if(Meteor.isClient) {
		console.log(Groups.find().fetch());
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
		Meteor.setInterval(updatePosts, upd*60000);
	}
}