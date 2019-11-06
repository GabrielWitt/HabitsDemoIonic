import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
/**
 * Generated class for the StartPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-start',
  templateUrl: 'start.html',
})
export class StartPage {
  @ViewChild(Slides) slides: Slides;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
	  private analytics:AnalyticsProvider,
  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StartPage');
    this.slides.lockSwipeToNext(true);
	
  }
  
   ionViewDidEnter() {
    this.analytics.appSeeEvent("El usuario ve el start");
    this.analytics.saveScreen("Start");
   }

  moveToNext(option?: any) {
    let slideIndex = this.slides.getActiveIndex();
    if (slideIndex == 0) {
      this.slides.lockSwipeToNext(false);
      this.slides.slideNext(undefined);
      this.slides.lockSwipeToNext(true);
    } else if (slideIndex == 1) {
      if (option == 'accept') {
        this.slides.lockSwipeToNext(false);
        this.slides.slideNext(undefined);
        this.slides.lockSwipeToNext(true);
        //permisos health
      } else {
        //alerta no puede seguit
      }
    } else if (slideIndex == 2) {
      if (this.platform.is('ios')) {
        //permisos notificaciones
      } else {
        this.navCtrl.setRoot('QuizPage');
      }
    } else if (slideIndex == 3) {
      this.navCtrl.setRoot('QuizPage');
    }
  }

}