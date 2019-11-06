import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewChatRoomPage } from './new-chat-room';
import { PipesModule } from  '../../pipes/pipes.module';

@NgModule({
  declarations: [
    NewChatRoomPage,
  ],
  imports: [
    IonicPageModule.forChild(NewChatRoomPage),
	  PipesModule 
  ],
})
export class NewChatRoomPageModule {}
