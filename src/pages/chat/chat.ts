import { Component, ViewChild, NgZone, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Content, Events, LoadingController, Loading, Platform, ViewController, ToastController, ActionSheetController } from 'ionic-angular';
import { User } from "../../interfaces/user";
import { ChatRoom } from "../../interfaces/chat-room";
import { ChatAnswer } from '../../interfaces/chat-answer';
import { ChatMessage } from '../../interfaces/chat-message';
import { Member } from '../../interfaces/member';
import { Keyboard } from '@ionic-native/keyboard';
import { ImageViewerController } from 'ionic-img-viewer';
import { Realtime } from '../../providers/social/social';
import { ChatProvider } from '../../providers/chat/chat';
import { UserProvider } from '../../providers/user/user';
import { ImagesProvider } from '../../providers/images/images';
import { AuthProvider } from '../../providers/auth/auth';
import { loadingProvider } from '../../providers/alert/alert';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { NotificationProvider } from '../../providers/notification/notification';
import { SettingsProvider } from '../../providers/settings/settings';

@IonicPage()
@Component({ 
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  @ViewChild(Content) content: Content;
  @ViewChild('scrollMi',{read: ElementRef}) private myScrollContainer: ElementRef;
  bottom = false;
  user: User;
  subTitle: string;
  chatBotRoom: ChatRoom;
  chatAnswer: ChatAnswer;
  query: string;
  hideWriting: boolean;
  chat_message: ChatMessage;
  display_messages: ChatMessage[];
  nextTalk: string;
  user_icon = "";
  loadingChatMessages: Loading;
  isOnline:boolean;
  activeSend: boolean;
  group_uid: string;
  chat_user_info: Member;
  user_icons: string[];
  user_names: string[];
  charnumber: number = 0;
  chatmessagecount = 0
  last = "";
  notread="";
  _imageViewerCtrl: ImageViewerController;
  mutationObserver: MutationObserver;
  default = 20;refres:boolean=false;
  mensajesInicial:number;
  scrollActive:boolean=false;
  threshold:string="500px";
  FirstMotation:boolean=false;
  paginationObserver:any=[];
  time='';
  test = false;
  label:any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private chatService: ChatProvider,
    public events: Events,
    public loadingCtrl: LoadingController,
    private chatlistener: Realtime,
    private ngzone:NgZone,
    public platform: Platform,
    public keyboard: Keyboard,
    public actionSheetCtrl: ActionSheetController,
    private userprovider: UserProvider,
    public imageViewerCtrl: ImageViewerController,
    public viewCtrl: ViewController,
    public imgs: ImagesProvider,
    public toastCtrl: ToastController,
    public authProvider: AuthProvider,
	  private analytics:AnalyticsProvider,
    public loadingService: loadingProvider,
    public notificationService:NotificationProvider,
    private language: SettingsProvider
    ) {
      this.label = this.language.getLanguage('ChatPage'); 
    this.group_uid = this.navParams.get('group_uid');
    //if(this.navParams.get('last_online')) this.last = this.navParams.get('last_online');
    this.user = this.userprovider.static_user();
    this.subTitle = this.label.online;
    this.activeSend = false;
    //this.user = this.userprovider.static_user();
    this.chatAnswer = { type: 'text' }
    this.user_icon = "./assets/user_icons/icon" + this.user.photo + ".png";
    if(this.user.picture) this.user_icon = this.user.picture
    this.chatBotRoom = { messages: [], name: '', picture: "./assets/imgs/notAvailable.jpg",uid:'' }
    this.updateUserData({ conected_chat:true,conected_app:true, mode_app:1},true);
    this._imageViewerCtrl = imageViewerCtrl;
    this.isOnline = this.authProvider.AppIsOnline();
  }

  ngOnInit() {
  }

  room_user_cards =[];
  loadUserIcons(){
    this.room_user_cards = []
    let icons = [];
    let names = [];
    this.chatlistener.user_card_list(this.chatBotRoom.members).then(user_card_list => {
      //////console.log("chat.ts->loadUserIcons",user_card_list);
      this.room_user_cards = user_card_list;
      user_card_list.forEach(user_card=>{
        icons[user_card.uid] = user_card.picture ? user_card.picture : "./assets/user_icons/icon0.png";
        names[user_card.uid] = user_card.name;
      })
    })
    this.user_icons = icons;
    this.user_names = names;
    //////console.log(this.user_icons,this.user_names,this.user);
  }

  updateUserData(status,x){
    this.userprovider.getUserCard(this.user.uid).then(card => {
      let user_img = "./assets/user_icons/icon"+this.user.photo+".png";
      if(this.user.picture) user_img = this.user.picture;
      let gruposAux={};
      if(card.groups!=null){
        gruposAux=card.groups;
        ////console.log("se actualizo la fecha");
        if(gruposAux[this.group_uid]!=null&&x) this.last=gruposAux[this.group_uid];
      }
      gruposAux[this.group_uid]=new Date().toISOString();
      this.chat_user_info = {
        last_online: new Date().toISOString(),
        name: this.user.name + " " + this.user.last_name,
        photo: user_img,
        status: status,
        uid: this.user.uid,
        writing: false,
        groups:gruposAux
      }
      this.chatService.updateUserCard(this.chat_user_info)
    }).catch(Error=>{
      ////console.log("error loco",Error);
    })
  }

  ionViewCanEnter() {

  }

  ionViewDidLoad() {
    this.presentLoading("Cargando...");
    let team = false;
    if(this.navParams.get('team')) team = true;
    let that = this;
    this.chatlistener.get_social_room(this.group_uid,team).then(SocialRoom =>{
      //Por ahora voy a asumir que el observable de mensajes respondio, pero puede darse el caso
      //que se llegue a esta pantalla y aun no carguen esos datos; lo cual afectaria en esta pagina
      that.chatlistener.enableChatRoom(this.group_uid);
      that.chatBotRoom = SocialRoom; 
      console.log(that.user,that.chatBotRoom);
      that.scrollActive=(that.chatBotRoom.lastVisible)?true:false;
      that.mensajesInicial=that.chatBotRoom.messages.length;
      that.loadUserIcons();
      that.notViewBar();
      if(that.chatBotRoom.messages.length==0){
        that.scrollActive=true;
        this.dismissLoading();
      }
      setTimeout(() => {
        if(this.content) {
          let dimensions = this.content.getContentDimensions();
          this.threshold=(Math.round(dimensions.scrollHeight*0.35))+"px";
        }
      },500);
      setTimeout(()=>{
        this.analytics.saveScreen("Chat Social");
        this.analytics.EventWithData("ChatSocial",{room_name:this.chatBotRoom.name})
        this.chatScrollBottom(true);
        this.dismissLoading();
        if(that.chatBotRoom.hasOwnProperty("ultimos")){
          that.scrollActive=true;
          this.dismissLoading();
          this.loadingService.presentToast("Todos los mensajes han sido cargados");
        }
      },1000);
    }).catch(error=>{
      ////console.log(error);
      this.dismissLoading();
    })
    //Para que cada vez que se agregue un elemento a la lista de mensajes baje el scroll
    this.mutationObserver = new MutationObserver((mutations) => {
        ////console.log("mutations observer",this.mensajesInicial,this.chatBotRoom.messages.length,this.content.directionY,this.refres);
        if (!this.refres&&this.content.directionY!="up"){
          //////console.log("llamo");
          this.chatScrollBottom(true);
          if(!this.FirstMotation){
            this.scrollActive=(that.chatBotRoom.lastVisible)?true:false;////console.log(this.scrollActive);
            this.FirstMotation=true;
          }
        }
        if(this.mensajesInicial!=null&&this.mensajesInicial<this.chatBotRoom.messages.length&&!this.refres){
          this.notview="0x";
        }
    });

    this.mutationObserver.observe(this.myScrollContainer.nativeElement, {
        childList: true
    });
  }

  msmListListener = 0;
  paginationMessages(){
    if(this.msmListListener == 0){
      this.msmListListener = this.chatBotRoom.messages.length;
      if(this.chatBotRoom.messages.length > 20 ){ this.default = 20;}
      else{this.default =this.chatBotRoom.messages.length}
    }else if(this.msmListListener != this.chatBotRoom.messages.length){
      this.msmListListener = this.chatBotRoom.messages.length;
      this.default = this.default + 1;
    }
    if(this.default > this.chatBotRoom.messages.length) this.default = this.chatBotRoom.messages.length
    let start = this.chatBotRoom.messages.length - this.default;
    return start;
  }

  notview = "0x";

  notViewBar(){
    ////console.log("notViewBar");
    if(this.last){
      for (var j = 0; j < this.chatBotRoom.messages.length; j++) {
        ////console.log(new Date(this.chatBotRoom.messages[j].timestamp)+" > "+new Date(this.last)+""+(new Date(this.chatBotRoom.messages[j].timestamp) > new Date(this.last)))
        if (this.notview=="0x"&&(new Date(this.chatBotRoom.messages[j].timestamp) > new Date(this.last))){ 
          this.notview = this.chatBotRoom.messages[j].timestamp;
          ////console.log(this.chatBotRoom.messages.length - j)
          this.notread = ""+(this.chatBotRoom.messages.length - j);
          break;
        }
      }
    }else{
      ////console.log("no tenia nada el this.last");
    }
  }

  checkNotview(timestamp){
    return (this.notview == timestamp)
  }

  showGroupInfo(){
    this.navCtrl.push("GroupInfoPage", {group:this.chatBotRoom,members:this.room_user_cards});
  }

  ionViewWillEnter(): void {
    this.navCtrl.swipeBackEnabled = true;
  }

  ionViewDidLeave(): void {
    this.navCtrl.swipeBackEnabled = false;
    this.chatlistener.setActual(false,this.group_uid);
    this.chatBotRoom.NotRead=0;
    if(this.mutationObserver)  this.mutationObserver.disconnect();
    if(this.paginationObserver.length>0){
      for (var i = 0; i < this.paginationObserver.length; ++i) {
        this.paginationObserver[i].unsubscribe();
      }
      this.paginationObserver=[];
    }
    this.events.unsubscribe('chatActual:messagues',null);
  }

  ionViewDidEnter(){
	  this.analytics.appSeeEvent("El usuario esta en un chat");
    this.chatlistener.setActual(true,this.group_uid);
    
  }

  onScrollStart() {
    //this.bottom=this.checkScroll();
    let dimensions = this.content.getContentDimensions();
    let scrollTop = this.content.scrollTop;
    let contentHeight = dimensions.contentHeight;
    let scrollHeight = dimensions.scrollHeight;
    this.ngzone.run(() => {
      if ( (scrollTop + contentHeight + 200) > scrollHeight) {
         this.bottom=false;
      } else {
        this.bottom=true;
      }
    });
  }

  end(){
    let dimensions = this.content.getContentDimensions();
    let scrollTop = this.content.scrollTop;
    let contentHeight = dimensions.contentHeight;
    let scrollHeight = dimensions.scrollHeight;
    this.ngzone.run(() => {
      if ( (scrollTop + contentHeight + 200) > scrollHeight) {
         this.bottom=false;
      } else {
        this.chatBotRoom.NotRead=0;
        this.bottom=true;
      }
    });
  }

  checkScroll():boolean{   
    if(this.content._scroll.ev.contentHeight<this.myScrollContainer.nativeElement.scrollHeight){
      return true;
    }else{
      return false;
    }
  }

  chatScrollBottom(x) {
    let that = this;
    if(this.checkScroll()){
      //Si tiene scroll
      if(!this.FirstMotation){
        //si aun no ha ejecutado el primer mutation observer
        this.scrollBottom(500,0).then(()=>{
           that.dismissLoading();
           that.bottom = false;
        });
      }else{
        ////console.log("chatScrollBottom sin FirstMotation");
        this.scrollBottom(500,500).then(()=>{
          that.bottom = false;
        });
      }
    }else{
      if(!this.FirstMotation){
        that.dismissLoading();
      }
    }
  }

  tmScroll:any=null;
  scrollBottom(miliseconds: number, duration: number) {
    return new Promise((resolve) => {
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
      }, miliseconds);
    });
  }

  enterPress(key) {
    if (key == 13) {
      this.send();
      this.authProvider.keyboardHide();
    }
  }

  writing(event){
    this.notview = "0x";
    if(event == 'paste'){
      this.activeSend = true; 
      ////console.log(this.query)
    }else if(this.query!=null&&this.query[0] !== ' ' && this.query.length > 0){
      this.charnumber = this.query.length;
      this.activeSend = true; 
      this.subTitle = this.label.writing;
    }else{
      this.activeSend = false; 
      this.subTitle = this.label.online;
    }
  }

  send() {
    this.notview = "0x";
    this.authProvider.keyboardHide();
    this.checkLink().then(type=>{
      this.chatAnswer = {};
        this.chat_message = {
          message: this.query,
          timestamp: new Date(),
          user: this.user.uid,
          type: type
        }
        this.chatService.saveMessage(this.group_uid, this.chat_message)  
        this.charnumber = 0; 
        this.query = null;
        this.subTitle = this.label.online;
        this.activeSend = false; 
        let status={ conected_chat:true,conected_app:true, mode_app:1}
        this.updateUserData(status,false);
    })
  }

  checkLink(): Promise<string> {
    return new Promise(resolve => {    
      if(this.query.includes("https://youtu.be/") || this.query.includes("https://www.youtube.com/watch?v=") || this.query.includes("https://www.youtube.com/embed/")){
        this.query = this.query.replace("https://youtu.be/","https://www.youtube.com/embed/");
        this.query = this.query.replace("https://www.youtube.com/watch?v=","https://www.youtube.com/embed/");
        this.query = this.query.replace("https://m.youtube.com/watch?v=","https://www.youtube.com/embed/");
        this.query = this.query.replace(/((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g, '||$1||');
        resolve ("video");
      }else if(this.query.includes("http://") || this.query.includes("https://")){
        this.query = this.query.replace(/((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g, '||$1||');
        resolve ("link");
      }else if(this.query.includes("www.")){
        this.query = this.query.replace("www.",'||http://www.');
        resolve ("link");
      }else{
        resolve ("text");
      }
    })
  }

  closeChat() {
    //this.chatService.off_chat_bot_room();
    this.chatlistener.InitRealtime();
    let status={ conected_chat:false,conected_app:true, mode_app:1}
    this.updateUserData(status,false);
    this.chatlistener.disableChatRoom(this.group_uid);
    this.navCtrl.pop();
  }

  //IMAGEN dobleclick  
  tap = 0;
  tapEvent(img) {
    ////console.log(this.tap,img)
    let that = this;
    this.tap++
    setTimeout(function() {that.tap=0;}, 3000);
    //if(this.tap>1){
      this.presentImage(img.element);
  //  }
  }
 
  presentImage(myImage) {
    const imageViewer = this._imageViewerCtrl.create(myImage);
    imageViewer.present();
  }

  openBrowse(message) {
    let article = this.getChatPart(message,1)
    window.open(article, '_system')
  }

  getChatPart(message:string,index){
    let xml = message.split("||")[index]
    if(xml) xml = xml.replace("||","")
    return xml
  }

  doRefresh(refresher?) {
    this.refres=true
    this.presentLoading("Cargando...");
    this.ngzone.run(() => {
      this.default = this.default+20;
      this.paginationMessages();
        setTimeout(() => {
          this.refres=false;
          if (this.content) {
            this.content.scrollToTop()
            if(refresher)refresher.complete();
            this.dismissLoading();
          }
        },300) 
      /*this.chatlistener.refresh_more_messages(this.group_uid,this.default).then(messages => {
        this.chatBotRoom.messages =  messages;
        //this.content.scrollToTop()
      });*/
    })
  }

  //MultimediaOptions
  presentActionSheet() {
    this.notview = "0x";
    const actionSheet = this.actionSheetCtrl.create({
      title: this.label.actionSheetTitle,
      buttons: [
        {
          text: this.label.camera,
          icon: 'camera',
          role: 'camera',
          handler: () => {
            this.CameraImage(1);
          }
        }, {
          text: this.label.gallery,
          icon: 'images',
          role: 'images',
          handler: () => {
            this.CameraImage(2);
          }
        }, {
          text: this.label.cancel,
          icon: 'close',
          role: 'cancel',
          handler: () => {
            ////console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  CameraImage(x){
    this.imgs.addCameraPhoto(x,true).then(url=>{
      this.uploadImg(url)
    }).catch(error=>{
      this.loadingService.showToast(error, 'bottom', false, 3000);
    });
  }
  
  percent = "0%";
  loader: any;
  uploadImg(url){
    this.loader = this.loadingCtrl.create({
      content: this.percent,
    })
    this.loader.present();
    this.imgs.upload_image(url, new Date().toISOString(),'social_imgs',progress =>{
      this.percent = Math.round(progress)+"%";
      this.refreshLoader()
    }).then(image=>{
      this.percent = "0%";
      this.publish(image);
      this.loader.dismiss().catch(() => {});;
    })
  }

  refreshLoader(){
    this.loader.dismiss().catch(() => {});;
    this.loader = this.loadingCtrl.create({
      content: this.percent,
    })
    this.loader.present();
  }

  publish(url){
      let chat_message = {
        message: url,
        timestamp: new Date(),
        user: this.user.uid,
        type: "img"
      }
      this.chatService.saveMessage(this.group_uid, chat_message).then(()=>{
        this.toastCtrl.create({
          message: "Operación exitosa.",
          duration: 1000,
          position: 'middle'
        })
      })  
  }

  presentLoading(mensaje) {
    if(this.loadingChatMessages==null){
        this.loadingChatMessages = this.loadingCtrl.create({
        content: mensaje,
        spinner: 'dots'
      });
      this.loadingChatMessages.present();
    }
  } 
 
  dismissLoading() {
    if (this.loadingChatMessages!=null) {
      this.loadingChatMessages.dismiss().catch(() => {});;
      this.loadingChatMessages=null;
    }
  }

  getImg(idUser){
    if(this.user_icons[idUser]!=null){
      return  this.user_icons[idUser];
    }else{
      return "./assets/user_icons/icon0.png";
    }
  }

  getMore(): Promise<any> {
    ////console.log("getMore");
    return new Promise((resolve) => {
      if(this.refres){
        //////console.log("hay una peticion pendiente");
        return resolve();
      }
      this.refres = true;
      this.chatService.more(this.chatBotRoom.lastVisible,this.chatBotRoom.uid).then(observable=>{
        this.paginationObserver.push(observable.subscribe(messages => {
          this.ngzone.run(() => {
            this.chatBotRoom.lastVisible =  (messages.length>49)?messages[messages.length-1].payload.doc:null;
            this.scrollActive=(this.chatBotRoom.lastVisible)?true:false;////console.log(this.scrollActive);
            messages=<any>messages.map(a  =>{
              let x=a.payload.doc.data();
              x.metadata=a.payload.doc.metadata;
              x.uid=a.payload.doc.id;
              return x; 
            });
            let heightAnt=this.content.getContentDimensions().scrollHeight;
            for (var i = 0; i < messages.length; ++i) {
              this.chatBotRoom.messages.unshift(messages[i]);
              if(messages[i].type.toString()=="img") this.imgs.addSrcMessage(messages[i]);
            }
            setTimeout(() => {
              if(this.content) {
                let dimensions = this.content.getContentDimensions();
                this.refres = false;
                this.threshold=(Math.round(dimensions.scrollHeight*0.35))+"px";
                if(dimensions.scrollTop<=100){
                  //////console.log("Finalizo peticion pendiente");
                  //////console.log("debo bajarlo a la posicion de la pagina anterior");
                  this.content.scrollTo(0,(dimensions.scrollHeight-heightAnt),0);
                }else{
                  //////console.log("Finalizo peticion pendiente");
                }
              }
              if(!this.scrollActive) this.loadingService.presentToast("Todos los mensajes han sido cargados");
              return resolve();
            },500);
            //////console.log("mensaje de ana 2",messages,"mensaje guarados",this.chatBotRoom.messages);
          });
        },error=>{
          alert("error a: "+JSON.stringify(error));
          return resolve();
        }));
      });
    });
  }


  existsImg(url,elem){
    try{
      //console.log(elem._src,elem.element);
      return url;
      //  this.imgs.existInCache(url).then(exist=>{
      //   return exist;
      // });
    }catch(e){
      //console.log(e);
    }
   
  }

}