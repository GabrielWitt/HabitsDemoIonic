import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Realtime } from '../../providers/social/social';
import { RetosProvider } from '../../providers/retos/retos';

@IonicPage()
@Component({
  selector: 'page-reto-team',
  templateUrl: 'reto-team.html',
})
export class RetoTeamPage {
	
  teamActual:any;
  retoActual:any;
  uidUser:any="uidP2";
  participantes:any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private socialservice: Realtime, private retosprovider: RetosProvider) {
	this.teamActual =  this.navParams.get('team');
	this.retoActual =  this.navParams.get('reto');
	this.socialservice.user_card_list_map(this.teamActual.members).then(user_card_list => {
		this.participantes =user_card_list.sort( (a,b) =>{
			return  (this.teamActual.members[a.uid].pasos || 0) < (this.teamActual.members[b.uid].pasos  || 0)? 1:-1 }
		);	
    })
	this.uidUser = this.retosprovider.userprov.userJson.uid
	
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RetoTeamPage');
  }

}
