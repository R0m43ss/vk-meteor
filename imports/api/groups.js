import { Mongo } from 'meteor/mongo';

export const Groups = new Mongo.Collection('groups');

if(Meteor.isServer){
	Meteor.publish('groups', function groupsPublication() {
		return Groups.find();
	});
}

Meteor.methods({
	'groups.update'(id, gid, count, time){
		Groups.update(id, { $set: { group: gid, postsCount: count, updTime: time } });
	},
});