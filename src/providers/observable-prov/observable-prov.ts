import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take, map, timeout, tap, delayWhen, retryWhen} from 'rxjs/operators';
import { timer, merge,/*interval,  of*/} from 'rxjs';
import { loadingProvider } from '../alert/alert';

const MAX_TIME_DELAY = 15;
@Injectable()
export class ObservableProvProvider {

  timeD:number=1;
  
  constructor(public http: HttpClient,  public alerts: loadingProvider,) {

  }
  
  public retry(){
	  //log error message
      tap(val => {console.log("We have to try again in ", (this.timeD<MAX_TIME_DELAY)?++this.timeD:this.timeD)});
      //restart in 6 seconds
     return delayWhen(val => timer(this.timeD * 1000))
	  
  }
  
  /* Take one time from cache*/
  public  cacheObserverOneTime(ref:any, callback:any){
	  try{ 
		return ref.get({source: 'cache'}).pipe(take(1),  map( (doc:any)  =>{ /*console.log(doc);*/ return doc.data()})).subscribe(
		
			data => {
				//console.log(data);
				callback(data); this.timeD= 1;},
			e =>{ 
				this.serveObserverOneTime(ref, callback);
			},
			() => {
				//console.log('Observable Finalizó');
				;
			});
		}catch(e){ 
			
			console.log('Ocurrio un error al procesar el observable');
			//console.trace()
			
		}
	  
  }
  
   /* Take from server one time */
   public  serveObserverOneTime(ref:any, callback:any){
		try{ 
			return ref.get({source: 'server'}).pipe(take(1),
													map( (doc:any)  =>{   return doc.data()}), timeout(this.timeD * 1000),
													retryWhen( errors => errors.pipe(
																		 //log error message
																		  tap(val =>   this.alerts.showToast("Se ha detectado que su conexión es inestable, por favor, espere o intente con otra conexión." ,"top",'Ok',undefined)),
																		  //restart in 6 seconds
																		  delayWhen(val => timer(this.timeD*1000))
																		)
													)
												).subscribe(
															data => {callback(data)},
															e => {console.log(e, 'ERROR IN SERVER TAKE');  }, 
															() => {
																this.timeD= 1;
															}
												);
		}catch(e){ 
			console.log(e);
			
		}  
	}
  



	public messageObserverBot(ref, limit){
		return new Promise ( (resolve, rejected) => {
			try{
				let lastDocRef:any= null;
				let a = null;
				let b = null;
				let callback = ((data) =>{
					if (data && data.docs[0]){
						lastDocRef = data.docs[0];
					
						a = ref.collection("messages",ref => ref.orderBy('timestamp','desc').limit(limit)).stateChanges(['added']).pipe(take(1));
						b = ref.collection("messages",ref => ref.orderBy('timestamp','desc').endBefore(lastDocRef)).stateChanges();
						
						resolve(merge(a, b));
					}else{
						
						b = ref.collection("messages",ref => ref.orderBy('timestamp','desc').limit(limit)).stateChanges();
							resolve(b);
					}
				});
				ref.collection("messages",ref => ref.orderBy('timestamp','desc').limit(1)).get({source: 'cache'}).pipe(take(1)).subscribe(
			
				data => {
					this.timeD= 1;
					return callback(data);
					},
				e =>{ 
					callback(null);
				},
				() => {
					//console.log('Observable Finalizó');
					//console.trace() ;
				});
				
			}catch(e){ 
				
				console.log('Ocurrio un error al procesar el observable');
				//console.trace()
				
			}
		});
		
	}
}