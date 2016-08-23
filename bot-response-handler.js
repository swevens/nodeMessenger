var service = require('./bot-service');
var WitHelper = require('./bot-wit-helper');
var _ = require('underscore');
var RP = require('request-promise');
const WIT = require('wit-js');


var nodewit = require('node-wit');
var fs = require('fs');
var http = require('http');
var https = require('https');
const execSync = require('child_process').execSync;

module.exports = {
    handleRequest: function (event,userObj,CONFIG,questionList) {
        
        //if user not exist, send plain message        
        if(!userObj){
            
            //send default messsage
            service.sendPlainMessage(userObj.userId,CONFIG,CONFIG.defaultAuthMsg);
        }else{ 
            
            //handle response if normal message received
            if (event.message){
                /***** MESSAGE ATTACHMENT EVENT ****/
                if (event.message.attachments) {
                    eventType = event.message ? (event.message.attachments ? event.message.attachments[0].type : "") : "";
                    console.log("attachment event recived ");
                    console.log("eventType",eventType);
                    
                    if(eventType == 'audio')
                    {
                        console.log("event payload url",event.message.attachments[0].payload.url);
                        console.log("event",event.message.attachments);
                        var file = fs.createWriteStream("sample.mp3");

                        file.on('finish', function () {
                            code = execSync('ffmpeg -i sample.mp3 output.wav -y');

                            var stream = fs.createReadStream('output.wav');
                            nodewit.captureSpeechIntent(CONFIG.witToken, stream, "audio/wav", function (err, witKey) {
                                    console.log("Response from Wit for audio stream: ");
                                    if (err) console.log("Error: ", err);
                                    console.log(JSON.stringify(witKey, null, " "));
                                    var data = _.findWhere(questionList,{key : witKey.outcomes ? witKey.outcomes[0].intent : false});
                                    var intentConfidence = witKey.outcomes ?  witKey.outcomes[0].confidence : 0 ;
                                    if(data && intentConfidence > 0.5){
                                        //send response
                                        service.sendMessage(event.message.text,userObj,CONFIG,data);
                                    }else{
                                        //send default messsage
                                        service.sendPlainMessage(userObj.userId,CONFIG,CONFIG.defaultQueryMsg);
                                    }
                            });

                        });  // file on finished 


                        var request = https.get(event.message.attachments[0].payload.url, function(response) {

                        response.pipe(file); 

                        });
                        
                    }    
                }
                
                else if (event.message.text && event.message.quick_reply == undefined) 
                {
                
                    //get message
                    var text = event.message.text,
                        client = new WIT.Client({apiToken : CONFIG.witToken});
                        console.log('text');
                    //Send message to WIT                
                    client.message(text, {})
                    .then(function(witKey){
                        console.log('wit response',witKey);
                        //Get question 
                        var data = _.findWhere(questionList,{key : witKey.outcomes ? witKey.outcomes[0].intent : false});
                        var intentConfidence = witKey.outcomes ?  witKey.outcomes[0].confidence : 0 ;
                        if(data && intentConfidence > 0.5){
                            //send response
                            service.sendMessage(event.message.text,userObj,CONFIG,data);
                        }else{
                            //send default messsage
                            service.sendPlainMessage(userObj.userId,CONFIG,CONFIG.defaultQueryMsg);
                        }
                        //send notification message to end user, in every 5 chat with bot  
                        /*if(userObj.notifyCounter % 4 === 0){
                            service.sendPlainMessage(userObj.userId,CONFIG,CONFIG.notifyMsg);
                        }*/
                        //increase notification counter on every message from bot
                        /*userObj.notifyCounter = userObj.notifyCounter + 1;
                        */
                    })
                    .catch(function(err){
                        console.log("WIT reponse fails",err);
                    });     
                }
                else if (event.message.text && event.message.quick_reply) {
                    var data = _.findWhere(questionList,{key : event.message.quick_reply.payload ? event.message.quick_reply.payload : false});
                    if(data){
                                //send response
                                console.log("response for QR :",data);
                                service.sendMessage(data,userObj,CONFIG,data);
                    }
                    else{
                        //send default messsage
                        console.log("response not found for QR");
                        service.sendPlainMessage(userObj.userId,CONFIG,CONFIG.defaultQueryMsg);
                    }
                }

                    
            
            }
            //Handle postbask reponse             
            else if (event.postback) {
                
                console.log(event.postback.payload);

                var payload = event.postback.payload.split("&&");
                console.log(payload);
                if(payload.length == 0)
                {
                        //send default messsage
                        console.log("payload is 0");
                        service.sendPlainMessage(userObj.userId,CONFIG,CONFIG.defaultQueryMsg);
                }
                else
                payload.forEach(function(p,i){
                        var data = _.findWhere(questionList,{key : p ? p : false});
                    (function(data,i){
                            setTimeout( function(){
                            if(data){
                                //send response
                                console.log("response for :",p);
                                service.sendMessage(p,userObj,CONFIG,data);
                            }
                            else{
                                //send default messsage
                                console.log("response not found");
                                service.sendPlainMessage(userObj.userId,CONFIG,CONFIG.defaultQueryMsg);
                            }
                        },1800*i);
                    })(data,i)
                })

                
                

                //Code need to written...
            }
        }     
    }
};    
                         
      