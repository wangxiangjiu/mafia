'use strict';
console.log('Loading function');

//const doc = require('dynamodb-doc');

//const dynamo = new doc.DynamoDB();


var Alexa = require("alexa-sdk");
var appId = 'amzn1.ask.skill.fc1040ab-fb4d-498e-80da-c762ff72c0ec';
//var recipeTable;
//dynamo.scan({TableName: "mafia"}, onScan);
//var recipeArray = "dummy text";
//var recipeList = "";
var room_number = 10;
// function toLower(x) {
//     return x.toLowerCase();
// }

// function onScan(err, data) {
//     if (err) {
//         console.error("failed")
//         this.emit(':tell', "something went wrong");
//     } else {
//         console.log("success");
//         recipeTable = data;
//         recipeArray = [];
//         recipeTable.Items.forEach(function (recipe) {
//             recipeArray.push(recipe.Player);
//         });
//         recipeArray = recipeArray.map(toLower);
//         recipeList = JSON.stringify(recipeArray);
//     }
// }


exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = appId;
    //alexa.dynamoDBTableName = 'mafia';
    // change necessary handlers names
    alexa.registerHandlers(newSessionHandlers, mainHandlers);
    alexa.execute();
};

var states = {
    MAINMODE: '_MAINMODE'
};

var newSessionHandlers = {
    // 'LaunchRequest': function () {
    //     // if (Object.keys(this.attributes).length === 0) {
    //     //     this.attributes['currentRecipe'] = "";
    //     // }
    //     //this.handler.state = states.MAINMODE;
    //     //this.emit(':ask', recipeArray);
    //     this.emit(':ask', 'Werewolf game here. The game requires 6 players. Two werewolves, a doctor, a sear, and' +
    //         'two villegers. To join the game, please enter the url. Please enter the room in on the webpage. The room number is ' + room_number);
    // },
    'NewSession': function () {
        // if (Object.keys(this.attributes).length === 0) {
        //     this.attributes['currentRecipe'] = "";
        // }
        this.handler.state = states.MAINMODE;
        //this.emit(':ask', recipeArray);
        this.emit(':ask', 'Werewolf game here. The game requires 6 players. Two werewolves, a doctor, a sear, and' +
            'two villegers. To join the game, please enter the url. Please enter the room in on the webpage. The room number is' + room_number);
    },
    "AMAZON.StopIntent": function () {
        this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function () {
        this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }
};


var mainHandlers = Alexa.CreateStateHandler(states.MAINMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'MainIntent': function () {
        var user_res = this.event.request.intent.slots.item.value;
        console.log('user chose: ' + user_res);
        // need to fix how to get the num_people;
        if (user_res === "ready") {
            this.emit(':ask', 'Great, to start the game, say werewolf game begin.');
            //list of other items we can say at this point?
        } else if (user_res === "werewolf game begin") {
            // update database to start game.
            //gameArray['Started'] = true;
            this.attributes['state'] = "close";
            this.emit(':ask', 'Werewolf game started, it is night time. Everyone please close your eyes. ' +
                'Say close eyes confirmed to move on');
        } else if (user_res === "confirmed" && this.attributes['state'] === "close") {
            this.attributes['state'] = "kill";
            this.emit(':ask', 'Werewolves, open your eyes and recognize each other. Tap a villeger on the phone to kill')
        } else if (user_res === "confirmed" && this.attributes['state'] === "kill" ) {
            this.attributes['state'] = "heal";
            this.emit(':ask', 'Ok, Werewolves, close your eyes. Now, Doctor, open your eyes. Tap on any role on the phone to heal')
        } else if (user_res === "confirmed" && this.attributes['state'] === "heal") {
            this.attributes['state'] = "sear";
            this.emit(':ask', 'Doctor, close your eyes. Sear, Open your eyes. Tap on the phone to see the role of another player');
        } else if (user_res === "confirmed" && this.attributes['state'] === "sear" ) {
            this.attributes['state'] = "";
            // Need to check the database and find out who is killed.
            this.emit(':ask', 'Sear, close your eyes. Now everybody open your eyes. It is daytime.');
        } else {
            this.emit(':ask', 'sorry, room is not filled yet. Please make sure everyone has entered the room.');
        }
    },

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', 'you can say sushi rolls, sandwiches');
    },
    "AMAZON.StopIntent": function () {
        console.log("STOPINTENT");
        this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function () {
        console.log("CANCELINTENT");
        this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function () {
        console.log("UNHANDLED");
        var message = 'We do not have this recipe, please say one of' + recipeList;
        this.emit(':ask', message, message);
    }
});
