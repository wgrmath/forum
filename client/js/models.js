/******************************************************************************
Models
*******************************************************************************/

(function() {
  'use strict';
  window.Fruum.require.push(function () {
    var _ = Fruum.libs._;
    var Backbone = Fruum.libs.Backbone;
    //Document
    Fruum.models.Document = Backbone.Model.extend({
      defaults: {
        //document id
        id: '',
        //breadcrumb path
        breadcrumb: [],
        //document parent id
        parent: '',
        //document parent type
        parent_type: '',
        //category, thread, article, blog, post, bookmark, channel
        type: '',
        //creation date in unix timestamp
        created: 0,
        //last update date in unix timestamp
        updated: 0,
        //category or thread initials
        initials: '',
        //header e.g. category or thread/channel title
        header: '',
        //body e.g. description or post message or bookmark search query
        body: '',
        //if category/thread is sticky
        sticky: false,
        //permissions
        locked: false,
        visible: true,
        inappropriate: false,
        //0: everyone, 1: logged-in, 2: admins
        permission: 0,
        //0: discussion, 1: helpdesk, 2: blog, 3: chat, 4: categories
        usage: 0,
        //denormalized author details
        user_id: '',
        user_username: '',
        user_displayname: '',
        user_avatar: '',
        //reactions (array of usernames)
        react_up: [],
        react_down: [],
        //order
        order: 0,
        //total number of children
        children_count: 0,
        //if document is marked for deletion
        archived: false,
        //archived date unix timestamp
        archived_ts: 0,
        //tags
        tags: [],
        //attachments, array of [{ name: '', type: 'image', data: 'base64' }, ..]
        attachments: [],
        //metadata
        meta: {}
      }
    });
    //User profile
    Fruum.models.Profile = Backbone.Model.extend({
      defaults: {
        id: '',
        username: '',
        displayname: '',
        avatar: '',
        karma: 0,
        admin: false,
        blocked: false,
        joined: 0, //timestamp
        last_login: 0, //timestamp or 'online'.
        topics: 0,
        replies: 0
      }
    });
    //UI state
    Fruum.models.UIState = Backbone.Model.extend({
      defaults: {
        breadcrumb: [],
        viewing: {},
        editing: {},
        online: {},

        total_entries: 0,
        viewing_from: 0,
        viewing_to: 0,
        jumpto_post: 0,

        search: '',
        loading: '',
        load_state: '',
        view_req: '',

        profile: '',
        profile_total_users: 0,
        interacting: false,
        searching: false,
        has_search_string: false,
        visible: false,
        connected: false,
        optimizing: 0,
        search_helper: false,
        updates_count: 0,

        navigation_height: 0,
        interactions_height: 0,
        content_height: 0,
        panel_height: 0
      }
    });
    //User
    Fruum.user = {
      anonymous: true,
      admin: false
    };
    Fruum.userUtils = {
      watch: function(docid) {
        if (!docid) return;
        Fruum.user.watch = Fruum.user.watch || [];
        if (Fruum.user.watch.indexOf(docid) < 0)
          Fruum.user.watch.push(docid);
      },
      unwatch: function(docid) {
        if (!docid || !Fruum.user.watch) return;
        var index = Fruum.user.watch.indexOf(docid);
        if (index >= 0) Fruum.user.watch.splice(index, 1);
      },
      isWatching: function(docid) {
        return Fruum.user.watch && Fruum.user.watch.indexOf(docid) >= 0;
      },
      hasNotification: function(docid) {
        return Fruum.user.notifications && Fruum.user.notifications.indexOf(docid) >= 0;
      },
      addNotification: function(docid) {
        if (!docid) return;
        Fruum.user.notifications = Fruum.user.notifications || [];
        if (Fruum.user.notifications.indexOf(docid) < 0)
          Fruum.user.notifications.push(docid);
      },
      removeNotification: function(docid) {
        if (!docid || !Fruum.user.notifications) return;
        var index = Fruum.user.notifications.indexOf(docid);
        if (index >= 0) Fruum.user.notifications.splice(index, 1);
      },
      countNotifications: function() {
        if (!Fruum.user.notifications) return 0;
        return Fruum.user.notifications.length;
      }
    }
    //Cross view communication channel
    Fruum.io = _.clone(Backbone.Events);
  });
})();
