import { Injectable,NgZone } from "@angular/core";
import { User } from "../../interfaces/user";
import { ChatRoom } from "../../interfaces/chat-room";
import { ToastController, App, Events  } from "ionic-angular";
import { ChatMessage } from "../../interfaces/chat-message";
import { UserProvider } from "../user/user";
import { ChatProvider } from "../chat/chat";
import { loadingProvider } from '../../providers/alert/alert';
import { AngularFirestore } from "@angular/fire/firestore";
import { ErrorProvider } from "../error/error";
import {  ImagesProvider} from "../images/images";
import { ObservableProvProvider } from '../observable-prov/observable-prov';
import { map } from 'rxjs/operators';


const CHAT_MESSAGE_ROM = 'chat_messages';

@Injectable() 
export class Realtime { 
  user: User;
  SocialRooms: any[];//SocialRooms: ChatRoom[];
  SocialRoomsA: any[];
  TeamRooms: ChatRoom[];
  TeamRoomsA:any[];
  AllGroupsListener: any=null;
  TeamGroupsListener: any=null;
  ChatRoomListener: any[] = [];
  ChatRoomObservable: any[] = [];
  activeChatRoom = "";
  company_user_list = [];
  myCard: any=null;
  actual:boolean=false; 
  salaActual:any=null;
  lastRoomsUpdate:any[]=[];
  fisrt:any={S:false,T:false};
  disjoinGroups:string=null;
  start = new Date().getTime();
  total_groups = 0;
  group_sms = 0;

  public constructor(
    private afs:AngularFirestore,
    private toast: ToastController,
    public app: App,
    public userprovider: UserProvider,
    private chatService: ChatProvider,
    private loadingService:loadingProvider,
    public events: Events,
    private errorprovider: ErrorProvider,
    private ngzone:NgZone,
    private imageService:ImagesProvider, 
	private ObserveServ: ObservableProvProvider
    //private auth: AuthProvider
  ) {
    this.user = this.userprovider.static_user();
    this.TeamRoomsA=[];this.TeamRooms=[];this.SocialRoomsA=[];this.SocialRooms=[];
  }

