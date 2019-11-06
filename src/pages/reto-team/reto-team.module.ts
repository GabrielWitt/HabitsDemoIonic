import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RetoTeamPage } from './reto-team';

import { PipesModule } from  '../../pipes/pipes.module';

@NgModule({
  declarations: [
    RetoTeamPage,
  ],
  imports: [
    IonicPageModule.forChild(RetoTeamPage),
	PipesModule
  ],
})
export class RetoTeamPageModule {}
