(function() {
  'use strict';
  window.FruumData = window.FruumData || [];

  window.Fruum = window.Fruum || {};
  window.Fruum.require = window.Fruum.require || [];
  window.Fruum.models = window.Fruum.models || {};
  window.Fruum.collections = window.Fruum.collections || {};
  window.Fruum.utils = window.Fruum.utils || {};
  window.Fruum.emoji = window.Fruum.emoji || {
    symbols: {},
    convert: function(str) { return str; }
  };
  window.Fruum.plugins = window.Fruum.plugins || [];
  window.Fruum.processors = window.Fruum.processors || {};
  window.Fruum.processors.post = [];
  window.Fruum.processors.transmit = [];
  window.Fruum.processors.receive = [];
  window.Fruum.processors.init = [];
  window.Fruum.processors.persona = [];
  window.Fruum.messages = {
    private: 'Only administrators will be able to see this!',
    public: 'Everybody will be able to see this!',
    report: 'Report this post as inappropriate?',
    move: 'Move entire stream under new category?'
  };
  window.Fruum.permission = {
    0: 'everyone',
    1: 'logged-in users',
    2: 'administrators'
  };
  window.Fruum.usage = {
    0: 'discussion',
    1: 'helpdesk',
    2: 'blog',
    3: 'chat',
    4: 'categories only'
  }
})();
