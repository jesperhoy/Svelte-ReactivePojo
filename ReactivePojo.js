function MakeStore(obj,prop) {
    if(obj[prop]===undefined) obj[prop]=null;
    let dsc=Object.getOwnPropertyDescriptor(obj,prop);
    if(!dsc.configurable) throw "Object property '" + prop + "' is not configurable";
    if(dsc.get || dsc.set) throw "Object property '" + prop + "' already has getter or setter";
    let CurVal=obj[prop];
    let subscribers=[];
    let SetVal = v => {
        CurVal=v;
        let sub2=[]; // copy to new array first, in case changes happen during callbacks
        subscribers.forEach(sb=>sub2.push(sb)); 
        sub2.forEach(sb=>sb(v));
    }
    delete obj[prop];
    Object.defineProperty(obj,prop,{
        enumerable: dsc.enumerable,
        get: () => CurVal,
        set: SetVal
    });
    return {
        subscribe(cb) {
            cb(CurVal);
            if(subscribers.indexOf(cb)>=0) return;
            subscribers.push(cb);
            return ()=>{
                let idx=subscribers.indexOf(cb);
                if(idx>=0) subscribers.splice(idx,1);
            }
        },
        set: SetVal
    }
}

function RPStore(obj,prop) {
    let spName=prop+'$RPStore';
    let store=obj[spName];
    if(store) return store;
    store=MakeStore(obj,prop);
    Object.defineProperty(obj,spName,{enumerable: false, get: () => store});
    return store;
}

export {RPStore};