  public InitRealtime(user?) {
    return new Promise((resolve)=>{
    if(user) this.company_card_list(user);
    this.start = new Date().getTime();
    if(user) this.user = user; 
    if(!this.AllGroupsListener){
      let SRooms:any[] = [];
      this.chatService.chatRooms().then(obserable => {
        //Esto es un escucha de loadChatRooms en el provider chat.ts
        this.AllGroupsListener = obserable.pipe(
          map(actions => actions.map((a:any) => {
            const data =a.payload.doc.data() as ChatRoom;
            data.changeType=a.type;
            return data;
          }))
        ).subscribe(rooms => {
          //chatRooms.forEach(rooms=>{
          //console.log("grupos publicos",rooms);
            //for (var i = rooms.length - 1; i >= 0; i--) {
            let reordenar=false;
            for(let i=0;i<rooms.length;i++){
              //////console.log(rooms[i]);
              let chatMessages: ChatMessage[] = [];
              rooms[i].joined = rooms[i].members.indexOf(this.user.uid)>-1;
              rooms[i].NotRead = 0;
              rooms[i].messages = chatMessages; 
              rooms[i].lastMessage = (rooms[i].lastMessage)?rooms[i].lastMessage:new Date(new Date().setFullYear(1900)).toISOString();  
              let index=rooms[i].uid;

              if(rooms[i].changeType=="added"){
                SRooms[index]=rooms[i];this.SocialRoomsA.push(SRooms[index]);
                if(SRooms[index].joined){
                  //Si es mi grupo obtengo sus mensaje
                  SRooms[index].firstData = true; this.total_groups++;
                  ////console.log("si es mi grupo",SRooms[index]);
                  this.get_group_messages(index,index);
                }
              }else if(rooms[i].changeType=="modified"){
                  //console.log("debo modificar el grupo que llego",rooms[i]);
                  if(SRooms[index]!=null){
                    SRooms[index].category=rooms[i].category;SRooms[index].company=rooms[i].company;
                    SRooms[index].create_date=rooms[i].create_date;SRooms[index].createdBy=rooms[i].createdBy;
                    SRooms[index].description=rooms[i].description;SRooms[index].goal=rooms[i].goal;
                    SRooms[index].members=rooms[i].members;SRooms[index].name=rooms[i].name;
                    SRooms[index].picture=rooms[i].picture;SRooms[index].type=rooms[i].type;
                    SRooms[index].uid=rooms[i].uid;SRooms[index].joined=rooms[i].joined;
                    SRooms[index].sincronizando=rooms[i].sincronizando;
                    let fechaAnt= SRooms[index].lastMessage;SRooms[index].lastMessage=rooms[i].lastMessage;
                    if(!SRooms[index].hasOwnProperty("NotRead")) SRooms[index].NotRead=rooms[i].NotRead;
                    if(!SRooms[index].hasOwnProperty("messages")) SRooms[index].messages=rooms[index].messages;
                    //SRooms[k]=rooms[i];
                    if(SRooms[index].joined){
                      //console.log("yo pertenezco a ese grupo",this.ChatRoomListener,SRooms[index].uid,SRooms[index].lastMessage.getTime(),rooms[i].lastMessage.getTime());
                      if(fechaAnt<SRooms[index].lastMessage){
                        //aca debo eliminar el objeto del this.SocialRoomsA y meterle al comienzo
                        this.ordenarArreglo(SRooms[index],this.SocialRoomsA);
                        if(!reordenar) reordenar=true;
                      }else{
                        //console.log("No se actualizo el lastMensaje por lo tanto no reordeno")
                      }
                      if(!this.ChatRoomListener[SRooms[index].uid]){
                        if(!reordenar) reordenar=true;
                        if(!SRooms[index].hasOwnProperty("firstData")){
                           SRooms[index].firstData = true;
                        }
                        this.get_group_messages(index,index);
                      }
                    }else{
                      //console.log("no es un grupo mio",this.disjoinGroups,index,this.disjoinGroups==index);
                     if(this.disjoinGroups!=null&&this.disjoinGroups==index) {
                      this.disjoinGroups=null;
                      if(this.lastRoomsUpdate.findIndex(x => x.uid === index)!=-1&&!reordenar) reordenar=true;
                     }
                    }
                  }
              }else{
                //remove
                //console.log("debo eliminar el grupo que llego");
                if(SRooms[index].joined){
                  if(this.ChatRoomListener[SRooms[index].uid]){
                    this.deleteListenerChatRoom(SRooms[index].uid);
                  }
                  if(!reordenar) reordenar=true;
                  this.loadingService.presentToast('Se ha elimino el grupo: "'+ SRooms[index].name+'"');
                }
                delete(SRooms[index]);
                let indice=this.SocialRoomsA.indexOf(SRooms[index]);
                this.SocialRoomsA.splice(indice,1);

              }
            }
            if(reordenar) this.get3Rooms();
            if(!this.fisrt.S&&rooms.length>0) this.get3Rooms(); this.fisrt.S=true;
        },error=>{
          //console.log(error);
          console.log("error en el observable de  grupos");
        }); 
      })
      this.SocialRooms = SRooms;//console.log("chats sociales",this.SocialRooms,this.SocialRoomsA);
    }
    this.getTeamRooms().then(data=>{  
      resolve("Done");
      this.loadingService.slowConnectionTimer(this.user.uid)
      this.setPercentLoader(85,450)
      setTimeout(()=>{
        if(this.total_groups==0){
          this.setPercentLoader(100,100);
          console.log("No Groups")
        }
      },500)
    })
    })
  }

