import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Platform, MenuController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { AuthProvider } from '../../providers/auth/auth';
import { loadingProvider } from '../../providers/alert/alert';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-sign-in',
  templateUrl: 'sign-in.html',
})
export class SignInPage {
  @ViewChild('passInput') passInput;
  mail: string;
  password: string;
  resetpass: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private auth: AuthProvider,
    public platform: Platform,
    public keyboard: Keyboard,
    private alerts: loadingProvider,
	  private analytics:AnalyticsProvider,
    public menuCtrl: MenuController
    ) {
      this.menuCtrl.enable(false);
    if(this.navParams.get("user")) this.mail = this.navParams.get("user");
    this.password = '';
  }

  ionViewDidEnter() {
    this.analytics.saveScreen("Inicio de Sesion");
  }

  enterMail(key) {
    if (key.keyCode == 13) {
      this.passInput.setFocus()
    }
  }

  enterPass(key) {
    if (key.keyCode == 13) {
      this.login();
    }
  }

  login() {
    this.hideKeyboard();
      this.mail = this.mail.replace(/ /g, '');//Borra espacios en blanco
      if (this.mail != '' && this.password != '') {
        this.auth.singInByEmail(this.mail, this.password).then(login => {
          if (login) {
            this.analytics.appSeeEvent("Inicio_Sesión");
            //this.navCtrl.setRoot('LoadscreenPage');
            //this.alerts.showLoading("Iniciando Sesión");
          }
        }).catch((error) => {
          this.presentToast(error);
        });
      } else {
        this.presentToast("Ingrese sus datos.");
      }
  }

  resetPass(){
      this.mail = this.mail.replace(/ /g, '');//Borra espacios en blanco
      this.auth.resetPassword(this.mail).then(answer => {
        console.log(answer);
        this.analytics.appSeeEvent("Reseteó_contraseña");
        this.alerts.ShowInfoAlert("Cambio de contraseña",answer);
      }).catch((error) => {
        this.presentToast(error);
      })
  }

  presentToast(message) {
    this.alerts.presentToast(message);
  }

  hideKeyboard(){
    if(this.platform.is('cordova')){
      this.keyboard.hide()
    }
  }
  
  return(){
    if(!this.resetpass){
      this.hideKeyboard();
      this.navCtrl.setRoot('LoginPage',{user:this.mail})
    }else{
      this.analytics.saveScreen("Login");
      this.hideKeyboard();
      this.resetpass=false
    }
  }

  reset(){
    this.hideKeyboard();
    this.analytics.saveScreen("Reset password");
    if(this.resetpass){this.resetpass=false}else{this.resetpass=true}
    console.log(this.resetpass)
  }

}
