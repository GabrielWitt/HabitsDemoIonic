import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { ParticleEffectButtonModule } from "angular-particle-effect-button";

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
	ParticleEffectButtonModule
  ],
})
export class LoginPageModule {}
