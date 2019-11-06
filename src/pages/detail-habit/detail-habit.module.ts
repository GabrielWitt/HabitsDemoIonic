import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailHabitPage } from './detail-habit';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    DetailHabitPage,
  ],
  imports: [
    IonicPageModule.forChild(DetailHabitPage),
    ComponentsModule
  ],
})
export class DetailHabitPageModule {}
