import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SocialPage } from './social';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    SocialPage,
  ],
  imports: [
    IonicPageModule.forChild(SocialPage),
    IonicImageLoader
  ],
})
export class SocialPageModule {}
