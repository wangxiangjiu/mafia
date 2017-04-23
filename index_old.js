'use strict';
console.log('Loading function');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();


var Alexa = require("alexa-sdk");

//Need to change this. 
var appId = 'amzn1.ask.skill.fc1040ab-fb4d-498e-80da-c762ff72c0ec';
// var recipeTable;
var playersTable;
var playersArray;
var playersList;
//dynamo.scan({TableName: "mafia"}, onScan_players);

var gameStateTable;
var gameArray;
var gameList;
//dynamo.scan({TableName: "Game_state"}, onScan_game_state);

// var recipeArray = "dummy text";
// var recipeList = ""

var room_number = random(1, 100);
var num_people = 0;

var num_werewolves = 2;
var num_villegers = 4;


function toLower(x) {
    return x.toLowerCase();
}

function onScan_players(err, data) {
    if (err) {
        console.error("failed")
        this.emit(':tell', "something went wrong");
    } else {
        console.log("success");
        playersTable = data;
        playersArray = [];
        players_table.Items.forEach(function (player) {
            playersArray.push(player.Player);
        });
        playersArray = playersArray.map(toLower);
        playersList = JSON.stringify(playersArray);
    }
}

function onScan_game_state(err, data) {
    if (err) {
        console.error("failed")
        this.emit(':tell', "something went wrong");
    } else {
        console.log("success");
        gameStateTable = data;
        gameArray = [];
        gameTable.Items.forEach(function (game) {
            gameArray.push(game.RoomId);
        });
        gameArray = gameArray.map(toLower);
        gameList = JSON.stringify(gameArray);
    }
}

// function onScan_game_state(err, data) {
//     if (err) {
//         console.error("failed")
//         this.emit(':tell', "something went wrong");
//     } else {
//         console.log("success");
//         recipeTable = data;
//         recipeArray = [];
//         recipeTable.Items.forEach(function (recipe) {
//             recipeArray.push(recipe.RecipeName);
//         });
//         recipeArray = recipeArray.map(toLower);
//         recipeList = JSON.stringify(recipeArray);
//     }
// }

function random (low, high) {
    return Math.random() * (high - low) + low;
}

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.dynamoDBTableName = 'mafia';
    // change necessary handlers names
    alexa.registerHandlers(newSessionHandlers, mainHandlers);
    alexa.execute();
};

var states = {
    INGREDIENTMODE: '_INGREDIENTMODE', // User is going through ingredients.
    MAINMODE: '_MAINMODE',  // Prompt the user to find a recipe.
    DIRECTIONMODE: '_DIRECTIONMODE'
};

var newSessionHandlers = {
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
        num_people = gameArray['num_people']
        // need to fix how to get the num_people;
        if (user_res === "ready" && num_people === 6) {
            this.emit(':ask', 'Great, to start the game, say start werewolf game.');
            //list of other items we can say at this point?
        } else if (user_res === "start werewolf game") {
            // update database to start game.
            gameArray['Started'] = true;
            this.emit(':ask', 'Great, werewolf game started, it is night time. Everyone please close your eyes. ' +
                'Say close eyes confirmed to move on');
        } else if (user_res === "close eyes confirmed") {
            this.emit(':ask', 'Werewolves, open your eyes and recognize each other. Tap a villeger on the phone to kill')
        } else if (user_res === "kill confirmed") {
            this.emit(':ask', 'Ok, Werewolves, close your eyes. Now, Doctor, open your eyes. Tap on any role on the phone to heal')
        } else {
            this.emit(':ask', 'sorry, room is not filled yet. Please make sure everyone has entered the room.');
        }
    },
    'FoodIntent': function () {
        var food = this.event.request.intent.slots.food.value;
        for (var i = 0; i < recipeArray.length; i++) {
            if (recipeArray[i] === food) {
                this.attributes['currentRecipe'] = food.toString();
                this.attributes['ingredientList'] = null;
                this.attributes['currentIngredientIndex'] = 0;
                this.attributes['directionList'] = null;
                this.attributes['currentDirectionIndex'] = 0;
                this.handler.state = states.INGREDIENTMODE;
                this.emit(':ask', 'you can say what are the ingredients');
            } else {
                this.emit(':ask', 'sorry, what you want to make is not in our list of recipes');
            }
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


