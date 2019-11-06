import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AppContants } from '../../app/app.constants';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../interfaces/user';
import { SettingsProvider } from '../../providers/settings/settings';
import { ChatProvider } from '../../providers/chat/chat';
import { Realtime } from '../../providers/social/social';
import { PointsProvider } from '../../providers/points/points';
import { LearningProvider } from '../../providers/learning/learning';
import { HabitProvider } from '../../providers/habit/habit';
import { HealthProvider } from '../../providers/health/health';
import { loadingProvider } from '../../providers/alert/alert';
import { ErrorProvider } from '../../providers/error/error';
import { DietProvider } from '../../providers/diet/diet';

@IonicPage()
@Component({
  selector: 'page-loadscreen',
  templateUrl: 'loadscreen.html',
})
export class LoadscreenPage {
  public showText: any = false;
  loadingInterval=0;
  interval: any
  AboutData = AppContants;
  loader=0;
  userObvs:any;
  user:User;
  limit = 0;
  doing=false;
  ready= false;
  logactive= false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private chatProvider: ChatProvider, 
    private authProvider:AuthProvider,
    private userProvider:UserProvider,
    private language: SettingsProvider,
    private learning: LearningProvider,
    public realtime: Realtime,
    private pointProvider: PointsProvider,
    private habitsprovider:HabitProvider,
    private healthProvider: HealthProvider,
    private loadingprovider:loadingProvider,
    private errorService: ErrorProvider,
    //private alerts: loadingProvider,
    private diet: DietProvider,
    public app: App, 
    ) {
      if(this.logactive) console.log("constructor LoadscreenPage",new Date().getTime());
  }

  ionViewDidLoad() {
    if(this.logactive) console.log("ionViewDidEnter LoadscreenPage");
    let auth=this.authProvider.getSesion();
    if(this.logactive) console.log(auth);
    this.authProvider.signalCheck().then(sign => {
      if(this.logactive) console.log("this.authProvider.signalCheck()",sign);
      if(AppContants.withoutSign) sign = false;
      if(sign){
        this.ready=false;
        this.navCtrl.setRoot('SignPage');
      }else{
        this.ready=true;
        this.setPercentLoader(3);
        this.startUserData(auth);
      }  
    });
  }

  startUserData(auth){   
    let mensaje="Se ha presentado un error al iniciar sesión, intenta ingresar de nuevo por favor."; 
    this.loadingprovider.slowConnectionTimer(auth.uid);
    this.userProvider.loadUser(auth.uid/*'R9fVd3XkTEdpNG7V5WaO5QgGv7q2'*/).then(user=>{
      //console.log("loadUser "+JSON.stringify(user))
      this.showText = "Cargando datos del usuario "+auth.mail; if(this.logactive) console.log(this.showText+"");
      this.userProvider.userObtainer().then(user=>{
        if(this.logactive) console.log("userObtainer: "+JSON.stringify(user))
        this.showText = "Verificando companía: "+user.company.name; if(this.logactive) console.log(this.showText+"");
        this.authProvider.checkCompany(user.company.uid).then(sign=>{
          //console.log("sign",sign)
          if(sign){
            this.navCtrl.setRoot('SignPage'); 
          }else{
            //console.log('loadstage')
            this.setPercentLoader(3.5); 
            this.loadStage1(user);
          }
        }).catch(error=>{
          this.errorService.setError("LOADING","ER","3",error.toString(),mensaje);
        });
      }).catch(error=>{
        this.errorService.setError("LOADING","ER","2",error.toString(),mensaje);
      }); 
    })
  }

  loadStage1(user){ 
    if(this.logactive) console.log('stage1')
    //let that = this;
    this.showText = "Cargando lenguage: "+user.language; if(this.logactive) console.log(this.showText+"");
    this.language.getLanguage('DashboardPage',user.language);
    let mensaje="Se ha presentado un error, intenta reiniciando Habits o por favor toma una captura de pantalla y contacta con soporte técnico.";
    this.showText = "Cargando hábitos... "; if(this.logactive) console.log(this.showText+"");
    this.habitsprovider.getMyHabits(user.uid,user.company.uid).then(myHabits => {
      //console.log("getMyHabits")
      this.setPercentLoader(4);
      this.showText = "Cargando Coach... "; if(this.logactive) console.log(this.showText+"");
      this.chatProvider.initChatBotRoom(user.chat_bot_room).then(answer1 => {
        //console.log("initChatBotRoom",answer1)
          this.showText = "Verificando mensajes de coach... "; if(this.logactive) console.log(this.showText+"");
        this.chatProvider.getChatBotNot(user.uid).then(answer2 =>{
          if(this.logactive) console.log("getChatBotRoom")
          this.setPercentLoader(4);
          this.showText = "Cargando salas de chat social... "; if(this.logactive) console.log(this.showText+"");
          this.chatProvider.loadChatRooms(user.company.uid).then(answer3=>{
            //console.log("answer3") 
            this.setPercentLoader(4.5);
            this.healthProvider.cleanUpHealth().then(()=>{
              this.showText = "Iniciando Salud... "; if(this.logactive) console.log(this.showText+"");
              this.healthProvider.InitHealth(user).then(data=>{
                this.showText = "Calculando datos de Salud... "; if(this.logactive) console.log(this.showText+"");
                //console.log("InitHealth")
                this.setPercentLoader(5);
                //console.log("saveSevenDaysProm---")
                this.healthProvider.saveSevenDaysProm().then(()=>{
                  this.showText = "Bienvenido a HABITS AI"; if(this.logactive) console.log(this.showText+"");
                  this.navCtrl./*push*/setRoot('DashboardPage');
                  this.loadStage2(user);
                  this.loadingprovider.dataReady();
                  this.loadingprovider.dataReady();
                })
              }).catch(error=>{
                this.errorService.setError("LOADING","ER","9",error.toString(),mensaje);
              }); 
            }).catch(error=>{
              this.errorService.setError("LOADING","ER","8",error.toString(),mensaje);
            });
          }).catch(error=>{
            this.errorService.setError("LOADING","ER","7",error.toString(),mensaje);
          });
        }).catch(error=>{
          this.errorService.setError("LOADING","ER","6",error.toString(),mensaje);
        });
      }).catch(error=>{
        this.errorService.setError("LOADING","ER","5",error.toString(),mensaje);
      });
    }).catch(error=>{
      this.errorService.setError("LOADING","ER","4",error.toString(),mensaje);
    });
  }

  stage2=true;
  async loadStage2(user){
    let mensaje="Se ha presentado un error, intenta reiniciando Habits o por favor toma una captura de pantalla y contacta con soporte técnico.";
    if(this.stage2){
      this.stage2=false;
      this.pointProvider.GetNotificationsPoints(user.uid).then(data1=>{
        //console.log("GetNotificationsPoints");
        this.realtime.InitRealtime(user).then(data2=>{
          //console.log("InitRealtime")
          this.healthProvider.startChallengeProcess().then(ans=>{
            //console.log("start_retos")
            this.learning.loadMyClases(user.uid);
            this.diet.getAdvanceData(user.uid);
            this.errorService.chraslyticsId(user.uid);
            //console.log("chraslyticsId: "+JSON.stringify(user)+" uid "+user.uid)
          }).catch(error=>{this.errorService.setError("LOADING","ER","11",error.toString(),mensaje);});
        }).catch(error=>{this.errorService.setError("LOADING","ER","10",error.toString(),mensaje);});
      }).catch(error=>{this.errorService.setError("LOADING","ER","9",error.toString(),mensaje);});
    }
  }
  
  last = 0; pass=true;
  setPercentLoader(percent){ 
    //console.log(percent)
    if(percent>this.last){
      this.last = percent;
      let that = this;
      this.limit = percent*20;
      if(!this.doing){
        this.doing = true;
        this.interval = setInterval(()=>{
          if (that.loader >= that.limit||that.loader >= 100) {
            clearInterval(this.interval);
            if(that.loader >= 100&&that.pass){
            }
          } else {
            that.loader++; 
          }
        }, 100);
      } 

    }
  }

}
