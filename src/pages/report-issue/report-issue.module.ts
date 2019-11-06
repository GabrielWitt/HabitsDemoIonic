import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportIssuePage } from './report-issue';
import { PipesModule } from  '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ReportIssuePage
  ],
  imports: [
    IonicPageModule.forChild(ReportIssuePage),
    PipesModule,
  ],
})
export class ReportIssuePageModule {}
