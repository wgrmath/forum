/******************************************************************************
 Authentication
*******************************************************************************/

'use strict';

var _ = require('underscore'),
    uuid = require('uuid'),
    Models = require('../models'),
    logger = require('../logger');

module.exports = function(options, instance, self) {
  var cache = self.cache,
      storage = self.storage,
      auth = self.auth,
      app_users = self.app_users,
      app_applications = self.app_applications;

  // --------------------------------- CONNECT ---------------------------------

  self.connect = function(socket) {
  }

  // ------------------------------- DISCONNECT --------------------------------

  self.disconnect = function(socket) {
    //unregister user
    var user = socket.fruum_user;
    if (user) {
      var app_id = user.get('app_id'),
          app = app_users[app_id];
      if (!app) {
        logger.error(socket.app_id, 'disconnect: cannot not find app', user);
      }
      else {
        app_users[app_id] = _.without(app, user);
        //remove from channel
        if (user.get('channel_id') && user.get('channel_parent')) {
          var online = {};
          online[user.get('channel_id')] = self.countNormalUsers(app_id, user.get('channel_id'));
          self.broadcastRaw(
            app_id, user.get('channel_parent'),
            'fruum:online', online
          );
        }
        //if app is empty, then delete it
        if (!app_users[app_id].length) {
          delete app_users[app_id];
          delete app_applications[app_id];
        }
        //update last logout timestamp and karma
        if (user.get('id')) {
          var now = Date.now();
          storage.update_user(app_id, user, {
            last_logout: now,
            logout_karma: user.get('karma')
          }, function(updated_user) {
            if (updated_user) {
              logger.info(app_id, 'update_last_logout',
                          updated_user.get('username') + ': ' + now);
              logger.info(app_id, 'update_logout_karma',
                          updated_user.get('username') + ': ' + updated_user.get('logout_karma'));
            }
            else {
              logger.error(app_id, 'update_last_logout_failed', user);
            }
          });
        }
      }
      user.set('socket', null);
      delete socket.fruum_user;
    }
  }

  // ----------------------------- AUTHENTICATE --------------------------------

  self.authenticate = function(socket, payload, onready) {
    //app_id is a required field
    if (!payload || !payload.app_id) {
      logger.system('auth: Missing app_id from payload');
      socket.emit('fruum:auth');
      socket.disconnect();
      return;
    }

    var app_id = payload.app_id;

    function register_cb(user) {
      var app = app_applications[app_id];
      app_users[app_id] = app_users[app_id] || [];
      app_users[app_id].push(user);
      //add default last visit timestamp
      user.set('last_visit', user.get('last_logout') || Date.now());
      //add a server time now
      user.set('server_now', Date.now());
      socket.emit('fruum:auth', {
        user: user.toJSON()
      });
      //add additional data
      user.set({
        viewing: 0,
        socket: socket,
        app_id: socket.app_id,
        session: uuid.v1(),
        permission: 0
      });
      //add permission level
      if (user.get('admin'))
        user.set('permission', 2);
      else if (!user.get('anonymous'))
        user.set('permission', 1);
      //ready to roll
      onready();
    }
    //get app by app_id
    if (!app_users[app_id]) {
      //app is not cached, query it
      storage.get_app(app_id, function(application) {
        if (!application) {
          logger.error(app_id, 'auth: Invalid app_id');
          socket.emit('fruum:auth');
          socket.disconnect();
        }
        else {
          app_applications[app_id] = application;
          _register_user(socket, payload, register_cb);
        }
      });
    }
    else _register_user(socket, payload, register_cb);
  }

  //register user
  function _register_user(socket, payload, onready) {
    //create a new user and put it in the right collection
    //based on the app_id
    var app_id = payload.app_id,
        user = new Models.User();
    //bind user object to socket for quick access
    socket.fruum_user = user;
    socket.app_id = app_id;
    //if user is defined in the payload try to authenticate using
    //the authentication engine, otherwise consider user to be anonymous
    if (payload.user) {
      //authenticate user
      auth.authenticate(app_applications[app_id], payload.user, function(auth_user) {
        if (auth_user && !auth_user.get('anonymous')) {
          //update user object with authentication results
          user.set(auth_user.toJSON());
          //check for updating user details
          storage.get_user(app_id, user.get('id'), function(storage_user) {
            var now = Date.now();
            if (!storage_user) {
              //add new user since it does not exist
              user.set({
                created: now,
                last_login: now
              });
              storage.add_user(app_id, user, function() {
                onready(user);
              });
            }
            else {
              //check for blocked user
              if (storage_user.get('blocked')) {
                //continue as anonymous
                user.set(user.defaults);
                onready(user);
                return;
              }
              //find new notifications
              storage.search_attributes(
                app_id,
                {
                  archived: false,
                  updated__gte: storage_user.get('last_logout'),
                  type__not: 'post',
                  ids: storage_user.get('watch')
                },
                function(documents) {
                  if (documents.length) {
                    var notifications = [];
                    _.each(documents, function(document) {
                      notifications.push(document.get('id'));
                    });
                    notifications = _.union(notifications, storage_user.get('notifications'));
                    storage_user.set('notifications', notifications);
                  }
                  //proceed to last step
                  user.set({
                    watch: storage_user.get('watch'),
                    notifications: storage_user.get('notifications'),
                    onboard: storage_user.get('onboard'),
                    karma: storage_user.get('karma'),
                    logout_karma: storage_user.get('logout_karma'),
                    meta: storage_user.get('meta'),
                    last_logout: storage_user.get('last_logout')
                  });
                  if (storage_user.needsUpdate(user)) {
                    //update user details (including posts)
                    user.set('last_login', now);
                    storage.update_user(app_id, user, null, function(updated_user) {
                      onready(updated_user);
                    });
                  } // user not modified
                  else {
                    storage.update_user(app_id, user, { last_login: now, notifications: user.get('notifications') }, function(updated_user) {
                      onready(updated_user);
                    });
                  }
                }, {
                  skipfields: ['header', 'body', 'tags', 'attachments']
                }
              );
            }
          });
        } //user not authenticated
        else { onready(user); }
      });
    } //no payload user object
    else { onready(user); }
  }
}
