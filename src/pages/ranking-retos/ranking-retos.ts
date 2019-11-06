import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { RetosProvider } from '../../providers/retos/retos';

@IonicPage()
@Component({
  selector: 'page-ranking-retos',
  templateUrl: 'ranking-retos.html',
})
export class RankingRetosPage {

	retoActual:any;
	uidTeam:any="uid7";
	myTeam:any;  
	typeI:boolean= false;
	user:any;
  	constructor(
	  public navCtrl: NavController, 
	  public navParams: NavParams, 
	  public userProvider: UserProvider,
	  private retosprovider: RetosProvider
	) { this.retoActual =  this.navParams.get('reto'); }

  ionViewWillEnter() {
	this.myTeam    =  this.retoActual.myTeam;
	this.user = this.userProvider.static_user();
	//console.log(this.user);
	this.retoActual.teams.sort( (a,b) =>{
			return  (a.pasos || 0) < (b.pasos  || 0)? 1:-1 }
	);
	this.typeI= this.retoActual.type == 'ranking_individual'?true:false;
  }
  
  	selectTeam(team){
		this.navCtrl.push('RetoTeamPage',  {reto: this.retoActual, team: team});
	}
	
	nuevoGrupo(reto){
		if (!this.myTeam){
			if (!this.typeI){
				this.navCtrl.push("NewChatRoomPage",  {reto: this.navParams.get('reto')});
			}else{
				let team = {
					uid: this.user.uid,
					tipo: 'ranking_individual',
					name: this.user.name_first,
					last_update: new Date(),
					pasos: 0,
					picture: this.user.picture,
					reto: this.retoActual.uid,
					members:{}
              }
              for(var i=0;i<1;i++){
                team.members[this.user.uid] = true;
              }
				this.retosprovider.create_team(team);
			}

		}
	}
}
