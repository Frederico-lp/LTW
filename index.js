const API='http://twserver.alunos.dcc.fc.up.pt:8008/'

var pl1Turn = true;
var pl1AvailableSeeds = 0;
var pl2Turn = false;
var pl2AvailableSeeds = 0;

var rulesPopShown = false;
var configsPopShown = false;
var highScoresPopShown = false;
var rankingFetched = false;

var isLoginContainerShown = false;
var isRegisterContainerShown = false;

var numberSeeds = 0;
var numberCavities = 0;
var pvp = true;
var aiLevel = 1;

var nickname = "nickname";
var password = "password";
var game = 0;

var loggedIn = false;

var eventSource = 0;

//variable that defines if game is online or local
var online = true;


addEventListener

window.onload = function defaultBoard(){
    createBoard(10, 6);
    numberCavities = 10;
    numberSeeds = 6;
}

/*          Login/Register          */
function showRegisterContainer(){
    document.getElementById("register-btn").onclick=function() {
        if(isLoginContainerShown){
            document.getElementById("login-popup").style.display='none';
            isLoginContainerShown = false;
        }
        if(isRegisterContainerShown){
            document.getElementById("register-popup").style.display='none';
            isRegisterContainerShown = false;
        }
        else {
            document.getElementById("register-popup").style.display='';
            isRegisterContainerShown = true;
        }
    }
}

function registerUser() {
    nickname = document.getElementById("username-register").value;
    password = document.getElementById("password-register").value;
    register(nickname, password);
}

function giveUp() {
    if(online){
        leave();
    }
    
}

function write_message(message) {
    var container = document.getElementById("write-messages");
    let msg = document.createElement("p");
    msg.textContent = " -: " + message;
    container.appendChild(msg);
}

/*                                  Pop-ups code - Beggining                                 */
function showPopUpRules(){
    document.getElementById("rules-bttn").onclick=function() {
        if(configsPopShown || highScoresPopShown){
            document.getElementById("configs-popup").style.display='none';
            document.getElementById("high-scores-popup").style.display='none';
            configsPopShown = false;
            highScoresPopShown = false;
        }
        if(!rulesPopShown){
            document.getElementById("rulespopup").style.display='';
            rulesPopShown = true;
        }
        else {
            document.getElementById("rulespopup").style.display='none';
            rulesPopShown = false;
        }
    };
}

function showPopUpConfigs(){
    document.getElementById("config-bttn").onclick=function() {
        if(rulesPopShown || highScoresPopShown){
            document.getElementById("rulespopup").style.display='none';
            document.getElementById("high-scores-popup").style.display='none';
            highScoresPopShown = false;
            rulesPopShown = false;
        }
        if(!configsPopShown){
            document.getElementById("configs-popup").style.display='';
            configsPopShown = true;
        }
        else {
            document.getElementById("configs-popup").style.display='none';
            configsPopShown = false;
        }
    };
}

function showPopUpHighScores(){
    document.getElementById("view-highscores-btn").onclick=function() {
        if(rulesPopShown || configsPopShown){
            document.getElementById("rulespopup").style.display='none';
            document.getElementById("configs-popup").style.display='none';
            configsPopShown = false;
            rulesPopShown = false;
        }
        if(!highScoresPopShown){
            document.getElementById("high-scores-popup").style.display='';
            highScoresPopShown = true;
            ranking();
        }
        else {
            document.getElementById("high-scores-popup").style.display='none';
            highScoresPopShown = false;
        }
    };

}
/*                                  Pop-ups code - END                                    */

function createBoard(items, seeds){
    let board = document.getElementById("board");

    let hiddenItem = document.createElement("div");
    hiddenItem.className = "hidden-item"

    let warehouse1 = document.createElement("div");
    let warehouse2 = document.createElement("div");
    warehouse1.id = "warehouse1";
    warehouse2.id = "warehouse2";

    board.appendChild(warehouse2);
    board.appendChild(hiddenItem);
    board.appendChild(warehouse1);


    let line1 = document.createElement("div");
    line1.className = "line";
    line1.id = "line1";
    let line2 = document.createElement("div");
    line2.className = "line";
    line2.id = "line2";

    hiddenItem.appendChild(line1);
    hiddenItem.appendChild(line2);

    //upper items
    for(let i = 0; i < items/2; i++){
        let item = document.createElement("div");
        item.className = "small-item";
        item.id = "a"+i;
        line1.appendChild(item);
    }
    //bottom items
    for(let i = items/2; i < items; i++){
        let item = document.createElement("div");
        item.className = "small-item";
        item.id = "a"+i;
        line2.appendChild(item);
    }

    createSeeds(items, seeds);
}

