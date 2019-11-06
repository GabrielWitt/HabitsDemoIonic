import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ElearningPage } from './elearning';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ElearningPage,
  ],
  imports: [
    IonicPageModule.forChild(ElearningPage),
    IonicImageLoader
  ],
})
export class ElearningPageModule {}
