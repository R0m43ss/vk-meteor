import { Mongo } from 'meteor/mongo';

export const Groups = new Mongo.Collection('groups');

if(Meteor.isServer){
	Meteor.publish('groups', function groupsPublication() {
		return Groups.find();
	});
}

Meteor.methods({
	// Insert test data
	'groups.data'(){
		if(!Groups.findOne({ group: 72495085 }))
			Groups.insert({ group: 72495085, postsCount: 9, updTime: 4 });
		if(!Groups.findOne({ group: 105256967 }))
			Groups.insert({ group: 105256967, postsCount: 4, updTime: 2 });
		if(!Groups.findOne({ group: 3305 }))
			Groups.insert({ group: 3305, postsCount: 3, updTime: 4 });
	},
	'groups.update'(id, gid, count, time){
		Groups.update(id, { $set: { group: gid, postsCount: count, updTime: time } });
	},
});