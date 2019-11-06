import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoadscreenPage } from './loadscreen';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    LoadscreenPage,
  ],
  imports: [
    IonicPageModule.forChild(LoadscreenPage),
    ComponentsModule,
  ],
})
export class LoadscreenPageModule {}
