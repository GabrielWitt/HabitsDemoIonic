import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Reminder } from '../../interfaces/reminder';
import { LocalNotification } from '../../interfaces/local-notification';
import { loadingProvider } from '../alert/alert';

@Injectable()
export class PushNotificationProvider {

  constructor(
    public localNotification: LocalNotifications,
    public platform: Platform,
    //private toastCtrl: AlertController,
    private alerts: loadingProvider
    ) {
      this.localNotification.setDefaults({
        led: { color: '#4B8DFE', on: 500, off: 500 },
        vibrate: true,
        sound: this.platform.is('android') ? 'file://assets/GOT_alarm.mp3' : 'file://Staging/www/assets/GOT_alarm.caf',//
        icon: "file://assets/LogoHabitspng.png",
      })
  }

  loadListener(){
    this.localNotification.on('click').subscribe(notification => {
      //this.presentToast(JSON.stringify(notification))
    })
    this.localNotification.on('ver').subscribe(notification => {
      this.alerts.ShowInfoAlert(notification.title,notification.text)
    })
  }

  public sendLocalNotification(title?: string, text?: string){
    let now = new Date();
    let hour = now.getHours()
    let minutes = (now.getMinutes()+2)
    if(minutes > 59){
      hour++;
      minutes = 0;
    }
    let testNotificacions =[{
      id: 1,
      title: title ? title : 'Habits AI',
      text: text ? text : 'Recuerda Comer verduras',
      trigger: {        
        every:{ weekday: now.getDay(), hour: hour, minute: minutes },
        count: 365,
      },
      led: { color: '#4B8DFE', on: 500, off: 500 },
      vibrate: true,
      sound: 'file://assets/ALARMA_HABITS.wav'
      //actions: [{ id: 'ver', title: 'Ver' }]
    },
    {
      id: 2,
      title: 'Habits AI',
      text: "Su notificacion ha sido programada para aparecer en 1 minuto.",
      led: { color: '#4B8DFE', on: 500, off: 500 },
      vibrate: true,
      sound: 'file://assets/ALARMA_HABITS.wav'
   }]
    this.localNotification.schedule(testNotificacions);
    console.log(JSON.stringify(testNotificacions));
   //this.presentToast(JSON.stringify(this.localNotification.getScheduled()))
  }         

  public async prepareNotificationReminder(operation:string, reminder: Reminder, typeID: number, title?:string){
    let selfCount = reminder.notificacion_id - typeID;
    let weekReminders: LocalNotification[] = []; let ids:string[]=[];
    for(let i=0;i<7;i++){
      let checkDay = false;
      if(reminder.frequency["d"+i]) checkDay = true;
      let dayId = (7*selfCount)+i+1+typeID;
      ids.push(""+dayId)
      if(checkDay){
        let dayCode = i;
        let hour=parseInt(reminder.hour.split(":")[0]); let min=parseInt(reminder.hour.split(":")[1]); 
        let notificationLoader : LocalNotification = {
          id: dayId,
          title: 'Recordatorio',
          text: reminder.name,
          trigger:{
            count: 365,
            every:{
              weekday: dayCode,
              hour: hour,
              minute: min,
            }
          },
          led: { color: '#4B8DFE', on: 500, off: 500 },
          vibrate: true,
          sound: 'file://assets/ALARMA_HABITS.wav'
        }
        weekReminders.push(notificationLoader)
      }
    }
    console.log(weekReminders)
    console.log(JSON.stringify(ids))
    if(operation == "SAVE"){
      this.schdeuleLocalNotification(weekReminders)
    }else{
      this.cancelLocalNotification(ids).then(() => {
        this.schdeuleLocalNotification(weekReminders)
      })
    }
  }

  public async schdeuleLocalNotification(notifications){
    console.log(JSON.stringify(notifications));
    let title = "";
    for(let alert of notifications){
      await this.localNotification.schedule(alert)
      console.log(alert.title+" ha sido asignado al id: "+alert.id+" correctamente");
      title = alert.text;
    }   
    this.alerts.ShowInfoAlert("Recordatorio: "+title,"Ha sido programado exitosamente.")
    return; 
  } 

  public async cancelLocalNotification(ids:string[]){
    for(let id of ids){
      this.localNotification.cancel(id)
    }
    return;
  }

  public async deleteLocalNotification(reminder:Reminder, typeID: number){
    let selfCount = reminder.notificacion_id - typeID;
    let ids:string[]=[];
    for(let i=0;i<7;i++){
      let dayId = (7*selfCount)+i+1+typeID;
      ids.push(""+dayId)
    }
    this.cancelLocalNotification(ids).then(() => {
      return;
    })
  }

  public async checkPermission(): Promise<boolean> {
    let isPermited: boolean = await this.localNotification.hasPermission();
    return isPermited;
  }

  public async requestPermission(): Promise<boolean>{
    let isRequested = await this.localNotification.requestPermission();
    return isRequested;
  }

  public async getAllIds(){
    if(this.platform.is('cordova')){return await this.localNotification.getIds()}
    else{return [];}
  }

  cancelDietLocalNotification(){
      //console.log(this.active)
      let ids = [];
      for(let i=50;i<85;i++){ ids.push(""+i); }
      this.cancelLocalNotification(ids)
  }
}
