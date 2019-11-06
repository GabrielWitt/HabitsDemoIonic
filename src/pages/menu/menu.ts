import { HealthProvider } from './../../providers/health/health';
import { AuthProvider } from './../../providers/auth/auth';
import { LearningProvider } from './../../providers/learning/learning';
import { UserProvider } from './../../providers/user/user';
import { User } from './../../interfaces/user';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { loadingProvider } from '../../providers/alert/alert';
import { DietProvider } from '../../providers/diet/diet';

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {
  public user: User;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public userprov:UserProvider,
    private alerts:loadingProvider,
    private learning: LearningProvider,
    private diet:DietProvider,
    private authProvider: AuthProvider,
    private healthProvider: HealthProvider) {
      this.user = this.userprov.static_user();
  }

  ionViewDidLoad() {
    console.log(this.user);
  }

  public async goToPage(page: string) {
    if(page=='MenuPage'){
      console.log('Already in this page')
    }else if(page=='DashboardPage'){
      this.navCtrl.setRoot('DashboardPage')
    }else if(page == "courses") {
      this.alerts.showLoading('Cargando cursos');
      this.learning.load_topics().then(data => {
        this.navCtrl.pop({animate:false});
        this.navCtrl.push('ElearningPage', { data: data });
        this.alerts.dismissLoading();
      })
    }else if(page == 'diet'){
      this.alerts.showLoading('Cargando módulo de dieta');
      let options = await this.reloadDiet()
      this.alerts.dismissLoading();
      this.navCtrl.pop({animate:false});
      this.navCtrl.push("DietPage",options);
    }else if(page == "ranking") {
      this.navCtrl.pop({animate:false});
      this.navCtrl.push('NewsPage', { tab: "rankingTab",news:[]},{animate:false});
    }else if (page == "logout") {
      if(this.authProvider.userAuthenticated){
        this.alerts.showLoading('Cerrando Sesion...');
        this.authProvider.singOut().then(() => {
          this.healthProvider.cleanOut();
          this.navCtrl.setRoot('LoginPage',{user:this.user.mail});
          this.alerts.dismissLoading();
        });
      }
    } else{
      this.navCtrl.pop({animate:false});
      this.navCtrl.push(page,{},{animate:false});
    }
  }

  async reloadDiet(){    
    let types = await this.diet.getTypes();   
    let products = await this.diet.loadProducts();
    let rules = await this.diet.getRules();
    let dietDocs = await this.diet.load_Diets(this.user.diet).then(data=>{
      let dietReminders:any={};
      this.diet.get_diet_reminders(this.user.uid).then(reminder=>{ 
        if(reminder['diet']){ 
          dietReminders = reminder;
          if(reminder['reminder_update'])dietReminders.reminder_update=reminder['reminder_update'].toDate();
          if(reminder['update'])dietReminders.update=reminder['update'].toDate();
          dietReminders.empty=false;
        }else{dietReminders["empty"]=true;}
      })
      return {data:data,dietReminders:dietReminders};
    })
    return {
      user:this.user, dietData:dietDocs['data'], dietReminders:dietDocs['dietReminders'],
      products:products,types:types,weekDiet:null,rules:rules
    };
  }

}
