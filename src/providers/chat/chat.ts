import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppContants } from '../../app/app.constants';
import { ChatAnswer } from '../../interfaces/chat-answer';
import { ChatMessage } from '../../interfaces/chat-message';
import { AngularFireDatabase/*, AngularFireList*/ } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection,AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs/Observable';
import { ChatRoom } from '../../interfaces/chat-room';
import { ChatContext } from '../../interfaces/chat-context';
//import { DocumentSnapshot } from '@firebase/firestore-types';
//import { Subject } from 'rxjs/Subject';
//import { AnalyticsProvider } from '../analytics/analytics';
import { AngularFireAuth } from '@angular/fire/auth';
import { ErrorProvider } from '../error/error';
import { ObservableProvProvider } from '../observable-prov/observable-prov';
import { loadingProvider } from '../alert/alert';
import { take } from 'rxjs/operators';
//import * as moment from 'moment';

const CHAT_MESSAGE_ROM = "chat_messages";
const CHAT_BOT_NODE = 'chat_bot';
const CHAT_ROOM_NODE = 'chat_room';
const USER_CARD_NODE = "user_card";
const CHAT_BOT_NODE2 = 'chat_bot_habits';
//const CATEGORIA = "PCHT";
const CATEGORIA_DF = "DF";
//const USER_NODE = 'user';
export interface ContextsButtons {
    chatAnswer:ChatAnswer;
    contextData?:ChatContext;
}

@Injectable()
export class ChatProvider {

  //variable para cuando se registra un habito desde Ana
  public registroHabitoAna : any = {registrado:false, categoria:null, subCategoria:null,ir:false};
  //variable para colocar el ping de notificacion de una conversacion nueva con Ana
  public notAna: number = 0;
  //private _chatRoomsBotDoc: any;//Replace
  public  ChatBotRoom:ChatRoom=null;//Replace
  //variable que guarda la referencia de las salas de chat de los bots
  private _chatsRoomsBotsDocs: AngularFirestoreDocument<ChatRoom>[]=[];
  //variable que guarda la referencia de la suscripcion a los observables de las salas de chat de los bots
  private _chatsRoomsBotsRefSubs:any[]=[];
  //variable que guarda la data de cada una de las salas de chat de los bots
  public _chatRoomsBotsData:ChatRoom[]=[];
  //variable que guarda la referencia de la suscripcion a los observables de los mensajes de las salas de chat de los bots
  private _chatRoomsBotMessages: any[]=[];
  //variable que guarda la referencia de las salas de chat publicas de un usuario
  private _chatRoomsRefCollection: AngularFirestoreCollection<any>;
  //variable que guarda la referencia del observable las salas de chat publicas de un usuario
  private _chatRooms: Observable<ChatRoom[]>;
  //variable que guarda la referencia de las salas de chat privadas de un usuario
  private _TeamRoomsRefCollection: AngularFirestoreCollection<any>;
  //variable que guarda la referencia del observable las salas de chat privadas de un usuario
  private _TeamRooms: Observable<ChatRoom[]>;
  //variable que tiene la referencia del observable del nodo chat_bot decada bot
  private dataBotRef:any[]=[];
  //variable para controlar la logica del mandatori video de Ana
  public Mandatory_Video = {finalize:false, time:null, percent:null,view:false};
  
  constructor(
    public http: HttpClient,
    private afDatabase: AngularFireDatabase,
    private afs: AngularFirestore,
    private fireDB: AngularFireDatabase,
    //private analytics: AnalyticsProvider,
    public afAuth: AngularFireAuth,
    public errorService:ErrorProvider,
    public alerts: loadingProvider,
	private ObserveServ: ObservableProvProvider
  ) {
   }

  public async createChatRoom(data,data2,user_uid,user_name,companyName,companyKey){
    //BOT ANA
    let uid = this.afs.createId();
    data["uid"] = uid;
    this.createChatBotdata(1,user_uid,user_name,companyName,companyKey,data.create_date)
    await this.afs.doc(`${CHAT_ROOM_NODE}/${uid}`).set(data);
    //Habits
    // let uid2 = this.afs.createId();
    // data2["uid"] = uid2;
    // this.createChatBotdata(2,user_uid,user_name,companyName,"Habits Bot",data.create_date)
    // await this.afs.doc(`${CHAT_ROOM_NODE}/${uid2}`).set(data2);
    return {ana:uid/*,habits:uid2*/}
  }

