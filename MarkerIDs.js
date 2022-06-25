on("ready", () => {
    const tokenMarkers = JSON.parse(Campaign().get("token_markers"));
    const getChatMessageFromTokenMarkers = markers => {
        let chatMessage = '';
        _.each(markers, marker => {
            chatMessage += `<p><img src='${marker.url}'> ${marker.id}: ${marker.name} -- ${marker.tag}</p>`;
        });
        return chatMessage;
    };
on("chat:message", msg => {
        if(msg.content.split(" ")[0].toLowerCase() === '!markernames') {
            let chatMessage = getChatMessageFromTokenMarkers(tokenMarkers);
            sendChat("Token Markers", chatMessage);
        } else if(msg.content.split(" ")[0].toLowerCase() === '!markerids') {
            const markerName = msg.content.split(" ")[1].toLowerCase();
            let results = [];
            _.each(tokenMarkers, marker => {
                if(marker.name.toLowerCase() === markerName) results.push(marker);
            });
            log(results);
            let chatMessage = getChatMessageFromTokenMarkers(results);
            chatMessage = chatMessage || 'Unable to find any matching token markers'
            sendChat("Token Markers", chatMessage);
        } else if(msg.content.split(" ")[0].toLowerCase() === '!settokenmarker') {
            const markerName = msg.content.split(" ")[1].toLowerCase();
            if (!msg.selected && msg.selected[0]._type == "graphic") return;
            obj = getObj(msg.selected[0]._type, msg.selected[0]._id);
            currentMarkers = obj.get("statusmarkers").split(',');
            currentMarkers.push(markerName);
            obj.set("statusmarkers", currentMarkers.join(','));
        } else if(msg.content.split(" ")[0].toLowerCase() === '!gettokenmarkers') {
            if (!msg.selected) return;
            if (msg.selected[0]._type !== "graphic") return;
            obj = getObj(msg.selected[0]._type, msg.selected[0]._id);
            currentMarkers = obj.get("statusmarkers");
            sendChat("Token Markers", currentMarkers);
        }
    });
});