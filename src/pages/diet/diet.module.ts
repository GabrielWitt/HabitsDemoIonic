import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DietPage } from './diet';

@NgModule({
  declarations: [
    DietPage,
  ],
  imports: [
    IonicPageModule.forChild(DietPage),
  ],
})
export class DietPageModule {}