  public async company_card_list(user){
    this.user = user;
    let company_users = []
    //if(this.auth.AppIsOnline()){
    let user_card_list = await this.chatService.user_card_listener(user.company.uid);
    for(let user_card of user_card_list){
      //cada vez que se escuche cambios en los user card que son de esta compañia debo 
      //verificar si cada uno de esos user_card que estan llegando ya se agregaron o no
      if(company_users.length>0){
        let existe=false;
        for (var i = 0; i < company_users.length; ++i) {
          if(user_card.uid == company_users[i].uid){
            existe=true;break;
          }
        }
        if(existe){
          //////console.log("El miembro ya existe, procedo a actualizar susu datos");
          company_users[i]=user_card;
        }else{
          //////console.log("El miembro no existe el arreglo,loa grego");
          company_users.push(user_card);
        }
      }else{
        company_users.push(user_card);
      }

    }
    this.company_user_list = company_users;
    //console.log(this.company_user_list)
  }
  
  /* OBTIENE EL NOMBRE DEL USUARIO CUANDO ESTE SE ENCUENTRA EN UN MAPA*/
  public async user_card_list_map(members){
    let room_members =[];
    this.company_user_list.forEach(user_card=>{
      if (members[user_card.uid]){
        room_members.push(user_card);
      }
    })
    return room_members;
  }

  public async user_card_list(members){
    let room_members =[];
     this.company_user_list.forEach(user_card=>{
      members.forEach(user_id=>{
        if(user_id == user_card.uid) room_members.push(user_card);
      })
     })
    return room_members;
  }

  public load_social_rooms(): Promise<any> {
    return new Promise((resolve, rejected) => {
      resolve(this.SocialRoomsA)
    })
  }

  public get_social_room(room_uid,team): Promise<any> {
    return new Promise((resolve, rejected) => {
      //let SelectedRoom: ChatRoom[]
      if(team){
        (this.TeamRooms.hasOwnProperty(room_uid))?resolve(this.TeamRooms[room_uid]):rejected(new Error("No se encontro el team"));
        rejected();
      }else{
        (this.SocialRooms.hasOwnProperty(room_uid))?resolve(this.SocialRooms[room_uid]):rejected(new Error("No se encontro el grupo social"));
      }
    })
  }

  public getTypeChatRomm(room_uid):string{
    if (this.SocialRooms[room_uid]!=null) {
      return "group";
    }
    if (this.TeamRooms[room_uid]!=null) {
      return "team";
    }
    return "none"
  }

  public refresh_social_room(room_uid) {
      for (var i = 0; i < this.SocialRooms.length; i++) {
        if (this.SocialRooms[i].uid == room_uid) {
          return (this.SocialRooms[i])
        }
      }
  }

  public refresh_more_messages(room_uid, number): Promise<ChatMessage[]> {
    return new Promise((resolve, rejected) => {
      //////console.log(room_uid)
      for (var i = 0; i < this.SocialRooms.length; i++) {
        if (this.SocialRooms[i].uid == room_uid) {
          //////console.log(i)
          this.get_group_messages(room_uid,i+"").then(messages => {
            resolve(messages)
          })
        }
      }
    })
  } 

  // ONCE METHODS
  public get_group_messages(room_uid: string, index: string,team?): Promise<any> {
   //console.log("obteniendo mensajes del chat :",room_uid,team);
    return new Promise((resolve, rejected) => {  
      let chatMessages: ChatMessage[] = []; 
        this.lastOnlineListener(room_uid, index,team).then(() => {
          //console.log("lastOnlineListener sucess");
          this.messagesListerner(room_uid, index,team);
          return resolve(chatMessages);
        }).catch(error=>{
          alert(1);
          console.log(error);
          return resolve(chatMessages);
        })
    });
  }

  //RealtimeListeners
  private lastOnlineListener(room_uid: string, index, team?): Promise<void> {
    return new Promise((resolve, rejected) => {
      if(team!=null && team == "team"&& this.TeamRoomsA.length==0){
        rejected(new Error("No hay grupos sociales"));
      }
      if(team!=null && team!="team"&& this.SocialRoomsA.length==0){
        rejected(new Error("No hay grupos privados (equipos)"));
      }
      this.userprovider.getUserCard(this.user.uid).then(card => {
        let last_online = new Date();
        //if(card.groups!=null&&card.groups[room_uid]) last_online = card.groups[room_uid].lastConection;
        if(card.groups!=null&&card.groups[room_uid]) last_online = new Date(card.groups[room_uid]);
        if(team == "team"){
          //console.log(this.TeamRooms[index],team);
          this.TeamRooms[index]["last_online"] = last_online;
        }else{
          //console.log(this.SocialRooms[index],team);
          this.SocialRooms[index]["last_online"] = last_online;
        }
        resolve();
      }).catch(error=>{
       rejected(error);
      })
    })
  }

