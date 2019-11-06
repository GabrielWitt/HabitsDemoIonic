import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditDietPage } from './edit-diet';

@NgModule({
  declarations: [
    EditDietPage,
  ],
  imports: [
    IonicPageModule.forChild(EditDietPage),
  ],
})
export class EditDietPageModule {}
