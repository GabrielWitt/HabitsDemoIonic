import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PushNotificationProvider } from '../../providers/push-notification/push-notification';
import { LocalNotification } from '../../interfaces/local-notification';
import { loadingProvider } from '../../providers/alert/alert';
import { User } from '../../interfaces/User';
import { DietProvider } from '../../providers/diet/diet';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AuthProvider } from '../../providers/auth/auth';

@IonicPage()
@Component({
  selector: 'page-diet-reminders',
  templateUrl: 'diet-reminders.html',
})
export class DietRemindersPage {
  user: User
  active = false;
  daysArray = [
    {
      name: "Lunes",
      code: '1',
      selected: false,
    },
    {
      name: "Martes",
      code: '2',
      selected: false,
    },
    {
      name: "Miércoles",
      code: '3',
      selected: false,
    },
    {
      name: "Jueves",
      code: '4',
      selected: false,
    },
    {
      name: "Viernes",
      code: '5',
      selected: false,
    },
    {
      name: "Sábado",
      code: '6',
      selected: false,
    },
    {
      name: "Domingo",
      code: '0',
      selected: false,
    }
  ];
  foods=[
    {
      name: "Desayuno",
      hour:"00:00",
      text: ""
    },
    {
      name: "Colación 1",
      hour:"00:00",
      text: ""
    },
    {
      name: "Comida",
      hour:"00:00",
      text: ""
    },
    {
      name: "Colación 2",
      hour:"00:00",
      text: ""
    },
    {
      name: "Cena",
      hour:"00:00",
      text: ""
    },
  ];
  notificacionts={};
  dietReminders: any;
  dietData: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private localNotification: PushNotificationProvider,
    public dietService: DietProvider,
	  private analytics:AnalyticsProvider,
    private alerts: loadingProvider,
    private auth: AuthProvider
    ) {
  }

  ionViewDidLoad() {
    this.user = this.navParams.get("user")
    this.notificacionts = this.navParams.get("dietText")
    console.log(this.notificacionts)
    this.dietReminders = this.navParams.get('dietReminders');
    console.log(this.dietReminders)
    this.dietData = this.navParams.get('dietData');
    console.log(this.dietData)
    if(!this.dietReminders["empty"]){
      this.foods = this.dietReminders.hours;
      this.daysArray = this.dietReminders.days;
      this.active = this.dietReminders.active;
      console.log(this.foods)
      for(let i=0;i<5;i++){
        this.foods[i]["text"] = this.notificacionts[i]
      }
    }else{
      for(let i=0;i<5;i++){
        this.foods[i]["text"] = this.notificacionts[i]
      }
    }
  } 

  ionViewDidEnter(){  
		this.analytics.saveScreen("Recodatorios de dieta");
	}

  getActive(){
    if(this.active){
      return "Activas"
    }else{
      return "Inactivas"
    }
  }

  changeAlarmStatus(){
    this.alerts.presentToast("Presione guardar para que los cambios tengan efecto.");
    this.dissmissKeyboard();
  }

  async setAlerts(){
    this.dissmissKeyboard()
    let days = [];
    this.daysArray.forEach((day) => {
      if(day.selected) days.push(day.code)
    })
   let checkHour = true;let checkDays = true; let notId = 49;
   let alerts: LocalNotification[] = [];
   for(let food of this.foods){
    if(food.hour == "00:00"){ checkHour = false; break;}
    if(!days.length){ checkDays = false; break;}
    let hour=parseInt(food.hour.split(":")[0]); let min=parseInt(food.hour.split(":")[1]); 
    for(let day of days){
      notId++;
      let notificationLoader : LocalNotification = {
        id: notId,
        title: food.name+":",
        text: food.text,
        trigger:{
          count: 365,
          every:{
            weekday: parseInt(day),
            hour: hour,
            minute: min,
          }
        }
      }
      alerts.push(notificationLoader)
    }
   }
   //console.log(alerts)//JSON.stringify()
   if(checkHour && checkDays){
    this.alerts.showLoading("Guardando Recordatorios")
      await this.dietService.save_diet_reminders(this.user.uid,this.daysArray,this.foods,this.active,this.user.diet).then(() => {return;})  
      if(this.active){
        await this.localNotification.schdeuleLocalNotification(alerts).then(() => {return;});
        this.alerts.dismissLoading();
        this.navCtrl.pop();
        this.alerts.presentToast("Sus notificaciones y configuracion ha sido guardadas.");
      }else{
        this.cancelLocalNotification()
        this.navCtrl.pop();
        this.alerts.dismissLoading();
        this.alerts.presentToast("Su configuracion ha sido guardada, para activar las notificaciones deslice el botón de estado de notificaciones.");
      }
      this.dietService.save_reminder_update(this.user.uid);
      console.log("update_time")
   }else{
    if(!checkDays){
      this.alerts.presentToast("Por favor configure los dias de las notificaciones para continuar...");
    }else{
      this.alerts.presentToast("Por favor configure todas las horas de las comidas para continuar...");
    }
   }
  }

  cancelDietLocalNotification(){
      //console.log(this.active)
      let ids = [];
      for(let i=50;i<85;i++){ ids.push(""+i); }
      this.localNotification.cancelLocalNotification(ids)
  }

  testLN(){
    this.localNotification.sendLocalNotification(this.foods[2].name,this.foods[2].text)
  }

  getIDS(){
    this.localNotification.getAllIds()
  }

  dissmissKeyboard(){
    this.auth.keyboardHide()
  }
  
  close(){
    this.dissmissKeyboard();
    this.navCtrl.pop();
  }
  
  cancelLocalNotification(){
    this.localNotification.cancelDietLocalNotification();
  }
  

}
