(function($, Backbone, _, rooms){

  var roomSocket = io.connect('/rooms'),
      messageSocket = io.connect('/messages');

  var Room = Backbone.Model.extend({
    idAttribute: "_id",

    defaults: {
      _id: null,
      title: "New room",
      active: false
    },

    initialize: function(options) {
      if (options && options.socketData) {
        var data = options.socketData;
        this.set({
          _id: data._id,
          title: data.title
        })
      }
    },

    validate: function() {
      if (_.isEmpty(this.get('title'))) {
        return "Title can't be empty";
      }
    }

  })

  var RoomCollection = Backbone.Collection.extend({

    model: Room,
    comparator: 'title',

    initialize: function(options) {
      _.bindAll(this, 'addFromSocket', 'destroyFromSocket');

      roomSocket.on('new room', this.addFromSocket);
      roomSocket.on('destroyed room', this.destroyFromSocket);
    },

    addFromSocket: function(data) {
      var model = new Room({ socketData: data });
      this.add(model);
    },

    destroyFromSocket: function(data) {
      var room = this.where({ _id: data._id })[0];

      if (room) {
        room.trigger('remove');
        this.remove(room);
      }
    }

  })

  var Message = Backbone.Model.extend({

    defaults: {
      body: "",
      created_at: new Date(),
      sender: ""
    },

    initialize: function(options) {
      if (options.socketData) {
        var data = options.socketData;
        this.set({
          body: data.body,
          sender: data.sender.login,
          created_at: new Date(Date.parse(data.created_at))
        })
      }
    }
  })

  var MessageView = Backbone.View.extend({

    tagName: "div",
    className: 'chat-message',
    template: _.template($('#message-view-template').html()),

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }

  })

  var MessageCollection = Backbone.Collection.extend({
    model: Message,

    initialize: function(roomId) {
      _.bindAll(this, 'setRoomId', 'populateFromSocket', 'addFromSocket');
      this.setRoomId(roomId);

      messageSocket.on('messages', this.populateFromSocket);
      messageSocket.on('new message', this.addFromSocket);
    },

    setRoomId: function(roomId) {
      this.roomId = roomId;
    },

    fetch: function() {
      messageSocket.emit('all', { roomId: this.roomId });
    },

    populateFromSocket: function(data) {
      var models = [];
      _.each(data, function(data){
        var model = new Message({ socketData: data });
        models.push(model);
      })

      this.reset(models);
    },

    addFromSocket: function(data) {
      if (this.roomId === data.roomId) {
        this.add(new Message({ socketData: data }));
      }
    },

    push: function(model) {
      messageSocket.emit('new', {
        body: model.get('body'),
        roomId: this.roomId
      })
    }

  })

  var ChatView = Backbone.View.extend({

    messages: null,

    events: {
      'submit form': 'onFormSubmit'
    },

    initialize: function(options){
      _.bindAll(this);

      this.app = options.app;
      this.$el = options.$el;

      this.$messagesContainer = $("<div class='span8' id='chat'></div>");
      this.$submitForm = $("<form action='post' class='span8'>"
        + "<input type='text' class='span10 pull-left' />"
        + "<input type='submit' class='span2 btn btn-primary pull-right' />"
        + "</form>");
      this.$input = this.$submitForm.find('input[type=text]');

      this.messages = new MessageCollection();

      this.on('changeRoom', this.changeRoom);
      this.listenTo(this.messages, 'reset', this.addMessages);
      this.listenTo(this.messages, 'add', this.addMessage);
    },

    render: function() {
      this.clear();
      var $hTag = $('<h3></h3>');
      $hTag.html("Chatting in " + this.room.get('title'));

      this.$el.append($hTag);
      this.$el.append(this.$messagesContainer);
      this.$el.append(this.$submitForm);
    },

    changeRoom: function(room) {
      this.room = room;
      this.$messagesContainer.html('')
      this.messages.setRoomId(room.get('_id'));
      this.messages.fetch(room.get('_id'))
      this.render();
    },

    onFormSubmit: function(event) {
      var body = this.$input.val();
      var message = new Message({
        body: body
      })

      this.messages.push(message);
      this.$input.val('');
      event.preventDefault();
    },

    addMessage: function(model) {
      var messageView = new MessageView({ model: model })
      this.$messagesContainer.append(messageView.render().$el);
      this.$messagesContainer.scrollTop(this.$messagesContainer[0].scrollHeight);
    },

    addMessages: function() {
      this.messages.forEach(function(model) {
        this.addMessage(model);
      }, this)
    },

    clear: function() {
      this.$el.html('');
    }

  })

  var RoomView = Backbone.View.extend({

    model: null,
    tagName: "li",
    template: _.template($('#room-view-template').html()),

    events: {
      'click': 'changeRooms',
      'click .icon-remove-sign': 'removeRoom'
    },

    initialize: function(options) {
      _.bindAll(this, 'changeRooms', 'removeRoom', 'toggleActive', 'triggerRemove');
      this.model = options.model;
      this.app = options.app;
      this.roomDeletionView = options.roomDeletionView;

      this.listenTo(this.model, 'remove', this.triggerRemove);
      this.listenTo(this.model, 'change:active', this.toggleActive);
    },

    render: function() {
      this.$el.html(this.template(_.extend(this.model.toJSON(), { roomDeletionView: this.roomDeletionView })));
      this.toggleActive();
      return this;
    },

    changeRooms: function(event) {
      if ($(event.target).hasClass('icon-remove-sign')) {
        return
      }

      this.app.trigger('roomChanged', this.model.get('_id'));
    },

    triggerRemove: function() {
      this.remove();
    },

    removeRoom: function(event) {
      if (confirm('Are you sure?')) {
        event.preventDefault();
        roomSocket.emit('destroyed room', { _id: this.model.get('_id') });
      }
    },

    toggleActive: function() {
      if (this.model.get('active')) {
        this.$el.addClass('active');
      } else {
        this.$el.removeClass('active');
      }
    }

  })

  var RoomListView = Backbone.View.extend({

    rooms: null,

    events: {
      'click .new-room-button': 'newRoomClicked',
      'keypress .new-room-input': 'inputKeyPress',
      'focusout .new-room-input': 'cancelEntering'
    },

    initialize: function(options) {
      _.bindAll(this);

      this.app = options.app;
      this.$el = options.$el;
      this.rooms = options.rooms;

      this.roomDeletionView = this.$el.data('delete-rooms');

      this.$container = $("<ul class='nav nav-pills nav-stacked'></ul>");
      this.$newRoomButton = $("<button class='new-room-button btn pull-right'><i class='icon-plus'></i>New chat room</button>");
      this.$newRoomInput = $("<input type='text' class='new-room-input input-small pull-right' />").hide();

      this.listenTo(this.rooms, 'add', this.addOne);
      this.listenTo(this.rooms, 'reset', this.addAll);
      this.listenTo(this.rooms, 'remove', this.removeRoom);
    },

    render: function() {
      this.$el.html('');

      this.$container.html('');
      this.$el.append(this.$container);
      this.$el.append(this.$newRoomButton);
      this.$el.append(this.$newRoomInput);

      this.$el.addClass('clearfix');

      this.addAll();
    },

    addOne: function(room) {
      var view = new RoomView({
        model: room,
        roomDeletionView: this.roomDeletionView,
        app: this.app
      });

      this.$container.append(view.render().$el);
    },

    addAll: function() {
      this.rooms.each(this.addOne, this);
    },

    newRoomClicked: function() {
      this.$newRoomButton.hide();
      this.$newRoomInput.show().focus().val('New room');
    },

    cancelEntering: function(event) {
      this.$newRoomButton.show();
      this.$newRoomInput.hide();
    },

    inputKeyPress: function(event) {
      if (event.which !== 13) {
        // continue if not enter
        return
      }

      var newRoom = new Room();
      newRoom.set('title', this.$newRoomInput.val())

      if (!newRoom.isValid()) {
        alert(newRoom.validationError());
      } else {
        roomSocket.emit('new room', newRoom.toJSON());
        this.cancelEntering();
      }
    }

   })

  var ChatApp = Backbone.View.extend({

    activeRoom: null,

    initialize: function(options) {
      _.bindAll(this, 'switchToFirstRoom', 'changeRoom', 'onRoomsReset');
      this.rooms = new RoomCollection();

      this.listenTo(this.rooms, 'add', this.onNewRoom);
      this.listenTo(this.rooms, 'remove', this.onRoomDeletion);
      this.listenTo(this.rooms, 'reset', this.onRoomsReset);
      this.on('roomChanged', this.changeRoom);

      this.roomList = new RoomListView({
        app: this,
        $el: options.$rooms,
        rooms: this.rooms
      });

      this.chatView = new ChatView({
        app: this,
        $el: options.$chat
      })

      this.rooms.reset(options.rooms);
    },

    render: function() {
      this.roomList.render();
    },

    changeRoom: function(id) {
      var room = this.rooms.where({ _id: id })[0],
          previousActive = this.rooms.where({ active: true})[0];

      if (previousActive) {
        previousActive.set('active', false);
      }

      room.set('active', true);
      this.chatView.trigger('changeRoom', room);
    },

    onRoomsReset: function() {
      if (this.activeRoom ===  null || _.isEmpty(this.rooms.where({ _id: this.activeRoom}))) {
        this.switchToFirstRoom();
      }
    },

    onRoomDeletion: function(room) {
      if (this.activeRoom === room.get('_id')) {
        this.switchToFirstRoom();
      }
    },

    onNewRoom: function(room) {
      if (this.activeRoom === null) {
        this.switchToFirstRoom();
      }
    },

    switchToFirstRoom: function() {
      var firstRoom = this.rooms.first();
      if (firstRoom) {
        this.activeRoom = firstRoom.get('_id');
        this.changeRoom(this.activeRoom);
      } else {
        this.activeRoom = null;
        this.chatView.clear();
      }
    }

  })

  new ChatApp({
    rooms: rooms,
    $rooms: $('#js-rooms-container'),
    $chat: $('#js-chat-container')
  }).render()


})(jQuery, Backbone, _, rooms)

