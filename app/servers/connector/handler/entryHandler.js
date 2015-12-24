module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.publish = function(msg, session, next) {
	var channel = this.app.get('channelService').getChannel(msg.topic, false);
	if (!channel) {
		next(null);
		return;
	}
	channel.pushMessage(msg);
	next(null);
};

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.subscribe = function(msg, session, next) {
	var granted = [msg.subscriptions[0].qos];
	var topic = msg.subscriptions[0].topic;
	if (!topic || topic.length == 0) {
		console.log("Invalid topic");
		next(null, []);
		return;
	}

	session.bind(session.id);
	session.set('topic', topic);
	session.pushAll(function(err) {
		if(err) {
			console.error('pushAll for session service failed! error is : %j', err.stack);
		}
	});

	session.on('closed', onSessionClosed.bind(null, this.app));

	var channel = this.app.get('channelService').getChannel(topic, true);
	if (!channel) {
		console.log("Get channel error");
		next(null, []);
		return;
	}

	channel.add(session.id, this.app.get("serverId"));

	next(null, granted);
}

var onSessionClosed = function(app, session) {
	if(!session) {
		return;
	}
	var topic = session.topic;
	if (!topic || topic.length == 0) {
		return;
	}

	var channel = app.get('channelService').getChannel(topic, false);
	if (!channel) {
		console.log("onSessionClosed get channel error");
		return;
	}
	channel.leave(session.id, app.get('serverId'));
	var ss = Object.keys(channel.records);
	if (ss == null || ss.length == 0) {
		channel.destroy();
	}
}
