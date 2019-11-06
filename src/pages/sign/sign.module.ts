import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignPage } from './sign';
import { ParticleEffectButtonModule } from "angular-particle-effect-button";

@NgModule({
  declarations: [
    SignPage,
  ],
  imports: [
    IonicPageModule.forChild(SignPage),
	ParticleEffectButtonModule
  ],
})
export class SignPageModule {}
