import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';

/**
 * Generated class for the AnaimgPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-anaimg',
  templateUrl: 'anaimg.html',
})
export class AnaimgPage {

	chatBotRoom:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,  private chatProvider: ChatProvider,public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
	this.chatBotRoom =  this.navParams.get('chatRoom');
  }
  
  selectImg(path:string){
		this.chatProvider.changeBotImag(path, this.chatBotRoom.uid).then( ()=>{
			this.viewCtrl.dismiss(path);
		}
	);
  }
  
  back(path:string){
		
			this.viewCtrl.dismiss(null);
	
  }

}
