import { Component, ViewChild,  } from '@angular/core';
import { Platform, Nav, LoadingController, Loading, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { LearningProvider } from '../providers/learning/learning';
import { UserProvider } from '../providers/user/user';
import { PushNotificationProvider } from '../providers/push-notification/push-notification';
import { NotificationProvider } from '../providers/notification/notification';
import { AnalyticsProvider } from '../providers/analytics/analytics';
import { ImagesProvider } from '../providers/images/images';
import { HealthProvider } from '../providers/health/health';
import { Device } from '@ionic-native/device';
//import { AppContants } from './app.constants';
import { ErrorProvider } from '../providers/error/error';
import { NewsProvider } from '../providers/news/news';
import { SettingsProvider } from '../providers/settings/settings';
import { Realtime } from '../providers/social/social';

//const CATEGORIA = "APP";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
//  @ViewChild('canvas_conffeti') canvas_conffeti: ElementRef;
  loader: Loading;
  isOnline: boolean;
  pages: Array<{ title: string, ios_icon: string, md_icon: string, name: string }>;
  mail = "";
  user_uid = "";
  connection= false;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public loaderCtrl: LoadingController,
    public toastCtrl: ToastController,
    private authProvider: AuthProvider,
    private learning: LearningProvider,
    private userprovider:UserProvider,
    private localnotificacions:PushNotificationProvider,   
    private notificationService:NotificationProvider,
    private analytics: AnalyticsProvider,
    private images:ImagesProvider,
    private healthProvider: HealthProvider,
    public device: Device,
    public errorService:ErrorProvider,
    public newsprovider:NewsProvider,
    public language: SettingsProvider,
    public realtime: Realtime
  ){
    //this.authProvider.singOut()
    this.isOnline = true;    
    this.pages = [
      { title: 'home', ios_icon: "ios-speedometer", md_icon: "md-speedometer", name: 'DashboardPage' },
      //{ title: 'SOCIAL', ios_icon: "ios-people", md_icon: "md-people", name: DashboardPage },
      //{ title: 'MI EMPRESA', ios_icon: "ios-briefcase", md_icon: "md-briefcase", name: DashboardPage },
      { title: 'inspiration', ios_icon: "ios-share", md_icon: "md-share", name: 'NewsPage' },
      { title: 'ranking', ios_icon: "ios-trophy", md_icon: "md-trophy", name: 'DashboardPage' },
      //{ title: 'CANJE DE PUNTOS', ios_icon: "ios-trophy", md_icon: "md-trophy", name: DashboardPage },
      { title: 'coach', ios_icon: "ios-chatbubbles", md_icon: "md-chatbubbles", name: 'ChatbotPage' },
      { title: 'groups', ios_icon: "ios-people", md_icon: "md-people", name: 'SocialPage' },
      { title: 'tutorial', ios_icon: "ios-help-circle", md_icon: "md-help-circle", name: 'TutorialPage' },
      //{ title: 'QUIZ', ios_icon: "ios-paper-outline", md_icon: "md-paper", name: QuizPage },
      { title: 'courses', ios_icon: "ios-book", md_icon: "md-book", name: 'ElearningPage' },
      { title: 'quiz', ios_icon: "ios-paper-outline", md_icon: "ios-paper-outline", name: 'TestsPage' },
	  { title: 'HistorialPuntos', ios_icon: "ios-star", md_icon: "ios-star", name: 'HistorialPuntosPage' },
	  { title: 'retopasos', ios_icon: "ios-paper-outline", md_icon: "ios-paper-outline", name: 'RetoPasosPage' },  
	  { title: 'Miprogreso', ios_icon: "ios-paper-outline", md_icon: "ios-paper-outline", name: 'MiprogresoPage'},
      { title: 'logout', ios_icon: "ios-exit", md_icon: "md-exit", name: 'LoginPage' }
    ]; 
    this.initializeApp();
	
  }

  initializeApp() {
    console.log("initializeApp",new Date().getTime());
    this.authProvider.isAuthenticated();
    this.platform.ready().then(() => {
      this.authProvider.conectionStatus().then(()=>{   
        //este metodo signalCheck que realiza???
        // this.authProvider.signalCheck().then(sign => {
        //   let data:any = this.authProvider.getinitData();let email=data.email;let pass=data.pass;
        //   if(email&&pass){
        //     console.log("en teoria trengo user");
        //     this.authProvider.singInByEmail(email,pass).then(session => {
        //       console.log("me relogeuo");
        //       this.authProvider.isAuthenticated(auth => { 
        //         try{ 
        //           let inicialPage = "";
        //           if (!auth || !auth.email) {
        //             inicialPage = 'LoginPage';
        //           } else {
        //             this.mail = auth.email;
        //             this.user_uid = auth.uid;
        //             inicialPage = 'LoadscreenPage';
        //             //inicialPage = 'DashboardPage';
        //           }  
        //           if(AppContants.withoutSign)sign = false;
        //           if(sign){this.rootPage = 'SignPage';}          
        //           else{this.rootPage = inicialPage;}
        //         }catch(e){
        //           console.log(e)
        //           let inicialPage = 'LoginPage';
        //           this.errorService.setError(CATEGORIA,"ER","1",e.toString(),"Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles.");
        //           if(AppContants.withoutSign)sign = false;
        //           if(sign){this.rootPage = 'SignPage';}          
        //           else{this.rootPage = inicialPage;}
        //         }
        //       })
        //     }).catch(error=>{
        //       let inicialPage = 'LoginPage';
        //       this.errorService.setError(CATEGORIA,"ER","1",error.toString(),"Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles.");
        //       if(AppContants.withoutSign)sign = false;
        //       if(sign){this.rootPage = 'SignPage';}          
        //       else{this.rootPage = inicialPage;}
        //     });
        //   }else{
        //     console.log("me va a mandar al login");
        //     let inicialPage = 'LoginPage';
        //     if(AppContants.withoutSign)sign = false;
        //     if(sign){this.rootPage = 'SignPage';}          
        //     else{this.rootPage = inicialPage;}
        //   }
        // });
      })  
      try{
        if (this.platform.is('cordova')){
          this.analytics.startAppSee();
          if(!this.connection){this.analytics.appSeeEvent("Conexiones");this.connection = true;}
          this.localnotificacions.loadListener();
          this.notificationService.loadListenerNotification();
        }
        this.statusBar.styleBlackTranslucent();
        this.statusBar.backgroundColorByHexString("#455A64");
        this.learning.load_topics()
        this.images.configCacheImages();
      }catch(e){
        console.log(e.toString());
      }
      if(this.authProvider.getTypeNetwok() == 'none'){
        if (this.isOnline != false) {
          this.isOnline = false;
          this.statusBar.backgroundColorByHexString("#D32F2F");
          this.authProvider.doOnDisconnect();
        }
      }
      this.language.canvas_conffeti = document.getElementById("canvas_conffeti");
    });
  }

  openPage(page) {
      this.authProvider.conectionStatus().then(()=>{
        if (page.title == "home") {
          this.nav.setRoot(page.name);
        }else if (page.title == "logout") {
          if(this.authProvider.userAuthenticated){
            let singOutLoader = this.loaderCtrl.create({
              spinner: 'dots',
              content: 'Cerrando Sesion...'
            });
            singOutLoader.present();
            this.authProvider.singOut().then(() => {
              this.healthProvider.cleanOut();
              this.nav.setRoot('LoginPage',{user:this.mail});
              singOutLoader.dismiss().catch(() => {});
            });
          }
        } else if (page.title == "ranking") {
          this.nav.push('NewsPage', { tab: "rankingTab",news:[]});
        } else if (page.title == "courses") {
          let learningLoader = this.loaderCtrl.create({
            spinner: 'dots',
            content: 'Cargando cursos'
          });
          learningLoader.present();
          this.learning.load_topics().then(data => {
            this.nav.push('ElearningPage', { data: data });
            learningLoader.dismiss().catch(() => {});;
          })
        } else if (page.title == "coach") {
            let user = this.userprovider.static_user()
            this.nav.push('ChatbotPage', { user: user,bot:'BOT-001' });
        } else {
          this.nav.push(page.name);
        }
      })
  }

  privacyPage() {
    this.nav.push('PrivacyPage');
  }

  getMenuTitle(title){
    return this.language.getMenuTitle(title);
  }

  async reportPage() {
    this.nav.push('ReportIssuePage');
    /*let app_version = "";    
    if (this.platform.is('ios')) {
      app_version = AppContants.ios_ver;
    } else if (this.platform.is('android')) {
      app_version = AppContants.android_ver;
    }
    let user = this.userprovider.static_user()
    let steps = await this.healthProvider.save_actual_steps();
    let link ="https://wa.me/+5215577678352?text=Hola,%20soy%20"+user.name+"%20"+user.last_name+"%20de%20"+user.company.name+",%20mi%20correo%20es%20"+user.mail+"%20y%20quiero%20reportar%20un%20problema.%20Mi%20teléfono%20es%20un%20"+this.device.model+"%20y%20la%20versión%20de%20la%20aplicación%20es%20"+app_version+"%20mis%20pasos%20actuales:%20"+steps+"%20y%20mis%20puntos:%20"+user.points+"%20Fecha:%20"+new Date().toISOString();
    window.open(link, '_system');*/
  }

  reportAbout() {
    this.nav.push('AboutPage');
  }

  async changeLanguage(){
    let lang = this.language.getLanguageSetting();
    if(lang == 'es'){lang = 'en'}else{lang = 'es'};
    await this.language.setLanguage(lang);
    this.nav.setRoot('DashboardPage');
  }

  showToast(text, position, showOk, duration) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: duration,
      position: position,
      showCloseButton: showOk,
      closeButtonText: 'OK'
    });
    toast.present();
  }
  
  
}

