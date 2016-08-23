//Export module
module.exports = {
  getTmplText: function (data,userName) {
    var tmpl,
        _answer;
        
    //update template by replacing user name in string
    if( (data.key === "hello" || data.key === "bye" || data.key === "Hello") && data.answer.indexOf('<user>') > -1){
      _answer = data.answer.replace('<user>',userName);
    }else{
      //send direct answer to user
      _answer = data.answer;
    }

    //console.log(_answer,data.key,data.answer.indexOf('<user>'));

    
    tmpl = {
        text : _answer
    };

    return tmpl;  
  },
  getTmplOptionList: function (data, userName) {
    var tmpl,
        list = [];

    //update template by replacing user name in string
    if( (data.key === "hello" || data.key === "bye" || data.key === "Hello") && data.answer.indexOf('<user>') > -1){
      _answer = data.answer.replace('<user>',userName);
    }else{
      //send direct answer to user
      _answer = data.answer;
    }    

    for(var i=0;i<data.options.length;i++){
      var _obj = {
        "type":"postback",
        "title":data.options[i].name,
        "payload":data.options[i].id
      };

      list.push(_obj);
    }

   // console.log(list);

    tmpl = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":_answer,
          "buttons": list
        }
      }
    };
   // console.log(tmpl);
    return tmpl;
  },
  getTmplCarouselList : function(list){
    var tmpl;
    tmpl = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements": list.options,
        //  "text":list.answer
        }
      }
    };

    return tmpl;
  },

  getLoginTemplate : function(list){
    var tmpl;
    tmpl = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements": list.options,
        //  "text":list.answer
        }
      }
    };

    return tmpl;
  },

  getTmplReceipt : function(data){
    var tmpl;

    tmpl = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements": data.details
        }
      }
    };

    return tmpl;
  },

  getTmplQuickReply : function(data){
    var tmpl;

    tmpl = {
      "text": data.answer,
      "quick_replies" : data.quick_replies

    };

    return tmpl;
  },

  getTmplDatePicker : function(msg){
    var tmpl;

    return tmpl;
  }
};