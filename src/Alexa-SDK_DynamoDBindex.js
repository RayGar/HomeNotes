//console.log('starting function');

//const AWS = require('aws-sdk');
//const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

"use strict";

var Alexa = require('alexa-sdk');

var handlers = {
    "LaunchRequest": function () {
        this.attributes.notes = {
          'currUser': 'N/A',
          'targetUser': 'N/A',
          'message': 'N/A'
        }

	  this.response.speak("Welcome to Home Notes")//.listen("Who is this?");
      this.emit(":responseReady");
        //this.emit("CurrentUser")
    },
    "CurrentUser": function () {
        var currUser = this.event.request.intent.slots.User.value;
        this.attributes.notes.currUser = currUser;
        this.response.speak("Hello "+currUser)//.listen(", would you like to receive your notes or leave one?");
        this.emit(':responseReady');
    },
    "TargetUser": function () {
        var targetUser = this.event.request.intent.slots.User.value;
        this.response.speak("Target User is now "+targetUser);
        this.attributes.notes.targetUser = targetUser;
        this.emit(':responseReady');
    },
    "LeaveMessage": function () {
        var message = this.event.request.intent.slots.Message.value;
        this.attributes.notes.message = message;
        this.response.speak("LeaveMessage: "+ message);
        this.emit(':responseReady');
    }

};

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context);
    //alexa.appID = appID;
    alexa.dynamoDBTableName = 'currUser';
    alexa.registerHandlers(handlers);
    alexa.execute();
};
