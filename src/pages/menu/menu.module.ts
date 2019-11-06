import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MenuPage } from './menu';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    MenuPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuPage),
    IonicImageLoader
  ],
})
export class MenuPageModule {}
