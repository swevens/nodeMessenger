//load modules
var request = require('request');
var jsonfile = require('jsonfile');
var questions = require('./bot-static-questions');
var template = require('./bot-template-manager');
var _ = require('underscore');
var firebaseHelper = require('./bot-db-helper');


//global variables
var tmplType = {
  "text":"getTmplText",
  "optionList":"getTmplOptionList",
  "carouselList":"getTmplCarouselList",
  "datePickerList":"getTmplDatePicker",
  "receipt":"getTmplReceipt",
  "userProfile":"getUserProfile",
  "quickReply":"getTmplQuickReply",
  "login":"getLoginTemplate"
};

//export modules
module.exports = {
  saveConversation: function (chatData,userProfile) {

    var fileName = 'data/' + (userProfile.first_name.replace(/ /g,'')) + '_' + (new Date().getTime())+ '.json';

    jsonfile.writeFile(fileName, chatData, {spaces: 4}, function(err) {
      console.error(err);
    })

  },
  saveChatObj : function(question,userObj, CONFIG,data){
      //create chat object
      var chatDataObj = {
        "userId" : userObj.userId,
        "question" : question,
        "answer" : data.answer,
        "key" : data.key
      };

      //save to firebase
      firebaseHelper.saveChat(chatDataObj);
  },
  prepareCustomList : function(list){
    var objList = [];

    for (var i = 0,j=1; i < list.length; i++,j++) {
      var obj = {
        "title":list[i].name,
        "image_url":list[i].image,
        "subtitle":list[i].subtitle,
        "buttons":[{
          "type":"postback",
          "payload":j,
          "title":"Select Meal"
        }]
      };  
      objList.push(obj);
    }
    return objList;
  },
  sendMessage : function(message,userObj, CONFIG,data) {
    
    var _this = this,
        userName = userObj.profile ? userObj.profile.first_name : "there",
        tmplData = template[tmplType[data.tType]](data,userName);
        
    return request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:CONFIG.accessToken},
        method: 'POST',
        json: {
            "recipient": { id : userObj.userId },
            "message": tmplData,
        }
    }, function(error, response, body) {

        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
          console.log('Message sent as : ', data.answer);
          
          //save chat to firebase
         // _this.saveChatObj(message,userObj, CONFIG,data);
        }
    })
  },
  getUserProfile : function(token,userId) {
   
    return request({
        url: 'https://graph.facebook.com/v2.6/' + userId,
        qs: {access_token:token},
        method: 'GET',
        json: {
            fields: "first_name,last_name,profile_pic,locale,timezone,gender"
        }
    });
    
  },
  sendPlainMessage : function(userId, CONFIG,msg) {
    
   request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: CONFIG.accessToken
        },
        method: 'POST',
        json: {
            recipient: {  id: userId   },
            message: {  text: msg   }
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }else{
          console.log('Message sent');
        }
    })
  }
};