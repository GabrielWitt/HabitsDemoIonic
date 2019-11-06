import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewsPage } from './news';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    NewsPage,
  ],
  imports: [
    IonicPageModule.forChild(NewsPage),
    IonicImageLoader
  ]
})
export class NewsPageModule {}