  public async create_group_chat_room(chat_room){
    let uid = this.afs.createId();
    chat_room["uid"] = uid;
    this.afs.doc(`${CHAT_ROOM_NODE}/${uid}`).set(chat_room);
    this.afDatabase.database.ref(`${USER_CARD_NODE}/${chat_room.createdBy}`).once("value",data=>{
      let card=data.val();
      let gruposAux={};
      if(card.groups!=null){
        gruposAux=card.groups;
      }
      gruposAux[chat_room.uid]=new Date().toISOString();
      let user_card ={
        uid: chat_room.createdBy,
        groups:gruposAux
      }
      this.updateUserCard(user_card)
    });
  }

  public async editTeamMembers(room_uid,members){
    this.afs.doc(`${CHAT_ROOM_NODE}/${room_uid}`).update({members:members}).then(()=>{
      return;
    });
  }

  //bot igual 1 =Ana
  //bot igual 2 =Habit Bot
  public createChatBotdata(bot,uid,user_name,companyName,companyKey,timestamp){
    let chatbot ={
      company: companyName,
      atributes:{
        empresa:{
        name: "empresa",
        timestamp: timestamp,
        value: companyName
        }
      },
      next_talk:companyKey,
      parameters:{
        name:user_name,
        breakfast:"Todavía no has configurado tu dieta, una vez que la selecciones yo podre ayudarte.",
        snack_one:"Todavía no has configurado tu dieta, una vez que la selecciones yo podre ayudarte.",
        lunch:"Todavía no has configurado tu dieta, una vez que la selecciones yo podre ayudarte.",
        snack_two:"Todavía no has configurado tu dieta, una vez que la selecciones yo podre ayudarte.",
        dinner:"Todavía no has configurado tu dieta, una vez que la selecciones yo podre ayudarte."
      }
    }
    if(bot==1){
      this.afDatabase.database.ref(`${CHAT_BOT_NODE}/${uid}`).set(chatbot)
    }else{
      this.afDatabase.database.ref(`${CHAT_BOT_NODE2}/${uid}`).set(chatbot)
    }
  }

  //USER CARD SERVICE
  public async createUserCard(user_card){
    this.afDatabase.database.ref(`${USER_CARD_NODE}/${user_card.uid}`).set(user_card)
    .then(()=>{ return; })
    .catch(error=>{ console.log(error); return ;})
  }

  public async updateUserCard(user_card){
    this.afDatabase.database.ref(`${USER_CARD_NODE}/${user_card.uid}`).update(user_card)
    .then(()=>{ return; })
    .catch(error=>{ console.log(error); return ;})
  }

  public user_card_listener(company_uid):any{
    return new Promise((resolve)=>{
      this.fireDB.database.ref(USER_CARD_NODE).orderByChild('company').equalTo(company_uid).once("value",users => {
          let user_array = users.val(); let employee_array = []; let userKeys = []
          if(user_array) userKeys = Object.keys(user_array); 
          for(var i = 0;i<userKeys.length;i++){
              if(!(userKeys[i].includes("BOT-001"))){
                  let auxUser = user_array[userKeys[i]]
                  let user = {
                      uid: auxUser['uid'],
                      name: auxUser['name'],
                      //gender: auxUser['gender'],
                      //department: auxUser['department'],
                      picture: auxUser['picture'],
                      points: auxUser['points'],  
                      last_online: auxUser['last_online'],
                      company: auxUser['company'],
                      status:  auxUser['status'] ? auxUser['status'] : { conected_chat:false,conected_app:true, mode_app:1}
                  }
                  let goals = auxUser['user_goals']
                  let auxGoalKey = []; let goalName = []
                  if(goals) auxGoalKey = Object.keys(goals)
                  for(var j=0; j<auxGoalKey.length;j++){
                      goalName.push(goals[auxGoalKey[j]])
                  }
                  user["user_goal"] = goalName;
                  employee_array.push(user);
              }
          }
          resolve(employee_array)
      })
    })

  }

