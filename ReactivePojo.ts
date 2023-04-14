type SubscribeCB<T> = (v:T)=>void;

type Store<T> ={
  get: ()=>T,
  set: (v:T)=>void,
  subscribe: (cb:SubscribeCB<T>)=>VoidFunction
}

function MakeStore<T>(val:T) {
  let subscribers:SubscribeCB<T>[]=[];
  return {
      subscribe(cb:SubscribeCB<T>):VoidFunction {
          cb(val);
          if(subscribers.indexOf(cb)<0) subscribers.push(cb);
          return ()=>{
              let idx=subscribers.indexOf(cb);
              if(idx>=0) subscribers.splice(idx,1);
          }
      },
      set: (v:T) => {
          val=v;
          let sub2=[...subscribers]; // copy to new array first, in case changes happen during callbacks
          sub2.forEach(cb=>cb(v));
      },
      get: ()=> val
  }
}

function ReplaceProp<T>(obj:any,prop:string,store:Store<T>):void {
  if(obj[prop]===undefined) obj[prop]=null;
  let dsc=Object.getOwnPropertyDescriptor(obj,prop) as PropertyDescriptor;
  if(!dsc.configurable) throw "Object property '" + prop + "' is not configurable";
  if(dsc.get || dsc.set) throw "Object property '" + prop + "' already has getter or setter";
  delete obj[prop];
  Object.defineProperty(obj,prop,{
      enumerable: dsc.enumerable,
      get: store.get,
      set: store.set
  });
}

function RPStore<T>(obj:any,prop:string):Store<T> {
  if(obj.$RPStores===undefined) Object.defineProperty(obj,'$RPStores',{enumerable: false, value: {}});
  let rv:Store<T>=obj.$RPStores[prop];
  if(rv) return rv;
  rv=MakeStore<T>(obj[prop]);
  obj.$RPStores[prop]=rv;
  ReplaceProp<T>(obj,prop,rv);
  return rv;
}

export default RPStore;
