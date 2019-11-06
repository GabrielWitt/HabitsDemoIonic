import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewHabitPage } from './new-habit';
import { PipesModule } from '../../pipes/pipes.module';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    NewHabitPage,
  ],
  imports: [
    IonicPageModule.forChild(NewHabitPage),
    PipesModule,
    IonicImageLoader,
  ],
})
export class NewHabitPageModule {}