  public get_user_cards_by_company(company_uid): Promise<any> {
      return new Promise((resolve, rejected) => {
          this.fireDB.database.ref(USER_CARD_NODE).orderByChild('company').equalTo(company_uid).once("value",users => {
              let user_array = users.val(); let employee_array = []; let userKeys = []
              if(user_array) userKeys = Object.keys(user_array); 
              for(var i = 0;i<userKeys.length;i++){
                  if(!(userKeys[i].includes("BOT-001"))){
                      let auxUser = user_array[userKeys[i]]
                      let user = {
                          uid: auxUser['uid'],
                          name: auxUser['name'],
                          gender: auxUser['gender'],
                          department: auxUser['department'],
                          //photo: "./assets/user_icons/icon"+auxUser['photo']+".png",
                          picture: auxUser['picture'],
                          points: auxUser['points'],
                          company: auxUser['company']
                      }
                      let goals = auxUser['user_goals']
                      let auxGoalKey = []; let goalName = []
                      if(goals) auxGoalKey = Object.keys(goals)
                      for(var j=0; j<auxGoalKey.length;j++){
                          goalName.push(goals[auxGoalKey[j]])
                      }
                      user["user_goal"] = goalName;
                      employee_array.push(user);
                  }
              }
              resolve(employee_array)
          })
      })
  } 


  //CHATBOT FUNCTIONS

  public set_habit_value(user_uid: string,goal_name: string, data:string): Promise<any> {
    return new Promise((resolve, rejected) => {
      this.fireDB.database.ref(CHAT_BOT_NODE).child(user_uid).child('parameters').update({[data]:goal_name}).then((updated) => {
          resolve(updated);
      })
    })
  }

  public get_next_talk_value(user_uid: string,key_bot): Promise<any> {
      return new Promise((resolve, rejected) => {
          let nodo=CHAT_BOT_NODE;
          if(key_bot!="BOT-001"){
            nodo=CHAT_BOT_NODE2;
          }
          console.log(nodo,key_bot,key_bot!="BOT-001");
          this.fireDB.database.ref(nodo).child(user_uid).child('next_talk').once('value').then(snapshot => {
              if (snapshot.exists()) {
                  resolve(snapshot.val());
              } else {
                  resolve(0);
              }

          })
      })
  }

  public set_next_talk(user_uid: string,bot:string): Promise<any> {
      return new Promise((resolve, rejected) => {
          let nodo=CHAT_BOT_NODE;
          if(bot!="BOT-001"){
            nodo=CHAT_BOT_NODE2;
          }
          this.fireDB.database.ref(nodo).child(user_uid).child('next_talk').set(0).then((updated) => {
              //console.log(updated,"set_next_talk");
              resolve(updated);
          })
      });
  }	

  //funcion que inicia los diferenctes observables y referencias de los chats Bots del usuario
  public async initChatBotRoom(bot_rooms){
    for (let index in bot_rooms) {
      if(this._chatsRoomsBotsDocs[bot_rooms[index]]==null){
        this._chatsRoomsBotsDocs[bot_rooms[index]]=this.afs.collection(CHAT_ROOM_NODE).doc(bot_rooms[index]);
		//console.log('chatBotRomm load');
		try{ 
		  //console.log(this.ObserveServ)
			this._chatsRoomsBotsRefSubs[bot_rooms[index]]= this.ObserveServ.cacheObserverOneTime( this._chatsRoomsBotsDocs[bot_rooms[index]],dataBot => {
				//console.log('chatBot actual',dataBot);
				
			  this._chatRoomsBotsData[bot_rooms[index]]=dataBot;
			});
			
			/*this._chatsRoomsBotsDocs[bot_rooms[index]].get({source: 'cache'}).pipe(take(1),  map( doc  =>{return doc.data()})).subscribe(dataBot => {
				console.log('chatBot actual',dataBot);
			  this._chatRoomsBotsData[bot_rooms[index]]=dataBot;
			},
			
			e => {console.log(e); alert(e); this._chatsRoomsBotsDocs[bot_rooms[index]].get({source: 'server'}).pipe(take(1), timeout(10000), map( doc  =>{return doc.data()})).subscribe(dataBot => {
				console.log('chatBot actual',dataBot);
			  this._chatRoomsBotsData[bot_rooms[index]]=dataBot;
			})}, 
			
			e => {console.log(e); alert(e) });*/
		}catch(e){ 
			console.log(e);
			
		}
		let ref = this.afs.collection(CHAT_MESSAGE_ROM).doc(bot_rooms[index]);
        //this._chatRoomsBotMessages[bot_rooms[index]] = this.afs.collection(CHAT_MESSAGE_ROM).doc(bot_rooms[index]).collection("messages",ref => ref.orderBy('timestamp','desc').limit(50)).stateChanges();
		await this.ObserveServ.messageObserverBot(ref, 50).then ( obs=> {
			   this._chatRoomsBotMessages[bot_rooms[index]]  = obs;
		})
		
		
      }
    }
    return null; 
  }

 
  public getChatBotRoomData(room_uid): Promise<any>{
    console.log( this._chatsRoomsBotsDocs[room_uid],this._chatRoomsBotsData[room_uid]);
    return new Promise((resolve, rejected) => {
      if(this._chatRoomsBotsData[room_uid]!=null){
        return resolve(this._chatRoomsBotsData[room_uid]);
      }else{
        this._chatsRoomsBotsDocs[room_uid].ref.get().then(BotRoomSnapshot=>{
          this.ChatBotRoom=BotRoomSnapshot.data();
           return resolve(this.ChatBotRoom);
        }).catch(error=>{
          return rejected(error);
        });
      }
    });
  }

