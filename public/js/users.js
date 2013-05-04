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

    tagName: 'tr',
    template: _.template("<td>{{ login }}</td><td><a href='#' class='remove btn btn-danger'>Remove User</a></td>"),

    events: {
      'click .remove': 'removeUser'
    },

    initialize: function(options) {
      _.bindAll(this, 'removeUser');

      this.model = options.model;
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    removeUser: function(event) {
      event.preventDefault();

      if (confirm("Are you sure you want to delete user?")) {
        this.model.destroy();
      }
    }

  })

  var UserListView = Backbone.View.extend({

    searchTemplate: _.template($('#search-template').html()),
    tableTemplate: _.template($('#user-table-template').html()),

    keyUpTimeout: null,

    events: {
      "keyup .search-query": "onSearchFieldType"
    },

    initialize: function(options) {
      _.bindAll(this, 'filterUsers', 'onSearchFieldType');

      this.$el = options.$el;
      this.$search = $(this.searchTemplate({ submit: 'Submit' }));
      this.$table = $(this.tableTemplate({ users: [] }));
      this.$tbody = this.$table.find('tbody');

      this.users = new UserCollection();
      this.listenTo(this.users, 'reset', this.render);
      this.users.reset(options.users);
    },

    render: function() {
      this.$el.html('');
      this.$tbody.html('');
      this.$el.append(this.$search);
      this.$el.append(this.$table);

      this.users.each(function(user){
        var userView = new UserView({ model: user });
        this.$tbody.append(userView.render().$el);
      }, this)
    },

    filterUsers: function() {
      $.ajax({
        context: this,
        url: '/users/search/' + this.$search.val(),
        type: 'GET',
        success: function(data) {
          this.users.reset(JSON.parse(data));
          this.$search.focus();
        }
      })
    },

    onSearchFieldType: function(event) {
      event.preventDefault();

      var that = this;
      clearTimeout(this.keyUpTimeout);

      this.keyUpTimeout = setTimeout(function() {
        that.filterUsers();
      }, 200);
    }

  })

  new UserListView({
    users: users,
    $el: $('#js-user-list')
  })

})($, Backbone, _, users)

