import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupInfoPage } from './group-info';
import { IonicImageLoader } from 'ionic-image-loader';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    GroupInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupInfoPage),
    IonicImageLoader,
    ComponentsModule,
  ],
})
export class GroupInfoPageModule {}