  public getChatsBotsRoomsData(user): Promise<ChatRoom[]>{
    return new Promise((resolve, rejected) => {
      if(Object.keys(this._chatRoomsBotsData).length>0){
        return resolve(this._chatRoomsBotsData);
      }else{
        let chats:ChatRoom[]=[];
        this.afs.collection(CHAT_ROOM_NODE).ref.where("type", "==", 'bot').where("members."+user.uid, "==", true).get().then(BotRoomSnapshot=>{
          console.log(BotRoomSnapshot.size);
          BotRoomSnapshot.forEach(data=>{
            chats.push(data.data());
          });
          return resolve(chats);
        }).catch(error=>{
          console.log(error);
          return rejected(error);
        });
      }
    });
  }
  
  public async getChatBotNot(user_uid) {
		this.fireDB.database.ref(CHAT_BOT_NODE).child(user_uid).child('next_talk').on('value', snapshot => {
			  if (snapshot.val()) {
				this.notAna = 1;
			  } else {
				this.notAna =0;
			  }
			  return;
		})
  }

  public async  loadChatRooms(companyUID: string) {
    this._chatRoomsRefCollection = this.afs.collection(CHAT_ROOM_NODE, ref => ref.where("company", '==',companyUID).where("type", '==', "group").orderBy('lastMessage','desc'));
    this._chatRooms = this._chatRoomsRefCollection.stateChanges();
    this._TeamRoomsRefCollection = this.afs.collection(CHAT_ROOM_NODE, ref => ref.where("company", '==', companyUID).where("type", '==', "team").orderBy('lastMessage','desc'));
    this._TeamRooms = this._TeamRoomsRefCollection.stateChanges();
    return;
  } 

  public async TeamRooms() {
    try{
      return this._TeamRooms;
    }catch{
      //console.log("error");
    }
  }

  public async chatRooms() {
    try{
    return this._chatRooms;
    }catch{
      //console.log("error");
    }
  }

  public async chatBotMessages(room_uid:string) {
    try{  
		let ref = this.afs.collection(CHAT_MESSAGE_ROM).doc(room_uid);
        //this._chatRoomsBotMessages[bot_rooms[index]] = this.afs.collection(CHAT_MESSAGE_ROM).doc(bot_rooms[index]).collection("messages",ref => ref.orderBy('timestamp','desc').limit(50)).stateChanges();
		await this.ObserveServ.messageObserverBot(ref, 50).then ( obs=> {
			this._chatRoomsBotMessages[room_uid]  = obs;
		});
		return this._chatRoomsBotMessages[room_uid]
    }catch{
      //console.log("error");
    }
  }    

public saveMessage(chat_room_uid: string, chat_message: ChatMessage): Promise<any> {
  return new Promise((resolve, rejected) => {
    let uid = this.afs.createId();
    this.afs.collection(CHAT_MESSAGE_ROM).doc(chat_room_uid).collection("messages").doc(uid).set(chat_message).then(() => {
      resolve(true);
    }).catch(error=>{
      //console.log(error);
      rejected(error)
    })
  })
}  

