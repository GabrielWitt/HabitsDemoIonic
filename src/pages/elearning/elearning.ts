import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Loading, ToastController, AlertController/*, LoadingController*/ } from 'ionic-angular';
import { Category } from '../../interfaces/category';
import { LearningProvider } from '../../providers/learning/learning';
import { UserProvider } from '../../providers/user/user';
import { AuthProvider } from '../../providers/auth/auth';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { SettingsProvider } from '../../providers/settings/settings';

@IonicPage()
@Component({
  selector: 'page-elearning',
  templateUrl: 'elearning.html',
})
export class ElearningPage {

  user:any;
  isOnline: boolean;
  loaderUser: Loading;
  categories: Category[] = [];
  myClasseshow: boolean;
  selectedModule = "";
  Lessons=[];
  modules=[""];
  label:any;

  constructor(
    public navCtrl: NavController, 
    private userprovider: UserProvider,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private learning:LearningProvider,
    public auth: AuthProvider,
    public toast: ToastController,
	  private analytics:AnalyticsProvider,
    private language: SettingsProvider
    ) {
    this.label = this.language.getLanguage('ElearningPage');
    this.user = this.userprovider.static_user();
  }

  async load_classes(){ 
    let that = this;
    await this.learning.loadMyClases(this.user.uid).then(mylearning => {
      mylearning.forEach(myclasses=>{
        //console.log(myclasses,this.Lessons)
        if(!myclasses[0]){
          that.allClasses();
        }else{
          myclasses.forEach(data=>{
            this.Lessons.forEach(lesson =>{
              if(data.uid == lesson.uid){ 
                lesson.joined = true;
                lesson.advance = data.topic_number ? data.topic_number : "0"
              }
            })
          })
        }
        return
      })
    })
  }

  ionViewDidEnter(){
		this.analytics.saveScreen("Cursos");
	}

  ionViewWillEnter(){
    if(this.learning.actualizar){
      this.learning.load_topics().then(data => {
        this.Lessons = data;
        this.load_classes()
        this.myClasses();
      });
      this.learning.actualizar=false;
    }
  }
  getModules(){    
    let modules =[]
    this.Lessons.forEach(lesson=>{
      if(lesson.module)modules.push(lesson.module);
    })
    let x = (modules) => modules.filter((v,i) => modules.indexOf(v) === i);
    if(!this.selectedModule) this.selectedModule = x(modules)[0];
    return x(modules);
  }

  OpenLesson(lesson){
    if (this.auth.AppIsOnline()) {
      this.learning.load_lessons(lesson.uid).then(topics =>{
        //console.log(topics)
        lesson.topics = topics;
        this.navCtrl.push("LessonPage",{lesson:lesson,user:this.user})
      })
    } else {
      this.showToast('No disponible sin conexión...', 'top', false, 3000);
    }
  }

  ionViewDidLoad() {
    let data = this.navParams.get('data');
    this.selectedModule = this.navParams.get('module') ? this.navParams.get('module') : "";
    console.log(data);
    this.Lessons = data;
    this.load_classes()
    this.myClasses();
  }

  myClasses(){
    this.myClasseshow = true
  }

  allClasses(){
    this.myClasseshow = false
  }

  subscribeLesson(lesson){
    let prompt = this.alertCtrl.create({
      title: '¿Estás seguro que quieres unirte a "'+ lesson.title +'"?',
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
            this.confirmLesson(lesson);
          }
        }
      ]
    });
    prompt.present();
  }

  confirmLesson(lesson){   
    this.learning.startLesson(this.user.uid,lesson.uid)      
    let message = "Te has unido a clases de " + lesson.title;
    this.showToast(message, 'bottom', true, 3000);
    this.myClasses();
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

}
