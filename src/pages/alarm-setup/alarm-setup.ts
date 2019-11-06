import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Reminder } from '../../interfaces/reminder';
import { HabitProvider } from '../../providers/habit/habit';
import { Observable } from 'rxjs/observable'
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { PushNotificationProvider } from '../../providers/push-notification/push-notification';
import { loadingProvider } from '../../providers/alert/alert';

@IonicPage()
@Component({
  selector: 'page-alarm-setup',
  templateUrl: 'alarm-setup.html',
})
export class AlarmSetupPage {

  alarmType: string;
  alarmName: string;
  chatAlarm: boolean;
  reminders: Observable<Reminder[]>;
  userUID: string;
  goalSelection: any;
  daysObject = {
    d1: {
      name: "Lunes",
      short: 'lun.',
      selected: false,
    },
    d2: {
      name: "Martes",
      short: 'mar.',
      selected: false,
    },
    d3: {
      name: "Miércoles",
      short: 'mié.',
      selected: false,
    },
    d4: {
      name: "Jueves",
      short: 'jue.',
      selected: false,
    },
    d5: {
      name: "Viernes",
      short: 'vie.',
      selected: false,
    },
    d6: {
      name: "Sábado",
      short: 'sáb.',
      selected: false,
    },
    d0: {
      name: "Domingo",
      short: 'dom.',
      selected: false,
    }
  }

  type = ["exercise_reminder","medicine_reminder","alimentation_reminder","habit_reminder"]
  typeID = 0;
  count = 0;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public habitProvider: HabitProvider,
	  private analytics:AnalyticsProvider,
    public alert: loadingProvider,
    private setAlarm: PushNotificationProvider,
    private localNotification:PushNotificationProvider
    ) {
    this.alert.showLoading("Obteniendo recordatorios...")
    this.userUID = this.navParams.get('userUID');
    this.alarmType = this.navParams.get('alarmType');
    this.alarmName = this.navParams.get('alarmName');
    this.chatAlarm = this.navParams.get('chatAlarm');
    this.chatAlarm = this.navParams.get('chatAlarm');
    this.goalSelection = this.navParams.get('goalSelection');
		this.analytics.saveScreen("Configuración Alarma");
    for(let i=0;i<this.type.length;i++){
      //console.log(this.type[i]+" : "+(i+1)*200);
      if(this.type[i] == this.alarmType){
        this.typeID = (i+1)*200;
      }
    }
    this.loadNotificationByType();
  }

  async loadNotificationByType() {
    let that = this;
    this.reminders = await this.habitProvider.getAlarmType(this.alarmType, this.userUID);
    this.count = this.typeID;
    this.reminders.forEach(data =>{
      data.forEach(remind =>{
        //console.log(remind)
        this.count++;
      })
      that.alert.dismissLoading();
    })    
    this.localNotification.getAllIds().then(alerts => {
      //console.log(JSON.stringify(alerts)); 
      let typeCount = 0;
      if(!alerts){ this.alert.showToast('Sus alarmas estan inactivas.', 'middle', false, 3000);}
      else{
        for(let alert of alerts){
          //console.log(alert+"/"+this.typeID+"="+Math.round(alert/this.typeID))
          if(Math.round(alert/this.typeID)==1) typeCount++;
        }
        if(!typeCount) this.alert.showToast('Sus alarmas estan inactivas.', 'bottom', false, 3000)
      }
    })
  }

  saveAlarm() {
    console.log(this.count-this.typeID)
    if((this.count-this.typeID) < 26){
    this.showAlarmModal((reminderData => {
      if (reminderData) {
        reminderData.type = this.alarmType;
        reminderData.user = this.userUID;
        reminderData.notificacion_id = this.count;
        this.habitProvider.saveAlarm(reminderData, this.typeID).then(() => {
          this.analytics.EventWithData("Crear_alarma",this.alarmType)
         });
      }
    }));
    }else{
      this.alert.showToast('Ups, has superado el límite de alarmas. Por favor elimina una alerta para poder crear otra.', 'top', false, 3000);
    }
  }

  editAlarm(reminder: Reminder) {
    this.showAlarmModal((reminderData => {
      if (reminderData) {
        this.habitProvider.editAlarm(reminderData, this.typeID).then(() => {
          this.analytics.EventWithData("Editar_alarma",this.alarmType)
        });
      }
    }), reminder, this.typeID);
  }

  deleteAlarm(reminder: Reminder) {
	console.log( this.typeID);
  this.analytics.EventWithData("Borrar_alarma",this.alarmType)
    this.habitProvider.deleteAlarm(reminder, this.typeID).then(() => {
      this.loadNotificationByType();
    });
  }

  changeAlarmStatus(reminder: Reminder) {
    reminder.status = reminder.status!
    this.habitProvider.editAlarm(reminder, this.typeID).then(() => {
      this.analytics.EventWithData("Cambio_Status_alarma",this.alarmType)
    });
  }

  showAlarmModal(callback: (reminder: Reminder) => void, reminder: Reminder = null, typeID: number = 0) {
    let alarmModal = this.modalCtrl.create('AlarmSetupModalPage', { reminder_data: reminder, alarmName: this.alarmName,type_ID: typeID  });
    alarmModal.present();
    alarmModal.onDidDismiss(data => callback(data));
  }

  getAalarmName(reminder: Reminder) {
    let daysText = '';
    let sunday = '';
    let daysArray = Object.keys(reminder.frequency);
    daysArray.forEach(dayCode => {
      if (dayCode == 'd0') {
        sunday = this.daysObject[dayCode].short;
      } else {
        daysText += this.daysObject[dayCode].short + ' ';
      }
    });
    return reminder.name + ' ' + daysText + sunday;
  }

  close() {
    if(this.goalSelection){
      this.navCtrl.pop()      
      this.navCtrl.pop()
      this.navCtrl.push("NewHabitPage",{goalSelection:this.goalSelection})
    }else{
      this.navCtrl.pop()
    }
  }

  alarm(){
    this.setAlarm.sendLocalNotification();
  }


}
