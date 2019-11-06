import { UserProvider } from './../user/user';
import { Injectable } from '@angular/core';
import { loadingProvider } from '../../providers/alert/alert';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from "@angular/fire/firestore";
import { Platform } from 'ionic-angular';
import { AppContants } from '../../app/app.constants';
import * as moment from 'moment';
import { Device } from '@ionic-native/device';
//import { FirebaseCrash } from '@ionic-native/firebase-crash/ngx';

const CATALAGO_NODE = "catalogo";
const CHEAT_NODE = "CHEAT_LIST";

@Injectable()
export class ErrorProvider {
  user_uid=null;
  crashlytics = window['FirebasePlugin']
  constructor(
  	private afs:AngularFirestore,
    public loadingService:loadingProvider,
    public platform: Platform,
	public afAuth: AngularFireAuth,
	private userProv: UserProvider,	  
    public device: Device,
	) {
  	this.afAuth.auth.onAuthStateChanged(auth => {
      if(auth){
        this.user_uid=auth.uid;
      }
    });
  }


  /**
   * Metodo para guadar un objeto error en la BD y mostrar un mensaje al usuario
   * @param {string} componente Componente principal en el cual sucede el error
   * @param {string} type Tipo de error (Error,Warning,Info)
   * @param {string} secuencial Numero de la funcion donde sucede el error (secuencial de arriba hacia abajo)
   * @param {any} error Objeto que contine el error que fue capturado
   * @param {string} messague Mensaje que va ser mostrado al usuario en la interfaz
   * @param {string} empresa a la que pertenece el usuario donde ocurrio el error
   * @return {any} Retorna una promesa
   */
  setError(componente:string,type:string,secuencial:string,error:any,messague:string,DF?:string):Promise<any>{
  	return new Promise((resolve, rejected) => {
  		let code =type+"."+componente+"."+secuencial;
		this.chraslyticsError(code+error);
  		let ref =this.afs.firestore.collection(CATALAGO_NODE).doc(code);
  		ref.get().then(errorDoc=>{
  			if (errorDoc.exists) {
  				//existe el error
  				let data=errorDoc.data();
  				data.total_error+=1;
  				data.error_pend+=1;
  				ref.update(data).then(() => {
  					let errorData={
		        		error:error,
		        		timestamp:new Date().toISOString(),
		        		user:this.user_uid,
		        		app_version:this.getVersion()
		        	}
		        	if(DF){
		        		//@ts-ignore
		        		errorData.empresa=DF;
		        	}
			   		ref.collection("error").doc(this.afs.createId()).set(errorData).then(() => {
			   			if(error) this.loadingService.presentToast(messague);
			   			console.log(data,errorData);
				      	resolve();
				    }).catch(error=>{
				      console.log(5);
				      ref.delete();
				      console.log("error al crear la coleccion (se borro el objeto del catalago)",error);
				      rejected(error)
				    })
			    }).catch(error=>{
			      console.log("error al tratar de actualizar",error);
			      rejected(error);
			    });
		    }else {
		        //no existe el error
		        let data={
		        	componente:componente,
		        	type:type,
		        	secuencial:secuencial,
		        	code:code,
		        	total_error:1,
		        	error_pend:1,
		        	last_resolution:null
		        }
		        ref.set(data).then(docError => {
		        	let errorData={
		        		error:error,
		        		timestamp:new Date().toISOString(),
		        		user:this.user_uid,
		        		app_version:this.getVersion(),
		        		solve:false,
		        	}
		        	if(DF){
		        		//@ts-ignore
		        		errorData.empresa=DF;
		        	}
			      	ref.collection("error").doc(this.afs.createId()).set(errorData).then(() => {
				      if(error) this.loadingService.presentToast(messague);
				      console.log(data,errorData);
				      resolve();
				    }).catch(error=>{
				      ref.delete();
				      console.log("error al crear la coleccion (se borro el objeto del catalago)",error);
				      rejected(error)
				    })
			    }).catch(error=>{
			      console.log("error al crear el documento", error);
			      rejected(error)
			    });
		    }
  		}).catch(error=>{
  			console.log("error al obtener el documento",error);
	      	rejected(error);
  		});
	});
  }

  reportManualSteps(){  
	let app_version = ""; 
    if (this.platform.is('ios')) {
      app_version = AppContants.ios_ver;
    } else if (this.platform.is('android')) {
      app_version = AppContants.android_ver;
    }
	let user = this.userProv.static_user(); let date = moment().format('YYYY-MM-DD');
	this.afs.doc(`${CHEAT_NODE}/${user.company.uid}/${user.uid}/${date}`).set({
		timestamp:moment().toDate(),
		app_version:app_version,
		company: user.company.name,
		device: this.device.model
	})
	this.loadingService.showToast("Se han encontrado pasos agregados manualmente, eliminelos e intente nuevamente en una hora.","bottom","Ok",undefined);
  }

  getVersion():string{
  	if (this.platform.is('ios')) {
      return AppContants.ios_ver;
    } else if (this.platform.is('android')) {
      return AppContants.android_ver;
    }else{
      return AppContants.web_ver;
    }
  }
	
	checkMode(){
		if(AppContants.config_mode =="test")return true
		return false;
	}

	chraslyticsId(user_uid:string){
		if(this.platform.is('android')){
			//this.crashlytics.setUserId(user_uid);
			console.log(user_uid);
		}else{
			console.log(user_uid);
		}
	}

	chraslyticsError(message:string){
		if(this.platform.is('android')){
			console.log(message);
			//this.crashlytics.logError(message);
		}else{
			console.log(message);
		}
	}

	chraslyticsLogWarning(error:string){
		if(this.platform.is('android')){
			this.crashlytics.logMessage(error);
		}else{
			console.log(error);
		}
	}

