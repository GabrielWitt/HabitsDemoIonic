import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, AlertController, ToastController, Loading, LoadingController } from 'ionic-angular';
import { User } from "../../interfaces/user";
import { ChatRoom } from "../../interfaces/chat-room";
import { UserProvider } from '../../providers/user/user';
import { Realtime } from '../../providers/social/social';
import { ChatProvider } from '../../providers/chat/chat';
//import { AuthProvider } from '../../providers/auth/auth';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { SettingsProvider } from '../../providers/settings/settings';

@IonicPage()
@Component({
  selector: 'page-social',
  templateUrl: 'social.html',
})
export class SocialPage {
  loaderUser: Loading;
  user: User;
  SocialRooms: ChatRoom[];
  TeamRooms: ChatRoom[];
  chatBotRoom: ChatRoom = { messages: [], name: '' };//Replace
  chatBotRooms: ChatRoom[] =[];
  myGroupshow: boolean;
  myGroupColor: boolean;
  user_uid = "";
  cerrado:boolean=false;
  label: any;

  constructor(
    private navCtrl: NavController,
    private chatService: ChatProvider,
    public toast: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private chatlistener: Realtime,
    private userprovider: UserProvider,
    private ngzone:NgZone, 
  	private analytics:AnalyticsProvider,
    private language: SettingsProvider
  ) {
    this.label = this.language.getLanguage('SocialPage'); 
    this.loaderUser = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Cargando...'
    });
    this.loaderUser.present();
    this.user = this.userprovider.static_user();
    this.user_uid = this.user.uid;
    this.chatlistener.company_card_list(this.user)
     this.chatlistener.load_social_rooms().then(SocialRooms => {
      //console.log("SocialRooms",SocialRooms)
      this.getTeamRooms();
      this.SocialRooms =SocialRooms;
      this.chatService.getChatsBotsRoomsData(this.user).then(bot_rooms =>{
        //data se mantiene actualizada a traves de un  boservable de las sala de chats con los bots
        this.chatBotRooms=[];
        for (let index in bot_rooms) {
          bot_rooms[index].joined=true;
          this.chatBotRooms.push(Object.assign({},bot_rooms[index]));
        }
        this.loaderUser.dismiss().catch(() => {});
        this.cerrado=true;
      });
    });
    this.myGroup();
    setTimeout(()=>{
      if(!this.cerrado){
        this.loaderUser.dismiss().catch(() => {});;
        this.cerrado=true;
      }
    },4000)
  }

  getTeamRooms(){
    this.chatlistener.load_team_rooms().then(TeamRooms => {
      this.TeamRooms = TeamRooms;
    });
  }

  getNotread(index){
    this.ngzone.run(() => {
      let num = 0
      if(this.SocialRooms[index].NotRead) num = this.SocialRooms[index].NotRead
      return num;
    })
  }

  ionViewDidLoad() {
    this.chatlistener.disableChatRoom("");
	
    //console.log("disable")
  }


  ionViewDidEnter() {
    this.myGroup();
    this.analytics.saveScreen("Grupos Sociales");
  } 

  closeWindow() {
    this.navCtrl.pop();
  }

  newSocialChat(){
    this.navCtrl.push("NewChatRoomPage")
  }

  goChatBot(uid){
    this.navCtrl.push("ChatbotPage", { 'user': this.user, bot:uid});
    /*if (this.auth.AppIsOnline()) {
      this.navCtrl.push("ChatbotPage", { 'user': this.user });
    } else {
      this.showToast('No disponible sin conexión...', 'top', false, 3000);
    }*/
  }

  async goChatGroup(chatroom,team?){
    //if (this.auth.AppIsOnline()) {
    //console.log(chatroom)
    let last = await this.chatlistener.getMyCard();
    if(last!=null&&last['last_online']){ last = last['last_online'] }else{ last = "" }
    let notread = chatroom.notread
    this.navCtrl.push("ChatPage",{group_uid:chatroom.uid,last_online:last,notread:notread,team:team});
    /*} else {
      this.showToast('No disponible sin conexión...', 'top', false, 3000);
    }*/
  }

  getItemview(join){
    if(this.myGroupshow == join){
      return true;
    }else{
      return false
    }
  }

  myGroup(){
    this.myGroupshow = true
  }

  allGroup(){
    this.myGroupshow = false
  }

  joinChatGroup(group){
    let prompt = this.alertCtrl.create({
      title: '¿Estás seguro que quieres unirte a: "'+ group.name +'"?',
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirmar',
          handler: data => {
            this.confirmChatGroup(group);
          }
        }
      ]
    });
    prompt.present();
  }

  async confirmChatGroup(group){ 
    let card= await this.chatlistener.getMyCard();  
    this.chatService.join_group(card, group).then(() => {
      let message = "Te has unido al grupo " +group.name;
      this.showToast(message, 'bottom', true, 3500);
      this.myGroup();
    })

  }

  showToast(text, position, showOk, duration) {
    let toast = this.toast.create({
      message: text,
      duration: duration,
      position: position,
      showCloseButton: showOk,
      closeButtonText: 'OK'
    });
    toast.present();
  }

  getArraData(){
    //@ts-ignore
    return  <any>Object.values(this.SocialRooms);
  }

	public goToPage(page: string) {
    if(page=='SocialPage'){
      console.log('Already in this page')
    }else if(page=='DashboardPage'){
		  this.navCtrl.setRoot('DashboardPage')
	  }else if(page == "ranking") {
      this.navCtrl.push('NewsPage', { tab: "rankingTab",news:[]},{animate:false});
    }else{
      this.navCtrl.pop({animate:false});
      this.navCtrl.push(page,{},{animate:false});
    }
	}

}
