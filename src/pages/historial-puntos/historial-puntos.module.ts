import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HistorialPuntosPage } from './historial-puntos';
import { PipesModule } from  '../../pipes/pipes.module';

@NgModule({
  declarations: [
    HistorialPuntosPage,
  ],
  imports: [
    IonicPageModule.forChild(HistorialPuntosPage),
	 PipesModule 
  ],
})
export class HistorialPuntosPageModule {}