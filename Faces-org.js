var API_Meta = API_Meta || {};
API_Meta.Faces = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Faces.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}

on('ready', () => {
    const version = '0.0.2';
    log('Faces v' + version + ' is ready! --offset ' + API_Meta.Faces.offset + ' -- Use the command !faces [Rollable Table Name] to get started');
});

on('chat:message', (msg_orig) => {
    let msg = _.clone(msg_orig);
    if (!/^!faces/.test(msg.content) || msg.content.length === 6) {
        return;
    }

    let whom = ((!playerIsGM(msg.playerid)) ? `"${msg.who}"` : "gm ");
    let arg = msg.content.split('!faces ')[1];
    let imgSrc = "";
    let tableName = "";
    let itemName = "";
    let addName = "";
    let argType = "";
    let validTable = true;
    let tokens = [];
    let tokenID = "";
    let newName = "";
    let output = "";
    let noteButtons = "";

    if (arg.includes("images/")) {
        argType = "image";
        imgSrc = 'https://s3.amazonaws.com/files.d20.io/' + arg;

    } else {
        if (msg.content.includes("!faces add ")) {
            argType = "add";
            addName = msg.content.split(/^!faces add /)[1].split(/ to /)[0];
            tableName = msg.content.split(/^!faces add .* to /)[1].split(/ using /)[0];
            tokenID = msg.content.split(/^!faces add .* using /)[1];

        } else {
            if (msg.content.includes("!faces name ")) {
                argType = "name";
                newName = msg.content.split(/^!faces name /)[1];
            } else {
                if (msg.content.includes("!faces tokennote ")) {
                    argType = "tokennote";
                    newName = msg.content.split(/^!faces tokennote /)[1];
                } else {
                    if (msg.content.includes("!faces tooltip ")) {
                        argType = "tooltip";
                        newName = msg.content.split(/^!faces tooltip /)[1];
                    } else {
                        argType = "table";
                        tableName = arg
                    }
                }
            }
        }
    }

    const openReport = "<div style='color: #000; border: 1px solid #000; background-color: #ccc; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; font-family: sans-serif; white-space: pre-wrap;'>";
    const closeReport = '</div>';
    const openHeader = "<div style='font-weight:bold; color:#fff; background-color:#404040; margin:0px 3px 3px 0px; padding:3px;'>"
    const closeHeader = `</div>`;
    const openButton = "<div style='clear:left; display:inline-block; height: 87px; text-align:center; background-color:#404040; color: #eee; padding: 2px 2px 0px 2px; border-width:1px; border-style: groove; border-radius:43px 43px 3px 3px; margin-right:3px; overflow: hidden'>";
    const openNotesButton = "<div style='clear:left; display:inline-block; height: 87px; text-align:left;   background-color:#404040; color: #eee; padding: 2px 2px 0px 2px; border-width:1px; border-style: groove; border-radius:40px  3px 3px 3px; margin-right:3px; overflow: hidden'>";
    const closeButton = `</div>`;
    const buttonStyle = `'display: block; text-align:center; padding:0px 5px; margin:10px 0px 0px 0px; color: #eee; background-color:##404040; border-radius:10px'`;
    const noteButtonStyle = `'display: block; float:right; font-size:11px; line-height:11px; text-align:center; padding:0px 2px 0px 6px; margin:2px 0px 0px 2px; color: #333; background-color:#aaa; border-width:0px; border-radius:10px 0px 0px 10px'`;
    const noteDeleteButtonStyle = `'display: block; float:right; font-size:11px; line-height:11px; text-align:center; padding:0px 6px 0px 2px; margin:2px 2px 0px px; color: #333; background-color:#aaa; border-width:0px; border-radius:0px 10px 10px 0px'`;

    function makeImage(url, itemNote) {
        imageCode = url.split('d20.io/')[1].replace(/thumb\.|med\.|max\.|original\./, 'thumb' + '.') || url;
        if (!itemNote) {
            return `<a href='!faces ${imageCode}' style='width: 70px; height:70px; margin: 0px; padding: 0px; background-color:transparent; border:none'><img src='${url}'></a>`
        } else {
            return `<div><a href='!faces ${imageCode}' style='float:left; width: 70px; height:70px; margin: 0px; padding: 0px; background-color:transparent; border:none'><img src='${url}'></a><div style='display:inline-block; float:left; margin-left:5px; font-size:11px; line-height:12px; height:60px; width:130px;overflow:hidden'>${itemNote}</div></div>`

        }

    }
    function makeChangeNameButton(name, itemNote) {
        if (!itemNote) {
            return "<div style='clear:both '><a style = 'background-color: transparent; padding: 0px; margin:0px; border:none; color:#eee'              href='!faces name " + name + "'>" + name + "</a></div>"
        } else {
            return "<div style='clear:both '><a style = 'background-color: transparent; padding: 0px; margin:0px; border:none; color:#eee; align:left;' href='!faces name " + name + "'>" + name + "</a><a style = " + noteDeleteButtonStyle + "href = '!faces tooltip -'>x</a><a style = " + noteButtonStyle + "href = '!faces tooltip " + itemNote + "'>tooltip</a><a style = " + noteDeleteButtonStyle + "href = '!faces tokennote -'>x</a><a style = " + noteButtonStyle + "href = '!faces tokennote " + itemNote + "'>notes</a></div>";
        }
    }

    function makeNotesArea(note) {
        return '';
    }

    switch (argType) {
        case 'table':
        case 'add':


            let tables = findObjs({
                type: 'rollabletable',
                name: tableName
            });
            if (tables.length < 1) {
                sendChat('Faces', `/w ${whom}` + openReport + openHeader + tableName + closeHeader + "No table by this name. For this script to work you must use the name of a table that has an image and name for every table item." + closeReport, null, {
                    noarchive: true
                });
                return;

            }

            tables = tables[0];

            let output = "";
            let tableitems = findObjs({
                type: 'tableitem',
                _rollabletableid: tables.get('_id'),
            });

            tableitems.forEach(t => {
                itemAvatar = t.get('avatar');
                if (itemAvatar.length < 1) { validTable = false }
                itemName = t.get(('name')).split('--')[0] || t.get(('name'));
                itemNote = '';
                if (t.get('name').includes(' --')) {
                    itemNote = t.get(('name')).split('--')[1];
                }
                if (itemNote.length > 1) {
                    noteButtons = `<a style = ${noteButtonStyle} href = '!tooltip'>tooltip</a>`;
                } else {
                    noteButtons = "";
                }
                if (itemName.length < 1) { validTable = false }
                if (validTable) {
                    output = output + `${((itemNote) ? openNotesButton : openButton)}${makeImage(itemAvatar, itemNote)}<BR>${makeChangeNameButton(itemName, itemNote)}${noteButtons}${closeButton}`;
                } else {
                    output = "Not a valid table. For this script to work you must use the name of a table that has an image and name for every table item.";
                }
            });
            if (validTable) { output = output + "<br><a style=" + buttonStyle + "href='!faces add ?{name} to " + tableName + " using &#64;{target|token_id}'> Add an image to this table.</a>" }


            let header = `${openHeader}${tableName}${closeHeader}`;

            if (argType === "add") {
                if (tokenID !== "") {
                    tokens = getObj('graphic', tokenID)
                }
                if (!tokens.get("imgsrc").includes("marketplace")) {
                    createObj('tableitem', {
                        name: addName,
                        _rollabletableid: tables.get('_id'),
                        avatar: tokens.get("imgsrc"),
                    });
                    output = addName + " added to " + tableName + ".<BR>" + `${openButton}${makeImage(tokens.get("imgsrc"))}<BR>${addName}${closeButton}`;
                    output = output + "<br><a style=" + buttonStyle + "href='!faces " + tableName + "'> Display this table.</a>";
                    output = output + "<a style=" + buttonStyle + "href='!faces add ?{name} to " + tableName + " using &#64;{target|token_id}'> Add another image to this table.</a>";

                } else {
                    output = "API scripts cannot affect marketplace images";
                }
            }

            sendChat('Faces', `/w ${whom}` + openReport + header + output + closeReport, null, {
                noarchive: true
            });

            break;
        case 'image':
            if (undefined !== msg.selected) {
                tokens = msg.selected
                    .map(o => getObj('graphic', o._id))
                    .filter(o => undefined !== o)
                tokens.forEach(t => {
                    if (t.get("type") === 'graphic') {
                        t.set("imgsrc", imgSrc);
                    }
                });
            } else {
                sendChat('Faces', `/w ${whom}` + openReport + 'You must select a token you control in order to change the face.' + closeReport, null, {
                    noarchive: true
                });
            }

            break;
        case 'name':
            if (undefined !== msg.selected) {
                tokens = msg.selected
                    .map(o => getObj('graphic', o._id))
                    .filter(o => undefined !== o)
                tokens.forEach(t => {
                    if (t.get("type") === 'graphic') {
                        t.set("name", newName);
                    }
                });
            }
            break;
        case 'tokennote':
            if (newName === '-') { newName = '' };
            if (undefined !== msg.selected) {
                tokens = msg.selected
                    .map(o => getObj('graphic', o._id))
                    .filter(o => undefined !== o)
                tokens.forEach(t => {
                    if (t.get("type") === 'graphic') {

                        t.set({
                            gmnotes: newName
                        });


                    }
                });
            }
            break;
        case 'tooltip':
            if (newName === '-') { newName = '' };

            if (undefined !== msg.selected) {
                tokens = msg.selected
                    .map(o => getObj('graphic', o._id))
                    .filter(o => undefined !== o)
                tokens.forEach(t => {
                    if (t.get("type") === 'graphic') {
                        t.set("tooltip", newName);
                    }
                });
            }
            break;
        default:
            log(`nothing happens here.`);
    }
});