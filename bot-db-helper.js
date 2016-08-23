//lets require/import the mongodb native drivers.
var firebase = require("firebase");
var CONFIG = require('./bot-config');

//Initialize firebase 
firebase.initializeApp(CONFIG.firebase);

module.exports = {
  getQuestionsList : function(CONFIG){
    
    var db = firebase.database(), 
        questions = db.ref();

    return questions;
  },
  saveChat : function (chatData) {
       
       //get new key from firebase
        var newPostKey = firebase.database().ref().child('chatData').push().key;
        
        console.log("KEY - ",newPostKey);
        console.log("Chat dat to save - ",chatData);
        
        var newChat = {};
        newChat['/chatData/' + newPostKey] = chatData; //set data
        
        //update table
        firebase.database().ref().update(newChat);
  }
};