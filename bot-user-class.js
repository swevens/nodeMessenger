var method = User.prototype;

function User(userId,userProfile){
    this.userId = userId;
    this.status = false;
    this.profile = userProfile;
    this.lastQuestion = {};
    this.chatData = {},
    this.notifyCounter = 0;
}
    
module.exports  = User;