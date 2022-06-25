
var SRC_Test = SRC_Test || (function () {
    'use strict';
    var version = '0.01',
        ScriptName = "STC_Test",
        schemaVersion = '0.01',
        Updated = "Aug 20 2020",

    handleInput = function (msg) {
        var msgFormula = msg.content.split(/\s+/);
        var command = msgFormula[0].toUpperCase(), UPPER ="";
        if(msg.type == "api" && command.indexOf("!SRCTEST") !== -1) {
            var OPTION = msgFormula[1] || "MENU";
            if(!playerIsGM(msg.playerid)) {
                sendChat('SRC_Test', "/w " + msg.who + " you must be a GM to use this command!");
                return;
            }
            else {
                switch(OPTION.toUpperCase()) {
                    case "MENU":
                        ShowTest();
                        break;
                    default:
                        ShowMenu(OPTION);
                        break;
                }
            }
        }
    },
    ShowTest = function(){
        GMW("Menu");
    },
    ShowMenu = function(msg){
        GMW(msg + " Sent");
        var chatoutput ='';
        chatoutput = '<div><a href="!srctest menu">Hello</a></div>';
        log('API'+'/w GM '+chatoutput);
        sendChat('API','/w GM '+chatoutput);
    },
//WHISPER GM------------
    GMW = function (text) {
        var DIV = "<div style='width: 100%; border-radius: 4px;  box-shadow: 1px 1px 1px #707070; text-align: center; vertical-align: middle; padding: 3px 0px; margin: 0px auto; border: 1px solid #000; color: #000; background-image: -webkit-linear-gradient(-45deg, #a7c7dc 0%,#85b2d3 100%);";
        var MSG = DIV + "'><b>"+text+"</b></div";
        sendChat('SRC_Test', "/w GM "+MSG);
    },
//REGISTER TRIGGERS------------
    registerEventHandlers = function () {
        on('chat:message', handleInput);
        //on("change:token", handleToken);
    };
//RETURN OUTSIDE FUNCTIONS------------
    return {
        GMW: GMW,
        RegisterEventHandlers: registerEventHandlers
    };
}());



on('ready', function () {
    'use strict';
    SRC_Test.GMW("API READY");
    //SRC_Test.CheckInstall();
    SRC_Test.RegisterEventHandlers();
});