/******************************************************************************
Breadcrumb view
*******************************************************************************/

(function() {
  'use strict';
  window.Fruum.require.push(function () {
    Fruum.views = Fruum.views || {};

    var $ = Fruum.libs.$,
        _ = Fruum.libs._,
        Messages = Fruum.messages,
        Backbone = Fruum.libs.Backbone,
        Marionette = Fruum.libs.Marionette;

    Fruum.views.BreadcrumbView = Marionette.ItemView.extend({
      template: '#fruum-template-breadcrumb',
      ui: {
        navigate: '.fruum-js-navigate',
        close_search: '.fruum-js-search-close'
      },
      modelEvents: {
        'change:viewing change:searching': 'render'
      },
      events: {
        'click @ui.close_search': 'onCloseSearch',
        'click @ui.navigate': 'onNavigate'
      },
      onNavigate: function(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        Fruum.io.trigger('fruum:unset_onboard', 'breadcrumb');
        Fruum.io.trigger('fruum:view', { id: $(event.target).closest('[data-id]').data('id') });
      },
      onCloseSearch: function(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        Fruum.io.trigger('fruum:clear_search');
      }
    });
  });
})();