function createSeeds(items, seeds){
    for(var i = 0; i < items; i++){
        let box = document.getElementById("a"+i);
        for (var j = 0; j < seeds; j++) {
            let seed =  document.createElement("div");
            seed.className = "seed";
            seed.style.top = (Math.random()*50 +25) + "%"; 
            seed.style.left = (Math.random()*50 + 25) + "%"; 
            seed.style.transform = "rotate (" + Math.random*360 + "deg)"; 
            box.appendChild(seed);
        }
        box.addEventListener("click",function(){
            if(!online)
                changeSeeds(this);
            else 
                onlinePlay(this);
        });
    }
}



function emptyBox(box){
    if(box == null)
        return;

    let length = box.children.length;
    for(var i=0; i < length; i++){
        box.children[0].remove();
    }
    return length;
}

function addSeed(box){
    let seed =  document.createElement("div");
        seed.className = "seed";
        seed.style.top = (Math.random()*50 +25) + "%"; 
        seed.style.left = (Math.random()*50 + 25) + "%"; 
        seed.style.transform = "rotate (" + Math.random*360 + "deg)"; 
        box.appendChild(seed);
}

function addSeedtoContainer(container){
    let seed =  document.createElement("div");
    seed.className = "seed";
    seed.style.top = (Math.random()*50 +25) + "%"; 
    seed.style.left = (Math.random()*50 + 25) + "%"; 
    seed.style.transform = "rotate (" + Math.random*360 + "deg)"; 
    container.appendChild(seed);
}

function plantSeeds(availableSeeds, box){
    let id = parseInt(box.id.substr(1));
    let pl1Container = document.getElementById("warehouse1");
    let pl2Container = document.getElementById("warehouse2");
    let botFlag = false;   //flag is used when row is changed
    let topFlag = false;
    let i = 0;
    console.log("number of cavities is "+numberCavities);
    for(i; i < availableSeeds; i++){
        
        //send rest of seeds to upper row
        if(id+1 > numberCavities-1){
            console.log("last bottom");
            //add seed to container if its pl1 turn
            if(pl1Turn){
                addSeedtoContainer(pl1Container);
                //last seed in the container
                if(i == (availableSeeds - 1))
                    return 1;
                availableSeeds--;
            }
            id = numberCavities/2;
            topFlag = true;
        }
        //send rest of seeds to bottom row
        if(id-1 < 0){
            console.log("last upper");
            if(pl2Turn){
                addSeedtoContainer(pl2Container);
                if(i == (availableSeeds - 1))
                    return 1;
                availableSeeds--;
            }
            id = numberCavities/2-1;
            botFlag = true;
        }
        console.log("seeds for this for available"+(availableSeeds-i-1));
        // if(i >= availableSeeds - 1)
        //     return 1;
        
        //top row
        if(!botFlag && id <= (numberCavities/2 - 1) || topFlag){
            console.log("normal upper");
            id--;
            console.log(id);
            let nextBox = document.getElementById('a' + id);
            console.log(nextBox.id);

            //special rule for last seed
            
            if(i == availableSeeds - 1){
                //if the box of my last seed is empty and is enemies box
                if(nextBox.childElementCount == 0 && pl2Turn){
                    let enemyBox = document.getElementById('a' + (id + (numberCavities/2)));
                    console.log(enemyBox.id);
                    var seedsTaken = emptyBox(enemyBox);
                    //empty enemy opposite box and fill mine
                    for(let j = 0; j < seedsTaken; j++)
                        addSeedtoContainer(pl2Container);
                    return 0;
                }
            }
            
            addSeed(nextBox);
            if(topFlag)
                topFlag = false;
        }

        //bottom row
        else if (id >= (numberCavities/2) || botFlag){
            console.log("normal bottom");
            id++;
            console.log(id);
            let nextBox = document.getElementById('a' + id);
            console.log(nextBox.id);
    
             //special rule for last seed
             if(i == availableSeeds - 1){
                //if the box of my last seed is empty and is my box
                if(nextBox.childElementCount == 0 && pl1Turn){
                    let enemyBox = document.getElementById('a' + (id-(numberCavities/2)));
                    console.log(enemyBox.id);
                    seedsTaken = emptyBox(enemyBox);
                    //empty enemy opposite box and fill mine
                    for(let j = 0; j < seedsTaken; j++)
                        addSeedtoContainer(pl1Container);
                    return 0;
                }
            }
            

            addSeed(nextBox);
            if(botFlag)
                botFlag = false;
        }

    }
    return 0;
}

