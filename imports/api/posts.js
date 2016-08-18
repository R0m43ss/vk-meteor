import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

export const Posts = new Meteor.Collection('posts');

if(Meteor.isServer) {
	Meteor.publish('posts', function postsPublication() {
		return Posts.find();
	});	
	Meteor.methods({
		'posts.get'(id, count){
			return Meteor.http.get('https://api.vk.com/method/wall.get?owner_id='+id*(-1)+'&count='+count);
		},
		'posts.removeAll'(){
			Posts.remove({});
		},
	});
}