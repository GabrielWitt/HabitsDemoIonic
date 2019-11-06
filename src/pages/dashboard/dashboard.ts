import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, Events, MenuController } from 'ionic-angular';
import { User } from '../../interfaces/user';
import { UserProvider } from '../../providers/user/user';
import { ChatProvider } from '../../providers/chat/chat';
import { MainProvider } from '../../providers/main/main';
import { Realtime } from '../../providers/social/social';
import { AppContants } from '../../app/app.constants';
import { NotificationProvider } from '../../providers/notification/notification';
import { UserGoal } from '../../interfaces/user-goal';
import { HabitProvider } from '../../providers/habit/habit';
import { rankingProvider } from '../../providers/ranking/ranking';
import { ErrorProvider } from '../../providers/error/error';
import { HealthProvider } from '../../providers/health/health';
import { NewsProvider } from '../../providers/news/news';
import { SettingsProvider } from '../../providers/settings/settings';
import { loadingProvider } from '../../providers/alert/alert';
import { AuthProvider } from '../../providers/auth/auth';

const CATEGORIA = "DSB";

@IonicPage()
@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {
  showUserCard: boolean;
  isOnline: boolean;
  companyCode: string ="";
  user: User;
  obsuser: any;
  companykey: string = "";
  loggedUser: User;
  user_goals: UserGoal[] = [];  
  AnaBadge:number=0; 
  mode:string;
  label:any;
  faq = false;
  chartData:any={
    "25":503,
    "50":590,
    "75":678,
    "95":748,
    "05":433,
    max_steps:765,
    prom:590,
    total_proms_array:1180,
    grafico:"bar",
    timestamp:"2019-08-06T13:38:26.098Z",
    type:"chart",
    percentilUser:5,
    prom_user:309,
    nameAnalitycs:"Mi edad",
    titulo:"Usuarios con edad entre 25 y 30 años"
  }
  enter:boolean=false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    private chatProvider: ChatProvider,   
    public platform: Platform,
    public realtime: Realtime,
    public notificationProvider: NotificationProvider,
    private mainProvider: MainProvider,
    private habitsprovider: HabitProvider,
    public rankingService: rankingProvider,
    public healthProvider: HealthProvider,
    public events: Events,
    public menuCtrl: MenuController,
    public errorService:ErrorProvider,
    public newsprovider: NewsProvider,
    private language: SettingsProvider,
    private alert : loadingProvider,
    private auth : AuthProvider
    ) {
      this.user = this.userProvider.static_user();
      this.label = this.language.getLanguage('DashboardPage');
      this.menuCtrl.enable(true);
      this.showUserCard = true;
      this.isOnline = true;
      this.mode=AppContants.config_mode;
      this.companyCode= this.companykey.substring(0,3);
    } 

  public ionViewCanEnter(): Promise<boolean> {
    //console.log("ionViewCanEnter DashboardPage");
    return new Promise(resolve => {
      this.loadUserData();
      this.events.publish('DashboardLoad');
      this.auth.checkFaq().then(check=>{
        this.faq = check.val();
      })
      resolve(true);
    });
  }

  checkAuth = false
  public ionViewDidLoad() {
    //console.log("ionViewDidLoad DashboardPage");
  }

  async loadUserData(){
    this.obsuser = await this.userProvider.getUserObservable();
    if(this.obsuser){
      this.obsuser.subscribe(userlistener=>{
        this.userProvider.set_static_user(userlistener); 
        this.user = userlistener;
        console.log(this.user)
      })
      if(this.userProvider.CheckMedVersion(this.user.company.key)){
      //  this.news.loadNews("-LLV3WuhohL7m9K5tkNb");
        this.rankingService.get_company_ranking(this.user.company.uid, 10);
      }
      //this.mainProvider.checkVersion();
      this.mainProvider.register_connection(this.user.uid, isOnline => { },this.user.company.uid);
      this.saveDeviceInfo(this.user.uid);
    }
    return;
  }

  checkMedix(){
      if(this.companykey == ''){
        //console.log("empty")
        return true
      } else if (this.userProvider.CheckMedVersion(this.companykey)){
        //console.log(this.companykey)
        return true
      } else {
        //console.log("no")
        return false
      }
  }
  
  checkCode(code){
      if(this.companyCode == code){
        return true
      }  else {
        return false
      }
  }

	public goToPage(page: string) {    
	  if(page=='DashboardPage'){
		  console.log('Already in Home')//this.navCtrl.setRoot('DashboardPage')
	  }else if(page == "ranking") {
      this.navCtrl.push('NewsPage', { tab: "rankingTab",news:[]},{animate:false});
    }else{
      this.navCtrl.push(page,{},{animate:false});
    }
	}

  public toHabitsBot() {
    console.log("hola");
    this.navCtrl.push('ChatbotPage', { user:this.user,bot:'BOT-002' });
  }

  public toChatBotRoom() {
    this.healthProvider.save_actual_steps()
	console.log(this.chatProvider);
    if(this.coachReady()){
      this.navCtrl.push('ChatbotPage', { user:this.user,bot:'BOT-001' });
    }else{
      this.alert.presentToast("Cargando Coach");
    }
    
  }

  saveDeviceInfo(uid) {
    //console.log("saveDeviceInfo",uid);
    if (this.platform.is('cordova')) {
      this.notificationProvider.get_token(token => {
        if (this.platform.is('ios')) {
          this.mainProvider.save_device_info(uid, AppContants.ios_ver, token);
        } else if (this.platform.is('android')) {
          this.mainProvider.save_device_info(uid, AppContants.android_ver, token);
        }
      })
    }
  } 

  async openSocial(chatroom){
    let team=null;
    let last = await this.realtime.getMyCard();
    if(last!=null&&last['last_online']){ last = last['last_online'] }else{ last = "" }
    let notread = chatroom.notread;
    if(chatroom.type=="team") team="team";
    this.navCtrl.push("ChatPage",{group_uid:chatroom.uid,last_online:last,notread:notread,team:team});
  }

  getName(name){
    if(name.length>11){
      return name.substr(0,11)+"...";
    }else{
      return name;
    }
  }
  
  geClassAna(){
    return this.chatProvider&&this.chatProvider.notAna ? "AnaCSSon" : "AnaCSSoff"
  }

  notReads = [0,0,0]
  badge = 0;
  sumNotReads(){
    this.badge = 0;
    for(let NR of this.notReads){
      this.badge = this.badge + NR;
    }
    //this.CDR.detectChanges()
    return this.badge ? true : false;
  }

  setbadge(index,notread){
    this.notReads[index] = notread;
    return true;
  }

  probar(){
    try{
      let x=null;
      x.h="hola"
    }catch(e){
      this.errorService.setError(CATEGORIA,"ER","15",e.toString(),"Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles.").then(()=>{
      }).catch(error=>{
        this.errorService.setError(CATEGORIA,"ER","15",error.toString(),"Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles...")
        //console.log(error.message,error.toString());
      });
    }
  }

  async doRefresh(refresher) {
    //console.log('Begin async operation', refresher);
    this.user = await this.userProvider.static_user(); 
    this.auth.checkFaq().then(check=>{
      console.log("faq:",check.val())
      this.faq = check.val();
      if(this.user.tester) this.faq = true;
    })
    this.user_goals = await this.habitsprovider.getHabitObserver();  
    let sub = this.habitsprovider.getHabitSubcategory(); 
    //console.log('startNews?',this.user.company.uid,sub)
    this.newsprovider.startNews(sub,this.user.company.uid).then(data=>{
      //console.log(data)
      this.events.publish('DashboardLoad');
      this.realtime.company_card_list(this.user);
    });
    setTimeout(() => {
      //console.log('Async operation has ended');
      refresher.complete();
      this.alert.presentToast(this.label.update)
    }, 2000);
  }

  coachReady(){
    let percent = this.realtime.getPercent();
    if(percent==100){
      return true;
    }else{
      return false;
    }
  }

  startFunctios(){
    console.log("main")
    this.mainProvider.iusers();
  }

   public ionViewDidEnter() {
    this.enter=true;
  }
}


