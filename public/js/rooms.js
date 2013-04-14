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

  var ChatView = Backbone.View.extend({

    model: new Room(),

    events: {
    },

    initialize: function(options){
      this.$el = options.$el;

      this.listenTo(this.model, 'change', this.render);

      this.$messagesContainer = $("<textarea class='span8' id='chat' />");
      this.$submitForm = $("<form class='span8'>"
        + "<input class='span10 pull-left' />"
        + "<input type='submit' class='span2 btn btn-primary pull-right' />"
        + "</form>");
    },

    render: function() {
      console.log('ChatView: chatting in ' + this.model.get('_id'));
      this.$el.html('');

      var $hTag = $('<h3></h3>');
      $hTag.html("Chatting in " + this.model.get('title'));

      this.$el.append($hTag);
      this.$el.append(this.$messagesContainer);
      this.$el.append(this.$submitForm);
    }

  })

  var RoomView = Backbone.View.extend({

    tagName: "li",
    template: _.template("<a href='#' data-id='<%= _id %>'><%= title %></a>"),

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  })

  var RoomListView = Backbone.View.extend({

    activeRoom: null,

    events: {
      'click .new-room-button': 'newRoomClicked',
      'keypress .new-room-input': 'inputKeyPress',
      'focusout .new-room-input': 'cancelEntering',
      'click .nav a': 'changeRooms'
    },

    initialize: function(options) {
      _.bindAll(this, 'newRoomClicked', 'inputKeyPress', 'cancelEntering', 'changedRooms', 'changeRooms');

      this.$el = options.$el;

      this.chatView = new ChatView({
        $el: options.$chat
      })

      this.$container = $("<ul class='nav nav-pills nav-stacked'></ul>");
      this.$newRoomButton = $("<button class='new-room-button btn pull-right'><i class='icon-plus'></i>New chat room</button>");
      this.$newRoomInput = $("<input type='text' class='new-room-input input-small pull-right' />").hide();

      this.rooms = new RoomCollection();

      this.listenTo(this.rooms, 'add', this.addAll);
      this.listenTo(this.rooms, 'reset', this.addAll);
      this.listenTo(this.rooms, 'all', this.render);

      var that = this;

      this.rooms.fetch({
        success: function(collection, response, options) {
          if (collection.length > 0) {
            that.activeRoom = collection.first();
            that.changeRooms(that.activeRoom.get('_id'));
          }
        }
      })

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
      this.rooms.each(this.addOne, this);
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
            this.rooms.add(model);
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
    },

    changedRooms: function() {
      this.chatView.model.set({
        'title': this.activeRoom.get('title'),
        '_id': this.activeRoom.get('_id')
      });
    },

    changeRooms: function(event) {
      if (typeof event === 'string') {
        var $target = this.$el.find('a[data-id='+ event +']');
      } else {
        var $target = $(event.target);
      }

      this.$el.find('li.active').removeClass('active');
      $target.parent().addClass('active');
      this.activeRoom = this.rooms.get($target.data('id'));
      this.changedRooms();

      event.preventDefault();
    }

  })

  var roomsView = new RoomListView({
    $el: $('#js-rooms-container'),
    $chat: $('#js-chat-container')
  });

})(jQuery, Backbone, _)

