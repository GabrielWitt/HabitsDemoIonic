import { DietProvider } from './../diet/diet';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { UserProvider } from '../user/user';
import { Observable } from 'rxjs/Observable';
import { AppContants } from '../../app/app.constants';

const TEST_NODE = 'test';
const USER_TEST_NODE = 'user_test';
const UID_TEST_NODE= AppContants.config_mode=="test"? 'Z4PcRwmsDSrNvOG4cy67':'cXX2mQn4ClIPCkXxYlIP';

export interface DataItem {
  name: string, 
  question: any,
  result: any,
  type: any,
}

@Injectable()
export class TestProvider {

  LastTest="";
  
  constructor(
    private afs: AngularFirestore, 
	public userprov: UserProvider,
	public dietProv: DietProvider
  ) {}

  private TestSet : AngularFirestoreCollection<DataItem>
  TestObservable : Observable<any[]>;
  testListener:any=null;
  TestItems:any=[];
  
  
  
  private TestUsAnsSet : AngularFirestoreCollection<DataItem>
  TestUsAnsObservable : Observable<any[]>;
  testUsAnsListener:any=null;
  TestUsAnsItems:any=[];
  
  private TestArticleSet : AngularFirestoreDocument<DataItem>
  TestArticleObservable : Observable<DataItem>;
  TestArticleListener:any=null;
  TestArticleItem:any=[];
  
  TestsArticleObservable : Observable<any[]>;
  TestsArticleListener:any=null;
  TestsArticleItem:any;
  ArticlesItems:any=[];
  
  TestWTHUs:boolean=false;
  
  load_all_test():any{
    return new Promise((resolve, rejected) => {
		if (this.TestItems.length ==0&&this.userprov.userJson){
			  if  ( this.testListener != undefined){
					this.testListener.unsubscribe();
			  }
			  //console.log('empresas.'+this.userprov.userJson.company.uid)
			  this.TestSet = this.afs.collection(`${TEST_NODE}`, ref => ref.where('empresas.'+this.userprov.userJson.company.uid, '==', true));
			  this.TestObservable = this.TestSet.valueChanges();
			 
			  this.testListener=this.TestObservable.subscribe(tests => {
				//console.log(tests);
				this.TestItems=tests;
				if (this.TestWTHUs){
					this.tests_with_answer_user(); 
				}
				resolve(this.TestItems);
			  },error=>{
				console.log(error);
				resolve(this.TestItems);
			  });
			  this.getTestArticle();
			  
		}else{
			resolve(this.TestItems);
		}
		
    });
  }
  
  test_user_answers(user_uid:string):any {
	let A =  new Promise((resolve, rejected) => {
		if (this.TestUsAnsItems == 0){
		  this.TestUsAnsSet = this.afs.collection(`${USER_TEST_NODE}`, q =>q.where( 'user', '==',user_uid ));
		  this.TestUsAnsObservable = this.TestUsAnsSet.valueChanges();
		  this.testUsAnsListener=this.TestUsAnsObservable.subscribe(tests => {
			this.TestUsAnsItems=tests;
			if (this.TestWTHUs){
				 this.tests_with_answer_user(user_uid);
			}
			resolve(this.TestUsAnsItems);
		  },error=>{
			console.log(error);
			resolve(this.TestUsAnsItems);
		  });
		  
		  
		}else{
			resolve(this.TestUsAnsItems);
		}
    });
	//console.log(A);
	return A;
  }
  
  
	tests_with_answer_user(user_uid?:string){
		return new Promise ((resolve, rejected) =>{
			let arrayPromise = [];
			arrayPromise.push(this.load_all_test());
			if (user_uid != undefined){
				arrayPromise.push(this.test_user_answers(user_uid));
			}
			Promise.all(arrayPromise).then(() => {
				let MapTest= [];
				this.TestWTHUs=true;
				let j = 0;
				for (let i =0; i < this.TestUsAnsItems.length; i++){
					let auxAns=  this.TestUsAnsItems[i]; 
					if (MapTest[auxAns.test]){
						MapTest[auxAns.test].results.push(auxAns);
					}else{
						for (let k = j; k< this.TestItems.length; k++){
							MapTest[this.TestItems[k].uid] = this.TestItems[k];
							MapTest[this.TestItems[k].uid].results = [];
							if (MapTest[auxAns.test]){
								MapTest[auxAns.test].results.push(auxAns);
								break;
							}
							j++;
						}
						j++;
					}
				}
				this.ordenar_answers();
				resolve(this.TestItems);
			})
		})
  }

