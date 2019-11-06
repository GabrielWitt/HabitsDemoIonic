import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RankingRetosPage } from './ranking-retos';
import { PipesModule } from  '../../pipes/pipes.module';

@NgModule({
  declarations: [
    RankingRetosPage,
  ],
  imports: [
    IonicPageModule.forChild(RankingRetosPage),
	  PipesModule 
  ],
})
export class RankingRetosPageModule {}
