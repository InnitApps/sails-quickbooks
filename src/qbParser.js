var xml2js = require('xml2js').parseString;
var util = require('util');

var Parser = module.exports = {

  /**
  Parse the raw response from the IDS API
  **/
  parseResponse : function(qbCollection,response,data,callback){

    switch(response.statusCode) {

      //successful REST request/response...
      case 200:

       Parser.parseSuccessResponseData(qbCollection,data,function(err,responseData){

       // console.log(responseData)

        async.map(responseData,function(rawObject,cb){

          Parser.parseQbObject(qbCollection,rawObject,cb)

        },function(err,objects){

          //console.log(objects)
          callback(null,objects)
        })

        })

      break;

    //OAuth tokens are invalid
    case 401:
  
      break;

    //404
    case 401:
  
      break;

    default:
    // error
      
      break;
    }
  },

  parseSuccessResponseData : function(qbModel,data,callback){

     xml2js(data, {mergeAttrs: true,explicitArray : false, normalize : true},function (err, result) {


    
      var rawObjects = result.RestResponse[qbModel.config[qbModel.identity].qbCollectionKey][qbModel.config[qbModel.identity].qbObjectKey]

      callback(null,rawObjects)






     })


  },

  parseQbObject : function(qbModel,rawObject,callback){

    
    if(rawObject){

      var qbModelObject = {}

      var def = qbModel.definition;

      

      async.each(Object.keys(def),function(key,cb){


        switch(key) {

        // case 'id':
  
        //   qbModelObject.id = rawObject.Id._
        //   qbModelObject.domain = rawObject.Id.idDomain;

        //   qbModelObject.externalKey = rawObject.Id._
        //   qbModelObject.externalDomain = rawObject.Id.idDomain;

        //   cb()

        // break;

        case 'createdAt':
          qbModelObject.createdAt = rawObject.MetaData.CreateTime;

          cb()
        break;

        case 'updatedAt':
          qbModelObject.updatedAt = rawObject.MetaData.LastUpdatedTime;
          qbModelObject.syncToken = rawObject.SyncToken;
          qbModelObject.isDraft = rawObject.Draft == 'true';
          qbModelObject.isSynchronized = rawObject.Synchronized == 'true';
          qbModelObject.objectState = rawObject.ObjectState;

          cb()
        break;

        default:

          Parser.parseQbObjectProperty(def,rawObject,key,function callback(err,value){

           // console.log(key)
              

              qbModelObject[key] = value;

              if(key == 'id'){


                console.log(rawObject['Id'])
              }

              var type = typeof value;

              
              cb()
          })

           break;


    // error
      
       
    }


        // if(key == 'id'){

          
        // }
        // else if(key == 'createdAt'){

        //   qbModelObject.createdAt = rawObject.MetaData.CreateTime;

        // }
        // else if(key = 'updatedAt'){
        //   qbModelObject.updatedAt = rawObject.MetaData.LastUpdatedTime;
        //   qbModelObject.syncToken = rawObject.SyncToken;
        //   qbModelObject.isDraft = rawObject.Draft == 'true';
        //   qbModelObject.isSynchronized = rawObject.Synchronized == 'true';
        //   qbModelObject.objectState = rawObject.ObjectState;
        // }
        // else {

          
        //   console.log(qbModelObject[key])
        // }


        
      },function(){

        callback(null,qbModelObject)

      })


        
       



      

      

      //qbModelObject.employeeName = rawObject.Name;


    }
    else{
      callback('no object found')
    }
  },

  parseQbObjectProperty : function(qbModel,rawObject,key,callback){
    

    var _prop = rawObject[key]


    
   // console.log(qbModel)

  




    callback(null,_prop)




  }



}

