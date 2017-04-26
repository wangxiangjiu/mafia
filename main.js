// AWS.config.update({
//   region:
//   endpoint:
//   accessKeyId:
//   secretAccessKey: 
// });

// var dynamodb = new AWS.DyanomDB();
// var docClient = new AWS.DyanomDB.DocumentClient();


$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms

  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $roomInput = $('.roomInput');
  var $loginPage = $('.login.page');
  var $lobbyPage = $('.lobby.page');
  var $gamePage = $('.game.page');
  var $gameMessage = $('.game.message');
  var $gameBroadcast = $('.game.broadcast');
  var $playerArea = $(".users");


  var otherPlayerPID = [];
  var player = {};

  var username = false;
  var connected = false;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  socket.on("welcome", function(message){
    $("div.welcome").text(message);
    // set something to some message.
  })

  socket.on("roomcount", function(message){
    $("div.broadcast").text(message);
  })

  socket.on("assign role", function(roleData){
    // $.ajax({
    //   type: "POST",
    //   url: "https://p7lrmho5n7.execute-api.us-east-1.amazonaws.com/prod/RecipeUpdate?TableName=mafia",
    //   data: role,

    // })
    var url = "https://d8iqr83w63.execute-api.us-east-1.amazonaws.com/prod/MafiaRequest";

    console.log(roleData);
    $.post(url, JSON.stringify({
      "type":"POST",
      "Access-Control-Allow-Origin": "*",
      "data": {
        "TableName" : "mafia",
        "Item":{
          "Player": roleData["Player"],
          "Role": roleData["Role"]}}})
    , function(data, status){
      // alert(status);
      player.role = roleData["Role"];
      player.pid = roleData["pid"];
      // if (player.role == )
      var html = getRoleHTML(player.role, "You");
      $playerArea.append(html);


    });

  })

  function getRoleHTML(role, username){
    var text;
    if (role == "Werewolf"){
      text = "<a href='#'><span><div class='circle werewolf'><img src='img/wolf.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "Villager") {
      text = "<a href='#'><span><div class='circle villager'><img src='img/villager.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "Doctor") {
      text = "<a href='#'><span><div class='circle doctor'><img src='img/doctor.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "Seer"){
      text = "<a href='#'><span><div class='circle seer'><img src='img/seer.png'/></div><span class='username'>"+username+"</span></span></a>"
    } else if (role == "unknown"){
      text ="<a href='#'><span><div class='circle question'><img src='img/question.png'/></div><span class='username'>Player "+username+"</span></span></a>"
    }
    return text;
  }


  socket.on("player joined", function (newPlayer){
    npName = newPlayer.username;
    // APPEND CIRCLE THING 

    if (player.role === "Werewolf"){
      if (newPlayer.role === "Werewolf"){
        var html = getRoleHTML("Werewolf", npName);
        $playerArea.append(html);
      } else {
        var html = getRoleHTML("unknown", npName);
        $playerArea.append(html);   
      }
    } else {
      var html = getRoleHTML("unknown", npName);
      $playerArea.append(html);
    }
  });

  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    // $loginPage.fadeOut();
    // $lobbyPage.show();

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $lobbyPage.show();
      $roomInput.focus();

      socket.emit('add user', username);
    //   // $loginPage.off('click');
    //   // $currentInput = $inputMessage.focus();

    //   // Tell the server your username
    //   // socket.emit('add user', username);
    }
  }

  socket.on("update players", function(playerData){
    var username = playerData[0];
    var role = playerData[1]
    var html;
    if (player.role == "Werewolf"){
      if (role == "Werewolf"){
        html = getRoleHTML(role, username);
      }
    } else {
      html = getRoleHTML("unknown", username);
    }
     $playerArea.append(html);
  });



  function joinRoom () {
    room = cleanInput($roomInput.val().trim());
    if (room) {
      $lobbyPage.fadeOut();
      $gamePage.show();
      $.get("https://d8iqr83w63.execute-api.us-east-1.amazonaws.com/prod/MafiaRequest?TableName=Game_state", function(data) {
        // if room does not exist, tell player to reprompt alexa i think.
        entries = data["Items"];
        var data = false;
        data = validRoom(entries);
        if (data){
          socket.emit("join room", data);
        } else {
          console.log("invalid room!");
        }
      });
    }
  }

  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  function validRoom (items) {
    var data = {};
    for (var i=0; i<items.length; i++ ){
      var entry = items[i];
      if (entry["RoomId"]==room){
        data["room"] = entry["RoomId"];
        data["max"] = entry["Num_people"];
        data.username = username;
        return data;
      }
    }
    return false;
  }

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    // if (!(event.ctrlKey || event.metaKey || event.altKey)) {
    //   $currentInput.focus();
    // }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username){
        joinRoom();
      } else {
  	    setUsername();      
      }
    }
  });

  $(document).on('click', ".circle", function(event){
    if (player.role == "Werewolf"){

      // "<a href='#'><span><div class='circle seer'><img src='img/seer.png'/></div><span class='username'>"+username+"</span></span></a>"


      if ($(event.target).attr('class') != "circle werewolf"){
        $(this).find("img").attr('src', 'img/skull.png');
      }
    }
    // }
    // console.log($(event.target).attr('class'));
  });

  // $(".circle").click(function(event){
  //   console.log(event);
  // });
  // if (player.role == "Werewolf"){
      
  //   } else {

  //   }
  // });

});




