/* index.js: HomeNote's lambda function */


"use strict";

var Alexa = require("alexa-sdk");           
const AWS = require('aws-sdk');
//const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

var actionPrompt = " Now what action do you wish to take next?";                                            
var actionRepeat = "Sorry I did not hear that. Please repeat the action you wish to take.";




var handlers = {																										// this is an object that handles the intent requests

	//LaunchRequest is the user's point of entry
    "LaunchRequest": function () {
		
		
        if(Object.keys(this.attributes).length === 0) {																	//is it the first time a user has initiated the skill
            this.attributes['currUser'] = "";																			//for not having to ask who a note is for if we already know
            this.attributes['currNote'] = "";
            this.attributes['notes'] = [];
            this.attributes['correspondingUserNotes'] = [];          													//for knowing who each note is for
            this.response.speak("Welcome to home notes... What action do you wish to take?")
                .listen(actionPrompt);
        } else {
            this.response.speak("Welcome back to home notes ... What action do you wish to take?")
                .listen(actionRepeat);
        }
	    
	    
	    this.emit(':responseReady');
     },
     
	//LeaveNoteIntent leaves precisely one note that is designated for precisely one user
    "LeaveNoteIntent": function() {
	    var currNote = this.event.request.intent.slots.Note.value;
		this.attributes['currNote'] = currNote;
		
		var recievingUser = this.event.request.intent.slots.User.value;
		this.attributes['currUser'] = recievingUser;
		
		if(currNote && recievingUser) {																					//if both not NULL
		    this.attributes['notes'].push(currNote);
		    this.attributes['correspondingUserNotes'].push(recievingUser);
		    let index = this.attributes['notes'].length.toString();														//length of the notes array
		    
		    this.response.speak("I will now leave the message: " +
		        this.attributes['notes'][this.attributes['notes'].length-1] + " to " + 									//output confirmation of the new note
		        this.attributes['correspondingUserNotes'][this.attributes['correspondingUserNotes'].length-1]			//output cofirmation of who the note is for
		        + actionPrompt)
		            .listen(actionRepeat);
		}
		else {
			this.response.speak("I'/m sorry I didn't understand that. Please repeat your utterance.");
		}
		
		
		this.emit(':responseReady');
	},
	
	//DeleteNotesIntent deletes all the notes left for a given user
	"DeleteNoteIntent": function() {
		var i = this.event.request.intent.slots.index.value;
		
		if(i) {
			this.attributes['notes'].pop(i);
			this.attributes['correspondingUser'].pop(i);
			
			this.response.speak("Note number: " + i + " has been deleted. Play all the notes to find what the new ordering is.");
		} else {
			this.response.speak("I'/m sorry I didn't understand the number. Please repeat your action again.");
		}
		
		
		
		this.response.speak("You have chosen to delete a note. " + actionPrompt)
			.listen(actionRepeat);
		this.emit(':responseReady');
	},
	
	//PlayNotesIntent plays the notes left to a specific user
	"PlayNotesIntent": function() {
		var receivingUser = this.event.request.intent.slots.User.value;
	    var i;
	    var output = "";
		
		for(i = 0; i < this.attributes['notes'].length; i++) {									//for each member of the notes array ...
		    if(receivingUser == this.attributes['correspondingUserNotes'][i]){					//if the user inputed user name is equal to the name on the correspondingUser array...
		        output += "Note number: " + i + ", reads " +  									//append the member of the notes array to the output string
		            this.attributes['notes'][i] + " ... ";
		    }
		}
		
		this.response.speak(output);															//pass the prepared output speech to the alexa device
		
		
		this.emit(':responseReady');
	},
	
	//Plays every note for every user in the users array
	"PlayEveryNoteIntent": function() {
	    var i;
	    
	    for(i=0;i<this.attributes['notes'].length;i++) {
	        this.response.speak("Note number: " + i + ", reads " +
	            this.attributes['notes'][i] + " ... " + 
		        "And it is for ... " + 
		        this.attributes['correspondingUserNotes'][i]);
	    }
	    
	    this.emit(':responseReady');
	},
	
	//RegisterUserIntent serves two purposes: adds a new user to the user array and sets him/her as the currentUser for other intents to know
	'RegisterUserIntent': function() {
		var currUser = this.event.request.intent.slots.User.value;
		this.attributes['currUser'] = currUser;
		    
        
        if(currUser) {
			//TODO: also check if there is such a user by that name in the attributes['users'] object, for now I'm assuming that it is, if there isn't add him
			this.response.speak("I shall now address you as " + currUser + ". " + actionPrompt)
				.listen(actionPrompt);
		} else {
			this.response.speak("I'm sorry. I couldn't understand your name. Please repeat the action.")
				.listen(actionRepeat);
		}
		
		
		this.emit(':responseReady');
	},
	  
	  
   // Stop
  'AMAZON.StopIntent': function() {
      this.response.speak('Ok, let\'s play again soon.');
      this.emit(':responseReady');
  },

  // Cancel
  'AMAZON.CancelIntent': function() {
      this.response.speak('Ok, let\'s play again soon.');
      this.emit(':responseReady');
  },

  // Save state
  'SessionEndedRequest': function() {
    console.log('session ended!');
    //TODO" this line causes skill to crash
    this.emit(':saveState', true);
  }
  
};

exports.handler = function(event, context, callback) {												//every lambda function needs this, not just Alexa, AWS calls it everytime someone uses our skill
  var alexa = Alexa.handler(event, context);														//setup the Alexa object
    alexa.registerHandlers(handlers);																//register the handlers we wrote in the preceding block
    alexa.execute();	//calls the Alexa code
    
    
};