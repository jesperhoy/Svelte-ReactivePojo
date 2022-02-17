let mp=new WeakMap();

function MakeStore(obj,prop) {
    let subscribers=[];
    return {
        subscribe(f) {
            f(obj[prop]);
            if(subscribers.indexOf(f)>=0) return;
            subscribers.push(f);
            return ()=>{
                let idx=subscribers.indexOf(f);
                if(idx<0) return;
                subscribers.splice(idx,1);
            }
        },
        set(v) {
            obj[prop]=v;
            let sub2=[];
            subscribers.forEach(sb=>sub2.push(sb));
            sub2.forEach(sb=>sb(v));
        }
    }
}

function _RPStore(obj,prop,create) {
    let StoreCol=mp.get(obj);
    if(StoreCol===undefined) {
        if(!create) return undefined;
        StoreCol={};
        mp.set(obj,StoreCol);
    }
    let store=StoreCol[prop];
    if(store) return store;
    if(!create) return undefined;
    store=MakeStore(obj,prop);
    StoreCol[prop]=store;
    return store;
}

function RPStore(obj,prop) {
    return _RPStore(obj,prop,true);
}

function RPSet(obj,prop,value) {
    let store=_RPStore(obj,prop,false);
    if(store) {
        store.set(value);
    } else {
        obj[prop]=value;
    }
}


export {RPStore,RPSet};
