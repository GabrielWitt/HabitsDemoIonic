import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform, Keyboard } from 'ionic-angular';
//import { MainProvider } from '../../providers/main/main';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../interfaces/User';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AuthProvider } from '../../providers/auth/auth';
import { NewsProvider } from '../../providers/news/news';
import { loadingProvider } from '../../providers/alert/alert';
import { SearchPipe } from '../../pipes/search/search';
import { AppContants } from '../../app/app.constants';
import { HealthProvider } from '../../providers/health/health';
import { Device } from '@ionic-native/device';

@IonicPage()
@Component({
  selector: 'page-report-issue',
  templateUrl: 'report-issue.html',
})
export class ReportIssuePage {
  showSkip = true;
  user: User;
  report ={
    title: '',
    description: ''
  }
  selectedQuestion= { answer: "", question: "",
                      tip: {text: "", url: "", type: ""},
                      type: "", uid: "" };
  faq_categories:any;
  error = false;
  searchText="";
  type_question="";
  list_question:any;
  currentIndex =0;
  label={title:"Ayuda",read_more:"Ver más"}
  public questionlist = true;
  public showquestion = false;
  public showreport = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    //private mainService: MainProvider,,
    public platform: Platform,
    public toastCtrl: ToastController,
    public userprovider: UserProvider,
    private analytics:AnalyticsProvider,
    private auth: AuthProvider,
    private newsprov: NewsProvider,
    private loadinService: loadingProvider,
    public keyboard: Keyboard,
    private healthProvider:HealthProvider,    
    public device: Device,
  ) {
    this.user = this.userprovider.static_user();
  }

  ionViewDidEnter() {
    this.analytics.saveScreen("Reportar Error");
    this.newsprov.loadFaq().then(data=>{
      console.log(data)
      this.faq_categories = data;
      this.list_question = data;
    });
  }

  sendReport() {
    this.analytics.EventWithData("Reporte_Error",this.report.title+"-"+this.report.description)
    this.presentToast("Servicio disponible pronto...");
    this.auth.keyboardHide();
    //'Gracias por tu ayuda');
    /*this.mainService.save_report(this.user.id, this.report).then(() => {
    }) */
  }

  presentToast(message: string) {
    const toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

  loadFaqButton(faq){
    this.selectedQuestion = faq;
    this.showquestion=true;
    this.questionlist = false;
    this.showreport = false;
  }
  
  openlink(openlink) {
    if (this.auth.AppIsOnline()) {
      window.open(openlink, '_system');
    } else {
      this.loadinService.presentToast('No disponible sin conexión...');
    }
  }

  closeFaq(){
    this.hideKeyboard()
    if(this.questionlist == true){
      this.navCtrl.pop();
    }else{      
      this.error = false;
      this.questionlist = true;
      this.showquestion = false;
      this.showreport = false;
    }
  }

  reportError(){
    this.hideKeyboard()
    this.error = true;
    this.questionlist = false;
    this.showquestion = false;
    this.showreport = true;
  }

  search_word(){
    this.list_question = new SearchPipe().transform(this.faq_categories, this.searchText, 'question');
    this.hideKeyboard()
  }

  async reportPage() {
    //this.nav.push('ReportIssuePage');
    let app_version = "";    
    if (this.platform.is('ios')) {
      app_version = AppContants.ios_ver;
    } else if (this.platform.is('android')) {
      app_version = AppContants.android_ver;
    }
    let user = this.userprovider.static_user()
    let steps = await this.healthProvider.save_actual_steps();
    let link ="https://wa.me/+5215577678352?text=Hola,%20soy%20"+user.name+"%20"+user.last_name+"%20de%20"+user.company.name+",%20mi%20correo%20es%20"+user.mail+"%20y%20quiero%20reportar%20un%20problema.%20Mi%20teléfono%20es%20un%20"+this.device.model+"%20y%20la%20versión%20de%20la%20aplicación%20es%20"+app_version+"%20mis%20pasos%20actuales:%20"+steps+"%20y%20mis%20puntos:%20"+user.points+"%20Fecha:%20"+new Date().toISOString();
    window.open(link, '_system');
  }

  hideKeyboard(){
    if(this.platform.is('cordova')){
      this.auth.keyboardHide();
    }
  }

}
