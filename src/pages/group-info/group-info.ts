import { Component/*, NgZone*/ } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { User } from "../../interfaces/user";
import { ChatRoom } from "../../interfaces/chat-room";
import { UserProvider } from '../../providers/user/user';
import { loadingProvider } from '../../providers/alert/alert';
import { ChatProvider } from '../../providers/chat/chat';
import { Realtime } from '../../providers/social/social';
//import { HabitProvider } from '../../providers/habit/habit';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AngularFirestore } from "@angular/fire/firestore";

@IonicPage()
@Component({
  selector: 'page-group-info',
  templateUrl: 'group-info.html',
})
export class GroupInfoPage {
  group_uid: string;
  chatBotRoom: ChatRoom ={ name: "", members: [] };
  members = [];
  habit: string = "";
  category: string = "";
  MyUser: User;
  AddTeam=false;
  silence:boolean;
  procesando:boolean=false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private chatService: ChatProvider,
    private alertCtrl: AlertController,
    private toast: ToastController,
    private userprovider: UserProvider,
    private alertService:loadingProvider,
	  private analytics:AnalyticsProvider,
    private socialService: Realtime,
    private fireDB: AngularFirestore,

  ) {
    this.MyUser = this.userprovider.static_user();
    this.chatBotRoom = this.navParams.get('group');console.log(this.chatBotRoom);
    this.analytics.saveScreen("Info Grupo")
    this.members = this.navParams.get('members');
    this.group_uid = this.chatBotRoom.uid;
    this.silence=this.chatBotRoom.members[this.MyUser.uid];
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad GroupInfoPage');
  }

  confirmChatGroup(){
    let prompt = this.alertCtrl.create({
      title: '¿Estás seguro que quieres dejar el grupo: "'+ this.chatBotRoom.name +'"?',
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
            this.disjoinGroup(this.MyUser.uid,false);
          }
        }
      ]
    });
    prompt.present();
  }

  disjoinGroup(uid,member){
    this.alertService.showLoading("");
    let aux=[];
    for(var i=0;i<this.members.length;i++){ 
      if(uid!=this.members[i].uid){
        aux.push(this.members[i].uid);
      }      
    }
    this.userprovider.getUserCard(uid).then(card => {
       this.socialService.disjoinGroups=this.group_uid;
      this.chatService.disjoin_group(card, this.group_uid,aux).then(() => {
         this.socialService.disjoinGroups=this.group_uid;
        //eliminar el listener de los mensajes del grupo del cual me sali
        try{
          this.socialService.deleteListenerChatRoom(this.group_uid);
        }catch(e){
          console.log("error al tratar de desvincular el listener ",e);
        }
        this.alertService.dismissLoading();
        let message = "Te has salido del grupo " +this.chatBotRoom.name;
        if(member) message = member +" ha sido eliminado del grupo " +this.chatBotRoom.name;
        this.alertService.presentToast(message);
        if(!member){
          this.navCtrl.pop();
          this.navCtrl.pop();
        }
      }).catch(error=>{
        console.log(error);
        this.alertService.dismissLoading();
        this.socialService.disjoinGroups=null;
        let message = "No se pudo salir del grupo "+this.chatBotRoom.name;
        if(member) message =  "No se pudo eliminar a "+member+" del grupo " +this.chatBotRoom.name;
        this.alertService.presentToast(message);
      });
    });
  }

  confirmDeleteGroup(){
    let prompt = this.alertCtrl.create({
      title: '¿Estás seguro que eliminar el grupo: "'+ this.chatBotRoom.name +'"?',
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
            this.deleteGroup();
          }
        }
      ]
    });
    prompt.present();
  }

  deleteGroup(){
    this.alertService.showLoading("");
    this.userprovider.getUserCard(this.MyUser.uid).then(card => {
      this.chatService.delete_group(card, this.group_uid).then(() => {
        this.alertService.dismissLoading();
        this.navCtrl.pop();
        this.navCtrl.pop();
      }).catch(error=>{
        let message = "No se pudo eliminar el grupo " +this.chatBotRoom.name;
        this.alertService.presentToast(message);
      });
    });
  }

  AddMembers(){
    if(this.AddTeam){
      this.AddTeam=false;
    }else{
      this.AddTeam=true;
    }
  }

  deleteMember(user){
    //console.log(user)
    let prompt = this.alertCtrl.create({
      title: '¿Estás seguro que quieres eliminar a '+user.name+' del grupo "'+ this.chatBotRoom.name +'"?',
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
            this.disjoinGroup(user.uid, user.name);
          }
        }
      ]
    });  

    prompt.present();
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

  stateChange(event){
    this.procesando=true;
    let ant =this.chatBotRoom.members[this.MyUser.uid];
    this.chatBotRoom.members[this.MyUser.uid]=event;
    this.fireDB.collection("chat_room").doc(this.group_uid).update({
      "members":this.chatBotRoom.members
    }).then(()=>{
      this.procesando=false;
    }).catch(error=>{
      this.procesando=false;
      this.chatBotRoom.members[this.MyUser.uid]=ant;
      this.silence=ant;
    })
  }

}