on('ready',() => {

    const checkFormulaOnTurn = () => {
        let to=JSON.parse(Campaign().get('turnorder')||'[]');
        if(to.length && to[0].id==='-1'){
            sendChat('',`[[${to[0].pr}+(${to[0].formula||0})]]`,(r)=>{
                to[0].pr=r[0].inlinerolls[0].results.total;
                Campaign().set('turnorder',JSON.stringify(to));
            });
        }
    };

    on('chat:message',(msg) => {

        if('api' === msg.type) {
            if(msg.content.match(/^!act\b/) ){
                let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

                if(_.has(msg,'inlinerolls')){
                    msg.content = _.chain(msg.inlinerolls)
                        .reduce((m,v,k) => {
                            let ti=_.reduce(v.results.rolls,(m2,v2) => {
                                if(_.has(v2,'table')){
                                    m2.push(_.reduce(v2.results,(m3,v3) => {
                                        m3.push(v3.tableItem.name);
                                        return m3;
                                    },[]).join(', '));
                                }
                                return m2;
                            },[]).join(', ');
                            m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
                            return m;
                        },{})
                        .reduce((m,v,k) => {
                            return m.replace(k,v);
                        },msg.content)
                        .value();
                }

                let args = msg.content
                    .replace(/<br\/>\n/g, ' ')
                    .replace(/(\{\{(.*?)\}\})/g," $2 ")
                    .split(/\s+--/);

                let cmds=args.shift().split(/\s+/);
                let change=parseFloat(cmds[1]);
                change = Number.isNaN(change) ? '+1' : change;
                change = `${/^[+-]\d/.test(change)?'':'+'}${change}`;
                let initial = parseFloat(cmds[2])||0;
                let entry = args.join(' ');

                if(entry.length){
                    let to=JSON.parse(Campaign().get('turnorder')||'[]');
                    to.unshift({
                        id: "-1",
                        pr: initial,
                        custom: entry,
                        formula: change
                    });
                    Campaign().set('turnorder',JSON.stringify(to));
                    if(!playerIsGM(msg.playerid)){
                        sendChat('ACT',`/w gm <div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><div style="background-color: #ffeeee;"><b>${who}</b> added entry for <b>${entry}</b> starting at <b>${initial}</b> and changing by <b>${change}</b>.</div></div>`);
                    }
                } else {
                    sendChat('ACT',`/w "${who}" <div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><div style="background-color: #ffeeee;">Use <b><pre>!act [formula] [starting value] --[description]</pre></b></div></div>`);
                }
            } else if(msg.content.match(/^!eot/i)){
                _.defer(checkFormulaOnTurn);
            }
        }
    });
});