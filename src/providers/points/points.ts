import { Injectable } from '@angular/core';
import { Point } from '../../interfaces/points';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { AngularFireDatabase } from '@angular/fire/database';
import { AlertController, Events } from 'ionic-angular';
import { AnalyticsProvider } from '../analytics/analytics';
import { UserProvider } from '../user/user';
import { SettingsProvider } from '../settings/settings';

import { Subject } from 'rxjs/Subject';
import { take } from 'rxjs/operators';
import { loadingProvider } from '../alert/alert';

const LISTENER_NODE = 'user_card';
const POINTS_NODE = 'user_points';

export interface PointsOptions {text: string,role: string, handler?: any}

@Injectable()
export class PointsProvider {

  user_points_reference_node : any;
  private _pointsListener: Observable<{}[]>;
  public listPoints: {pointsProcesar:string[],points:Point[]}
  private procesandoNotificaciones:boolean;

  public historyPoints:any=[];
  public offset:number=10;
  public startKey:any;
  
  public unsubscribe$ = new Subject();
  
  constructor(
    public fireDB: AngularFireDatabase,
    public alertCtrl: AlertController,
    private analytics: AnalyticsProvider,
    public events: Events,
    public userprov: UserProvider,
    public st: SettingsProvider, 
    public alert: loadingProvider,
    ) {
    this.listPoints={pointsProcesar:[],points:[]};
    this.procesandoNotificaciones=false;
  }

  //funcion para escuchar los cambios en los puntos del usuario
  public spy_points(uid: string, callback){
    this.fireDB.database.ref(LISTENER_NODE).child(uid).child('points').on('value', snapshotChanges => {
        callback(snapshotChanges.val());
    });
  }
  
  public addHistory(snapshotChanges:any){
	if (this.historyPoints && this.historyPoints.length > 0){
		let i = 0;
		let datAct = new Date (this.historyPoints[this.historyPoints.length - 1].date).toLocaleDateString();
		let j = this.historyPoints.length;
		this.historyPoints[j - 1 ].aDay= false;
		for (i = 0; i < snapshotChanges.length; i++){
			let dat = new Date (snapshotChanges[i].date);
			if (datAct != dat.toLocaleDateString()){
				this.historyPoints[j - 1 ].aDay= true;
				datAct = dat.toLocaleDateString();
			}
			this.historyPoints.unshift(snapshotChanges[i]); 
			
		}
	}
  
  }
  
  public GetHistorialPuntos(){
		let aux:any={}
		if (!this.startKey){
			aux = this.fireDB.list('/'+POINTS_NODE+'/'+this.userprov.userJson.uid, 
				 query => query.orderByKey().limitToLast(this.offset+1)	
			);
		}else{
			aux = this.fireDB.list('/'+POINTS_NODE+'/'+this.userprov.userJson.uid, 
				 query => query.orderByKey().endAt(this.startKey.key).limitToLast(this.offset+1)	
			);
		}
		console.log(aux);
		aux.snapshotChanges().takeUntil(this.unsubscribe$).pipe(take(1), map(changes => 
			//@ts-ignore
			changes.map(c => {
			  let val=c.payload.val();val.key=c.payload.key;
			 
			  return (val)
			})
		  )
		).subscribe(snapshotChanges => {
			if(snapshotChanges.length>0){
				if (!this.historyPoints || this.historyPoints.length == 0){
					let i = 0;
					let datAct = "";
					for (i = 0; i < snapshotChanges.length; i++){
						let dat = new Date (snapshotChanges[i].date);
						//snapshotChanges[i].aDay = datAct==""? true:false;
						datAct = datAct==""? dat.toLocaleDateString():datAct;
						if (datAct != dat.toLocaleDateString()){
							snapshotChanges[i - 1 ].aDay= true;
							datAct = dat.toLocaleDateString();
						}
						this.historyPoints.unshift(snapshotChanges[i]); 
					}
					this.startKey= snapshotChanges[0];
				}else{
					this.startKey= snapshotChanges[0];
					snapshotChanges.reverse();
					let datAct = new Date (this.historyPoints[this.historyPoints.length - 1].date).toLocaleDateString();
					for (let i = 1; i < snapshotChanges.length ; i++){
						let dat = new Date (snapshotChanges[i].date);
						snapshotChanges[i].aDay = datAct==""? true:false;
						datAct = datAct==""? dat.toLocaleDateString():datAct;
						if (datAct != dat.toLocaleDateString()){
							snapshotChanges[i].aDay= true;
							datAct = dat.toLocaleDateString();
						}
						this.historyPoints.push(snapshotChanges[i]);
					}		
				}
			}
		});
	}
  
