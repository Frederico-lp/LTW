const http = require('http');
const fs = require('fs');

const port = 9083;

const crypto = require('crypto');




const server = http.createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    if(req.method != 'POST'){
        res.writeHead(404);
        let error = JSON.stringify({error: "invalid HTTP method"});
        res.end(error);
    }
    if(req.url == '/ranking'){
        serverRanking(res);
    }
    else if(req.url == '/register'){
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var post = JSON.parse(body);
            serverRegister(post, res);
        });
    }
    else{
        res.writeHead(404);
        let error = JSON.stringify({error: "unkown request"});
        res.end(error);
    }
    
});


server.listen(port, function(error){
    if(error)
        console.log('Something went wrong', error);
    else
        console.log('Server is listening on port' + port);

});



function serverRanking(res){
    fs.readFile('ranking.json',function(err,data) {
        if(! err) {
            res.end(data);
        }
    });
}

function createRank(userNick, userVictories, userGames){
    var rank = {
        nick: userNick,
        victories: userVictories,
        games: userGames
    }

    //add entry to end of file
    var data = fs.readFileSync('ranking.json');
    var json = JSON.parse(data);
    json.push(rank);

    fs.writeFile("testOutput.json", JSON.stringify(json));
}



function serverRegister(reqData, res){
    fs.readFile('logins.json',function(err,data) {
        if(! err) {
            parsedData = JSON.parse(data.toString());
            for(let i=0; i<parsedData.length;i++){
                if(parsedData[i].nick === reqData.nick){
                    passwordHash = crypto.createHash('md5').update(reqData.password).digest('hex');
                    if(parsedData[i].password == passwordHash){
                        res.end(JSON.stringify({}));
                        return;
                    }
                        
                    else {
                        res.writeHead(401);
                        let error = JSON.stringify({error: "invalid password"});
                        res.end(error);
                        return;
                    }
                }
            }
            //user doesn't exist
            console.log("user not found, creating new user");
            createLogin(reqData.nick, reqData.password, res);
        }
    });
    
    if(reqData.nick == null || reqData.password == null)
        console.log('error');
    


}

function createLogin(userNick, userPassword, res){
    passwordHash = crypto.createHash('md5').update(userPassword).digest('hex');

    var login = {
        nick: userNick,
        password: passwordHash
    }

    //add entry to end of file
    var data = fs.readFileSync('logins.json');
    var json = JSON.parse(data);
    json.push(login);
    console.log(json);

    fs.writeFile("logins.json", JSON.stringify(json), function(err, result) {
        if(err){
            console.log('error', err);
        }
    });
    res.end(JSON.stringify({}));
    return;

}