import { Component } from '@angular/core';
import { ViewController, ToastController, AlertController, NavParams, Platform, IonicPage } from 'ionic-angular';
import { Reminder } from '../../interfaces/reminder';
import { HabitProvider } from '../../providers/habit/habit';
//import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the AlarmSetupModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-alarm-setup-modal',
  templateUrl: 'alarm-setup-modal.html',
})
export class AlarmSetupModalPage {
  minHour: string;
  typeID:number=0;
  canDelete = false;
  reminder: Reminder ={
    frequency: {},
    name: '',
    hour: ''
  };
  daysArray = [
    {
      name: "Lunes",
      code: 'd1',
      selected: false,
    },
    {
      name: "Martes",
      code: 'd2',
      selected: false,
    },
    {
      name: "Miércoles",
      code: 'd3',
      selected: false,
    },
    {
      name: "Jueves",
      code: 'd4',
      selected: false,
    },
    {
      name: "Viernes",
      code: 'd5',
      selected: false,
    },
    {
      name: "Sábado",
      code: 'd6',
      selected: false,
    },
    {
      name: "Domingo",
      code: 'd0',
      selected: false,
    }
  ];

  recordatorioOtro: string;
  food: boolean = true;

  constructor(public params: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
	  public habitProvider: HabitProvider,
	  //private analytics:AnalyticsProvider,
    public platform: Platform,
    private auth:AuthProvider) {
    if(this.params.get('alarmName') == 'Alimentación'){this.food = true}else{this.food = false}
    //console.log(this.params.get('alarmName'),this.food)
    this.minHour = "00:00";
	  if (this.params.get('type_ID') != 0) {
      this.typeID = this.params.get('type_ID');
    } 
    if (this.params.get('reminder_data') === null) {
      this.reminder = {
        frequency: {},
        name: '',
        hour: ''
      }
    } else {
      this.reminder = this.params.get('reminder_data');
      this.recordatorioOtro = this.reminder.name
      let frequency = this.reminder.frequency;
      this.daysArray.forEach((day, index) => {
        if(frequency.hasOwnProperty(day.code)){
          this.daysArray[index].selected = true;
        }
      })
	  
      this.reminder.frequency = {};
	  this.canDelete = true;
      //console.log(this.daysArray)
    }
  }

  setReminder() {
    let now = new Date();
    if(this.recordatorioOtro != "") this.reminder.name = this.recordatorioOtro;
    let hourArray = this.reminder.hour.split(':');
    let hours = Number.parseInt(hourArray[0]);
    let minutes = Number.parseInt(hourArray[1]);
    now.setHours(hours, minutes);
    this.reminder.date = now.toISOString();
    this.reminder.status = true;
    this.daysArray.forEach(dayData => {
      if (dayData.selected) {
        this.reminder.frequency[dayData.code] = true;
      }
    });
    this.dismiss(this.reminder);
  }

  dismiss(reminder: Reminder = null) {
    this.auth.keyboardHide();
    this.viewCtrl.dismiss(reminder);
  }

  deleteAlarm(reminder: Reminder) {
    this.habitProvider.deleteAlarm(reminder, this.typeID).then(() => {     
    });	
	  this.dismiss();
  }
 

}
