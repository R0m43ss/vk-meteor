import { Mongo } from 'meteor/mongo';

export const Groups = new Mongo.Collection('groups');

if(Meteor.isServer){
	Meteor.publish('groups', function groupsPublication() {
		if(!Groups.findOne({ group: 72495085 }))
			Groups.insert({ group: 72495085, postsCount: 9, updTime: 4, date: new Date() });
		if(!Groups.findOne({ group: 105256967 }))
			Groups.insert({ group: 105256967, postsCount: 4, updTime: 2, date: new Date() });
		if(!Groups.findOne({ group: 3305 }))
			Groups.insert({ group: 3305, postsCount: 3, updTime: 4, date: new Date() });
		return Groups.find();
	});
}

Meteor.methods({
	'groups.update'(id, gid, count, time){
		let group = Math.abs(parseInt(gid,10));
		let postsCount = Math.abs(parseInt(count,10));
		let updTime = Math.abs(parseInt(time,10));
		if(isNaN(group) || (isNaN(postsCount)) || isNaN(updTime)){
			throw new Meteor.Error("Wrong data format: Integer expected");
		}
		let g = Groups.findOne(id);
		if(group != g.group || postsCount != g.postsCount || updTime != g.updTime){
			Groups.update(id, { $set: { group: group, postsCount: postsCount, updTime: updTime, date: new Date() } });
		}
	},
	'groups.add'(gid, count, time){
		let group = Math.abs(parseInt(gid,10));
		let postsCount = Math.abs(parseInt(count,10));
		let updTime = Math.abs(parseInt(time,10));
		if(isNaN(group) || (isNaN(postsCount)) || isNaN(updTime)){
			throw new Meteor.Error("Wrong data format: Integer expected");
		}
		Groups.insert({ group: group, postsCount: postsCount, updTime: updTime, date: new Date() });
	},
	'groups.remove'(id){
		Groups.remove(id);
	},
});