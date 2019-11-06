import { option } from './../../interfaces/option';
import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ChatMessage } from '../../interfaces/chat-message';
import { ChatAnswer } from '../../interfaces/chat-answer';
import { IonicPage, NavController, NavParams, Content, Events, Platform, AlertController, ModalController } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { User } from '../../interfaces/user';
import { ChatRoom } from '../../interfaces/chat-room';
import { ImageViewerController } from 'ionic-img-viewer';
import { Keyboard } from '@ionic-native/keyboard';
import { DietProvider } from '../../providers/diet/diet';
import { HabitProvider } from '../../providers/habit/habit';
import { UserGoal } from '../../interfaces/user-goal';
import { UserProvider } from '../../providers/user/user';
import { loadingProvider } from '../../providers/alert/alert';
import { AuthProvider } from '../../providers/auth/auth';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { Network } from '@ionic-native/network';
import { SettingsProvider } from '../../providers/settings/settings';
import { ChatContext } from '../../interfaces/chat-context';
import "rxjs/add/operator/toPromise";
import * as firebase from 'firebase';
import * as moment from "moment";

export interface DataItem {percent: string, timestamp: Date};
export interface ContextsButtons {
    chatAnswer:ChatAnswer;
    contextData?:ChatContext;
}
const timestampFs= firebase.firestore.FieldValue.serverTimestamp();

@IonicPage()
@Component({
  selector: 'page-chatbot',
  templateUrl: 'chatbot.html',
})
export class ChatbotPage {
  @ViewChild(Content) content: Content;
  @ViewChild('scrollMe',{read: ElementRef}) private myScrollContainer: ElementRef;