function changeSeeds(box){
    //currentPlayer = document.getElementById("current-player");
    let id = parseInt(box.id.substr(1));
    informations = document.getElementById("informations");
    if(pl1Turn){
        if(id < numberCavities/2){
            console.log(id);
            return -1;
        }
        pl1AvailableSeeds = emptyBox(box);
        console.log("pl1 available seeds is:"+pl1AvailableSeeds);
        let playAgain = plantSeeds(pl1AvailableSeeds, box);
        if(!playAgain){
            informations.innerText = 'Player 2 turn (upper)';
            pl1Turn = false;
            pl2Turn = true;
        }
        
    }

    else if(pl2Turn){
        if(id > (numberCavities/2 - 1))
            return;
        pl2AvailableSeeds = emptyBox(box);
        console.log("pl2 available seeds is:"+pl2AvailableSeeds);
        let playAgain = plantSeeds(pl2AvailableSeeds, box);
        if(!playAgain){
            informations.innerText = 'Player 1 turn (bottom)';
            pl2Turn = false;
            pl1Turn = true;
        }
    }
    checkGameEnding();
}

function checkGameEnding(){
    let pl1Container = document.getElementById("warehouse1");
    let pl2Container = document.getElementById("warehouse2");

    var pl2CavitySeeds = 0;
    for(let i = 0; i < (numberCavities/2); i++){
        let box = document.getElementById('a' + i);
        let length = box.children.length;
        pl2CavitySeeds += length;
        
    }
    console.log("pl2 total seeds is" + pl2CavitySeeds);

    //if pl2 doesnt have seeds pl1 collects the ones left
    if(pl2CavitySeeds == 0){
        for(let i = numberCavities; i < numberCavities; i++){
            let box = document.getElementById('a' + i);
            let seedsLeft = emptyBox(box);
            for(let j=0;j<seedsLeft;j++)
                addSeedtoContainer(pl1Container);
        }
        checkWinner();
    }

    //bottom cavities
    var pl1CavitySeeds = 0;
    for(let i = numberCavities/2; i < numberCavities; i++){
        let box = document.getElementById('a' + i);
        let length = box.children.length;
        pl1CavitySeeds += length;
    }
    console.log("pl1 total seeds is" + pl1CavitySeeds);
    if(pl1CavitySeeds == 0){
        for(let i = 0; i < (numberCavities/2); i++){
            let box = document.getElementById('a' + i);
            let seedsLeft = emptyBox(box);
            for(let j=0;j<seedsLeft;j++)
                addSeedtoContainer(pl2Container);
        }
        checkWinner();

    }
}

function checkWinner(){
    let pl1Container = document.getElementById("warehouse1");
    let pl2Container = document.getElementById("warehouse2");

    var pl1TotalSeeds = pl1Container.children.length;
    var pl2TotalSeeds = pl2Container.children.length;


    var informations = document.getElementById("informations");

    if(pl1TotalSeeds > pl2TotalSeeds)
        informations.innerText = "Player 1 won!!";
    else if(pl1TotalSeeds < pl2TotalSeeds)
        informations.innerText = "Player 2 won!!";
    else 
        informations.innerText = "It was a draw!";

    pl1Turn = false;
    pl2Turn = false;


}


function resetGame(){
    createBoard(10,6);
}

//adicionar event listener com esta funçao
function findGame(){
    informations.innerText = "Wating for players...";
    join(nickname, password, numberCavities, numberSeeds);    

}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

