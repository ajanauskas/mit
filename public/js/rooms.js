(function($, Backbone, _){
  var Room = Backbone.Model.extend({
    idAttribute: "_id",

    defaults: {
      _id: null,
      title: "New room"
    },

    initialize: function() {

    }

  })

  var RoomCollection = Backbone.Collection.extend({
    model: Room,
    url: '/rooms.json'
  })

  var Rooms = new RoomCollection();

  var RoomView = Backbone.View.extend({

    tagName: "li",
    template: _.template("<a href='/rooms/{{ this.id }}'>{{ this.title }}</a>"),

    events: {
    }

  })

  var RoomListView = Backbone.View.extend({

    events: {
      'click .new-room-button': 'newRoomClicked',
      'keypress .new-room-input': 'newRoomEntered',
      'focusout .new-room-input': 'cancelEntering'
    },

    initialize: function(options) {
      _.bindAll(this, 'newRoomClicked', 'newRoomEntered', 'cancelEntering');

      this.el = options.el;
      this.$el = this.el;

      this.$container = $("<ul class='nav nav-pills nav-stacked'></ul>");
      this.$newRoomButton = $("<button class='new-room-button btn pull-right'><i class='icon-plus'></i>New chat room</button>")
      this.$newRoomInput = $("<input type='text' class='new-room-input input-small pull-right' />").hide();

      this.newRoom = null;

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
      Rooms.each(this.addOne, this)
    },

    newRoomClicked: function() {
      this.newRoom = new Room({});

      this.$newRoomButton.hide();
      this.$newRoomInput.show().focus().val(this.newRoom.get('title'));
    },

    newRoomEntered: function() {
      if (this.newRoom) {
      }

      this.$newRoomButton.show();
      this.$newRoomInput.hide();
    },

    cancelEntering: function(event) {
      this.newRoom = null;

      this.newRoomEntered();
    }
  })

  var RoomsView = new RoomListView({ el: $('.js-rooms-container') });

})(jQuery, Backbone, _)

