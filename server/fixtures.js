import { Meteor } from 'meteor/meteor';
import { Groups } from '../imports/api/groups.js';

Meteor.startup(function(){
	if(Groups.find().count() !== 0)
		return;
	Groups.insert({ group: 72495085, postsCount: 5, updTime: 4, date: new Date() });
	Groups.insert({ group: 105256967, postsCount: 4, updTime: 2, date: new Date() });
	Groups.insert({ group: 3305, postsCount: 3, updTime: 4, date: new Date() });
});