//for 1 turn in online, happens everytime cavity is pressed
function onlinePlay(box){
    if(game == 0)
        return false;
        
    let id = parseInt(box.id.substr(1));


    //if it's the enemy field
    if(id < (numberCavities/2 - 1))
        return -1;
    else(id -= (numberCavities/2) );

    //play notification
    notify(nickname, password, game, id)

    //server answer
}

function getFormData() {
    ///////////board
    numberCavities = document.getElementById("number-cavities").value * 2;
    numberSeeds = document.getElementById("number-seeds").value;
    console.log(numberCavities);
    console.log(numberSeeds);

    /////////enemy
    var pvpOnline = document.getElementById("player-on-player-online");
    informations = document.getElementById("informations");
    if(pvpOnline.checked){
        online = true;
        informations.innerText = "";
    }

    var pvpLocal = document.getElementById("player-on-player-local");
    if(pvpLocal.checked){
        online = false;
        informations.innerText = "Bottom player (Player 1) turn";
    }

    
    var resetY = document.getElementById("reset-game-yes");
    var resetN = document.getElementById("reset-game-no");

    if(resetY.checked && !resetN.checked)
        resetGame();

    var board = document.getElementById("board");
    while (board.lastElementChild) {
        board.removeChild(board.lastElementChild);
    }

    pl1Turn = true;
    pl2Turn = false;

    document.getElementById("configs-popup").style.display='none';
    configsPopShown = false;
    
    createBoard(numberCavities, numberSeeds);
}

////////////////////////////////////////////////////////////////////////////////////////////////
//                                  API functions

function join(){
    var group = 83;     //nº do nosso grupo(83)
    informations = document.getElementById("informations");
    const url = API + "join";   
    fetch(url , {
        method: 'POST',
        body: JSON.stringify({
            group: group,
            nick: nickname,
            password: password,
            size: numberCavities,
            initial: numberSeeds
            })
    })
    .then((resp)=>resp.json())
    .then(function(data){
        game = data.game;
        update();
        document.getElementById("find-game-btn").style.display='none';
        document.getElementById("leave-game-btn").style.display='';
        informations.innerText = "Looking for opponents...";
    })
    .catch((error) => {
        console.log(error)
        return false;
    });
}

function leave(){
    const url = API + "leave";   
    fetch(url , {
        method: 'POST',
        body: JSON.stringify({
            nick: nickname,
            password: password,
            game: game,
            })
    })
    .then(function() {
        informations = document.getElementById("informations");
        loggedIn = false;
        document.getElementById("leave-game-btn").style.display='none';
        document.getElementById("find-game-btn").style.display='';
        informations.innerText = "You left the game!";
    })
    .catch((error) => {
        console.log(error)
        return false;
    });
}

function notify(nickname, password, game, cavity){
    //cavity is the cavity to seed, starting with 0
    var informations = document.getElementById("informations");
    const url = API + "notify";
    fetch(url , {
        method: 'POST',
        body: JSON.stringify({
            nick: nickname,
            password: password,
            game: game,
            move: cavity
            })
    })
    .then((resp)=>resp.json())
    .then(function(data){
        if(data.error != null)
            informations.innerText = data.error;

    }) 
    .catch(console.log);
}

function ranking(){
    //for each line returns nickname, nº os victories and nº of played games (for that board size)
    //const url = API + "ranking";
    // take the comment bellow to test with our server
    const url = 'http://twserver.alunos.dcc.fc.up.pt:9083/ranking'
    fetch(url , {
        method: 'POST',
        body: JSON.stringify({
        })
    })
    .then((resp)=>resp.json())
    .then(function(data){
        showRanking(data);
    }) 
    .catch((error) => {
        console.log(error)
        return false;
    });
}

function showRanking(data){
    if(!rankingFetched){
        box = document.getElementById("high-scores-popup");  
        console.log(box.id);
        for(let i=0; i<data.ranking.length; i++){
            let tile = document.createElement("div");
            tile.setAttribute("id", "hs-tile");
            let nick =  document.createElement("h3");
            let victories =  document.createElement("p");
            let games =  document.createElement("p");
            let wp = document.createElement("p");
            nick.textContent = i+1 + "º Place: " + data.ranking[i].nick;
            victories.textContent = "Victories : " + data.ranking[i].victories;
            games.textContent = "Games : " + data.ranking[i].games;
            let number_wp = (((data.ranking[i].victories) / (data.ranking[i].games)) * 100);
            wp.textContent = "Win Percentage : " + number_wp.toFixed(3) + "%";
            box.appendChild(tile);
            tile.appendChild(nick);
            tile.appendChild(victories);
            tile.appendChild(games);
            tile.appendChild(wp);
        }
        rankingFetched = true;
    }
}