  public disjoin_group(card: any, group: string,members):Promise <void>{
    return new Promise((resolve, rejected) => {
      if(card.groups!=null&&card.groups[group]!=null){
        //group es la clave que debo eliminar del objeto clave valor
        delete card.groups[group];
        let user_card ={
          uid: card.uid,
          groups:card.groups
        }
        this.updateUserCard(user_card);
      }
      this.afs.doc(`${CHAT_ROOM_NODE}/${group}`).update({members:members}).then(() => {
        resolve();
      }).catch(error=>{
        rejected(error);
      });
    });
  }

  public delete_group(card: any, group: string):Promise <void>{
    return new Promise((resolve, rejected) => {
      if(card.groups!=null){
        //group es la clave que debo eliminar del objeto clave valor
        delete card.groups[group];
      } 
      let user_card ={
        uid: card.uid,
        groups:card.groups
      }
      this.updateUserCard(user_card);
      this.afs.collection(`${CHAT_ROOM_NODE}`).doc(`${group}`).delete().then(() => {
        resolve();
      }).catch(error=>{
        rejected(error);
      });
    });
  } 

  public async join_group(card,chat_room){ 
    let gruposAux={};
    if(card.groups!=null){
      gruposAux=card.groups;
    }
    //gruposAux[chat_room.uid]={lastConection:new Date().toISOString(),Silenciado:false};  
    gruposAux[chat_room.uid]=new Date().toISOString();
    let user_card ={
      uid: card.uid,
      groups:gruposAux
    }
    let members = chat_room.members;
    //members[card.uid]=false;
    members.push(card.uid)
    this.updateUserCard(user_card);
    this.afs.doc(`${CHAT_ROOM_NODE}/${chat_room.uid}`).update({members:members}) 
  } 

  public dialogFlowV1(query: string, user_uid: string, user_name: string, chat_room_uid: string, contexts: any[],bot:string,next_talk:string,empresa?:string): Promise<ContextsButtons> {
    return new Promise((resolve, rejected) => {
      this.afAuth.auth.currentUser.getIdToken().then(authorizationToken => {
        let URL = `${AppContants.node_api[AppContants.config_mode]}DialogFlow`;
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', `Bearer ${authorizationToken}`);
        let nodo=CHAT_BOT_NODE;
        if(bot!="BOT-001"){
          nodo=CHAT_BOT_NODE2;
        }
        let sendData = {
          "userUID": user_uid,
          "chatRoomUID": chat_room_uid,
          "name": user_name,
          "contextos":contexts,
          "mensaje":query,
          "nodo":nodo,
          "next_talk":next_talk
        }
        //console.log("sendData",sendData,"URL",URL);
        this.http.post(URL, sendData, { headers: headers }).subscribe(response => {
          let data:ContextsButtons;//let chatAnswer: ChatAnswer = {};  
          let finalizo=false;
          if(response['webhookStatus'].code==0||response['webhookStatus'].code==4){
            if (response['result'].fulfillmentMessages.length > 1){
              //debo ubicar el payload
              for (var j = 0; j < response['result'].fulfillmentMessages.length; j++) {
                if(response['result'].fulfillmentMessages[j].message.toLowerCase() =="payload"){
                  finalizo=true;
                  console.log("finalizo por payload");
                }
                if(response['result'].fulfillmentMessages[j].message=="text"&&response['result'].fulfillmentMessages[j].text.text[0].includes("#data#")){
                  //La respuesta son los botones
                  data=JSON.parse(response['result'].fulfillmentMessages[j].text.text[0])["#data#"];;
                  delete(response['result'].fulfillmentMessages[j]);
                  finalizo=true;
                  console.log("finalizo por #data#");
                }
              }
            }
            if(finalizo){
              let actions = response['result'].action.split(",");
              if(actions.indexOf("error")>=0){
                  this.errorService.setError(CATEGORIA_DF,"ER","1",(response['result'].queryText)?response['result'].queryText:"vacio",null,empresa);      
              }
              resolve(data);
            }else{
              this.errorService.setError(CATEGORIA_DF,"ER","2",response['webhookStatus'].message,null,empresa);  
              rejected("Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles");
            }
          }else{
            this.errorService.setError(CATEGORIA_DF,"ER","2",response['webhookStatus'].message,null,empresa);  
            rejected("Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles");
            //rejected(response['status'].errorType);
          }
        },error=>{
          rejected(error);
        });
      }).catch(error=>{
          return rejected(error);
      });
    });
  }