  firstChatMessage:boolean=true;
  private async messagesListerner(room_uid: string, index, team?) {
    //console.log("messagesListerner",team);
    try{
    if(this.ChatRoomListener[room_uid]!=null){
      return;
    }
    let docs=[];
	//console.log("oprev");
	//alert(2442);
	let ref = this.afs.collection(CHAT_MESSAGE_ROM).doc(room_uid);
        //this._chatRoomsBotMessages[bot_rooms[index]] = this.afs.collection(CHAT_MESSAGE_ROM).doc(bot_rooms[index]).collection("messages",ref => ref.orderBy('timestamp','desc').limit(50)).stateChanges();
	await this.ObserveServ.messageObserverBot(ref, 50).then ( obs=> {
		//alert(2121);
		this.ChatRoomObservable[room_uid]= obs;
	});
    this.ChatRoomObservable[room_uid] = this.ChatRoomObservable[room_uid].pipe(
		  map((actions:any) => {
			//console.log(actions);
			return actions.map((a:any) => {
				const data =a.payload.doc.data();
				docs[a.payload.doc.id]=a.payload.doc;
				data.metadata=a.payload.doc.metadata;
				data.uid=a.payload.doc.id;
				return data;
		   })
		  })
	);
	
    this.ChatRoomListener[room_uid] = this.ChatRoomObservable[room_uid].subscribe(newMessages => {
      //let end = Math.round((new Date().getTime() - this.start)/1000); this.group_sms++;
      let percentLoad = Math.round((this.group_sms*100)/this.total_groups);
      this.setPercentLoader(100,100);
      let SelectedRoom: ChatRoom[];
      index=room_uid;
      if(team == "team"){
        SelectedRoom = this.TeamRooms;
        //index=SelectedRoom.findIndex(x => x.uid === room_uid);
      }else{
        SelectedRoom = this.SocialRooms;
      }
      //console.log("newMessages",newMessages,team,SelectedRoom[index],SelectedRoom[index].lastVisible);
      this.setPercentLoader(percentLoad,100); 
      //console.log(end+" newMessages",newMessages,team,SelectedRoom[index], "percent="+this.group_sms+"/"+this.total_groups+"="+percentLoad);
      //se debe actualizar el indice por se puede dar el caso que se elimine un grupo y esto causa que
      //haya un desface en dicho index que si antes valia 1 ahora vale 0 al eliminar un grupo
      //console.log("grupo",SelectedRoom[index]);
      if(SelectedRoom[index]==null||SelectedRoom[index]==undefined) return;
      if(SelectedRoom[index].firstData){
        SelectedRoom[index].lastVisible = (newMessages.length==50)?docs[newMessages[newMessages.length-1].uid]:null;
        if(SelectedRoom[index].lastVisible==null&&newMessages.length>0) {
          SelectedRoom[index].ultimos=true;
        }
      }
      newMessages= newMessages.reverse();
      if(newMessages.length){
        if(SelectedRoom[index].firstData){
          SelectedRoom[index].firstData=false;
          //console.log("Primera carga");
          let notReadmessage = 0;
          for (var i = 0; i < newMessages.length; ++i) {
            SelectedRoom[index].messages.push(newMessages[i]);
            if(SelectedRoom[index].messages[i].timestamp > SelectedRoom[index]["last_online"]) notReadmessage++;
            if(newMessages[i].type=="img") this.imageService.addSrcMessage(newMessages[i]);
          }
          if(SelectedRoom[index].NotRead){
            SelectedRoom[index].NotRead+= notReadmessage;
          }else{
             SelectedRoom[index].NotRead= notReadmessage;
          }
          SelectedRoom[index].sincronizando=false;
        }else{
          //console.log("no es firsh data");
          let last_message = new Date().toISOString();
          let lastIndex = 0;
          if (SelectedRoom[index].messages.length) {
           //////console.log("A");
            lastIndex = SelectedRoom[index].messages.length - 1;
            last_message = SelectedRoom[index].messages[lastIndex].timestamp;
            this.firstChatMessage = false;
          }else{
            this.firstChatMessage = true;
          }
          //////console.log(newMessages,SelectedRoom[index].name);
          for (var k = 0; k < newMessages.length; k++) {
            let chatMessage: ChatMessage = newMessages[k]; 
            if(!chatMessage){
              return;
            }
            if (this.activeChatRoom != room_uid && this.user.uid != chatMessage.user) {
               //console.log("B");
               if(newMessages.length==1&&SelectedRoom[index].NotRead){
                 this.showChatToast(index, chatMessage, room_uid,SelectedRoom[index].name,SelectedRoom[index].type);
               }else{
                 if(k==(newMessages.length-1)&&SelectedRoom[index].NotRead){
                   this.showChatToast(index, chatMessage, room_uid,SelectedRoom[index].name,SelectedRoom[index].type,(SelectedRoom[index].NotRead+1));
                 }
               }
            }
            if (lastIndex == 0 && this.firstChatMessage) {
               //console.log("C");
                this.addMessage(index, chatMessage,last_message,SelectedRoom);
                this.firstChatMessage = false;
            } else if (last_message != chatMessage.timestamp.toString()) {
                //console.log("D",last_message, chatMessage.timestamp,last_message < chatMessage.timestamp);
                this.addMessage(index, chatMessage,last_message,SelectedRoom);
            }
          }
          if(room_uid==this.salaActual){
            this.events.publish('chatActual:messagues');
          }
          SelectedRoom[index].sincronizando=false;
        }  
        //////console.log(SelectedRoom[index]);
      }else{
        //console.log("No llego ningun mensaje nuevo");
      }
    },error=>{
      //manejar el error al suscribirse
      console.log("error")
    });
    }catch(e){
      //console.log("error",e);
    }
  }