  ordenar_answers() {
		let date = new Date();
		for (let k = 0; k< this.TestItems.length; k++){
			let testAct= this.TestItems[k];
			if (testAct.results && testAct.results.length >0){
				testAct.results = testAct.results.sort(function(a:any,b:any){
					return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
				});
				testAct.next = parseInt((date.getTime() - new Date(testAct.results[0].timestamp).getTime())/(3600000 * 24) + "" )
			}
		}
  }
  async all_test(){
	console.log( this.TestItems );
    return this.TestItems;
  }

  save_user_wellness(result){
    this.afs.firestore.collection(USER_TEST_NODE).add(result);
    this.afs.firestore.doc(`user/${result.user}`).update({wellness:result.result, test: "NOT-ASSIGNED"})
  }

  async save_diet(user_uid, diet){
    this.afs.firestore.doc(`user/${user_uid}`).update({diet:diet, test: "NOT-ASSIGNED"}).then(()=>{
		this.dietProv.loadDietinChatbot().then(()=>{
			this.dietProv.save_diet_update(user_uid);
			return "done";
		})
	})
  }


  getTestByType(type:string):any{
    let x=null;
    for (var i=0; i < this.TestItems.length; ++i) {
      if(this.TestItems[i].type==type){
        x=this.TestItems[i];
        break;
      }
    }
    return x;
  }

	ObservableVef(Listener:any){
		return (Listener._subscriptions.length> 0 && Listener._subscriptions[0].count ==0)
	}

	getTestArticle():Promise<any>{
		return new Promise((resolve, rejected) => {
			if (this.TestArticleObservable == null){
			  this.TestArticleSet = this.afs.collection(`${TEST_NODE}`).doc(UID_TEST_NODE);
			  this.TestArticleObservable = this.TestArticleSet.valueChanges();
			  this.TestArticleListener=this.TestArticleObservable.subscribe(tests => {
			  this.TestsArticleItem = tests;
			  this.getTestsArticles().then(()=>{
					resolve(this.TestsArticleItem);
				});
			  },error=>{
				console.log(error);
				
			  });
			}else{
				if (this.ObservableVef(this.TestArticleListener)){
					let tempOBS = this.TestArticleObservable.subscribe(articles=>{
						tempOBS.unsubscribe();
						this.getTestsArticles().then(()=>{
							resolve(this.TestsArticleItem);
						});
					});
			
				}else{
					this.getTestsArticles().then(()=>{
						resolve(this.TestsArticleItem);
					});
				}
			}
		})
	}
	
  getTestsArticles(): Promise<any>{
    return new Promise((resolve, rejected) => {
		if (this.TestsArticleObservable == null){
		   this.TestSet = this.afs.collection(`${TEST_NODE}`);
		   this.TestsArticleObservable = this.TestSet.doc(UID_TEST_NODE).collection("articles").snapshotChanges();
		   this.TestsArticleListener=  this.TestsArticleObservable.subscribe(articles=>{
				let articlesAux=[];
				articles.forEach(doc => {
				  articlesAux[doc.payload.doc.id]=doc.payload.doc.data();
				});
				//console.log("Respondio");
				this.ArticlesItems = articlesAux;
				this.TestsArticleItem["articles"]=this.ArticlesItems ;
				resolve(this.TestsArticleItem);
			  },error=>{
				resolve(this.TestsArticleItem);
			})
		}else{
			if (this.ObservableVef(this.TestsArticleListener)){
				let tempOBS = this.TestsArticleObservable.subscribe(articles=>{
					tempOBS.unsubscribe();
					this.TestsArticleItem.articles=this.ArticlesItems ;
					resolve(this.TestsArticleItem);
				});
			
			}else{
				this.TestsArticleItem.articles=this.ArticlesItems ;
				resolve(this.TestsArticleItem);
			}
			
		}
        
    });
  }
  
  getLastTest(){
	return this.LastTest;
  }
  
  setLastTest(LastTest){
	this.LastTest=LastTest;
  }

  cleanOut(){
    this.TestSet = null;
    this.TestObservable = null;
    this.testListener = null;
    this.TestItems=[];
  }

}