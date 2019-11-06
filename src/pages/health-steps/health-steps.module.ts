import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HealthStepsPage } from './health-steps';

@NgModule({
  declarations: [
    HealthStepsPage,
  ],
  imports: [
    IonicPageModule.forChild(HealthStepsPage),
  ],
})
export class HealthStepsPageModule {}
