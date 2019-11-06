import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DietRemindersPage } from './diet-reminders';

@NgModule({
  declarations: [
    DietRemindersPage,
  ],
  imports: [
    IonicPageModule.forChild(DietRemindersPage),
  ],
})
export class DietRemindersPageModule {}
