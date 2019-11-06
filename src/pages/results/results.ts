import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { User } from '../../interfaces/user';
import { TestProvider } from '../../providers/test/test';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { loadingProvider } from '../../providers/alert/alert';
import { SettingsProvider } from '../../providers/settings/settings';
import { DietProvider } from '../../providers/diet/diet';


@IonicPage()
@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {
  user: User;
  results: any;
  test: any;
  resultado: String = "";
  ResultText: String = "";
	label:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public testService: TestProvider,
    private loadingCtrl: loadingProvider,
	  private analytics:AnalyticsProvider,
    public menu: MenuController, 
    public language: SettingsProvider,
    private diet: DietProvider,
    private alerts: loadingProvider
  ) {
    this.user = this.navParams.get('user')
    this.label = this.language.getLanguage('ResultsPage');
    console.log(this.label)
  }
  
  ionViewDidEnter(){
    this.analytics.saveScreen("Resultado Quiz");
  }

  ionViewDidLoad() {
  this.menu.enable(false);
  this.loadingCtrl.showLoading('Cargando...');
	this.test = this.navParams.get('test')
    this.results = this.navParams.get('result')
    this.testService.setLastTest(this.test.uid);
    console.log(this.test,this.results)
      if(this.test.type == "diet_test"){
        console.log("diet")
        this.testService.save_diet(this.user.uid, this.results).then(()=>{
          let calories = this.results.split("-")
          this.ResultText = "Dieta de "+ calories[0]+" calorias calculada para tí será cargada en el módulo de Dieta. Ahora podrás programar tus alarmas para que te recuerde cuando y que debes comer.";
          this.loadingCtrl.dismissLoading();
        })
      } else{
        this.MinMaxResult();
      }
  }

  MinMaxResult(){
    console.log("wellness")
    let keys = Object.keys(this.test.result)
    for(let key of keys){
      console.log(this.test.result[key].min,this.results,this.test.result[key].max)
      if(this.results > this.test.result[key].min && this.results <= this.test.result[key].max){
        this.ResultText = this.test.result[key].resultText;
        this.resultado = this.results;
        //this.loaderUser.dismiss();
        break;
      }
    }
    if(!this.ResultText) this.ResultText = "Ups! algo salio mal."
    this.loadingCtrl.dismissLoading();
  }

	async EndQuiz(){
	if (this.navParams.get('Breturn')){
    this.navCtrl.setRoot("DashboardPage");
  }else if(this.test.type == "diet_test"){
    this.navCtrl.setRoot("DashboardPage");
    let options = await this.reloadDiet()
    this.alerts.presentToast("Puedes configurar tus alarmas en la parte superior derecha.")
    this.navCtrl.push("DietPage",options);
  }else{
		this.analytics.EventWithData("ResultadoQuiz",this.resultado);
		if(this.test.tutorial){
		  this.navCtrl.setRoot("TutorialPage");
		}else{
		  this.navCtrl.setRoot("DashboardPage");
		}
		this.loadingCtrl.dismissLoading();
	  }
  }

  async reloadDiet(){    
    let types = await this.diet.getTypes();   
    let products = await this.diet.loadProducts();
    let rules = await this.diet.getRules();
    let dietDocs = await this.diet.load_Diets(this.user.diet).then(data=>{
      let dietReminders:any={};
      this.diet.get_diet_reminders(this.user.uid).then(reminder=>{ 
        console.log(reminder)
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