  last_message = new Date().toISOString();
  showChatToast(index, chatMessage, room_uid,name,type,notRead?) {
    ////console.log("showChatToast");
    if (this.last_message != chatMessage.timestamp) {
      let member = this.findMember(chatMessage.user)
      let display = chatMessage.message;
      if(chatMessage.type == 'img'){ display = "Imagen";}
      else if(chatMessage.type == 'video'){ display = "Video";}
      let message = member['name'] + " @ " + name + " - " + display;
      message = message.replace("||",'')
      if(notRead!=null){
        ////console.log(notRead,"notRead");
        message=notRead + " mensajes sin leer @ " + name;
      }
      if(this.myCard==null) this.myCard = this.findMember(this.user.uid)
      this.showToast(message, 'top', true, 2000, room_uid, this.myCard[room_uid],type);
      this.last_message = chatMessage.timestamp
    }
  }

  findMember(uid){
    //console.log(this.company_user_list)
    for(let member of this.company_user_list){
      if(member.uid == uid) return member;
    }
    return null;
  }

  async getMyCard(){
    if(this.myCard==null) this.myCard = await this.findMember(this.user.uid);
    return this.myCard;
  }

  addMessage(index, chatMessage,lastConectionGroup,SelectedRoom) {
    if (lastConectionGroup < chatMessage.timestamp&&chatMessage.user!=this.user.uid) SelectedRoom[index].NotRead++;
    SelectedRoom[index].messages.push(chatMessage);
    if(chatMessage.type=="img") this.imageService.addSrcMessage(chatMessage);
  }

  disableChatRoom(uid) {
    this.activeChatRoom = ""
  }

  enableChatRoom(uid) {
    this.activeChatRoom = uid;
  }
  
