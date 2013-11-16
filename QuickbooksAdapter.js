/*---------------------------------------------------------------
  :: sails-quickbooks
  -> adapter
---------------------------------------------------------------*/

var async = require('async');
var util = require('util');
var fs = require('fs');
var path = require('path')
var _ = require('lodash');
var __request = require('request')
var xml2object = require('xml2object');
var stream = require('stream')
var zlib = require('zlib')

var qbParser = require('./src/qbParser')
var qbSchema = require('./src/qbSchema')
var qbXML = require('./src/qbXML.js')
var qbQuery = require('./src/qbQuery')
var qbStream = require('./src/qbStream2')
 

module.exports = (function() {

  //qbConnections -  A connection exists if the user has authorized a QuickBooks API app to access (connect to) a specific QuickBooks company.  
  // A connection corresponds to a unique combination of the user, app , and company.  
  //The user is identified by the Intuit App Center user ID, the app by the app token (appToken), and the company by the realmID.  
  //Each active connection has an authorized and valid OAuth access token.

  var connections = {}

  var qbCollections = {}

   var adapter = {

  intuitSchema : new qbSchema(),

  identity : 'sails-quickbooks',
     // Set to true if this adapter supports (or requires) things like data types, validations, keys, etc.
  // If true, the schema for models using this adapter will be automatically synced when the server starts.
  // Not terribly relevant if not using a non-SQL / non-schema-ed data store
  syncable: true,

  schema : true,

  // Including a commitLog config enables transactions in this adapter
  // Please note that these are not ACID-compliant transactions: 
  // They guarantee *ISOLATION*, and use a configurable persistent store, so they are *DURABLE* in the face of server crashes.
  // However there is no scheduled task that rebuild state from a mid-step commit log at server start, so they're not CONSISTENT yet.
  // and there is still lots of work to do as far as making them ATOMIC (they're not undoable right now)
  //
  // However, for the immediate future, they do a great job of preventing race conditions, and are
  // better than a naive solution.  They add the most value in findOrCreate() and createEach().
  // 
  // commitLog: {
  //  identity: '__default_mongo_transaction',
  //  adapter: 'sails-mongo'
  // },

  // Default configuration for collections
  // (same effect as if these properties were included at the top level of the model definitions)
  defaults: {

   // schema : true,
    
   
    //IPP Schema can't be changed...
   // migrate: 'safe'
  },
  
    registerCollection: function(collection, cb) {
      // console.log('register')
      console.log(collection)
      var def = _.clone(collection);
      var key = def.identity;
    //    console.log(key)
    //  console.log(def)

    //console.log(qbSchema)

      if(qbCollections[key]) return cb();


     qbCollections[key.toString()] = collection;

      // Always call describe
      this.describe(key, function(err, schema) {
        if(err) return cb(err);
        cb();
      });

  },


  // The following methods are optional
  ////////////////////////////////////////////////////////////

  // Optional hook fired when a model is unregistered, typically at server halt
  // useful for tearing down remaining open connections, etc.
  teardown: function(cb) {
    cb();
  },


  // REQUIRED method if integrating with a schemaful database
  define: function(collectionName, definition, cb) {

    //console.log(definition)

  
    // Define a new "table" or "collection" schema in the data store
    cb();
  },
  // REQUIRED method if integrating with a schemaful database
  describe: function(collectionName, cb) {
    
      // Respond with the schema (attributes) for a collection or table in the data store


    //  console.log(qbSchema)
    

    adapter.intuitSchema.describe(collectionName,cb)
   
  // cb(null,{})
  },
  // REQUIRED method if integrating with a schemaful database
  drop: function(collectionName, cb) {
    // Drop a "table" or "collection" schema from the data store
    cb();
  },

  // Optional override of built-in alter logic
  // Can be simulated with describe(), define(), and drop(),
  // but will probably be made much more efficient by an override here
  //  alter: function (collectionName, attributes, cb) { 
  // // Modify the schema of a table or collection in the data store
  //  cb(); 
  //  },


  // REQUIRED method if users expect to call Model.create() or any methods
  create: function(collectionName, values, cb) {
    // Create a single new model specified by values

    //console.log(values)


    // Respond with error or newly created model instance
    cb(null, values);
  },


  sync : function(collectionNamecb){},





  // REQUIRED method if users expect to call Model.find(), Model.findAll() or related methods
  // You're actually supporting find(), findAll(), and other methods here
  // but the core will take care of supporting all the different usages.
  // (e.g. if this is a find(), not a findAll(), it will only send back a single model)
  find: function(collectionName, options, cb) {




   
     spawnQBClient(function __QBFIND__(client,cb){


      var query = new qbQuery(adapter.intuitSchema,qbCollections[collectionName],options)


      var _responseObjects = []
      var _foundObjectsInStream = false;
      var _responseObjectChunkCount = 0;
      var _responseObjectCount = 0;
      var xmlStreamer = new xml2object([query.collectionName]);
      var qbObjectTransformer = new qbStream(query)


    //  console.log(xmlStream)
    //  
    //  

      qbObjectTransformer.on('data',function(qbObj){

       // console.log('qbstream data ev')
        //console.log(qbObj)

        _responseObjects.push(qbObj)

       // callback(null,_responseObjects)

      })

      qbObjectTransformer.on('end',function(){

        console.log('qbend')
        console.log(_responseObjectChunkCount)  
        cb(null,_responseObjects)
      })

      xmlStreamer.on('object',function(objectKey,rawObject){

         // console.log(rawObject)
         
         // 
         // 
          
          _foundObjectsInStream = true;
          _responseObjectChunkCount++
          _responseObjectCount++

           qbObjectTransformer.write(rawObject)

      })

      xmlStreamer.on('error',function(err){
        cb(err)
      })

      xmlStreamer.on('end',function(){

        //cb(null,[])
        if(_foundObjectsInStream){

          if(_responseObjectChunkCount < query.chunkSize){
            console.log('less than')
            qbObjectTransformer.write(null)
            qbObjectTransformer.emit('end')

            //xmlStreamer.emit('end')
             //cb(null,_responseObjects)
          }
          else{

            _foundObjectsInStream = false;
            _responseObjectChunkCount = 0
         client.http.post(query.qbHttpRequestObject).pipe(zlib.createGunzip()).pipe(xmlStreamer.saxStream)

          }



          //console.log('found objects')

          
                      
        }
        else{
          //cb(null,_responseObjects)
         qbObjectTransformer.write(null)

           // xmlStreamer.emit('end')
        }
      })

      
      // })
      // // var requestStream = 

      // var i = 10
      // var randomReadable = pull.Source(function () {
      //   return function (end, cb) {
      //     if(end) return cb(end)
      //     //only read 10 times
      //     if(i-- < 0) return cb(true)

      //       setTimeout(function(){
      //         console.log('tick')
      //          cb(null, Math.random())
      //        }, 100);;
         
      //   }
      // })


      query.castToQbQueryObject()
      query.castToHttpRequest(client)
     // console.log(options)

     // console.log(query.qbHttpRequestObject)

      client.http.post(query.qbHttpRequestObject).pipe(zlib.createGunzip()).pipe(xmlStreamer.saxStream)

     // xmlStreamer.source = _query;

      //xmlStreamer.start()



     
        

      



     


     // pull(randomReadable(), createThroughStream(), pull.collect(cb))

   //    _responseObjects = []

   //    var query = new qbQuery(adapter.intuitSchema.context,qbCollections[collectionName],options)
   // //   var logger = new qbQuery.qbLogger()

   //    var _stream = new qbStream(client,query)
   //    var _logger = new QBLogger()


   //    _stream.on('data',function(_record){


   //      _responseObjects.push(_record)
   //    })

   //    _stream.on('end',function(){


   //       cb(null,_responseObjects)

   //    })
      //console.log(cb)

      //query.find(client,cb)
      //
      //
      //
        
     // _stream.pipe(_logger)



      },
      qbCollections[collectionName],cb);

//     var qbCollection = qbCollections[collectionName]

//     if(qbCollection){

//     //  console.log(qbCollection)



//       var url = 'https://services.intuit.com/sb/' + qbCollection.identity.toLowerCase() + '/v2/' + qbCollection.config.realm;

//      // console.log(url)

//       var request = require('request');

// // Create a new xml parser with an array of xml elements to look for
//       var parser = new xml2object([ qbCollection.identity ]);

// // Bind to the object event to work with the objects found in the XML file
//     parser.on('object', function(name, obj) {
//       console.log('Found an object: %s', name);
//       console.log(obj);
  
//     });

//     // Bind to the file end event to tell when the file is done being streamed
//   parser.on('end', function() {
//       console.log('Finished parsing xml!');
//       cb(null,[])
// }
//   );

// // Pipe a request into the parser

//     request.get({url:url, oauth:adapter.config.oauth, }).pipe(parser.saxStream);
     

     
//       }
//     else{

//       cb('collection not found')
//     }

    

    // ** Filter by criteria in options to generate result set

    // Respond with an error or a *list* of models in result set
   
   /**
    * spawnConnection(function __FIND__(client, cb) {

        // Check if this is an aggregate query and that there is something to return
        if(options.groupBy || options.sum || options.average || options.min || options.max) {
          if(!options.sum && !options.average && !options.min && !options.max) {
            return cb(new Error('Cannot groupBy without a calculation'));
          }
        }

        // Build Query
        var _schema = dbs[table].schema;
        var queryObj = new Query(_schema, dbs);
        var query = queryObj.find(table, options);

        // Run Query
        client.query(query.query, query.values, function __FIND__(err, result) {
          if(err) return cb(err);

          // Cast special values
          var values = [];

          result.rows.forEach(function(row) {
            values.push(queryObj.cast(row));
          });

          // If a join was used the values should be grouped to normalize the
          // result into objects
          var _values = options.joins ? utils.group(values) : values;

          cb(null, _values);
        });

      }, dbs[table].config, cb);
    */
  },

  // REQUIRED method if users expect to call Model.update()
  update: function(collectionName, options, values, cb) {

    // ** Filter by criteria in options to generate result set

    // Then update all model(s) in the result set

    // Respond with error or a *list* of models that were updated
    cb();
  },

  // REQUIRED method if users expect to call Model.destroy()
  destroy: function(collectionName, options, cb) {

    // ** Filter by criteria in options to generate result set

    // Destroy all model(s) in the result set

    // Return an error or nothing at all
    cb();
  },



  // REQUIRED method if users expect to call Model.stream()
  stream: function(collectionName, options, stream) {
    // options is a standard criteria/options object (like in find)

    // stream.write() and stream.end() should be called.
    // for an example, check out:
    // https://github.com/balderdashy/sails-dirty/blob/master/DirtyAdapter.js#L247

  },



  /*
  **********************************************
  * Optional overrides
  **********************************************

  // Optional override of built-in batch create logic for increased efficiency
  // otherwise, uses create()
  createEach: function (collectionName, cb) { cb(); },

  // Optional override of built-in findOrCreate logic for increased efficiency
  // otherwise, uses find() and create()
  findOrCreate: function (collectionName, cb) { cb(); },

  // Optional override of built-in batch findOrCreate logic for increased efficiency
  // otherwise, uses findOrCreate()
  findOrCreateEach: function (collectionName, cb) { cb(); }
  */


  // 
  /*
  **********************************************
  * Custom methods
  **********************************************

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  //
  // > NOTE:  There are a few gotchas here you should be aware of.
  //
  //    + The collectionName argument is always prepended as the first argument.
  //      This is so you can know which model is requesting the adapter.
  //
  //    + All adapter functions are asynchronous, even the completely custom ones,
  //      and they must always include a callback as the final argument.
  //      The first argument of callbacks is always an error object.
  //      For some core methods, Sails.js will add support for .done()/promise usage.
  //
  //    + 
  //
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  


  // Any other methods you include will be available on your models
  foo: function (collectionName, cb) {
    cb(null,"ok");
  },
  bar: function (collectionName, baz, watson, cb) {
    cb("Failure!");
  }


  // Example success usage:

  Model.foo(function (err, result) {
    if (err) console.error(err);
    else console.log(result);

    // outputs: ok
  })

  // Example error usage:

  Model.bar(235, {test: 'yes'}, function (err, result){
    if (err) console.error(err);
    else console.log(result);

    // outputs: Failure!
  })

  */



  }


  /*************************************************************************/
  /* Private Methods
  /*************************************************************************/

  // Wrap a function in the logic necessary to provision a connection
  // (grab from the pool or create a client)
  function spawnQBClient(logic, config, cb) {

    //console.log(config)
    var _qbConnection = {
      app_token : config.config.appToken,
      oauth :{
        consumer_key : config.config.consumer_key,
        consumer_secret : config.config.consumer_secret
      }
    }


    if(config.config['__devRealm']){

      _qbConnection.oauth.token = config.config.qbConnections[config.config.__devRealm].token
      _qbConnection.oauth.token_secret = config.config.qbConnections[config.config.__devRealm].token_secret
      _qbConnection.realm = config.config.__devRealm



      connectToIntuit(_qbConnection,function(err,client,done){

        after(err, client, done);

      })

      

    }
    else{

      //todo : hookup storage
      after('no identity info');
    }


    function connectToIntuit(_connection,cb){

      

        cb(null,{http :__request,connection : _connection},function(){
          console.log('done?')
        })


    }


    // var dbConfig = {
    //   database: config.database,
    //   host: config.host,
    //   user: config.user,
    //   password: config.password,
    //   port: config.port
    // };

    // // Grab a client instance from the client pool
    // pg.connect(dbConfig, function(err, client, done) {
    //   
    // });

    // Run logic using connection, then release/close it
    function after(err, client, done) {
      if(err) {
        console.error("Error creating a connection to Quickbooks: " + err);

        // be sure to release connection
        done();

        return cb(err);
      }

      logic(client, function(err, result) {

        // release client connection
        done();

        return cb(err, result);
      });
    }
  }

  


  //function get()


  // This method runs when a model is initially registered at server start time
 



 return adapter;
})();


//////////////                 //////////////////////////////////////////
////////////// Private Methods //////////////////////////////////////////
//////////////                 //////////////////////////////////////////