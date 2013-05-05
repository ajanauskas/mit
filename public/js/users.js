(function($, Backbone, _, users){

  var User = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot: '/users',

    defaults: {
      _id: null,
      login: null,
      roles: []
    }
  })

  var UserCollection = Backbone.Collection.extend({
    model: User
  })

  var UserView = Backbone.View.extend({

    tagName: 'tr',
    template: _.template("<td>{{ login }}</td><td><a href='#' class='manage btn'>Manage User</a><a href='#' class='remove btn btn-danger'>Remove User</a></td>"),

    events: {
      'click .remove': 'removeUser',
      "click .manage": "fireManagementEvent"
    },

    initialize: function(options) {
      _.bindAll(this, 'removeUser', 'fireManagementEvent');

      this.app = options.app;
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
    },

    fireManagementEvent: function(event) {
      event.preventDefault();

      this.app.trigger('openManagement', this.model);
    }

  })

  var UserManagementView = Backbone.View.extend({

    template: _.template($('#user-management-template').html()),

    events: {
      'submit form': 'submitForm'
    },

    user: null,

    initialize: function(options) {
      _.bindAll(this, 'clearView', 'submitForm');
      this.app = options.app;
      this.$el = options.$el;
    },

    render: function(user) {
      this.user = user;
      this.$el.html(this.template(user.toJSON()));
      this.$el.find('input[type=checkbox]').each(function(i, el) {
        $(el).prop('checked', _.contains(user.toJSON().roles, $(el).data('role')));
      });
      return this;
    },

    clearView: function() {
      this.$el.html('');
    },

    submitForm: function(event) {
      event.preventDefault();
      var $form = this.$el.find('form');

      $.ajax({
        context: this,
        url: $form.attr('action'),
        type: 'POST',
        data: $form.serialize(),
        success: function(data) {
          data = JSON.parse(data);
          if (data.status === 'OK') {
            this.user.set(data.user);
            alert('User saved');
          } else {
            alert('Internal error');
          }
        }
      })
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

      this.app = options.app;
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
        var userView = new UserView({ model: user, app: this.app });
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

  var UserAppView = Backbone.View.extend({

    initialize: function(options) {
      _.bindAll(this, 'openManagement');

      this.userList = new UserListView({
        app: this,
        users: users,
        $el: $('#js-user-list')
      });

      this.management = new UserManagementView({
        app: this,
        $el: $('#js-user-management')
      });

      this.on('openManagement', this.openManagement);
    },

    openManagement: function(user) {
      this.management.render(user);
    }

  })

  var userAppView = new UserAppView();

})($, Backbone, _, users)