  previousMessage = "";
  count = 0;
  toastNotification:any=null;
  showToast(text, position, showOk, duration, uid, last,type) {
    //let that = this;
    try{
    let displayedTime = new Date().getTime();
    if(this.previousMessage != text){
      this.previousMessage = text;
      if(this.toastNotification==null||(this.toastNotification!=null&&!this.toastNotification.presente)){
         this.toastNotification= this.toast.create({
          message: text,
          //duration: duration,
          position: position,
          showCloseButton: showOk,
          closeButtonText: "Ver"
        });
        this.toastNotification.onDidDismiss((data) => {
          ////console.log("onDidDismiss",data);
          if(data!=null){
            ////console.log("cerrado Pro");
            this.toastNotification.idTimeOut=null;
            this.toastNotification.presente=false;
            return;
          }else{
            ////console.log("cerrado user")
            if(this.toastNotification.idTimeOut!=null){
               clearInterval(this.toastNotification.idTimeOut);
              this.toastNotification.idTimeOut=null;
            }
          }
          let dismissedTime = new Date().getTime();
          if ((displayedTime + duration) > dismissedTime) {
            try{
              ////console.log(uid,last);
              let nav = this.app.getActiveNavs()[0];
              nav.push("ChatPage", {group_uid: uid, last_online:last,team:(type=="team")?"team":null});
            }catch(e){
              console.log(e);
            }
          };
          this.toastNotification.presente=false;
        });
        this.toastNotification.presente=true;
        this.toastNotification.present().then(()=>{
          ////console.log("creado",this.toastNotification);
          this.toastNotification.idTimeOut=setTimeout(()=>{
            ////console.log("setTimeout");
            this.toastNotification.dismiss({x:true});
          },2000)
        });
      }else{
        this.toastNotification.data.message=text;
        ////console.log(this.toastNotification.data.message);
      }
    }
    }catch(e){
      //console.error(e,2222);
    }
  }

  setActual(x,y){
    this.actual=x;
    this.salaActual=y;
  }

  async deleteListenerChatRoom(room_uid){
    if(this.ChatRoomListener[room_uid]!=null){
      try{
        this.ChatRoomListener[room_uid].unsubscribe()
        delete(this.ChatRoomListener[room_uid]);
        //console.log("se elimino el listener de los mensajes del grupo "+room_uid);
        return;
      }catch(err) {
        this.errorprovider.setError("Realtime","ER","20",err.toString(),"Error de unsubscribe");
        //console.log(err)
        return;
      }
    }
  } 


  //funcion para reinstanciar los observables de los grupos a los que pertenezco
  reinstanciar(){
    ////console.log("reinstanciar");
    try{
      for (var i = 0; i < this.SocialRooms.length; i++) {
        if (this.SocialRooms[i].joined) {
          this.SocialRooms[i].firstData=true;
          this.SocialRooms[i].sincronizando=true;
      this.SocialRooms[i].NotRead=0;
          this.deleteListenerChatRoom(this.SocialRooms[i].uid);
          this.get_group_messages(this.SocialRooms[i].uid,i+"").then(messages => {
          })
        }
      }
      this.reinstanciarTeam();
    }catch(e){
      ////console.log(e);
    }
  }

  reinstanciarTeam(){
    for (var i = 0; i < this.TeamRooms.length; i++) {
      if (this.TeamRooms[i].joined) {
        this.TeamRooms[i].firstData=true;
        this.TeamRooms[i].sincronizando=true;
        this.deleteListenerChatRoom(this.TeamRooms[i].uid);
        this.get_group_messages(this.TeamRooms[i].uid,i+"","team").then(messages => {
        })
      }
    }
  }



  // Servicio de Chats Privados

