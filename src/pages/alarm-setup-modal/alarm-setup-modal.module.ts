import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlarmSetupModalPage } from './alarm-setup-modal';

@NgModule({
  declarations: [
    AlarmSetupModalPage,
  ],
  imports: [
    IonicPageModule.forChild(AlarmSetupModalPage),
  ],
})
export class AlarmSetupModalPageModule {}
