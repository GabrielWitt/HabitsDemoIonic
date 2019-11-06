import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MandatoryVideoPage } from './mandatory-video';

@NgModule({
  declarations: [
    MandatoryVideoPage,
  ],
  imports: [
    IonicPageModule.forChild(MandatoryVideoPage),
  ],
})
export class MandatoryVideoPageModule {}
