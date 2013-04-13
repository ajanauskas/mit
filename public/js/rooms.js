(function($, Backbone, _){
  var Room = Backbone.Model.extend({
    idAttribute: "_id",
    url: '/rooms.json',

    defaults: {
      _id: null,
      title: "New room"
    },

    initialize: function() {
      _.bindAll(this, 'validate');
    },

    validate: function() {
      if (_.isEmpty(this.get('title'))) {
        return "Title can't be empty";
      }
    }

  })

  var RoomCollection = Backbone.Collection.extend({
    model: Room,
    url: '/rooms.json',
    comparator: 'title'
  })

  var Rooms = new RoomCollection();

  var RoomView = Backbone.View.extend({

    tagName: "li",
    template: _.template("<a href='/rooms/<%= _id %>'><%= title %></a>"),

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  })

  var RoomListView = Backbone.View.extend({

    events: {
      'click .new-room-button': 'newRoomClicked',
      'keypress .new-room-input': 'inputKeyPress',
      'focusout .new-room-input': 'cancelEntering'
    },

    initialize: function(options) {
      _.bindAll(this, 'newRoomClicked', 'inputKeyPress', 'cancelEntering');

      this.el = options.el;
      this.$el = this.el;

      this.$container = $("<ul class='nav nav-pills nav-stacked'></ul>");
      this.$newRoomButton = $("<button class='new-room-button btn pull-right'><i class='icon-plus'></i>New chat room</button>")
      this.$newRoomInput = $("<input type='text' class='new-room-input input-small pull-right' />").hide();

      this.addingRoom = false;

      this.listenTo(Rooms, 'add', this.addAll);
      this.listenTo(Rooms, 'reset', this.addAll);
      this.listenTo(Rooms, 'all', this.render);

      Rooms.fetch();
    },

    render: function() {
      this.$el.html('');

      this.$el.append(this.$container);
      this.$el.append(this.$newRoomButton);
      this.$el.append(this.$newRoomInput);

      this.$el.addClass('clearfix');
    },

    addOne: function(room) {
      var view = new RoomView({ model: room });
      this.$container.append(view.render().el);
    },

    addAll: function() {
      console.log('addAll');
      this.$container.html('');
      Rooms.each(this.addOne, this);
    },

    newRoomClicked: function() {
      this.addingRoom = true;

      this.$newRoomButton.hide();
      this.$newRoomInput.show().focus().val(new Room().get('title'));
    },

    inputKeyPress: function(event) {
      if (event.which !== 13) {
        // continue if not enter
        return
      }

      var newRoom = new Room();
      var that = this;

      newRoom.save({
        title: this.$newRoomInput.val()
      },
      {
        error: function(model, xhr, options) {
          //TODO: error handling?
          alert(xhr.responseText);
        },
        success: function(model, response, options) {
          if (response._id) {
            Rooms.add(model);
            that.$newRoomButton.show();
            that.$newRoomInput.hide();
          }
        }
      })
    },

    cancelEntering: function(event) {
      this.addingRoom = false;

      this.$newRoomButton.show();
      this.$newRoomInput.hide();
    }
  })

  var RoomsView = new RoomListView({ el: $('.js-rooms-container') });

})(jQuery, Backbone, _)

