import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NuevoEquipoPage } from './nuevo-equipo';

@NgModule({
  declarations: [
    NuevoEquipoPage,
  ],
  imports: [
    IonicPageModule.forChild(NuevoEquipoPage),
  ],
})
export class NuevoEquipoPageModule {}
