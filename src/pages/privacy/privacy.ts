import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
/**
 * Generated class for the PrivacyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-privacy',
  templateUrl: 'privacy.html',
})
export class PrivacyPage {

  constructor(
    public navCtrl: NavController, 
    private analytics:AnalyticsProvider, 
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
  }

  ionViewWillEnter(): void {
    this.analytics.saveScreen("Politicas de privacidad");
    this.navCtrl.swipeBackEnabled = true;
  }

  ionViewDidLeave(): void {
    this.navCtrl.swipeBackEnabled = false;
  }
}