  obtenerRandom(array){
    //Example, including customisable intervals [lower_bound, upper_bound)
    var limit = 4,
    lower_bound = 1,
    upper_bound = array.length,
    unique_random_numbers = [];

    while (limit>0) {
        var random_number = Math.floor(Math.random()*(upper_bound - lower_bound) + lower_bound);
        if (unique_random_numbers[random_number]==null) { 
            unique_random_numbers[random_number]=array[random_number];
            limit--;
        }
    }
    return Object["values"](unique_random_numbers);
  }

  public async  get_buttons(user_uid: string,bot:string,callback) {
      this.stop_Buttons();
      let nodo=CHAT_BOT_NODE;
      if(bot!="BOT-001"){
        nodo=CHAT_BOT_NODE2;
      }
      console.log(nodo);
      this.dataBotRef["chatBotButtons"]=this.fireDB.database.ref(nodo).child(user_uid).child('buttons');
      this.dataBotRef["chatBotButtons"].on("value",data=>{
        callback(data.val());
      });
  }

  public get_Contexts(user_uid,bot,callback){
    this.stop_Contexts();
    let nodo=CHAT_BOT_NODE;
    if(bot!="BOT-001"){
      nodo=CHAT_BOT_NODE2;
    }
    console.log(nodo);
    this.dataBotRef["chatBotContexts"]=this.fireDB.database.ref(nodo).child(user_uid).child('contexts');
    this.dataBotRef["chatBotContexts"].on("value",data=>{
      callback(data.val());
    });
  }

  public async setlastChatAnswer(userUID: string, lastChatAnswer: ChatAnswer): Promise<void> {
    try {
      this.fireDB.database.ref(CHAT_BOT_NODE).child(userUID).child('buttons').set(lastChatAnswer)
      return ;
    } catch (error) {
      throw error;
    }

  }

  public async stop_ButtonsContexts(){
    console.log("stop_ButtonsContexts");
    this.stop_Buttons();
    this.stop_Contexts();
  }

  public stop_Buttons(){
    console.log("stop_Buttons",this.dataBotRef["chatBotButtons"]);
    if(this.dataBotRef["chatBotButtons"]!=null){
      this.dataBotRef["chatBotButtons"].off();
      delete(this.dataBotRef["chatBotButtons"]);
    }
  }

  public stop_Contexts(){
    console.log("stop_Contexts",this.dataBotRef["chatBotContexts"])
    if(this.dataBotRef["chatBotContexts"]!=null){
      this.dataBotRef["chatBotContexts"].off();
      delete(this.dataBotRef["chatBotContexts"]);
    }
  }

  closeSession(){
    //this._chatRoomsBotDoc = null;//replace
    this._chatsRoomsBotsDocs = [];
    this._chatsRoomsBotsRefSubs=[];
    this._chatRoomsBotsData=[];
    this._chatRoomsBotMessages = [];
    this._chatRoomsRefCollection = null;
    this._chatRooms = null;
    this._TeamRoomsRefCollection = null;
    this._TeamRooms = null;
    this.registroHabitoAna = {registrado:false, categoria:null, subCategoria:null,ir:false};
    this.Mandatory_Video = {finalize:false, time:null, percent:null,view:false};
    this.notAna = 0;
  }

  async more(cursor,room_uid) {
    return this.afs.collection(CHAT_MESSAGE_ROM).doc(room_uid).collection("messages",ref => ref.orderBy('timestamp','desc').startAfter(cursor).limit(50)).snapshotChanges(['added']).pipe(take(1));
  }
  
  changeBotImag(path:string, room_uid:string):Promise<any>{
	return new Promise((resolve, rejected) => {
		this.afs.doc(`${CHAT_ROOM_NODE}/${room_uid}`).update({imagen:path}).then(()=>{
			resolve();
		});
	})
  }

}