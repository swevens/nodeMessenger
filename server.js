//Load external refrences 
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var request = require('request');
var yield = require('yield');
var suspend = require('suspend');
var Promise = require('promise');
var firebase = require("firebase");
  
debugger;  
  
//Load internal refrences
var CONFIG = require('./bot-config');
var DB = require('./bot-db-helper');
var globalMethods = require('./bot-global-methods');
var service = require('./bot-service');
var responseHandler = require('./bot-response-handler');
var User = require('./bot-user-class');
var firebaseHelper = require('./bot-db-helper');
var _ = require('underscore');
var questionsList = [];

debugger;


//Get one time data 
var activeUsers = [];

//Global methods 
var app = express();

//update SSL certificate 

var ssl = {
   key: fs.readFileSync('/etc/letsencrypt/live/keplervaani.com/privkey.pem'),
   cert: fs.readFileSync('/etc/letsencrypt/live/keplervaani.com/cert.pem'),
   ca: fs.readFileSync('/etc/letsencrypt/live/keplervaani.com/chain.pem')
}

//Set questions every hour
function getQuestions() {
    //get questions
    questionsList = [ 
                      {
                        "answer" : "Hello <user>, Please log in or type hello to continue as guest ",
                        "id" : 1,
                        "key" : "STARTING",
                        "tType" : "login",
                        "options": [{title:"Please log in or type hello to continue as guest",
                                     image_url:"",
                                     buttons:[{
                                        "type": "account_link",
                                        "url": "https://keplervaani.com/login"
                                      }]
                                    }]
                      },
                      {
                        "answer" : "Hello <user>, Please log in or type hello to continue as guest ",
                        "id" : 1,
                        "key" : "logout",
                        "tType" : "login",
                        "options": [{title:"Please tap below to log out",
                                     image_url:"",
                                     buttons:[{
                                        "type": "account_unlink",
                                        
                                      }]
                                    }]
                      },

                      ,{
                        "answer" : "Hello <user>, How can I help you today?",
                        "id" : 1,
                        "key" : "hello",
                        "tType" : "optionList",
                        "options": [{id:"1_1", name : "Updates near you"},
                                    {id:"ABOUT_COLLECTIONS&&my_collections", name : "Wishlist"},
                                    {id:"1_3", name : "News"}]
                      },
                      {
                        "answer" : "What would you like to order more?",
                        "id" : 112,
                        "key" : "orderMore",
                        "tType" : "optionList",
                        "options": [{id:"1_1", name : "Wine Pairing"},
                                    {id:"ABOUT_COLLECTIONS&&my_collections", name : "Your Collection"},
                                    {id:"1_3", name : "Select a Gift"}]
                      },
                      {
                        "answer" : "You are looking for a wine to ...",
                        "id" : 2,
                        "key" : "1_1",
                        "tType" : "optionList",
                        "options": [{id:"2_1", name : "Simply enjoy a glass"},
                                    {id:"2_2", name : "Complement a meal"}],
                      },
                      {
                        "answer" : "Sure, You are looking for a wine to ...",
                        "id" : 2,
                        "key" : "want_wine",
                        "tType" : "optionList",
                        "options": [{id:"2_1", name : "Simply enjoy a glass"},
                                    {id:"2_2", name : "Complement a meal"}],
                      },
                      {
                        "answer" : "I am still trying to understand Gifts... please try another option.",
                        "id" : 4,
                        "key" : "1_3",
                        "tType" : "optionList",
                        "options": [{id:"1_1", name : "Wine Pairing"},
                                    {id:"ABOUT_COLLECTIONS&&my_collections", name : "Your Collection"}]
                      },
                     
                      /*2_1 flow - enjoy a glass */
                      {
                        "answer" : "Which type of wine do you prefer?",
                        "id" : 2,
                        "key" : "2_1",
                        "tType" : "optionList",
                        "options": [{id:"2_2_2_1", name : "Red"},
                                    {id:"2_2_2_2", name : "White"}],
                       
                      },
                      /*end 2_1 flow - enjoy a glass */
                      /*2_2 flow - complement meal */
                      {
                        "answer" : "Which course do you want to serve your wine to?",
                        "id" : 3,
                        "key" : "2_2",
                        "tType" : "optionList",
                        "options": [{id:"2_2_1", name : "Starter"},
                                    {id:"2_2_2", name : "Main Dish"},
                                   ],
                      },
                      {
                        "answer" : "Which of the following starters would you be serving?",
                        "id" : 10,
                        "key" : "2_2_1",
                        "tType" : "optionList",
                        "options": [{id:"2_2_1_selection", name : "Cheese"},
                                    {id:"2_2_1_selection", name : "Salad"},
                                    {id:"2_2_1_selection", name : "Fish/ seafood"}
                                   ]
                      },
                      {
                        "answer" : "Yummy, we’d recommend a a Gewürztraminer or Reilsing for spicy foods or a Red Pinot for more mild and heady curry dishes. It looks like you have some matches",
                        "id" : 9,
                        "key" : "2_2_1_selection",
                        "tType" : "carouselList",
                        "options": [ 
                                      {   "title":"Pinot Noir",
                                        "image_url":"https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xtf1/t31.0-8/13680032_941303279311540_4562326276822502551_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Castillo Peralta",
                                        "image_url":"https://fbcdn-sphotos-e-a.akamaihd.net/hphotos-ak-xtl1/t31.0-8/13724877_941303325978202_8571308383795883810_o.png",
                                        "subtitle":"Review - 4.1 | Price - 22.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Ascencio",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13719583_941303335978201_2889076993438153988_o.png",
                                        "subtitle":"Review - 3.5 | Price - 21.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      }
                                      ]
                      },
                      {
                        "answer" : "What are you serving as a main course?",
                        "id" : 10,
                        "key" : "2_2_2",
                        "tType" : "optionList",
                        "options": [{id:"2_2_2_selection", name : "poultry"},
                                    {id:"2_2_2_selection", name : "Red meat"},
                                    {id:"2_2_2_selection", name : "Pasta"}
                                   ]
                      },
                      {
                        "answer" : "Which type of wine do you prefer?",
                        "id" : 10,
                        "key" : "2_2_2_selection",
                        "tType" : "optionList",
                        "options": [{id:"2_2_2_1", name : "Red"},
                                    {id:"2_2_2_2", name : "White"},
                                    {id:"2_2_2_3", name : "Both"}]
                      },
                      { "answer" : "",
                        "id" : 6,
                        "key" : "2_2_2_1",
                        "tType" : "carouselList",
                        "options": [{   "title":"Radius",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13735155_941303272644874_2788053627186968994_o.png",
                                        "subtitle":"Review - 4.0 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Pinot Noir",
                                        "image_url":"https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xtf1/t31.0-8/13680032_941303279311540_4562326276822502551_o.png",
                                        "subtitle":"Review - 4.5 | Price - 29.99 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Burg Wallenstein",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13725077_941303292644872_6108734695190025455_o.png",
                                        "subtitle":"Review - 4.1 | Price - 27.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      }]
                      },
                      { "answer" : "",
                        "id" : 6,
                        "key" : "2_2_2_2",
                        "tType" : "carouselList",
                        "options": [{   "title":"Muirwook",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13735570_941303305978204_3965658551279918352_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Castillo Peralta",
                                        "image_url":"https://fbcdn-sphotos-e-a.akamaihd.net/hphotos-ak-xtl1/t31.0-8/13724877_941303325978202_8571308383795883810_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Ascencio",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13719583_941303335978201_2889076993438153988_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      }]
                      },
                      { "answer" : "",
                        "id" : 6,
                        "key" : "2_2_2_3",

                        "tType" : "carouselList",
                        "options": [{   "title":"Radius",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13735155_941303272644874_2788053627186968994_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Pinot Noir",
                                        "image_url":"https://fbcdn-sphotos-g-a.akamaihd.net/hphotos-ak-xtf1/t31.0-8/13680032_941303279311540_4562326276822502551_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                       {   "title":"Castillo Peralta",
                                        "image_url":"https://fbcdn-sphotos-e-a.akamaihd.net/hphotos-ak-xtl1/t31.0-8/13724877_941303325978202_8571308383795883810_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Ascencio",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13719583_941303335978201_2889076993438153988_o.png",
                                        "subtitle":"Review - 3.5 | Price - 24.49 | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      }]
                      },
                      ,
                      { "answer" : "",
                        "id" : 6,
                        "key" : "my_collections",
                        "tType" : "carouselList",
                        "options": [{   "title":"Nike Shoes",
                                        "image_url":"https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-xtp1/v/t1.0-9/14079880_1038030116304340_6569978161962364811_n.jpg?oh=000c88a18375b39d7b44857ee4ef007e&oe=5858C487&__gda__=1481735585_44ecb0b233fcea47213d897281d07668",
                                        "subtitle":"Review - 3.5 | Price - 41.49 ",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                      {   "title":"Mc Grill Burger",
                                        "image_url":"https://scontent.fdel1-1.fna.fbcdn.net/t31.0-8/14068465_1038030519637633_6656910922728918672_o.jpg",
                                        "subtitle":"Review - 4.1 | Price - $13.49 ",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      },
                                       {   "title":"Al new Mayback",
                                        "image_url":"https://scontent-sit4-1.xx.fbcdn.net/v/t1.0-9/14068292_1038029602971058_5138765634300758096_n.jpg?oh=a799fb071cb407c79f0712ad2d3c9565&oe=5843904E",
                                        "subtitle":"Review - 4.2 | Price - $973k | Pack/Vol - 24-12oz Btls",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_selection",
                                          "title":"Add to Cart"
                                            }]
                                      }]
                      },
                      /*end - 2_2 flow - complement meal */
                      {
                        "answer" : "Item added to cart. Please checkout or browse more items.",
                        "id" : 10,
                        "key" : "2_selection",
                        "tType" : "optionList",
                        "options": [{id:"orderMore", name : "Order more?"},
                                    {id:"2_location", name : "Checkout Now"}]
                      },
                      {
                        "answer" : "",
                        "id" : 6,
                        "key" : "2_location",
                        "tType" : "carouselList",
                        "options": [{   "title":"McLean",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13767280_941303225978212_8627598517411228462_o.jpg",
                                        "subtitle":"McLean Shopping Center 1451 Chain Bridge Road McLean, VA    22101 (703) 749-0011",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_CC_1",
                                          "title":"Pickup from Location"
                                            }]
                                      },
                                      {   "title":"Alexandria",
                                        "image_url":"https://fbcdn-sphotos-e-a.akamaihd.net/hphotos-ak-xfa1/t31.0-8/13737677_941303232644878_4185565946713017707_o.jpg",
                                        "subtitle":"McLean Shopping Center 1451 Chain Bridge Road McLean, VA    22101 (703) 749-0011",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_CC_2",
                                          "title":"Pickup from Location"
                                            }]
                                      },
                                      {   "title":"Fairfax",
                                        "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13735761_941303229311545_1885038340660249524_o.jpg",
                                        "subtitle":"McLean Shopping Center 1451 Chain Bridge Road McLean, VA    22101 (703) 749-0011",
                                        "buttons":[{
                                          "type":"postback",
                                          "payload":"2_CC_3",
                                          "title":"Pickup from Location"
                                            }]
                                      }]
                      },
                      {
                        "answer" : "Select Payment Options",
                        "id" : 10,
                        "key" : "2_CC_1",
                        "tType" : "optionList",
                        "options": [{id:"2_Checkout_1&&RATING", name : "Apple Pay"},
                                    {id:"2_Checkout_1&&RATING", name : "Credit Card"},
                                    {id:"2_Checkout_1&&RATING", name : "ePay/online"}]
                      },
                      {
                        "answer" : "Select Payment Options",
                        "id" : 10,
                        "key" : "2_CC_2",
                        "tType" : "optionList",
                        "options": [{id:"2_Checkout_2&&RATING", name : "Apple Pay"},
                                    {id:"2_Checkout_2&&RATING", name : "Credit Card"},
                                    {id:"2_Checkout_2&&RATING", name : "ePay/online"}]
                      },
                      {
                        "answer" : "Select Payment Options",
                        "id" : 10,
                        "key" : "2_CC_3",
                        "tType" : "optionList",
                        "options": [{id:"2_Checkout_3&&RATING", name : "Apple Pay"},
                                    {id:"2_Checkout_3&&RATING", name : "Credit Card"},
                                    {id:"2_Checkout_3&&RATING", name : "ePay/online"}]
                      },
                      {
                        "id" : 13,
                        "answer" : "Congratulations, your payment has been received.",
                        "tType" : "receipt",
                        'key' : '2_Checkout_1',
                        "details" : [{
                          "title":"Thanks for your order - 1234156721 | You can pick your order from",
                          "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13767280_941303225978212_8627598517411228462_o.jpg",
                          "subtitle":"McLean | McLean Shopping Center 1451 Chain Bridge Road McLean, VA    22101 (703) 749-0011"
                        }]
                      },
                      {
                        "id" : 13,
                        "answer" : "Congratulations, your payment has been received.",
                        "tType" : "receipt",
                        'key' : '2_Checkout_2',
                        "details" : [{
                          "title":"Thanks for your order - 234156721 | You can pick your order from",
                          "image_url":"https://fbcdn-sphotos-e-a.akamaihd.net/hphotos-ak-xfa1/t31.0-8/13737677_941303232644878_4185565946713017707_o.jpg",
                          "subtitle":"You can collect your order from Alexandria | McLean Shopping Center 1451 Chain Bridge Road McLean, VA    22101 (703) 749-0011"
                        }]
                      },
                      {
                        "id" : 13,
                        "answer" : "Congratulations, your payment has been received.",
                        "tType" : "receipt",
                        'key' : '2_Checkout_3',
                        "details" : [{
                          "title":"Thanks for your order - 334156721 | You can pick your order from",
                          "image_url":"https://scontent-sin1-1.xx.fbcdn.net/t31.0-8/13735761_941303229311545_1885038340660249524_o.jpg",
                          "subtitle":"You can collect your order from Fairfax | McLean Shopping Center 1451 Chain Bridge Road McLean, VA    22101 (703) 749-0011"
                        }]
                      },

                      /*greetings*/
                      {
                        "answer" : "Hello there, Wishing you a very happy birthday. Would you like to celebrate your evening with a drink?",
                        "id" : 1,
                        "key" : "bdayMessage",
                        "tType" : "optionList",
                        "options": [{id:"1_1", name : "Wine Pairing"},
                                    {id:"ABOUT_COLLECTIONS&&my_collections", name : "Your Collection"}
                                    ]
                      },
                      {
                        "id" : 3,
                        "answer" : "Following are a few options from your search history",
                        "tType" : "text",
                        'key' : 'ABOUT_COLLECTIONS',
                      },
                      {
                        "id" : 33,
                        "answer" : "Rate your experience for this conversation:",
                        "tType" : "quickReply",
                        'key' : 'RATING',
                        "quick_replies":[
                          {
                            "content_type":"text",
                            "title":"1",
                            "payload":"D1"
                          },
                          {
                            "content_type":"text",
                            "title":"2",
                            "payload":"D1"
                          },
                          {
                            "content_type":"text",
                            "title":"3",
                            "payload":"D1"
                          },
                          {
                            "content_type":"text",
                            "title":"4",
                            "payload":"D1"
                          },
                          {
                            "content_type":"text",
                            "title":"5",
                            "payload":"D1"
                          }
                        ]
                      },
                      {
                        "id" : 34,
                        "answer" : "Thank You, have a nice day",
                        "tType" : "text",
                        'key' : 'D1',
                      }
];
    // var questionsPromise = firebaseHelper.getQuestionsList(CONFIG);  
    // questionsPromise.once("value").then(function(snapshot) {
            
    //     questionsList =  snapshot.val().questions;
    // });
}

