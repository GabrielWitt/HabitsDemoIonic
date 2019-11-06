import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DietInfoPage } from './diet-info';

@NgModule({
  declarations: [
    DietInfoPage
  ],
  imports: [
    IonicPageModule.forChild(DietInfoPage),
  ],
})
export class DietInfoPageModule {}
