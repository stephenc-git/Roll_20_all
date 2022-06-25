on("ready",function()
{
    on("chat:message",function(msg){
        if(msg.type=="api" && msg.content.indexOf("!spiritualWeapon")==0 && playerIsGM(msg.playerid))
        {
            var selected = msg.selected;
            if (selected===undefined)
            {
                sendChat("API","Please select a character.");
                return;
            }
            var tok = getObj("graphic",selected[0]._id);
            var character = getObj("character",tok.get("represents"));
            var playerlist = character.get("controlledby")
            
            createObj("graphic",{
                left:35,
                top:35,
                height:70,
                width:70,
                pageid:Campaign().get('playerpageid'),
                layer:"objects",
                imgsrc:"https://s3.amazonaws.com/files.d20.io/images/104629087/ZzHGu7CiyzL0sZTuB8KfJA/thumb.png?15816820805",
                name:"Spiritual Weapon"
            });
            
        }
    });
});