  subTitle: string;
  query: string;
  bottom = false;
  user: User;
  chatBotRoom: ChatRoom = { messages: [], name: '' };
  chatAnswer: ChatAnswer;
  chat_message: ChatMessage;
  _imageViewerCtrl: ImageViewerController;
  activeSend = false;
  user_habit: UserGoal = {};
  mutationObserver: MutationObserver=null;
  isOnline:boolean;
  isRefresher:boolean = false;
  espera:boolean=false;
  test = false;
  lastVisible:any;
  scrollActive:boolean=true;
  FirstMotation:boolean=false;
  noScroll:boolean=false;
  threshold:string="500px";
  paginationObserver:any=[];
  label:any;
  //loading=true;
  bot:string;
  ultimos:boolean=false;
  time='';
  fromCache='';
  subscriptionObservables:any=[];
  contexts:ChatContext;
  botPensado:boolean=false;
  height:string="280px";


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public keyboard: Keyboard,
    public imageViewerCtrl: ImageViewerController,
    public events: Events,
    private ngzone:NgZone,
    private chatProvider: ChatProvider,
    private dietprovider: DietProvider,
    private habitService: HabitProvider,
    private userProvider: UserProvider,
    public loadingprovider:loadingProvider,
    public alertCtrl: AlertController,
	  public modalCtrl: ModalController,
    private authProvider: AuthProvider,
	  private analytics:AnalyticsProvider,
    private network: Network,
    private language: SettingsProvider,
    private alerts: loadingProvider
    ) {
      this.label = this.language.getLanguage('ChatbotPage'); 
     this.isOnline = this.authProvider.isOnline;
     (this.isOnline) ? this.subTitle = this.label.online : this.subTitle = this.label.offline;    
     this.chatAnswer = {type:"text",lastUpdate:"1900-00-00T00:00:00-08:00"} 
     this.contexts = {lastUpdate:"1900-00-00T00:00:00-08:00",contexts:[]}  
     this._imageViewerCtrl = imageViewerCtrl;
     this.user_habit = this.habitService.getHabitObserver()[0];
     this.user = this.navParams.get('user');
     this.bot = this.navParams.get('bot');
     console.log("this.bot",this.bot);
     this.suscribirContextButtons(); 
  }
    
 
	/* */	
  ionViewDidLoad() {
    if(this.subscriptionObservables["msjBot"]!=null){
      this.subscriptionObservables["msjBot"].unsubscribe();
      delete(this.subscriptionObservables["msjBot"]);
    }
    /*this.loading=true;*/this.loadingprovider.showLoading("Cargando...");
    //console.log(this.user);
    this.chatProvider.getChatBotRoomData(this.user.chat_bot_room[this.bot]).then(BotRoom =>{
      let that = this;
	    console.log(BotRoom);
      this.loadingprovider.slowConnectionTimer(this.user.uid);
      let chatBotRoom=Object.assign({ messages: [], name: '' }, BotRoom);
      console.log("that.chatBotRoom",chatBotRoom,BotRoom);
      if(!chatBotRoom.hasOwnProperty("messages")) chatBotRoom.messages = [];
      if(!chatBotRoom.hasOwnProperty("firstData")) chatBotRoom.firstData = true;
      that.chatBotRoom = chatBotRoom;
      that.chatProvider.chatBotMessages(that.chatBotRoom.uid).then(observabl =>{
        if(that.subscriptionObservables["msjBot"]==null){
          //console.log("el obsservable no existe");
          that.time='';
          let x=moment(new Date());
          that.scrollActive=false;
          that.subscriptionObservables["msjBot"]=observabl.subscribe(messages => { 
           console.log("el observable fue creado y respondio",messages.length);
           //console.log("length 1"+messages.length,that.chatBotRoom.firstData,"componente",that.navCtrl.getActive().component.name);
           let y=moment(new Date());
            that.time= (moment.duration(y.diff(x))).as('seconds')+"";
            if(that.chatBotRoom.firstData){
              that.lastVisible = (messages.length==50)?messages[messages.length-1].payload.doc:null;
              that.scrollActive=(that.lastVisible)?true:false;
              that.chatBotRoom.firstData=false;
              if(!that.scrollActive&&messages.length>0){
                that.ultimos=true;
              }
            }
            messages=<any>messages.filter(a  =>{
              //if(a.payload.doc.metadata.hasPendingWrites) //console.log("tiene cambios pendientes haty que ignorarlo");
              let x=a.payload.doc.data();
              x.metadata=a.payload.doc.metadata;
              return (a.type=="added"&&!a.payload.doc.metadata.hasPendingWrites||a.type=="modified"&&!a.payload.doc.metadata.hasPendingWrites);
            }).map(a  =>{
              let x=a.payload.doc.data();
                x.metadata=a.payload.doc.metadata;
                return x;
            })
            //console.log("length 2"+messages.length,that.lastVisible);
            that.fromCache=(messages.length>0)?messages[0].metadata.fromCache+"":'';
            messages= messages.reverse()
            if(messages.length==0){
              that.scrollActive=true;
              that.loadingprovider.dataReady();/*that.loading=false;*/that.loadingprovider.dismissLoading();
            }
			
			console.log(messages);
            //alert("nuevo emnsaje de ana");
            for (var i = 0; i < messages.length; ++i) {
              that.chatBotRoom.messages.push(messages[i]);
            }
            console.log("mensaje nuevos",messages);
            setTimeout(() => {
              if(that.content) {
                let dimensions = that.content.getContentDimensions();
                that.threshold=(Math.round(dimensions.scrollHeight*0.35))+"px";
              }
            },500);
          },error=>{
            this.loadingprovider.dataReady();/*this.loading=false;*/that.loadingprovider.dismissLoading();
          });
          //console.log("seinstancio",that.chatProvider.BotAnaMsjObserver);
        }
      });
	
      //Para que cada vez que se agregue un elemento a la lista de mensajes baje el scroll
      this.mutationObserver = new MutationObserver((mutations) => {
        //console.log("mutation observer");
        if (!this.isRefresher){
          ////console.log("llamo");
    			this.chatScrollBottom();
          if(!this.FirstMotation){
            if(this.ultimos) this.loadingprovider.presentToast("Todos los mensajes han sido cargados");
            this.scrollActive=true;
            this.FirstMotation=true;
          }
    		}
      });

      this.mutationObserver.observe(this.myScrollContainer.nativeElement, {
        childList: true
      });
      this.ProcessNextTalk();
    }).catch(error=>{
      console.log(error);
      this.loadingprovider.dataReady();//this.loading=false;
      //this.loadingprovider.dismissLoading();
    });
  }

  ProcessNextTalk(){
    console.log("ProcessNextTalk");    
    this.chatProvider.get_next_talk_value(this.user.uid,this.chatBotRoom.BotUid).then(nexTalk => { 
      console.log(nexTalk,"nexTalk");
      if (nexTalk != 0) {
        console.log(1);
        this.loadingprovider.dataReady();/*this.loading=true;*/
        this.loadingprovider.showLoading("Cargando...");//this.loading=true;
        //console.log("nexTalk != 0");
        this.dialogFlow(nexTalk, [],nexTalk,() => {
          if(nexTalk!= 0) /*this.loading=false;*/this.loadingprovider.dismissLoading();
        })
      }else{
        console.log("nexTalk == 0");
        //this.loading=false;
      }
      if(!this.user_habit){
        this.user_habit = this.habitService.getHabitObserver()[0];
      }
    });
  }


  ionViewDidEnter(){
    //console.log("ionViewDidEnter");
		this.analytics.saveScreen("Coach Ana");
    //console.log(this.chatProvider.registroHabitoAna);
    if(this.chatProvider.registroHabitoAna.registrado||this.chatProvider.Mandatory_Video.finalize){
      if(this.chatProvider.registroHabitoAna.registrado){
        this.query=this.chatProvider.registroHabitoAna.categoria+"-"+this.chatProvider.registroHabitoAna.subCategoria;
        this.chatProvider.registroHabitoAna={registrado:false, categoria:null, subCategoria:null,ir:false}
      }
      if(this.chatProvider.Mandatory_Video.finalize){ 
        this.query="He terminado."; this.chatProvider.Mandatory_Video.finalize=false;
      }
      this.send();this.hideKeyboard();
    }
    if(this.chatProvider.registroHabitoAna.ir){
      this.chatProvider.registroHabitoAna.ir=false;
    }else{
      this.initListenNetword();
    }
  }


  closeChat() {
    this.navCtrl.pop();
  }

  onScrollStart() {
    //this.bottom=this.checkScroll();
    let dimensions = this.content.getContentDimensions();
    let scrollTop = this.content.scrollTop;
    let contentHeight = dimensions.contentHeight;
    let scrollHeight = dimensions.scrollHeight;
    if ( (scrollTop + contentHeight + 200) > scrollHeight) {
       this.bottom=false;
    } else {
      this.bottom=true;
    }
  }

  end(){
    let dimensions = this.content.getContentDimensions();
    let scrollTop = this.content.scrollTop;
    let contentHeight = dimensions.contentHeight;
    let scrollHeight = dimensions.scrollHeight;
    if ( (scrollTop + contentHeight + 200) > scrollHeight) {
       this.bottom=false;
    } else {
      this.bottom=true;
    }
  }

  checkScroll():boolean{ 
    if(this.content._scroll.ev.contentHeight<this.myScrollContainer.nativeElement.scrollHeight){
      return true;
    }else{
      return false;
    }
  }

  send() {
    this.hideKeyboard();
    if (this.authProvider.isOnline) {
      this.subTitle = this.label.writing;
      //this.chatProvider.getBotContexts(this.user.uid,this.chatBotRoom.BotUid).then(contexts => {
        //console.log("contextos",this.contexts);
        this.chat_message = {
          message: this.query,
          timestamp: timestampFs,
          user: this.user.uid,
          type: "text" 
        }
        let text = this.query;
        this.chatProvider.saveMessage(this.chatBotRoom.uid, this.chat_message).then(() => {
            this.dialogFlow(text, this.contexts.contexts,"0");
       }).catch(error=>{
        this.subTitle = this.label.online;
        this.query = "";
        let mensaje="Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles."
        if(error) mensaje=error;
        this.loadingprovider.presentToast(mensaje);
       })
      // }).catch(error=>{
      //   this.loadingprovider.presentToast("Parece que tu conexión a internet es inestable, mientras persista este problema, " +
      //   "algunas de las funciones no estarán disponibles.");
      // });
    } else {
      let message = "Parece que tu conexión a internet es inestable, mientras persista este problema, " +
        "algunas de las funciones no estarán disponibles."
      this.loadingprovider.presentToast(message);
    }
  }

  hideKeyboard(){
    if(this.platform.is('cordova')){
      this.authProvider.keyboardHide();
    }
  }

  writing() {
    if (this.query!=null&&this.query[0] !== ' ' && this.query.length > 0) {
      this.activeSend = true;
    } else {
      this.activeSend = false;
    }
  }

 dialogFlow(text, contexts,next_talk,callback?){
   this.espera=true;this.botPensado=true;
    ////console.log(text, contexts,"dialogFlow");
    this.chatProvider.dialogFlowV1(text, this.user.uid, this.user.name, this.chatBotRoom.uid, contexts,this.chatBotRoom.BotUid,next_talk,this.user.company.name).then((data:ContextsButtons) => {
      this.botPensado=false;
      setTimeout(()=>{
        this.espera=false;
      },1000);
      this.query = "";
      console.log("data",data);
      if(data!=null&&this.chatAnswer.lastUpdate<data.chatAnswer['lastUpdate']) {
        this.chatAnswer.lastUpdate = data.chatAnswer['lastUpdate'];
        this.chatAnswer.type = data.chatAnswer['type'];
        this.chatAnswer.buttons = data.chatAnswer['buttons'];
        if (data.chatAnswer['action']) {
          this.chatAnswer.action = data.chatAnswer['action'];
        }else{
          delete(this.chatAnswer.action);
        }
        console.log("botones actualizados por ajax",this.chatAnswer);
      }
      if(data!=null&&this.contexts.lastUpdate<data.contextData.lastUpdate){
        this.contexts.lastUpdate = data.contextData.lastUpdate;
        this.contexts.contexts = data.contextData.contexts;
        console.log("contextos actualizados por ajax",this.contexts);
      }
      console.log("this.chatProvider.dialogFlowV1->sucess",data)
      this.subTitle = this.label.online;
      this.hideKeyboard();
      //callback
      if(callback) callback();
    }).catch(error=>{
      console.log(error);
      this.procesarErrorDF(error);
    })
  }  

  pressButton(button) {
    console.log("//////////////////SIGUIENTE EJECUCION////////////////////");
    console.log(button,JSON.stringify(this.chatAnswer));
    let action = this.chatAnswer['action'];
    if (action) {
      switch (action) {
        case "create_new_habit":
          //console.log("NewHabitPage");
          this.chatProvider.registroHabitoAna.ir=true;
          this.navCtrl.push("NewHabitPage",{volverAna:true});
          //this.habitEvent = false;
          break;
        case "mandatory_video":
          console.log(this.chatAnswer);
          this.chatProvider.Mandatory_Video.view=true;
          this.navCtrl.push("MandatoryVideoPage",{volverAna:true,url:this.chatAnswer['url'],user:this.user});
          //this.habitEvent = false;
          break;
        case "stepsGoal":
          this.StepsGoal();
          break;
        case "register_evidence":
          this.evidenceCall();
          break;
        case "feed_record":
          this.FeedRecord();
          break;
        case "movement_record":
          this.MovementRecord();
          break;
        case "weight_record":
          this.WeightRecord();
          break;
        case "fat_record":
          this.FatRecord();
          break;
        case "muscle_record":
          this.MuscleRecord()
          break;
        case "open_portions":
          this.portionsMenu();
          break;
        case "alarmexercise":
          this.navCtrl.pop()
          this.navCtrl.push("AlarmSetupPage", {
            alarmType: 'exercise_reminder',
            alarmName: 'Ejercicio',
            chatAlarm: true
          });
          break;
        case "alarmfood":
          this.navCtrl.pop()
          this.navCtrl.push("AlarmSetupPage", {
            alarmType: 'alimentation_reminder',
            alarmName: 'Alimentación',
            chatAlarm: true
          });
          break;
        case "alarmmedicine":
          this.navCtrl.pop()
          this.navCtrl.push("AlarmSetupPage", {
            alarmType: 'medicine_reminder',
            alarmName: 'Medicina',
            chatAlarm: true
          });
          break;
        default:

      }
    } else {
      this.query = button;
      this.send();
      this.hideKeyboard();
    }
  }

  chatScrollBottom() {
    let that = this;
    if(this.checkScroll()){
      //Si tiene scroll
      if(!this.FirstMotation){
        //si aun no ha ejecutado el primer mutation observer
        this.scrollBottom(300,0).then(()=>{
          that.loadingprovider.dataReady();/*that.loading=false;*/that.loadingprovider.dismissLoading();
           that.bottom = false;
        });
      }else{
        this.scrollBottom(300,300).then(()=>{that.bottom = false;});
        setTimeout(() => {
          this.scrollBottom(300,300).then(()=>{that.bottom = false;});
        }, 500);
      }
    }else{
      if(!this.FirstMotation){
        that.loadingprovider.dataReady();/*that.loading=false;*/that.loadingprovider.dismissLoading();
      }
    }
  }

  tmScroll:any=null;
  scrollBottom(miliseconds: number, duration: number) {
    return  new Promise((resolve) => {
      let that = this;
	  clearTimeout(this.tmScroll);
      this.tmScroll = setTimeout(() => {
        if (that.content != null && that.content._scroll != null) {
          that.content.scrollToBottom(duration).then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      }, miliseconds)
	  //console.log( this.tmScroll);
    });
	
  }

  //Enviar al presionar Enter
  enterPress(key) {
    if (key == 13) {
      this.send();
    }
  }

  showToast(text,) {
    this.loadingprovider.presentToast(text);
  }
 
  //Hacer Zoom imagenes
  presentImage(myImage) {
    const imageViewer = this._imageViewerCtrl.create(myImage);
    imageViewer.present();
  }
  
  editImage(chatBotRoom){
	const modal = this.modalCtrl.create("AnaimgPage",{chatRoom:chatBotRoom});
    modal.present();
    modal.onDidDismiss((data)=>{
		if (data != null)
			chatBotRoom.imagen = data;
    });
  }

  //REGISTRAR EVIDENCIA

  evidenceCall() {
    let level = {
      option1: "Muy mal",
      option5: "Mal",
      option10: "Más o menos",
      option15: "Bien",
      option20: "Muy Bien",
    }
    this.setEvidenceAlert(level);
  }

  setEvidenceAlert(level) {
    let options = level;
    let that = this;
    let registerHabit = this.alertCtrl.create({
      title: "Registre su avance de habito",
      inputs: [
        {
          type: 'radio',
          label: options.option20,
          value: '20'
        },
        {
          type: 'radio',
          label: options.option15,
          value: '15'
        },
        {
          type: 'radio',
          label: options.option10,
          value: '10',
          checked: true
        },
        {
          type: 'radio',
          label: options.option5,
          value: '5'
        },
        {
          type: 'radio',
          label: options.option1,
          value: '1'
        }
      ],
      buttons: [
        {
          text: "Listo",
          handler: (data) => { that.registerEvidence(data, level) }
        }
      ]
    })
    registerHabit.present();
  }

  registerEvidence(data, level) {
    let aux = this.setDataEvidence(data)
    console.log("Data: "+JSON.stringify(data)+" Level: "+JSON.stringify(level)+" user_habit: "+JSON.stringify(this.user_habit))
    this.habitService.record_evidence(this.user_habit, aux).then(() => {
      this.analytics.EventWithData("AvanceHabito",aux.percent);
      this.callbalckChatBot(level['option' + data])
    }).catch(err=>{
      console.log(err)
    })
  }

  //ALIMENTACION
  FeedRecord() {
    let options = {
      option1: "Muy mal",
      option5: "Mal",
      option10: "Más o menos",
      option15: "Bien",
      option20: "Muy Bien",
    };
    let registerFeed = this.alertCtrl.create({
      title: "¿Cómo le ha ido con su alimentación?",
      inputs: [
        {
          type: 'radio',
          label: options.option20,
          value: '20'
        },
        {
          type: 'radio',
          label: options.option15,
          value: '15'
        },
        {
          type: 'radio',
          label: options.option10,
          value: '10',
          checked: true
        },
        {
          type: 'radio',
          label: options.option5,
          value: '5'
        },
        {
          type: 'radio',
          label: options.option1,
          value: '1'
        }
      ],
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let aux = this.setDataEvidence(data)
            this.dietprovider.save_diet_item(aux).then(() => {
              this.analytics.EventWithData("Alimentación",aux.percent);
              this.callbalckChatBot(options['option' + data]);
            })
          }
        }
      ]
    })
    registerFeed.present();
  }

  //Ejercicio
  MovementRecord() {
    let options = {
      option1: "Muy mal",
      option5: "Mal",
      option10: "Más o menos",
      option15: "Bien",
      option20: "Muy Bien",
    };
    let registerMovement = this.alertCtrl.create({
      title: "¿Cómo te ha ido haciendo ejercicio?",
      inputs: [
        {
          type: 'radio',
          label: options.option20,
          value: '20'
        },
        {
          type: 'radio',
          label: options.option15,
          value: '15'
        },
        {
          type: 'radio',
          label: options.option10,
          value: '10',
          checked: true
        },
        {
          type: 'radio',
          label: options.option5,
          value: '5'
        },
        {
          type: 'radio',
          label: options.option1,
          value: '1'
        }
      ],
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let aux = this.setDataEvidence(data)
            this.dietprovider.save_movement_item(aux).then(() => {
              this.analytics.EventWithData("Ejercicio",aux.percent);
              this.callbalckChatBot(options['option' + data]);
            })
          }
        }
      ]
    })
    registerMovement.present();
  }

  //Peso
  WeightRecord() {
    let registerMovement = this.alertCtrl.create({
      title: "Registra tu peso",
      inputs: [{ name: "kilos", placeholder: "Ingrese en kilos (ejem. 70.85)" },],
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let aux: DataItem = {
              percent: ""+parseFloat(data['kilos']),
              timestamp: new Date()
            }
            this.dietprovider.save_weight_item(aux).then(() => {
              this.analytics.appSeeEvent("Peso");
              this.callbalckChatBot(data['kilos'] + " KG.");
            })
          }
        }
      ]
    })
    registerMovement.present();
  }

  //Porcentaje de Grasa
  FatRecord() {
    let inputList  = [];
    for(let i=5;96>i;i++){
      inputList.push({ type: 'radio', label: i+"%", value:i },)
    }
    let registerFat = this.alertCtrl.create({
      title: "¿Cuál es su índice de grasa corporal?",
      inputs: [{ name: "percent", placeholder: "Ejemplo: 30.15" },],
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let percent = parseFloat(data['percent'])
            if(percent>5&&96>percent){
              let aux: DataItem = {
                percent: ""+percent,
                timestamp: new Date()
              }
              this.dietprovider.save_fat_item(aux).then(() => {
                this.analytics.appSeeEvent("Grasa");
                this.callbalckChatBot(percent + "% de grasa corporal");
              })
            }else{
              this.loadingprovider.presentToast("Ingrese un número entre 5.00 y 95.00, por favor");
              this.FatRecord();
            }
          }
        }
      ]
      /*inputs: inputList,
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let aux: DataItem = {
              percent: ""+parseFloat(data),
              timestamp: new Date().toISOString()
            }
            this.dietprovider.save_fat_item(aux).then(() => {
              this.analytics.appSeeEvent("Grasa");
              this.callbalckChatBot(data + "% de grasa corporal");
            })
          }
        }
      ]*/
    })
    registerFat.present();
  }

  //Resgistro de masa muscular
  MuscleRecord(){
    let inputList  = [];
    for(let i=5;96>i;i++){
      inputList.push({ type: 'radio', label: i+"%", value:i },)
    }
    let registerMuscle = this.alertCtrl.create({
      title: "¿Cuál es su porcentaje de masa muscular?",
      inputs: [{ name: "percent", placeholder: "Ejemplo: 50.25" },],
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let percent = parseFloat(data['percent'])
            if(percent>5&&96>percent){
              let aux: DataItem = {
                percent: ""+percent,
                timestamp: new Date()
              }
              this.dietprovider.save_muscle_item(aux).then(() => {
                this.analytics.appSeeEvent("Muscle");
                this.callbalckChatBot(percent + "% de masa muscular");
              })
            }else{
              this.loadingprovider.presentToast("Ingrese un número entre 5.00 y 95.00, por favor.");
              this.MuscleRecord();
            }
          }
        }
      ]
      /*
      inputs: inputList,
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let aux: DataItem = {
              percent: ""+parseFloat(data),
              timestamp: new Date().toISOString()
            }
            this.dietprovider.save_muscle_item(aux).then(() => {
              this.analytics.appSeeEvent("Muscle");
              this.callbalckChatBot(data + "% de músculo.");
            })
          }
        }
      ]*/
    })
    registerMuscle.present();
  }

  //Meta de Pasos
  StepsGoal() {
    let options = [
      "5000 pasos",
      "6000 pasos",
      "7000 pasos",
      "8000 pasos",
      "9000 pasos",
      "10000 pasos",
      "11000 pasos",
      "12000 pasos"
    ];
    let registerFeed = this.alertCtrl.create({
      title: "¿Cuál es su meta de pasos diaros?",
      inputs: [
        { type: 'radio', label: "5000 pasos", value:"0" },
        { type: 'radio', label: "6000 pasos", value:"1" },
        { type: 'radio', label: "7000 pasos", value:"2" },
        { type: 'radio', label: "8000 pasos", value:"3" },
        { type: 'radio', label: "9000 pasos", value:"4" },
        { type: 'radio', label: "10000 pasos", value:"5" },
        { type: 'radio', label: "11000 pasos", value:"6" },
        { type: 'radio', label: "12000 pasos", value:"7" }
      ],
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let value = parseInt(data)
            this.user.steps_goal = 5000 + (value*1000);
            this.userProvider.updateUser(this.user).then(() => {
              this.analytics.appSeeEvent("CambioPasos");
              this.callbalckChatBot(options[value]);
            })
          }
        }
      ]
    })
    registerFeed.present();
  }


  setDataEvidence(data) {
    let aux: DataItem = {
      percent: data,
      timestamp: new Date()
    }
    this.hideKeyboard();
    return aux
  }

 callbalckChatBot(query) {
    this.hideKeyboard();
    this.query = query;
    this.send();
  }


  ionViewDidLeave(): void {
    //console.log("ionViewDidLeave",this.chatProvider.BotAnaMsjObserver,this.mutationObserver);
    if(!this.chatProvider.registroHabitoAna.ir&&!this.chatProvider.Mandatory_Video.view){
      if(this.subscriptionObservables["msjBot"]) {
        this.subscriptionObservables["msjBot"].unsubscribe();delete(this.subscriptionObservables["msjBot"]);
      }
      if(this.subscriptionObservables["onDisconnect"]) {
        this.subscriptionObservables["onDisconnect"].unsubscribe();delete(this.subscriptionObservables["onDisconnect"])
      }
      if(this.mutationObserver)  {
        this.mutationObserver.disconnect();this.mutationObserver=null;
      }
      this.chatProvider.stop_ButtonsContexts();
      if(this.paginationObserver.length>0){
        for (var i = 0; i < this.paginationObserver.length; ++i) {
          this.paginationObserver[i].unsubscribe();
        }
        this.paginationObserver=[];
      }
      //this.loading = false;
    }
    this.loadingprovider.dismissLoading()
    //console.log("salio ionViewDidLeave",this.chatProvider.BotAnaMsjObserver,this.mutationObserver);
  }

  procesarErrorDF(error){
    //console.log(error);
    setTimeout(()=>{
      this.espera=false;
    },1000);
    this.subTitle = this.label.online;
    this.botPensado=false;
    this.query = "";
    this.hideKeyboard();
    this.loadingprovider.dataReady();/*this.loading=false;*/this.loadingprovider.dismissLoading();
    let mensaje="Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles."
    if(error&&(error.status!=0)) mensaje=error;
    this.loadingprovider.presentToast(mensaje);
  }

  initListenNetword(){
    this.subscriptionObservables["onDisconnect"]=this.network.onDisconnect().subscribe(() => {
      //desconectado
      setTimeout(()=>{
        this.espera=false;
      },1000);
      this.subTitle = this.label.online;
      this.botPensado=false;
      this.query = "";
      this.hideKeyboard();
    });
  }


  getMore(): Promise<any> {
    //console.log("getMore");
    return new Promise((resolve) => {
      if(this.isRefresher){
        ////console.log("hay una peticion pendiente");
        return resolve();
      }
      this.isRefresher = true;
      this.chatProvider.more(this.lastVisible,this.chatBotRoom.uid).then(observable=>{
        let x=moment(new Date());
        this.paginationObserver.push(observable.subscribe(messages => {
        console.log("length pag"+messages.length);
        let y=moment(new Date());
          this.time=(moment.duration(y.diff(x))).as('seconds')+"";
          this.ngzone.run(() => {
            this.lastVisible =  (messages.length>49)?messages[messages.length-1].payload.doc:null;
            this.scrollActive=(this.lastVisible)?true:false;
            messages=<any>messages.map(a  =>{
              let x=a.payload.doc.data();
              x.metadata=a.payload.doc.metadata;
              return x; 
            });
            //@ts-ignore
            this.fromCache=(messages.length>0)?messages[0].metadata.fromCache+"":'';
            //if(infiniteScroll)infiniteScroll.complete();
            //alert("nuevo emnsaje de ana");
            ////console.log("tamaño anterior: ",this.content.getContentDimensions());
            let heightAnt=this.content.getContentDimensions().scrollHeight;
            for (var i = 0; i < messages.length; ++i) {
              this.chatBotRoom.messages.unshift(messages[i]);
            }
            setTimeout(() => {
              if(this.content) {
                let dimensions = this.content.getContentDimensions();
                ////console.log(new Date().getTime(),dimensions,dimensions.scrollTop,this.isRefresher,this.scrollActive);
                this.isRefresher = false;
                this.threshold=(Math.round(dimensions.scrollHeight*0.35))+"px";
                if(dimensions.scrollTop<=100){
                  ////console.log("Finalizo peticion pendiente");
                  ////console.log("debo bajarlo a la posicion de la pagina anterior");
                  this.content.scrollTo(0,(dimensions.scrollHeight-heightAnt),0);
                }else{
                  ////console.log("Finalizo peticion pendiente");
                }
              }
              //if(!this.scrollActive) this.loadingprovider.presentToast("Todos los mensajes han sido cargados");
              return resolve();
            },500);
            ////console.log("mensaje de ana 2",messages,"mensaje guarados",this.chatBotRoom.messages);
          });
        },error=>{
          return resolve();
        }));
      });
    });
  }

  //funcion para suscribirse a los cambios en los contextos y los botones de un chatBot
  suscribirContextButtons(){
    console.log("suscribirContextButtons");
    this.suscriptionContext();
    this.suscriptionButton();
  }

  suscriptionButton(){
    this.chatProvider.get_buttons(this.user.uid,this.bot,answer => {
      if(answer!=null){ 
       if(this.chatAnswer.lastUpdate<answer.lastUpdate){
          this.chatAnswer.lastUpdate = answer.lastUpdate;
          this.chatAnswer.type = answer['type'];
          this.chatAnswer.buttons = answer['buttons'];
          if (answer['action']) {
            this.chatAnswer.action = answer['action'];
          }else{
            delete(this.chatAnswer.action);
          }
          if (answer['url']) {
            this.chatAnswer.url = answer['url'];
          }else{
            delete(this.chatAnswer.url);
          }
          console.log("botones actualizados por observable",this.chatAnswer);
        }
      }
    });
  }

  suscriptionContext(){
    this.chatProvider.get_Contexts(this.user.uid,this.bot,(contexts:ChatContext) => { 
      if(contexts){ 
        if(this.contexts.lastUpdate<contexts.lastUpdate){
          this.contexts.lastUpdate = contexts.lastUpdate;
          this.contexts.contexts = (contexts.contexts!=null)?contexts.contexts:[];
          console.log("contextos actualizados por observable",this.contexts);
        }
      }
    });
  }

  async portionsMenu(){
    let types = await this.dietprovider.getTypes(); let options: option[]=[];console.log(types);
    for(let typ of types){if(typ.type!='vegetables_lowcarb' && typ.type!='animals_light'){options.push({type:"radio",label:typ.title,value:typ.type})}} 
    console.log(options); 
    this.alerts.MultipleOption("Seleccione un tipo de producto:",options).then(result=>{
      if(result=="animals")result="animal"; this.processRules(result).then(filter => { console.log(filter); this.dialogFlow(filter, [],filter,() => {}); });
    }).catch(err=>{console.log("Porciones cancelado")}) 
  }

  async processRules(food){
    let rules = await this.dietprovider.getRules();
    console.log(this.user.diet)
    if(this.user.diet!=undefined&&this.user.diet!='Empty'){
      let diet = this.user.diet.split("-");
      for(let rul of rules){      
        console.log(diet[rul.position])
        if(diet[rul.position]=="si"){
          let change = rul.replace.split("-");
          if(food == change[0]){
            food = change[1];
          }
        }
      }
      return food;
    }else{
      return "no_diet";
    }
  }

}