  public getTeamRooms(){ 
    return new Promise((resolve)=>{
    if(!this.TeamGroupsListener){
      let SRooms:any[] = [];
      this.chatService.TeamRooms().then(observable => {
        this.TeamGroupsListener = observable.pipe(
          map(actions => actions.map((a:any) => {
              const data =a.payload.doc.data() as ChatRoom;
              data.changeType=a.type;
              return data;
            }).filter((team) => {
              return team.members.indexOf(this.user.uid)>-1
            })
          )
        ).subscribe(rooms => {
          //chatRooms.forEach(rooms=>{
          //console.log(rooms,SRooms);
          let reordenar=false;
          for(let i=0;i<rooms.length;i++){
            //////console.log(rooms[i]);
            let chatMessages: ChatMessage[] = [];
            //rooms[i].joined = rooms[i].members.hasOwnProperty(this.user.uid);
            rooms[i].joined = true;
            rooms[i].NotRead = 0;//aca esta la clave
            rooms[i].messages = chatMessages;
            rooms[i].lastMessage = (rooms[i].lastMessage)?rooms[i].lastMessage:new Date(new Date().setFullYear(1900)).toISOString();  
            let index=rooms[i].uid;

            if(rooms[i].changeType=="added"){
              SRooms[index]=rooms[i];this.TeamRoomsA.push(SRooms[index]);
              if(SRooms[index].joined){
                //Si es mi grupo obtengo sus mensaje
                SRooms[index].firstData = true;this.total_groups++;
                ////console.log("si es mi grupo",SRooms[index]);
                this.get_group_messages(index,index,"team");
              }
            }else if(rooms[i].changeType=="modified"){
              //console.log("debo modificar el grupo que llego",rooms[i]);
              if(SRooms[index]!=null){
                SRooms[index].category=rooms[i].category;SRooms[index].company=rooms[i].company;
                SRooms[index].create_date=rooms[i].create_date;SRooms[index].createdBy=rooms[i].createdBy;
                SRooms[index].description=rooms[i].description;SRooms[index].goal=rooms[i].goal;
                SRooms[index].members=rooms[i].members;SRooms[index].name=rooms[i].name;
                SRooms[index].picture=rooms[i].picture;SRooms[index].type=rooms[i].type;
                SRooms[index].uid=rooms[i].uid;SRooms[index].joined=rooms[i].joined;
                SRooms[index].sincronizando=rooms[i].sincronizando;
                let fechaAnt= SRooms[index].lastMessage;SRooms[index].lastMessage=rooms[i].lastMessage;
                if(!SRooms[index].hasOwnProperty("NotRead")) SRooms[index].NotRead=rooms[i].NotRead;
                if(!SRooms[index].hasOwnProperty("messages")) SRooms[index].messages=rooms[index].messages;
                //SRooms[k]=rooms[i];
                if(SRooms[index].joined){
                  //console.log("yo pertenezco a ese grupo",this.ChatRoomListener,SRooms[index].uid,SRooms[index].lastMessage.getTime(),rooms[i].lastMessage.getTime());
                  if(fechaAnt<SRooms[index].lastMessage){
                    //aca debo eliminar el objeto del this.SocialRoomsA y meterle al comienzo
                    this.ordenarArreglo(SRooms[index],this.SocialRoomsA);
                    if(!reordenar) reordenar=true;
                  }else{
                    //console.log("No se actualizo el lastMensaje por lo tanto no reordeno")
                  }
                  if(!this.ChatRoomListener[SRooms[index].uid]){
                    if(!SRooms[index].hasOwnProperty("firstData")){
                       SRooms[index].firstData = true;
                    }
                    this.get_group_messages(index,index,"team");
                  }
                }else{
                 //console.log("No pertenezco a ese grupo");
                }
              }
            }else{
              //remove
              //console.log("debo eliminar el grupo que llego");
              if(SRooms[index].joined){
                if(this.ChatRoomListener[SRooms[index].uid]){
                  this.deleteListenerChatRoom(SRooms[index].uid);
                }
                delete(SRooms[index]);
                let indice=this.TeamRoomsA.indexOf(SRooms[index]);
                this.TeamRoomsA.splice(indice,1);
                this.loadingService.presentToast('Se ha elimino el equipo: "'+ SRooms[index].name+'"');
                if(!reordenar) reordenar=true;
              }
            } 
          }
          if(reordenar) this.get3Rooms();
          if(!this.fisrt.T&&rooms.length>0) this.get3Rooms(); this.fisrt.T=true;
        },error=>{
          console.log(error);
          console.log("error en el observable de  equipos");
        });
      });
      this.TeamRooms = SRooms;//console.log(this.TeamRoomsA);
      resolve();
    }      
  })
  }

