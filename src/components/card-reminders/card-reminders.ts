import { Component, Input, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
/**
 * Generated class for the CardRemindersComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'card-reminders',
  templateUrl: 'card-reminders.html'
})
export class CardRemindersComponent {
  @Input("user") user: any;
  userUID: string;
  showRemind = false;

  constructor(public navCtrl: NavController,
    private userProvider: UserProvider,
    private ngzone: NgZone) {
  }

  ngOnChanges(): void {
    this.ngzone.run(() => {
      let key=""; if(this.user) key = this.user.company.key;
      if(this.user && this.userProvider.CheckMedVersion(key)){
        this.userUID = this.user.uid;
        this.showRemind = true;
      }
    })
  }


  openAlarm(type: string, name: string) {
    this.navCtrl.push('AlarmSetupPage', {
      alarmType: type,
      alarmName: name,
      chatAlarm: false,
      userUID: this.userUID
    });
  }

}
