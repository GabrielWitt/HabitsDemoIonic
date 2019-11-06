import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
//import { AuthProvider } from '../../providers/auth/auth'
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AuthProvider } from '../../providers/auth/auth';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  mail: string;
  password: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private analytics:AnalyticsProvider,
    private auth: AuthProvider,
    public menuCtrl: MenuController
    ) {
		
    this.menuCtrl.enable(false);
    if(this.navParams.get("user")) this.mail = this.navParams.get("user");
    this.auth.keyboardHide();
    this.password = '';
     console.log("constructor LoginPage",new Date().getTime());
  }

  ionViewDidLoad(){
  }

  ionViewDidEnter(){
		this.analytics.saveScreen("Login");
	}
  register() {
    this.navCtrl.push('RegisterPage');
  }

  signIn() {
    this.navCtrl.push('SignInPage',{user: this.mail});
  }
}
