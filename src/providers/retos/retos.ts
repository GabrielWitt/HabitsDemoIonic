import { AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import { Observable } from 'rxjs/Observable';
//import { take, map } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { UserProvider } from '../user/user';
import * as moment from 'moment';

const RETO_NODE = 'retos'; 
const ACTIVITIES_NODE = 'activities'; 
const ACTIVITY_NODE = 'activity'; 
const USER_ACTIVITY_NODE = 'user_activity'; 

export interface DataItem {user_answer: string, timestamp: Date,status: string,uid: string,points:number}

@Injectable()
export class RetosProvider {

	private RetosSet : AngularFirestoreCollection<any>
	private actDataSet : AngularFirestoreCollection<DataItem>
	RetosObservable : Observable<any[]>;
	retosListener:any=null;
	RetosItems:any=[];
	retoActual:any;
	my_team:any;
	
	constructor(private afs: AngularFirestore, public userprov: UserProvider, private alertCtrl:AlertController ) {
			
	}	
	
	public unsubscribe$ = new Subject();
	async loadTeams(reto:any){
		let TeamSet = this.afs.collection(`${RETO_NODE}`).doc(this.userprov.userJson.company.uid).collection(`${RETO_NODE}`).doc(reto.uid).collection('teams', ref => ref.orderBy('pasos', 'desc'));
		await TeamSet.ref.get({source:'cache'}).then(teams =>{
			reto.teams =[];
			for (let i =0 ; i<  teams.docs.length; i++){
				reto.teams.push(teams.docs[i].data());	
			}
			if (this.retoActual && reto.uid  == this.retoActual.uid){
				this.myTeam(reto).then(()=>{
					return;
				})
			}else{
				return ;
			}
		})		
		let TeamObservable = TeamSet.valueChanges().takeUntil(this.unsubscribe$);
		let TeamListen 	   = await TeamObservable.subscribe( teams =>{
			//console.timeEnd('t'  + reto.uid)
			reto.teams = teams;		
			if (this.retoActual && reto.uid  == this.retoActual.uid){
				this.myTeam(this.retoActual).then(()=>{
					return;
				})
			}else{
				return ;
			}
		})
		return TeamListen;		
	}
  
	/*
		Devuelve un mapa con todos los uids de los participantes en un reto
	*/
	participantesUIDS(reto):Array<any>{
		let participantes = [];
		for (let i = 0; i< reto.teams.length; i++){
			let team = reto.teams[i]
			participantes = Object.assign(participantes, team.members);
		}
		return participantes;
	}
	
	myTeam(reto){
		return new Promise((resolve)=>{
			for (let i = 0; i< reto.teams.length; i++){
				let team = reto.teams[i];
				if (team.members[this.userprov.userJson.uid]){
					reto.myTeam = team;
					reto.pos = i + 1;
					break;
				}
			}
			this.retoActual = reto;
			resolve(reto.myTeam);
		})
	}
	
	load_all_retos():any{
		return new Promise((resolve, rejected) => {
			if (this.RetosItems.length ==0 || (this.retosListener && this.retosListener.closed)){
				  if( this.retosListener != undefined){ this.retosListener.unsubscribe(); }
				  this.RetosSet = this.afs.collection(`${RETO_NODE}`).doc(this.userprov.userJson.company.uid).collection(`${RETO_NODE}`,ref=>ref.orderBy('fecha_inicio',"desc"));
				  this.RetosObservable = this.RetosSet.valueChanges().takeUntil(this.unsubscribe$);
				  this.retosListener=this.RetosObservable.subscribe(retos => {
					  this.completeData(retos).then(data=>{ resolve(data); })
				  },error=>{
					console.log(error);
					resolve(this.RetosItems);
				  });
			}else{
				resolve(this.RetosItems);
			}
		});
	}

	private numString(n:number, f:boolean){
		let s = f?'a':'';
		return n<=1?("un"+s):n<=2?("dos"):n<=3?("tres"):n<=4?("cuatro"):n<=5?("cinco"):n;
	}
	
	private dias(n){
		//console.log(n, (n>1?"s":"") )
		let resp = this.numString(n,false) + " dia"+(n>1?"s":"");
		if (n % 7 == 0){
			let d = n / 7;
			resp = this.numString(d,true) + " semana"+(d>1?"s":"");
		}
		if (n % 30 == 0 || n % 31 == 0){
			let d = n % 31 == 0? n / 31 :n / 30;
			resp = this.numString(d,false) + " mes"+(d>1?"es":"");
		}
		if (n % 365 == 0 || n % 366 == 0){
			let d = n % 365 == 0? n / 365 :n / 366;
			resp = this.numString(d,false) + " año"+(d>1?"s":"");
		}
		//console.log(resp);
		
		return resp;
	}
	async completeData(retos){	
		let date = new Date();
		this.RetosItems=retos;	
		for (let i = 0; i< this.RetosItems.length; i++){
			try{
				//console.log(this.RetosItems[i])
				this.RetosItems[i].fecha_inicio = this.RetosItems[i].fecha_inicio.toDate();
				this.RetosItems[i].fecha_fin = this.RetosItems[i].fecha_fin.toDate();
				this.loadTeams(this.RetosItems[i]).then(() =>{
					this.myTeam(this.RetosItems[i]).then(() =>{
						this.RetosItems[i].Dias = parseInt((date.getTime() - new Date(this.RetosItems[i].fecha_inicio).getTime())/(3600000 * 24) + "" )
						this.RetosItems[i].Dias_TotalR = (new Date(this.RetosItems[i].fecha_fin).getTime() - new Date(this.RetosItems[i].fecha_inicio).getTime())/(3600000 * 24) + "" 
						this.RetosItems[i].Dias_Total = Math.round(this.RetosItems[i].Dias_TotalR);						this.RetosItems[i].activo = this.RetosItems[i].Dias_Total - this.RetosItems[i].Dias;
						this.RetosItems[i].duracion_label=  this.dias( parseInt(this.RetosItems[i].Dias_Total));						//console.log(this.RetosItems[i]);
					})
				}) 	
			}catch(e){
				console.log(e);
			}
		}
		return this.RetosItems;
	}
	
	public async create_team(team){
		
		let uid = this.afs.createId();
		if (!team["uid"]  )
			team["uid"] = uid;
		else
			uid = team["uid"];
		this.RetosSet.doc(team.reto).collection('teams').doc(uid).set(team);
	}

	//Busca el ultimo reto y tu equipo si existe
	checkChallenge(): any{
		return new Promise((resolve)=>{
			this.load_all_retos().then( retos => {
				if(retos[0]){
						setTimeout(() => {
							resolve(retos[0]);
						}, 500);
				}else{resolve(false);} 
			})
		})
	}

	//Guarda los pasos/fecha actuales y calcula el promedio de pasos de equipo. 
	updateChallegeSteps(company_uid,reto,user_uid,steps,update){
		return new Promise((resolve)=>{
			let puntos = steps; let members = {}; let mbrs = Object.keys(reto.myTeam.members);
			for(let member of mbrs){
				if(member==user_uid){members[user_uid]={pasos:steps,last_update:update};}				
				else{ 
					members[member]=reto.myTeam.members[member];
					if(reto.myTeam.members[member].pasos) puntos+=reto.myTeam.members[member].pasos
				}
			}
			if(puntos!=0) puntos = Math.round(puntos/mbrs.length); let reto_update = {members:members,pasos:puntos};
			this.afs.doc(`retos/${company_uid}/retos/${reto.uid}/teams/${reto.myTeam.uid}`).update(reto_update).then(()=>{
				resolve(moment().toDate());
			}).catch(error=>resolve(JSON.stringify(error)));
		})
	}

	//////////////////////////////////////////////ACTIVITIES/////////////////////////////////////////////
	
	async loadActvities(){
		let ActivityListen = []
		let actSet = this.afs.collection(`${ACTIVITIES_NODE}`).doc(this.userprov.userJson.company.uid).collection(`${ACTIVITY_NODE}`, ref => ref.orderBy('timestamp', 'desc'));
		await actSet.ref.get().then(activities =>{
			let list = [];
			activities.forEach(activity=>{list.push(activity.data())});
			ActivityListen = list;
		})		
		ActivityListen = await this.load_user_activities(this.userprov.userJson.uid,ActivityListen)
		//console.log(ActivityListen);
		return ActivityListen;		
	}

	async load_user_activities(user_uid,activity_list){
		let now = moment().toDate();
		this.actDataSet = this.afs.collection(USER_ACTIVITY_NODE).doc(user_uid).collection("activities");
		let list = {};
		for(let activity of activity_list){
			list[activity.uid] = activity;
		}
		await this.actDataSet.ref.get().then(user_activities =>{
			user_activities.forEach(act=>{
				let	activity=act.data();
				//console.log(activity.uid,list,list[activity.uid])		
				list[activity.uid]['status'] = activity['status'];	
				list[activity.uid]['timestamp'] = activity['timestamp'].toDate();
				list[activity.uid]['user_answer'] = activity['user_answer'];
			});
			return ;
			//console.log(list);		
		})
		return activity_list;
	}

	public async save_activity_item(act:DataItem){
		return new Promise((resolve,rejected)=>{
			this.actDataSet.doc(act.uid).set(act).then(()=>{
			  let description = "<img class='img-point' src='./assets/imgs/clock_act.png'><br>Nuestro equipo la evaluará y en máximo 48 horas tendrás los puntos respectivos (Si cumpliste correctamente)";
			  let activityAlert = this.alertCtrl.create({
				  title: '¡Realizaste una actividad!',
				  message: description,
				  enableBackdropDismiss: false,
				  buttons: [{text:'OK', role: 'cancel',}]
			  });
			  activityAlert.present();
			  	resolve();
			}).catch(error=>{	
				rejected(error);
			})
		})
	}

}