	simulateCrash(){
		if(this.platform.is('android')){
			this.crashlytics.sendCrash();
		}else{
			console.log("Prueba, la app se cierra por 'Error'");
		}		
	}

}

// import { Injectable } from '@angular/core';
// import { loadingProvider } from '../../providers/alert/alert';
// import { AngularFirestore } from "angularfire2/firestore";
// <<<<<<< HEAD
// import { DocumentSnapshot } from '@firebase/firestore-types';
// =======
// >>>>>>> bc4f4c8b276c10b1686f596960d8fe0304d3bb96
// import { Platform } from 'ionic-angular';
// import { AppContants } from '../../app/app.constants';
// import { AngularFireAuth } from 'angularfire2/auth';

// const CATALAGO_NODE = "catalogo";

// @Injectable()
// export class ErrorProvider {
//   user_uid=null;
//   constructor(
//   	private afs:AngularFirestore,
// <<<<<<< HEAD
//     public loadingService:loadingProvider,
//     public platform: Platform,
//     public afAuth: AngularFireAuth,) {
//   	this.afAuth.auth.onAuthStateChanged(auth => {
//       console.log(auth,"user in error provider");
//       if(auth){
//         this.user_uid=auth.uid;
//       }
//     });
// =======
//     private loadingService:loadingProvider,
//     public platform: Platform,
//     public afAuth: AngularFireAuth,) {
//   	this.afAuth.auth.onAuthStateChanged(auth => {
//       if(auth){
// 				console.log(auth.uid,"user in error provider");
//         this.user_uid=auth.uid;
//       }
// 		});
// >>>>>>> bc4f4c8b276c10b1686f596960d8fe0304d3bb96
//   }


//   /**
//    * Metodo para guadar un objeto error en la BD y mostrar un mensaje al usuario
//    * @param {string} componente Componente principal en el cual sucede el error
//    * @param {string} type Tipo de error (Error,Warning,Info)
//    * @param {string} secuencial Numero de la funcion donde sucede el error (secuencial de arriba hacia abajo)
//    * @param {any} error Objeto que contine el error que fue capturado
//    * @param {string} messague Mensaje que va ser mostrado al usuario en la interfaz
//    * @return {any} Retorna una promesa
//    */
//   setError(componente:string,type:string,secuencial:string,error:any,messague:string):Promise<any>{
//   	return new Promise((resolve, rejected) => {
//   		let code =type+"."+componente+"."+secuencial;
//   		let ref =this.afs.firestore.collection(CATALAGO_NODE).doc(code);
//   		ref.get().then(errorDoc=>{
//   			if (errorDoc.exists) {
//   				//existe el error
//   				let data=errorDoc.data();console.log(data);
//   				data.total_error+=1;
//   				data.error_pend+=1;
//   				ref.update(data).then(() => {
//   					let errorData={
// 		        		error:error,
// 		        		timestamp:new Date().toISOString(),
// 		        		user:this.user_uid,
// 		        		app_version:this.getVersion()
// 		        	}
// 			   		ref.collection("error").doc(this.afs.createId()).set(errorData).then(() => {
// <<<<<<< HEAD
// 			   			if(error) this.loadingService.presentToast(messague);
// =======
// 							if(error&&this.checkMode()) this.loadingService.presentToast(messague);
// >>>>>>> bc4f4c8b276c10b1686f596960d8fe0304d3bb96
// 				      	resolve();
// 				    }).catch(error=>{
// 				      ref.delete();
// 				      console.log("error al crear la coleccion (se borro el objeto del catalago)",error);
// 				      rejected(error)
// 				    })
// 			    }).catch(error=>{
// 			      console.log("error al tratar de actualizar",error);
// 			      rejected(error);
// 			    });
// 		    }else {
// 		        //no existe el error
// 		        let data={
// 		        	componente:componente,
// 		        	type:type,
// 		        	secuencial:secuencial,
// 		        	code:code,
// 		        	total_error:1,
// 		        	error_pend:1,
// 		        	last_resolution:null
// 		        }
// 		        console.log(data);
// 		        ref.set(data).then(docError => {
// 		        	let errorData={
// 		        		error:error,
// 		        		timestamp:new Date().toISOString(),
// 		        		user:this.user_uid,
// 		        		app_version:this.getVersion()
// 		        	}
// 			      	ref.collection("error").doc(this.afs.createId()).set(errorData).then(() => {
// <<<<<<< HEAD
// 				      if(error) this.loadingService.presentToast(messague);
// =======
// 				      if(error&&this.checkMode()) this.loadingService.presentToast(messague);
// >>>>>>> bc4f4c8b276c10b1686f596960d8fe0304d3bb96
// 				      resolve();
// 				    }).catch(error=>{
// 				      ref.delete();
// 				      console.log("error al crear la coleccion (se borro el objeto del catalago)",error);
// 				      rejected(error)
// 				    })
// 			    }).catch(error=>{
// 			      console.log("error al crear el documento", error);
// 			      rejected(error)
// 			    });
// 		    }
//   		}).catch(error=>{
//   			console.log("error al obtener el documento",error);
// 	      	rejected(error);
//   		});
// 	});
//   }

//   getVersion():string{
//   	if (this.platform.is('ios')) {
//       return AppContants.ios_ver;
//     } else if (this.platform.is('android')) {
//       return AppContants.android_ver;
//     }
// <<<<<<< HEAD
//   }
// =======
// 	}
	
// 	checkMode(){
// 		if(AppContants.config_mode =="test")return true
// 		return false;
// 	}
// >>>>>>> bc4f4c8b276c10b1686f596960d8fe0304d3bb96
// }
