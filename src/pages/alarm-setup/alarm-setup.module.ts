import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AlarmSetupPage } from './alarm-setup';
import { AlarmSetupModalPageModule } from '../alarm-setup-modal/alarm-setup-modal.module'

@NgModule({
  declarations: [
    AlarmSetupPage,
  ],
  imports: [
    IonicPageModule.forChild(AlarmSetupPage),
    AlarmSetupModalPageModule
    
  ],
  entryComponents:[
  ]
  
})
export class AlarmSetupPageModule {}