  async GetNotificationsPoints(user_uid:string) {
    this._pointsListener= await this.fireDB.list('/'+POINTS_NODE+'/'+user_uid, ref => 
      ref.orderByChild('view').equalTo(false)
    ).snapshotChanges().pipe(map(changes => 
        changes.map(c => {
          let val:any=c.payload.val();val.key=c.payload.key
          return (val)
        })
      )
    );
    this._pointsListener.subscribe(snapshotChanges => {
      if(snapshotChanges.length>0){
        if(this.procesandoNotificaciones==false){
          //sino estoy procesando notificaciones, voy a inicializar el 
          //arreglo de listPoints.points con la data del snapshot
          this.listPoints.points=snapshotChanges;
          for (let j = 0; j < snapshotChanges.length; ++j) {
            //@ts-ignore
            this.listPoints.pointsProcesar.push(snapshotChanges[j].key);
          }
          console.log("Va a procesar con estos datos",this.listPoints);
          this.showEarnedPoints(0);
        }else{
          //console.log("Estoy procesando");
          //si estoy procesando notificaciones, debo de verificar cada uno de los puntos que me 
          //retorna a ver si no esta en el arreglo para procesar, y asi agregarlo a dicho arreglo
          for (var i = 0; i < snapshotChanges.length; ++i) {
            //@ts-ignore
            if(this.listPoints.pointsProcesar.indexOf(snapshotChanges[i].key) === -1){
             //El punto no esta en la lista para ser procesado
              this.listPoints.points.push(snapshotChanges[i]);
              //@ts-ignore
              this.listPoints.pointsProcesar.push(snapshotChanges[i].key);
            }else{
               //@ts-ignore
              //console.log("existe este elemento: "+snapshotChanges[i].key);
            }
          }
        }
      }
	  this.addHistory(snapshotChanges);
    });
    return;
  }

  showEarnedPoints(index) {
    if (this.listPoints.points.length > index) {
      this.procesandoNotificaciones=true; let options: PointsOptions[]=[{text:'OK', role: 'cancel',}]
      let auxUserPoint: Point = this.listPoints.points[index];
      let userID=auxUserPoint.user;
      let title = auxUserPoint.name;
      //if(auxUserPoint.description=="Cumpliste tu meta de pasos diarios") options = [{text:"Compartir",role:"share", handler: () =>{this.alert.sharebutton(this.userprov.userJson.steps_goal);}},{text:'OK', role: 'cancel'}]
      let description = "<img class='img-point' src='./assets/pointsUp.png'><br>"+auxUserPoint.description;
      let loaderPoints = this.alertCtrl.create({
      title: title,
      message: description,
      enableBackdropDismiss: false,
      buttons: options
      });
      loaderPoints.present();
      if (auxUserPoint.type.includes("step_today")){
      this.st.confetti_school();
      }
      loaderPoints.onDidDismiss(() => {
         this.fireDB.database.ref(POINTS_NODE).child(userID).child(auxUserPoint.key).child("view").set(true).then(() => { 
           //console.log("Points",title.split(" ")[1])          
            this.analytics.EventWithData("Puntos",title.split(" ")[1]);
            console.log("Proceso este:",this.listPoints.points[index]);
            this.events.publish('DashboardLoad');
            this.showEarnedPoints((index + 1))
         });
      });
    }else{
      this.procesandoNotificaciones=false;
      this.listPoints={pointsProcesar:[],points:[]};
      //console.log("no points",this.procesandoNotificaciones,this.listPoints);
    }

  }

  public cleanOut(){
    this.user_points_reference_node = null;
    this._pointsListener = null;
    this.listPoints={pointsProcesar:[],points:[]};
    this.procesandoNotificaciones=false;
  }
}