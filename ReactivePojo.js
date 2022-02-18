function MakeStore(val) {
    let subscribers=[];
    return {
        subscribe(cb) {
            cb(val);
            if(subscribers.indexOf(cb)>=0) return;
            subscribers.push(cb);
            return ()=>{
                let idx=subscribers.indexOf(cb);
                if(idx>=0) subscribers.splice(idx,1);
            }
        },
        set: v => {
            val=v;
            let sub2=[]; // copy to new array first, in case changes happen during callbacks
            subscribers.forEach(cb=>sub2.push(cb)); 
            sub2.forEach(cb=>cb(v));
        },
        get: ()=> val
    }
}

function ReplaceProp(obj,prop,store) {
    if(obj[prop]===undefined) obj[prop]=null;
    let dsc=Object.getOwnPropertyDescriptor(obj,prop);
    if(!dsc.configurable) throw "Object property '" + prop + "' is not configurable";
    if(dsc.get || dsc.set) throw "Object property '" + prop + "' already has getter or setter";
    delete obj[prop];
    Object.defineProperty(obj,prop,{
        enumerable: dsc.enumerable,
        get: store.get,
        set: store.set
    });
}

function RPStore(obj,prop) {
    if(obj.$RPStores===undefined) Object.defineProperty(obj,'$RPStores',{enumerable: false, value: {}});
    let store=obj.$RPStores[prop];
    if(store) return store;
    store=MakeStore(obj[prop]);
    obj.$RPStores[prop]=store;
    ReplaceProp(obj,prop,store);
    return store;
}

export default RPStore;
