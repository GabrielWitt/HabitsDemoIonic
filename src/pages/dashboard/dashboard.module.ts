import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DashboardPage } from './dashboard';
import { ComponentsModule } from '../../components/components.module';
import { IonicImageLoader } from 'ionic-image-loader';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    DashboardPage,
  ],
  imports: [
    IonicPageModule.forChild(DashboardPage),
    ComponentsModule,
    IonicImageLoader,
    PipesModule  
  ]  
})
export class DashboardPageModule {}
