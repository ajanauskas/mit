(function($, Backbone, _, users){

  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };

  var User = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot: '/users',

    defaults: {
      _id: null,
      login: null
    }
  })

  var UserCollection = Backbone.Collection.extend({
    model: User,

    initialize: function(options) {
      if (options && options.collection) {
        this.reset(options.collection);
      }
    }

  })

  var UserView = Backbone.View.extend({
  })

  var UserListView = Backbone.View.extend({

    searchTemplate: _.template($('#search-template').html()),

    initialize: function(options) {
      this.$el = options.$el;
      this.collection = options.collection;

      this.render();
    },

    render: function() {
      this.$el.html('');
      this.$el.append(this.searchTemplate({ submit: 'Submit' }));
    }

  })

  new UserListView({
    collection: new UserCollection({ collection: users }),
    $el: $('#js-user-list')
  })

})($, Backbone, _, users)

