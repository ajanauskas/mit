(function($, Backbone, _, rooms){

  var roomSocket = io.connect('/rooms'),
      messageSocket = io.connect('/messages');

  var Room = Backbone.Model.extend({
    idAttribute: "_id",

    defaults: {
      _id: null,
      title: "New room"
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
      var room = this.where({ _id: data._id });

      if (room) {
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
    template: _.template("<div class='date'>[<%= dateFormat(created_at, 'h:MM:ss TT') %>]</div>"
                        +"<div class='sender'><%= util.htmlEscape(sender) %>:</div><div class='body'><%= util.htmlEscape(body) %></div>"),

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

      this.reset();
      this.add(models);
    },

    addFromSocket: function(data) {
      this.add(new Message({ socketData: data }));
    },

    push: function(model) {
      messageSocket.emit('new', {
        body: model.get('body'),
        roomId: this.roomId
      })
    }

  })

  var ChatView = Backbone.View.extend({

    room: null,
    messages: null,

    events: {
      'submit form': 'onFormSubmit'
    },

    initialize: function(options){
      _.bindAll(this);

      this.$el = options.$el;

      this.$messagesContainer = $("<div class='span8' id='chat'></div>");
      this.$submitForm = $("<form action='post' class='span8'>"
        + "<input type='text' class='span10 pull-left' />"
        + "<input type='submit' class='span2 btn btn-primary pull-right' />"
        + "</form>");
      this.$input = this.$submitForm.find('input[type=text]');

      this.room = new Room();
      this.messages = new MessageCollection();

      this.listenTo(this.room, 'change', this.roomsChanged);
      this.listenTo(this.messages, 'add', this.addMessage);
      this.listenTo(this.messages, 'reset', this.resetChat);
    },

    render: function() {
      this.$el.html('');

      var $hTag = $('<h3></h3>');
      $hTag.html("Chatting in " + this.room.get('title'));

      this.$el.append($hTag);
      this.$el.append(this.$messagesContainer);
      this.$el.append(this.$submitForm);

      this.messages.fetch();
    },

    roomsChanged: function() {
      console.log('ChatView: chatting in ' + this.room.get('_id'));
      this.messages.setRoomId(this.room.get('_id'));
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

    resetChat: function() {
       this.$messagesContainer.html('');
    }

  })

  var RoomView = Backbone.View.extend({

    tagName: "li",
    templateWithDeletion: _.template("<a href='#' data-id='<%= _id %>'><span class='pull-left'><%= util.htmlEscape(title) %></span><i class='icon-remove-sign pull-right'></a>"),
    template: _.template("<a href='#' data-id='<%= _id %>'><span class='pull-left'><%= util.htmlEscape(title) %></span></a>"),

    events: {
      'click': 'changeRooms',
      'click .icon-remove-sign': 'removeRoom'
    },

    initialize: function(options) {
      _.bindAll(this);
      this.model = options.model;
      this.roomListView = options.roomListView;
    },

    render: function() {
      if (this.roomListView.roomDeletionView) {
        this.$el.html(this.templateWithDeletion(this.model.toJSON()));
      } else {
        this.$el.html(this.template(this.model.toJSON()));
      }
      return this;
    },

    changeRooms: function(event) {
      if ($(event.target).hasClass('icon-remove-sign')) {
        return
      }

      this.roomListView.changeRooms(this.model.get('_id'));
    },

    removeRoom: function(event) {
      if (confirm('Are you sure?')) {
        event.preventDefault();
        roomSocket.emit('destroyed room', { _id: this.model.get('_id') });
      }
    }

  })

  var RoomListView = Backbone.View.extend({

    activeRoom: null,
    rooms: null,

    events: {
      'click .new-room-button': 'newRoomClicked',
      'keypress .new-room-input': 'inputKeyPress',
      'focusout .new-room-input': 'cancelEntering'
    },

    initialize: function(options) {
      _.bindAll(this);

      this.$el = options.$el;

      this.rooms = new RoomCollection();
      this.chatView = new ChatView({
        $el: options.$chat
      })

      this.roomDeletionView = this.$el.data('delete-rooms');

      this.$container = $("<ul class='nav nav-pills nav-stacked'></ul>");
      this.$newRoomButton = $("<button class='new-room-button btn pull-right'><i class='icon-plus'></i>New chat room</button>");
      this.$newRoomInput = $("<input type='text' class='new-room-input input-small pull-right' />").hide();

      this.listenTo(this.rooms, 'add', this.addAll);
      this.listenTo(this.rooms, 'reset', this.addAll);
      this.listenTo(this.rooms, 'remove', this.addAll);

      if (options.rooms && options.rooms.length > 0) {
        this.rooms.reset(options.rooms);
        this.activeRoom = this.rooms.first();
        this.changeRooms(this.activeRoom.get('_id'));
      }

    },

    render: function() {
      this.$el.html('');

      this.$container.html('');
      this.$el.append(this.$container);
      this.$el.append(this.$newRoomButton);
      this.$el.append(this.$newRoomInput);

      this.$el.addClass('clearfix');
    },

    addOne: function(room) {
      var view = new RoomView({
        model: room,
        roomListView: this,
      });

      this.$container.append(view.render().$el);
    },

    addAll: function() {
      this.render();
      this.rooms.each(this.addOne, this);

      if (this.rooms.length) {
        if (this.activeRoom != null) {
          this.changeRooms(this.activeRoom.get('_id'))
        } else {
          this.changeRooms(this.rooms.first().get('_id'))
        }
      }
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
    },

    changedRooms: function() {
      this.chatView.room.set({
        'title': this.activeRoom.get('title'),
        '_id': this.activeRoom.get('_id')
      });
    },

    changeRooms: function(id) {
      var $target = this.$el.find('a[data-id='+ id +']');
      this.activeRoom = this.rooms.get(id);

      this.$el.find('li.active').removeClass('active');
      $target.parent().addClass('active');
      this.changedRooms();
    }

  })

  var roomsView = new RoomListView({
    $el: $('#js-rooms-container'),
    $chat: $('#js-chat-container'),
    rooms: rooms
  });

})(jQuery, Backbone, _, rooms)

