var CONFIG = {
    accessToken : "", // FB page access token
    witToken : "", // Wit ai token
    port : 80,
    ssl : {
        key: "",
        cert: "",
        ca: ""
    },
    verifyToken : "", // webhook verification token
    notifyCounter : 5,
    listenPort : 443,
    defaultAuthMsg : "User not authorized, kindly try again.",
    defaultQueryMsg : "Thank you for your interest. Please send hi/hello for menu",
    notifyMsg : "Thank you for your interest. Please send hi/hello for menu",
    
}
module.exports = CONFIG;