  public load_team_rooms(): Promise<any> {
    return new Promise((resolve, rejected) => {
      resolve(this.TeamRoomsA)
    })
  }

  public async loadRoomsByLastTimestamp(dashRooms){
    let auxRooms = []
    for(let room of dashRooms){
      if(room.joined){auxRooms.push(room);}
    }
    return auxRooms;
  }

  ordenarArreglo(room,SelectedRoom){
    //debo buscar la posicion de la sala de chat con uid==index para removerla y agregarla al proncipio
    let index=SelectedRoom.indexOf(room);
    SelectedRoom.unshift(SelectedRoom.splice(index,1)[0]);
  } 

  get3Rooms(){
    let x=[];
    //@ts-ignore
    let aux=this.SocialRoomsA.concat(this.TeamRoomsA);//console.log(aux);
    aux.sort(function(a, b) {
      if (a.lastMessage > b.lastMessage) {
        return -1;
      }
      if (a.lastMessage < b.lastMessage) {
        return 1;
      }
      return 0;
    });
    for (var i = 0; i < aux.length; ++i) {
      if(x.length<3){
        if(aux[i].joined){
          x.push(aux[i]);
        } 
      }else{
        break;
      }
    }
    this.ngzone.run(() => {
      if(x.length) this.lastRoomsUpdate=this.lastRoomsUpdate=x;
    });
  }


  cleanOutListeners(){
    //console.log("cleanOutListeners");
    //eliminar la suscripciones para dejar de escuchar los cambios en teams y grupos y mensajes nuevos
    if(this.AllGroupsListener!=null){      
      try{
        this.AllGroupsListener.unsubscribe();
      }catch(err) {
        console.log(err)
      }
    }
    if(this.TeamGroupsListener!=null){      
      try{
        this.TeamGroupsListener.unsubscribe();
      }catch(err) {
        console.log(err)
      }
    } 
    this.AllGroupsListener = null;
    this.TeamGroupsListener = null;

    for (var i = 0; i < this.TeamRooms.length; i++) {
      if (this.TeamRooms[i].joined) {
        this.deleteListenerChatRoom(this.TeamRooms[i].uid);
      }
    }
    for (var j = 0; j < this.SocialRoomsA.length; j++) {
      if (this.SocialRoomsA[j].joined) {
        this.deleteListenerChatRoom(this.SocialRoomsA[j].uid);
      }
    }
    this.SocialRooms = [];
    this.TeamRooms = [];
    this.company_user_list = [];
    this.ChatRoomListener=[];
    this.SocialRoomsA=[];
    this.chatService.closeSession();
  }

  
  last = 0; pass=true;doing=false;limit = 0;
  loader = 0; interval: any
  setPercentLoader(percent,limit){ 
    if(this.interval) clearInterval(this.interval);
    if(87>percent){
      if(this.last>percent) percent = this.last;
      this.last = percent;
      this.intervalSetter(percent,150)
    }else{
      this.loadingService.dataReady();
      this.loader = 100;
      this.intervalSetter(100,150)
      this.loadingService.dataReady();
      setTimeout(() => {
        this.loadingService.dataReady();
      }, 500);
    }
    setTimeout(() => {
      this.intervalSetter(100,150)
      this.loadingService.dataReady();
    }, 11000);
  }

  intervalSetter(limit,time){
    let that = this;
    this.interval = setInterval(()=>{
      if (that.loader >= limit) {
        if(100>that.loader){
        //this.intervalSetter(80,350)
        }else{
          clearInterval(this.interval);
        }
      } else {
        that.loader++; 
      }
    }, time);
  }

  getPercent(){    
    return this.loader;
  }
  
   
}