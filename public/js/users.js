(function($, Backbone, _, users){

  var User = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot: '/users',

    defaults: {
      _id: null,
      login: null
    }
  })

  var UserCollection = Backbone.Collection.extend({
    model: User

  })

  var UserView = Backbone.View.extend({
  })

  var UserListView = Backbone.View.extend({

    searchTemplate: _.template($('#search-template').html()),
    tableTemplate: _.template($('#user-table-template').html()),
    tableRowTemplate: _.template('<tr><td>{{ login }}</td></tr>'),

    initialize: function(options) {
      this.$el = options.$el;
      this.$search = $(this.searchTemplate({ submit: 'Submit' }));
      this.$table = $(this.tableTemplate({ users: [] }));
      this.$tbody = this.$table.find('tbody');

      this.users = new UserCollection();
      this.listenTo(this.users, 'reset', this.render);
      this.listenTo(this.users, 'change', this.render)
      this.users.reset(options.users);
    },

    render: function() {
      this.$el.html('');
      this.$tbody.html('');
      this.$el.append(this.$search);
      this.$el.append(this.$table);

      this.users.each(function(user){
        this.$tbody.append(this.tableRowTemplate({ login: user.get('login') }));
      }, this)
    }

  })

  new UserListView({
    users: users,
    $el: $('#js-user-list')
  })

})($, Backbone, _, users)

