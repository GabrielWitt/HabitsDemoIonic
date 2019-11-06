import { Component, Input, AfterContentInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { UserGoal } from '../../interfaces/user-goal';
import { HabitGoal } from '../../interfaces/habit-goal';
import { UserProvider } from '../../providers/user/user';
import { HabitProvider } from '../../providers/habit/habit';
import { SettingsProvider } from '../../providers/settings/settings';

@Component({
  selector: 'card-habit',
  templateUrl: 'card-habit.html'
})
export class CardHabitComponent implements AfterContentInit {
  @Input("user_goal") userGoal: UserGoal;
  label:any;

  addNewHabitAnimation: boolean = false;
  goal: HabitGoal;
  goalAdvance: UserGoal[];

  constructor(
    public navCtrl: NavController,
    public userprovider: UserProvider,
    public habitprovider: HabitProvider,
    private language: SettingsProvider
  ) {
    this.label = this.language.getLanguage('CardHabitComponent');
  }

  ngAfterContentInit(): void {
    //console.log(this.userGoal)
    this.habitprovider.setHabitSubcategory(this.userGoal.category,this.userGoal.subcategory);
    this.label = this.language.getLanguage('CardHabitComponent');
    this.habitprovider.getMyAdvance(this.userGoal.uid).subscribe(goal_advance => {
      let sortedData = goal_advance.sort(function(a, b) {
        let C = new Date(a.timestamp);
        let D = new Date(b.timestamp);
        return C<D ? -1 : C>D ? 1 : 0;
      });
      if(sortedData.length>10){
        this.goalAdvance = sortedData.slice(Math.max(sortedData.length - 10, 1));
      }else{
        this.goalAdvance = sortedData;
      }
    })
  }

  checkPercent(percent){
    if(percent>100){ return 100;}
    else{ return percent;}
  }


  openDetail() {
    this.navCtrl.push("DetailHabitPage", {userGoal: this.userGoal, goalAdvance:this.goalAdvance});
  }
  
  openAlarm() {
    this.navCtrl.push('AlarmSetupPage', {
      alarmType: 'habit_reminder',
      alarmName: 'Recordatorios',
      chatAlarm: false,
      userUID: this.userGoal.user
    });
  }

}
