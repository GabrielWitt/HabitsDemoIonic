import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { loadingProvider } from '../../providers/alert/alert';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { HealthProvider } from '../../providers/health/health';
import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-sign',
  templateUrl: 'sign.html',
})
export class SignPage {
  SIGN = {title:"", text:"", link:"", type:"wait",button:"",button2:"",logout:false}

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private authProvider: AuthProvider,
    public alerts: loadingProvider,
    public menuCtrl: MenuController,
    public analitycs: AnalyticsProvider,
    public healthProvider: HealthProvider,
    public userprov: UserProvider
    ) {
      this.menuCtrl.enable(false);
      this.SIGN = this.authProvider.getSign();
      this.alerts.dataReady();
      console.log(this.SIGN);
    }

  ionViewDidLoad() {
    this.analitycs.saveScreen("Modal Bloqueo");
    this.alerts.dataReady();
  }

  openLink(){  
    this.analitycs.appSeeEvent("Abrio link modal bloqueo")  
    window.open(this.SIGN.link, '_system');
    this.checkSign();
  }

  async checkSign(){
    //console.log('chek')
    let user = await this.userprov.static_user();
    console.log('user',user)
    if(user.uid){
      this.authProvider.checkCompany(user.company.uid).then(company=>{
        console.log(company)
        if(!company){
          this.refreshCheck();
        }else{
          this.alerts.presentToast(user.company.name+" esta inhabilitada por el momento.");
        }
      })
    }else{
      this.refreshCheck();
    }
  }
  
  signOut(){
    this.alerts.presentLoadingText('Cerrando Sesion...',undefined);
    this.authProvider.singOut().then(() => {
      this.healthProvider.cleanOut();
      this.navCtrl.setRoot('LoginPage');
      this.alerts.dismissLoading();
    });
  }

  refreshCheck(){    
    this.authProvider.signalCheck().then(sign => {
      this.SIGN = this.authProvider.getSign();
      console.log(sign)
      if(!sign){
          let sesion =this.authProvider.getSesion() 
          if(sesion.mail==null&&sesion.uid==null) {
            console.log("se mando a la pantalla de LoginPage desde el sign.ts");
            this.navCtrl.setRoot('LoginPage');
          } else {
           console.log("se mando a la pantalla de LoadscreenPage desde el sign.ts");
            this.navCtrl.setRoot('LoadscreenPage');
          } 
      }else{
        if(this.SIGN.type == 'maintenance'){
          this.alerts.presentToast("El servicio aún está en mantenimiento.");
        }else{
          this.alerts.presentToast("Por favor, actualiza la aplicación para continuar.");
        }
      }
    })
  }

}
