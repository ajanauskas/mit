var UsersCollection = {
  collection: null,
  db: null,
  init: function(db) {
    this.db = db
  },

  prepareCollection: function(callback) {
    if (this.collection)
      callback()

    this.db.collection('users', function(error, collection) {
      console.log('users collection ready to go!')

      UsersCollection.collection = collection
      callback()
    })
  },

  get: function(id, callback) {
    this.prepareCollection(function(){
      UsersCollection.collection.find({"id": id.toString()}, function(error, cursor){
        if (error) {
          console.log('something went wrong')
          return
        }
        cursor.toArray(function(error, result){
          console.log(result)
          callback(result[0])
        })
      })
    })
  },

  insert: function(object, callback) {
    this.prepareCollection(function(){
      UsersCollection.collection.insert(object, function(error){
        if (error) {
          console.log('something went wrong')
          return
        }

        console.log('Object successfully inserted')
        callback()
      })
    })
  }
}

module.exports = UsersCollection;
