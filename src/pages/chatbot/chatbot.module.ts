import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatbotPage } from './chatbot';
import { PipesModule } from  '../../pipes/pipes.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ChatbotPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatbotPage),
    PipesModule,
    ComponentsModule
  ],
})
export class ChatbotPageModule {}
