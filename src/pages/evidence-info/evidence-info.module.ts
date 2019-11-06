import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EvidenceInfoPage } from './evidence-info';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    EvidenceInfoPage,
    //CardNewsComponent
  ],
  imports: [
    IonicPageModule.forChild(EvidenceInfoPage),
    ComponentsModule
  ],
})
export class EvidenceInfoPageModule {}
