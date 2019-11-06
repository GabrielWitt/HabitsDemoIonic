import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppContants } from '../../app/app.constants';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { loadingProvider } from '../../providers/alert/alert';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../interfaces/user';


@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  AboutData = AppContants;
  Mode: string = "HABITS.TEST"
  user:User;

  constructor(
    public navCtrl: NavController, 
    private analytics:AnalyticsProvider, 
    public navParams: NavParams,
    public alert:loadingProvider,
    public userprov:UserProvider) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad AboutPage');
    this.user = this.userprov.static_user();
    this.AboutData = AppContants;
    if(this.AboutData.config_mode == "production") this.Mode = "HABITS.AI"

  }
  
   public ionViewDidEnter(){
		this.analytics.saveScreen("AcercaDe");
  }


}
