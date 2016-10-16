/******************************************************************************
Elastic search response validators
*******************************************************************************/

'use strict';

var _ = require('underscore');

module.exports = {
  id: function (source, q) {
    return source.id == q || source.parent == q || source.breadcrumb.indexOf(q) >= 0;
  },
  user_id: function (source, q) {
    return source.user_id == q;
  },
  mget: function (source, q) {
    return q.indexOf(source.id) >= 0;
  },
  children: function (source, q) {
    return source.parent == q && !source.archived;
  },
  gc_archived: function (source, q) {
    return source.archived == true && source.archived_ts <= q;
  },
  gc_chat: function (source, q) {
    return source.type == 'post' && source.parent_type == 'channel' && source.updated <= q;
  },
  gc_users: function (source, q) {
    return source.admin == false && !(source.watch || []).length && source.last_login <= q;
  },
  gc_onboard: function (source, q) {
    return source.last_login <= q;
  },
  match_users: function(source, q) {
    return _.isMatch(source, q);
  },
  find_watch_users: function(source, q) {
    return _.intersection(source.watch, q).length > 0;
  }
}