//updatequestions
setTimeout(function(){
    getQuestions(); 
},60000); //timer for one hour

//load static questions on load
getQuestions();

//Init application 
function initApplication(){
   // setSSL(fs); //load SSL certificate 
}

//Set request methods
app.use(bodyParser.urlencoded({
    extended: false
}));

// Process application/json
app.use(bodyParser.json());

// Get default request 
app.get('/', function(req, res) {
    res.send('Hello, This is kepler');
});
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/login', function(req, res) {
  
  res.render('index', {
                       redirect_uri: req.params['redirect_uri'], 
                       account_linking_token: req.params['account_linking_token']//, 
                       // authorization_code: res.params['authorization_code']
                     });
});

    

//Get platform callback and validate token  
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === CONFIG.verifyToken) {
        res.send(req.query['hub.challenge']);
    }else{
        res.send('Error, wrong validation token');
    }
});

//Get post platform callback 
app.post('/webhook/', function(req, res) {
    
    //get events    
    messaging_events = req.body.entry[0].messaging;
    //console.log(messaging_events);
    //iterate events 
    for (i = 0; i < messaging_events.length; i++) {
        
        event = req.body.entry[0].messaging[i]; //find event 
        userId = event.sender.id; //get sender id
          
          console.log("USER:",userId);

        //Check if user pings and no acknowlegement event fires
        if(event.message || event.postback || event.account_linking){
        
            var userExist = _.findWhere(activeUsers,{userId : userId.toString()});
            // console.log('User ID', userId);
            // console.log('User Object', userExist);
            // console.log('Active users', activeUsers);

            //Get user profile if not exist
            if(typeof(userExist) !== "object"){
                
                //var userProfileObj = service.getUserProfile(CONFIG.accessToken,userId);

                request({
                    url: 'https://graph.facebook.com/v2.6/' + userId,
                    qs: {access_token:CONFIG.accessToken},
                    method: 'GET',
                    json: {
                        fields: "first_name,last_name,profile_pic,locale,timezone,gender"
                    }
                }, function(error, userData, body) {

                    if (error) {
                        console.log('Error sending messages: ', error)
                    } else if (userData.body.error) {
                        console.log('Error: ', userData.body.error)
                    }else{
                        var userObj = new User(userId,userData.body); //Set user object
                        userExist = userObj; //assign newly created user 
                        activeUsers.push(_.clone(userObj)); //add user
                    
                        //send response
                        responseHandler.handleRequest(event,userExist,CONFIG,questionsList);
                    }
            });
                
            }else{
                //send response
                responseHandler.handleRequest(event,userExist,CONFIG,questionsList);
            }
        }
        if(event.postback){
            console.log(event);
        }
       
    }
    res.sendStatus(200);
});

// Create an HTTP service.
http.createServer(app).listen(CONFIG.port);

/* timer for push */

//setTimeout(push,100000);
function push(){
            console.log('push notification set');
            var uid = 1268385303180850;
            request({
                url: 'https://graph.facebook.com/v2.6/' + uid,
                qs: {access_token:CONFIG.accessToken},
                method: 'GET',
                json: {
                    fields: "first_name,last_name,profile_pic,locale,timezone,gender"
                }
            }, function(error, userData, body) {
                var event = {};
                event.postback = { 'payload': 'bdayMessage' };

                if (error) {
                    console.log('Error sending messages: ', error)
                } else if (userData.body.error) {
                    console.log('Error: ', userData.body.error)
                }else{
                    var userObj = new User(uid,userData.body); //Set user object
                    responseHandler.handleRequest(event,userObj,CONFIG,questionsList);
                }
            });
}

// Create an HTTPS service identical to the HTTP service.
https.createServer(ssl, app).listen(CONFIG.listenPort);



