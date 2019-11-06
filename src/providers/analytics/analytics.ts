import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';

declare var Appsee:any;

@Injectable()
export class AnalyticsProvider {

  constructor(
    public http: HttpClient,
    public platform: Platform,
    public FBAnalytics: Firebase
    ) {
  }

  checkPlatform(){
    return this.platform.is("cordova");
  }

  startAppSee(){    
	//alert('va a grabar la pantalla');
    if(this.checkPlatform()) if(this.platform.is("android")) Appsee.start("b4f46553432145e68641f4df1ade02c8");
  }

  setUserID(uid:string){    
    if(this.checkPlatform()){
      if(this.platform.is("android")) Appsee.setUserId(uid);
      if(uid!=undefined){
        this.FBAnalytics.setUserId(uid).then(save =>{
          //console.log(uid+" has been saved as UserId."+save);
        })
      }
    }
  }

  setUserProperty(data){ 
    if(this.checkPlatform()){
      if(data!=undefined&&data!=NaN){
        this.FBAnalytics.setUserProperty(data.name,data.val).then(save =>{
          //console.log(data.val+" has been saved as "+data.name+" UserProperty. "+save);
        })
      }
    }
  }

  saveAllUser(user){
    let age = new Date().getFullYear() - new Date(user.born_date).getFullYear();
    this.setUserID(user.uid);
    this.setUserProperty({name:"Edad", val: age})
    this.setUserProperty({name:"Compania", val: user.company.name})
    this.setUserProperty({name:"Sexo", val: user.gender})
    this.setUserProperty({name:"Puesto", val: user.company.position.name})
    this.setUserProperty({name:"Departamento", val: user.company.department.name})
    ////console.log("User ID: "+user.uid)
  }

  saveScreen(screenName:string){
	try{
    if(this.checkPlatform()){ 
      if(this.platform.is("android")) Appsee.startScreen(screenName);
      this.FBAnalytics.setScreenName(screenName)
    }
	}catch(e){
		//console.log(e);
	}
  }

  saveButtonAction(buttonName:string){
    if(this.checkPlatform()) if(this.platform.is("android")) Appsee.addScreenAction(buttonName);
  }

  appSeeEvent(eventName: string){
	try{
		if(this.checkPlatform()){ 
      if(this.platform.is("android")) Appsee.addEvent(eventName);
      this.FBAnalytics.logEvent(eventName,{}).then(save =>{
        //console.log(eventName+" event has been saved. Response:"+save);
      }).catch(error =>{
        //console.log(eventName+" event has been saved. Response:"+error);
      })
    }
	}catch(e){
		//console.log(e);
	}
  }

  EventWithData(eventName: string, data){
    if(this.checkPlatform()){
      if(this.platform.is("android")){ Appsee.addEventWithProperties(eventName, data)}
      else{data = {data}}//Solo asi funciona iOS
      this.FBAnalytics.logEvent(eventName,data).then(save =>{
        //console.log(eventName+" event has been saved. Data:"+JSON.stringify(data)+"Response:"+save);
      }).catch(error =>{
        //console.log(eventName+" event has been saved. Data:"+JSON.stringify(data)+"Response:"+error);
      })
    }
  }

}