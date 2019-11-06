import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { LearningProvider } from '../../providers/learning/learning';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
/**
 * Generated class for the LessonPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lesson',
  templateUrl: 'lesson.html',
})
export class LessonPage {
  lesson: any;
  user: any;
  avaliable = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,    
    public toast: ToastController,
    private alertCtrl: AlertController,
    public learning: LearningProvider,
	  private analytics:AnalyticsProvider
    ) {
    this.lesson = this.navParams.get('lesson');
    this.user = this.navParams.get('user');    
	  this.analytics.saveScreen("Lección");
    if(this.lesson.advance) this.avaliable = this.lesson.advance;
    //console.log(this.avaliable,this.lesson)
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad LessonPage');
  }
  
  ionViewDidEnter(){
	 this.analytics.appSeeEvent("El usuario esta en una clase");
	}

  closeWindow() {
    this.navCtrl.pop();
  }

  unsubscribeLesson(){
    let prompt = this.alertCtrl.create({
      title: '¿Estás segur@ que quieres salir de la clase "'+ this.lesson.title +'"?',
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
            this.deleteLesson();
          }
        }
      ]
    });
    prompt.present();
  }

  deleteLesson(){      
    this.learning.deleteLesson(this.user.uid,this.lesson.uid);
    this.learning.actualizar=true; 
    this.navCtrl.pop();    
    let message = 'Te has retirado de la clase "' + this.lesson.title+'"';
    this.showToast(message, 'bottom', true, 3000);
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

  getLock(i){
    if(i > this.avaliable){
      return true
    }else{
      return false;
    }
  }

  getLessonAdvance(i){
    if(i < this.lesson.advance){
      return true
    }else{
      return false
    }
  }

  openTopic(topic,index){
    console.log(this.lesson,topic,index)
    if(index < this.lesson.advance || index == this.avaliable){
      this.lesson['topic'] = index+1;
      this.navCtrl.push('TopicPage',{topic:topic, index:this.lesson, user:this.user});    
    }else{
      let message = "Para desbloquear está clase debes ver la clase anterior";
      this.showToast(message, 'bottom', true, 3000);
    }
  }

}
