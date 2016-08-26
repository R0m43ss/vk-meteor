import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

export const Posts = new Meteor.Collection('posts');

if(Meteor.isServer) {
	Meteor.publish('posts', function postsPublication() {
		return Posts.find();
	});	
	Meteor.methods({
		'posts.get'(id, gid, count){
			Posts.remove({owner: id});
			let result = HTTP.call('GET', 'https://api.vk.com/method/wall.get?owner_id='+gid*(-1)+'&count='+count);
			let ans;
			try {
				ans = JSON.parse(result.content);
			}
			catch(err) {
				throw new Meteor.Error(err.message);
			}
			if(ans.response){
				for(var i = 1; i < ans.response.length; i++) {
					let str = ans.response[i].text.replace(/<br>/g,"\n");
					let post = ans.response[i].id;
					let pic="";
					if(ans.response[i].attachment && ans.response[i].attachment.type=="photo")
						pic = ans.response[i].attachment.photo.src_big;
					Posts.insert({ text: str , url: 'http://vk.com/feed?w=wall' + gid*(-1) + '_' + post, img: pic, owner: id,});
				}
			}
			else if(ans.error)
				throw new Meteor.Error(ans.error.error_msg);
			else
				throw new Meteor.Error("Something went wrong:(");
		},
	});
}