import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, Loading, LoadingController, NavParams } from 'ionic-angular';

import { ImagesProvider } from '../../providers/images/images';
import { UserProvider } from '../../providers/user/user';
import { ChatProvider } from '../../providers/chat/chat';
import { Member } from '../../interfaces/member';
import { User } from '../../interfaces/User';
import { HabitGoal } from '../../interfaces/habit-goal';
import { UserGoal } from '../../interfaces/user-goal';
import { loadingProvider } from '../../providers/alert/alert';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { SearchPipe } from '../../pipes/search/search';
import { RetosProvider } from '../../providers/retos/retos';
import { Platform } from 'ionic-angular/platform/platform';

/**
 * Generated class for the NewChatRoomPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'new-chat-room',
  templateUrl: 'new-chat-room.html',
})
export class NewChatRoomPage {

  loaderUser: Loading;
  loaderGroup: Loading;
  retoActual:any;
  loaderImg:Loading;
  percent = 0;
  user: User;
  members: Member[];
  memberList: Member[] = [];
  title = "";
  description = "";
  picture = "./assets/imgs/notAvailable.jpg";
  imgFile: any
  type: string = "";
  searchText: string = "";
  chatRoom = {
    name: "",
    create_date: "",
    description: "",
    members: [],
    picture: "",
    company: "",
    type: "group",
    createdBy: "",
    lastMessage:new Date(new Date().setFullYear(1900)),
    total_messages:0
  }


  categories: HabitGoal[] = [];
  goals: UserGoal[] = [];
  page1 = true;
  page2 = false;
  creator: Member;
  loadHabit:Boolean=false;
  participantes:any;
  selectedCategory :any;
  selectedGoal:any;

  constructor(
    private navCtrl: NavController,
    public toast: ToastController,
    private loadingCtrl: LoadingController,
    private chatService: ChatProvider,
    private userprovider: UserProvider,
	  private retosprovider: RetosProvider,
    public imageCtrl: ImagesProvider,
    public loadingService: loadingProvider,
	  private analytics:AnalyticsProvider,
	  public navParams: NavParams,
    private platform: Platform,
    private alerts:loadingProvider
  ) {
    this.user = this.userprovider.static_user();
    this.loaderGroup = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Creando grupo...'
    });
    this.loaderImg = this.loadingCtrl.create({
      spinner: 'crescent',
      content: 'Guardando Imagen...'
    });
    this.chatService.get_user_cards_by_company(this.user.company.uid).then(users => {
      this.members = users;
      //console.log.log(this.members)
      this.members.sort();
      for(var i=0;i<this.members.length;i++){
        if(this.members[i]['uid'] == this.user.uid){ 
          this.addMember(i);
        }
      }
    });
  }

  addMember(x){
	if (this.retoActual && this.retoActual.participantes ==  this.memberList.length){
		return;
	}
	let list  = new SearchPipe().transform(this.members, this.searchText, 'name');
    this.memberList.push(list[x])
    let auxList = [];
    for(var i=0;i<this.members.length;i++){
      if(this.members[i].uid != list[x].uid) auxList.push(this.members[i])
    }
    this.members = auxList;
    this.members.sort();
  }

  removeMember(x){
    this.members.push(this.memberList[x])
    let auxList = [];
    for(var i=0;i<this.memberList.length;i++){
      if(i != x) auxList.push(this.memberList[i])
    }
    this.memberList = auxList;
    this.members.sort();
  }

  ionViewDidLoad() {
	this.analytics.saveScreen("Nuevo chat room");
	if (this.navParams.get('reto')){
		this.retoActual =  this.navParams.get('reto');
		this.participantes = this.retosprovider.participantesUIDS(this.retoActual);
		this.type = "team";
	}

  }

  closeWindow() {
    this.navCtrl.pop();
  }
  
  memberData(memberList): Promise<string[]>{
    return new Promise((resolve, rejected) => {
      let auxMembers = [];
      for(var i=0;i<memberList.length;i++){
        let uid = this.memberList[i]['uid'];        
        auxMembers.push(uid);
      }
      resolve(auxMembers)
    })
  }

  newSocialChat(){
    if(this.type != ""){
      if(this.memberList.length>1){
        this.loaderImg.present();
        this.memberData(this.memberList).then( Members => {
          let auxMembers = Members; 
          let today =new Date().toISOString();
          this.imageCtrl.upload_image(this.picture, this.title+today,'group_imgs',progress =>{
            this.percent = parseInt(progress);
          }).then(image=>{
            this.chatRoom = {
              name: this.title,
              create_date: today,
              description: this.description,
              members: auxMembers,
              picture: image,
              company: this.user.company.uid,
              type: this.type,
              createdBy: this.user.uid,
              lastMessage:new Date(new Date().setFullYear(1900)),
              total_messages:0
            }
            this.loaderImg.dismiss().catch(() => {});;
            this.loaderGroup.present().catch(() => {});;
            //console.log.log(this.chatRoom);
            this.chatService.create_group_chat_room(this.chatRoom).then(()=>{
              let message = "El grupo fue creado exitosamente.";              
              this.analytics.EventWithData("Nuevo_Chat",this.chatRoom.name);
              this.showToast(message, 'bottom', true, 3500);
              this.closeWindow();
              this.loaderGroup.dismiss().catch(() => {});
            });
            if (this.retoActual){
              let team = {
                uid: "",
                name: this.title,
                last_update: new Date(),
                pasos: 0,
                picture: image,
                reto: this.retoActual.uid,
                members:{}
              }
              for(var i=0;i<auxMembers.length;i++){
                team.members[auxMembers[i]] = true;
              }
              this.retosprovider.create_team(team);
            }
          }).catch(Error=>{
            console.log("Ocurrio un error",Error);
          })
        })
      }else{
        let message = "El grupo debe tener más de un miembro.";
        this.showToast(message, 'bottom', true, undefined);
      }
    }else{
      let message = "Debe seleccionar un tipo de grupo.";
      this.showToast(message, 'bottom', true, undefined);
    }
  }

  showToast(text, position, showOk, duration) {
    this.alerts.showToast(text, position, showOk, duration);
  }

  nextPage(){
    if(this.title){
      if(this.description || this.retoActual ){
        if(this.picture != "./assets/imgs/notAvailable.jpg" || this.retoActual){
          this.page1 = false
          this.page2 = true
        }else{
          let message = "El grupo debe tener una imagen para su grupo.";
          this.showToast(message, 'bottom', true, undefined);
        }
      }else{
        let message = "Por favor, ingrese una descripción corta del grupo.";
        this.showToast(message, 'bottom', true, undefined);
      }
    }else{
      let message = "El grupo debe tener un nombre.";
      this.showToast(message, 'bottom', true, undefined);
    }
  }

  addCameraPhoto(x){
    if(this.platform.is('cordova')){
    this.imageCtrl.addCameraPhoto(x,true).then(url=>{
      this.picture = url;
    }).catch(error=>{
      this.loadingService.showToast(error, 'bottom', false, 3000);
    });
    }else{
      this.picture = "./assets/imgs/group.png";
    }
  }

  returnPage(){
    this.page1 = true
    this.page2 = false
  }

}