function register(nickname, password){
    //const url = API + "register";
    // take the comment bellow to test with our server
    const url = 'http://twserver.alunos.dcc.fc.up.pt:9083/register'
    fetch(url , {
        method: 'POST',
        body: JSON.stringify({
            nick: nickname,
            password: password
            })
    })
    .then((resp)=>resp.json())
    .then(function(data){
        if(data.error != null){
            informations.innerText = data.error;
            return Promise.reject(data.error);
        }
        loggedIn = true;
        document.getElementById("register-container").style.display='none';
        document.getElementById("logged-as-container").style.display='';
        document.getElementById("give-up").style.display='';
        informations = document.getElementById("informations");
        informations.innerText = "";
        let player_name_p = document.getElementById("player-logged");
        let player_name = document.createTextNode(" " + nickname);
        player_name_p.appendChild(player_name);
    })    
    .catch((error) => {
        console.log(error);
        return false
    });
}

function update(){
    //updates state of the game
    encodedGame = encodeURIComponent(game);
    encodedNick = encodeURIComponent(nickname);
    const url = API + "update?nick=" + encodedNick + "&game=" + encodedGame;

    eventSource = new EventSource(url);
    eventSource.onmessage = function(event) {
        if(event.data != null){
            const data = JSON.parse(event.data);
            console.log(data);
            updateHandler(data);
        }

    }

}

function updateHandler(data){
    informations = document.getElementById("informations");
    if(data.winner != null){
        write_message(data.winner +" won!!");
        document.getElementById("find-game-btn").style.display='';
        document.getElementById("leave-game-btn").style.display='none';
        if(data.winner == nickname)
            informations.innerText = ("You won!!");
        else informations.innerText = ("You lost...");
        
    }
    if(data.pit != undefined){
        if(data.board.turn == nickname ){
            write_message("Enemy seeded his pit nrº" + data.pit);
        }
        else{
            write_message("You seeded your pit nrº" + data.pit);
        }
    }
    if(data.board.turn == nickname)
        informations.innerText = "Your turn to play!";
    else
        informations.innerText = "Enemy's turn to play!";
    
    write_message(data.board.turn +"'s turn to play!");

    updateBoard(data);

}

function updateBoard(data){

    let pl1Container = document.getElementById("warehouse1");
    let pl2Container = document.getElementById("warehouse2");


    for(var name in data.board.sides) {
        console.log(name);
        if(name == nickname){
            pl1 = data.board.sides[name];
        }
        else
            pl2 = data.board.sides[name];

    }



    console.log(pl1.store);
    console.log(pl2.store);

    //add seeds to containers
    if(parseInt(pl1.store) != 0){
        console.log("ENTROU");
        for(let i=0; i<parseInt(pl1.store); i++){
            console.log("pl1 store, i is" + i);
            console.log(pl1Container.id);
            addSeedtoContainer(pl1Container);
        }
    }

    if(parseInt(pl2.store) != 0){
        for(let i=0; i<parseInt(pl2.store); i++){
            console.log("pl2 store, i is" + i);
            addSeedtoContainer(pl2Container);
        }
    }

    //add seeds to cavities
    //bottom cavities
    for(let i = 0; i < (pl1.pits.length/2); i++){
        let box = document.getElementById('a' + (i + (pl1.pits.length/2)) ); //começa a meio o indice
        console.log(box.id);
        emptyBox(box);
        for(let j=0; j < pl1.pits[i]; j++){
            addSeed(box);
        }
    }
    //upper cavities
    for(let i = 0; i < (pl2.pits.length/2); i++){
        let box = document.getElementById('a' + i); //começa a meio o indice
        emptyBox(box);
        for(let j=0; j < pl2.pits[i]; j++){
            addSeed(box);
        }
    }
}