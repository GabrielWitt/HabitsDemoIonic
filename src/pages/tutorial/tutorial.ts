import { Component, ViewChild } from '@angular/core';
import { IonicPage, MenuController, NavController, Platform } from 'ionic-angular';
import { DashboardPage } from '../dashboard/dashboard';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../interfaces/User';
import { Slides } from 'ionic-angular';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { HealthProvider } from '../../providers/health/health';
import { SettingsProvider } from '../../providers/settings/settings';

export interface Slide {
  title: string;
  description: string;
  image: string;
}

@IonicPage()
@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  @ViewChild('tutorial') slides2: Slides;
  slides = [];
  showSkip = true;
  dir: string = 'ltr';
  user: User;
  label: any;   

  constructor(
    public navCtrl: NavController, 
    public userprovider: UserProvider, 
    public menu: MenuController, 
	  private analytics:AnalyticsProvider,
    public platform: Platform,
    private health: HealthProvider,
    private language: SettingsProvider
    ) {
      this.label = this.language.getLanguage('TutorialPage');
      console.log(this.label)
      this.dir = platform.dir();    
      this.user = this.userprovider.static_user();
      if(this.userprovider.CheckMedVersion(this.user.company.key)){
        for(let i = 1;i<15;i++){
          let slide = {
            title: "Titulo "+i,
            description: "",
            image: './assets/imgs/tutorialMedix/'+i+'.png'
          }
          this.slides.push(slide)
        }
      }else{
        for(let i = 1;i<10;i++){   
          let slide = {
            title: this.label.standard[i].title? this.label.standard[i].title:"",
            text1: this.label.standard[i].text1? this.label.standard[i].text1:"",
            text2: this.label.standard[i].text2.split("-salto-"),
            description: "",
            image: './assets/imgs/tutorial/'+i+'.png'
          }
          console.log(slide.text2)
          this.slides.push(slide)
        }
        console.log(this.slides)
      }
	  
      /*this.slides = [
        {
          title: "Titulo1",
          description: "Descripcion 1",
          image: 'assets/imgs/logo.png',
        },
        {
          title: "Titulo 2",
          description: "Descripcion 2",
          image: 'assets/imgs/logo.png',
        },
        {
          title: "Titulo 3",
          description: "Descripcion 3",
          image: 'assets/imgs/logo.png',
        }
      ];*/
  }
	prev(){
		this.slides2.slidePrev(1000);
	}
	
	next(){
		this.slides2.slideNext(1000);
  }
  
  startApp() {    
    this.navCtrl.setRoot(DashboardPage, {}, {
      animate: true,
      direction: 'forward'
    });
    this.saveGoal();
  }

  saveGoal(){
    console.log(this.user)
    if(!this.user.steps_goal){
      this.health.checkStepsGoal(this.user,true)
    }
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd();
  }

  ionViewDidEnter() {
    this.analytics.saveScreen("Tutorial");
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
    this.analytics.appSeeEvent("Fin_tutorial");
  }

}
