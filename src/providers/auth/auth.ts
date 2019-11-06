import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Realtime } from '../social/social';
import { DietProvider } from '../diet/diet';
import { TestProvider } from '../test/test';
import { MainProvider } from '../main/main';
import { HabitProvider } from '../habit/habit';
import { LearningProvider } from '../learning/learning';
import { NewsProvider } from '../news/news';
import { PointsProvider } from '../points/points';
import { UserProvider } from '../user/user';
import { AppContants } from '../../app/app.constants';
import { ErrorProvider } from '../error/error';
import { Network } from '@ionic-native/network';
import { App } from "ionic-angular";
import { StatusBar } from '@ionic-native/status-bar';
import * as moment from "moment";
import * as firebase from 'firebase';
import { loadingProvider } from '../alert/alert';
import { Sesion } from '../../interfaces/sesion';
import { Storage } from '@ionic/storage';

const CATEGORIA = "PATH";

const CONFIG_NODE = 'config';
const UPDATE_NODE = "update";
const MAINTENANCE_NODE = "maintenance";
const ANDROID_NODE = "ANDROID";
const IOS_NODE = "APPLE_IOS";
const COMPANY_NODE = 'config/companies/';

@Injectable()
export class AuthProvider {
  isOnline: boolean;
  SIGN = {title:"ESPERE...", text:"", link:"", type:"",button:"",button2:"",logout:false}
  init:boolean=false;
  MAINTENANCE: any;
  UPDATE: any;
  sesion:Sesion={mail: null,pass:null,uid:null};
  rootPage:any="";
  isSingOut:boolean=false;
  isCreated:boolean=false;

  constructor(
    public afAuth: AngularFireAuth,
    private platform: Platform,
    private mainprovider: MainProvider,
    private realtime: Realtime,
    private dietprovider: DietProvider,
    private testprovider: TestProvider,
    private habitProvider: HabitProvider,
    private learningProvider: LearningProvider,
    private newsprovider: NewsProvider,
    private pointsProvider:PointsProvider,
    private userprovider: UserProvider,
    private afd: AngularFireDatabase,
    public errorService:ErrorProvider,
    public network: Network,
    public app: App, 
    public statusBar: StatusBar,
    public alert: loadingProvider,
    public storage:Storage,
  
  ) {
    this.afAuth.auth.setPersistence("local");    
    this.isOnline = true;
    if(this.platform.is("ios")){
      //console.log("IOS SIGN")
      this.MAINTENANCE = CONFIG_NODE+"/"+IOS_NODE+"/"+MAINTENANCE_NODE;
      this.UPDATE = CONFIG_NODE+"/"+IOS_NODE+"/"+UPDATE_NODE;
    }else{
      //console.log("ANDROID SIGN")
      this.MAINTENANCE = CONFIG_NODE+"/"+ANDROID_NODE+"/"+MAINTENANCE_NODE;
      this.UPDATE = CONFIG_NODE+"/"+ANDROID_NODE+"/"+UPDATE_NODE;
    }
    console.log("this.sesion",this.sesion);
   }

  public async isAuthenticated() {
    this.afAuth.auth.onAuthStateChanged(auth => {
      console.log("this.afAuth.auth.onAuthStateChanged",auth);
      try{
        let nav = this.app.getActiveNavs()[0];
        if(auth){
          //console.log("this.isCreated",this.isCreated);
          if(this.isCreated==false){
            this.sesion.mail = auth.email;this.sesion.uid = auth.uid;
            nav.setRoot('LoadscreenPage');
          }else{
            this.isCreated=false;
          }
          //this.singOut().then(() => {
           //this.saveSesion(null,null,null);
          //});
        }else{
          /*Quiere decir que no hay sesion, debo preguntar si en la variable del storage de la sesion del  user hay 
          datos, si los hay quiere decir que se cerro la sesion por inactividad u otro motivo y en ese caso hay
          que interntar reloguearlo validando que el usuario aun este valido (si no se puede reloguear por algun
          motivo si hay que mandarlo al login), sino hay datos en el storage si debo mandarlo al login*/ 
          //session = this.get_session();
          if(this.isSingOut==false){
            this.getSesionLocal().then(sesion=>{
              console.log("sesion response",sesion);
              if(sesion.mail!=null&&sesion.pass!=null&&sesion.uid!=null){
                console.log("si tenia una sesion y se cerro por algun motivo,intento reloguear");
                //si tenia una sesion y se cerro por algun motivo, intento reloguear
                this.singInByEmail(sesion.mail,sesion.pass).then(login => {
                  if (login) {
                    console.log("se relogueo");
                    nav.setRoot("LoadscreenPage");
                  }
                }).catch((error) => {
                  console.log("se intento reloguearlo pero fallo con los datos actuales");
                  this.clean_session(sesion.uid).then(()=>{
                    this.alert.showToast("Su sesión ha expirado, por favor ingrese nuevamente", 'top', true, 3000);
                    nav.setRoot("LoginPage");
                  });
                });
              }else{
                console.log("no tenia sesion, debo mandarlo al login");
                nav.setRoot("LoginPage");
              }
            }).catch(error=>{
              console.log("ocurrio un error al tratar de obtener de la data local, lo envio al login");
              nav.setRoot("LoginPage");
            });
          }else{
            this.isSingOut=false;
          }
        }
      }catch(e){
        console.log(e);
        this.errorService.setError(CATEGORIA,"ER","1",e.toString(),"Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles.");
      }
    });
  }

  get userAuthenticated() {
    return this.afAuth.auth.currentUser;
  }

  public singInAnonymously(): Promise<any> {
    return new Promise((resolve, rejected) => {
      this.afAuth.auth.signInAnonymously().then((auth) => {
        resolve(auth);
      }).catch((error) => {
        rejected(error);
      });
    });
  }

  public singInByEmail(user_name: string, password: string): Promise<any> {
    return new Promise((resolve, rejected) => {
      this.afAuth.auth.signInWithEmailAndPassword(user_name, password).then(auth => {
        this.sesion.pass=password;this.sesion.uid=auth.user.uid;
        this.saveSesion(user_name,password,auth.user.uid);
        return resolve(auth);
      }).catch(error => {
        this.saveSesion(null,null,null);
        console.log(error+" "+error.code)
        if (error.code == 'auth/invalid-email') {
          rejected('Usuario y/o contraseña incorrectos. Por favor, ingrese sus datos correctamente.');
        } else if (error.code == 'auth/user-disabled') {
          rejected('Usuario desactivado.');
        } else if (error.code == 'auth/user-not-found') {
          rejected('Usuario no existe. Por favor, regístrese.');
        } else if (error.code == 'auth/wrong-password') {
          rejected('Usuario y/o contraseña incorrectos. Por favor, ingrese sus datos correctamente.');
        } else if (error == 'Error: A network error (such as timeout, interrupted connection or unreachable host) has occurred.') {
          rejected("No se detecta conexión a internet. Por favor, verifique su conexión e intente de nuevo.");
        }
      });
    });
  }

  resetPassword(email): Promise<any> {
    return new Promise((resolve, rejected) => {
      if(email){
        this.afAuth.auth.sendPasswordResetEmail(email).then(data => {
          console.log(data)
          resolve("Listo! Por favor, revisa tu email. Ahí podras acceder a un link que te permita cambiar de contraseña.")
        }).catch(error => {
          console.log(error)
          switch (error.code){
            case "auth/user-not-found":
              rejected('Email no encontrado. Por favor, corrígelo y vuelve a intentarlo.');
              break;
            case "auth/invalid-email":
              rejected('Email no válido. Por favor, corrígelo y vuelve a intentarlo.');
              break;
            case "auth/network-request-failed":
              rejected('Error de red. Compruebe su conexión a internet y vuelva a intentarlo.');
              break;
            default:
              rejected('Ups! hubo un error, vuelve a intentarlo por favor.');
              break;
          }
        })
      }else{
        rejected('Ingrese un email, por favor.');
      }
    });
  }

  public singOut(): Promise<boolean> {
    return new Promise((resolve, rejected) => {
      this.isSingOut=true;
      this.afAuth.auth.signOut().then(a => {
        this.clean_session(this.sesion.uid).then(() =>{
          resolve(true);
        });
      }).catch(e=>{console.log(e);this.isSingOut=false;});
    });
  }

  public registerUserByEmail(email: string, password: string): Promise<any> {
    return new Promise((resolve, rejected) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(auth => {
        console.log("user guardado",auth);
        resolve(auth);
      }).catch(error => {
        if (error.code == 'auth/email-already-in-use') {
          rejected('Email ingresado ya en uso');
        } else if (error.code == 'auth/invalid-email') {
          rejected('Email ingresado inválido');
        } else if (error.code == 'auth/operation-not-allowed') {
          rejected('No permitido');
        } else if (error.code == 'auth/weak-password') {
          rejected('La contraseña es muy debil');
        }
      });
    });
  }

  public anonymousToPermanent(email: string, password: string): Promise<any> {
    return new Promise((resolve, rejected) => {
      //let credential = firebase.auth.EmailAuthProvider.credential(email, password);
      this.isCreated=true;
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(auth => {
        console.log(auth,"222222");
        resolve(auth);
      }).catch(error => {
        if (error.code == 'auth/email-already-in-use') {
          rejected('Email ingresado ya en uso');
        } else if (error.code == 'auth/invalid-email') {
          rejected('Email ingresado inválido'); 
        } else if (error.code == 'auth/operation-not-allowed') {
          rejected('No permitido');
        } else if (error.code == 'auth/weak-password') {
          rejected('La contraseña es muy debil');
        }
      });
    });
  }

  public sendEmail() {
    this.afAuth.auth.currentUser.sendEmailVerification().then((resolve) => {
      console.log('Enviado');
    }).catch((error) => {
      console.log(error);
    })
  }

  public keyboardHide(){
    if(this.platform.is("cordova")){
      try{
        window['Keyboard'].hide();
      }catch(e){
        //console.log(e);
      }
    }
  }

  async clean_session(uid){
    this.saveSesion(null,null,null).then(()=>{
      this.mainprovider.unsubcribeDeviceToken(uid);
      this.realtime.cleanOutListeners();
      this.dietprovider.cleanOut();
      this.testprovider.cleanOut();
      this.habitProvider.cleanOut();
      this.learningProvider.cleanOut();
      this.newsprovider.cleanOut();
      this.pointsProvider.cleanOut();
      this.userprovider.cleanOut();
      return null;
    });
  }

  updateAuthUser(data){
   //esto no tendra algo que ver con el problema de puntos
   let user = this.afAuth.auth.currentUser;
   user.updateProfile(data);
  }

  checkCompany(company_uid): Promise<any> {
    return new Promise((resolve, rejected) => {
      if(this.AppIsOnline()){
        //console.log(company_uid)
        let COMPANY = this.afd.object(COMPANY_NODE+company_uid).valueChanges();
        COMPANY.forEach(data => {
          //console.log(data) 
          let checkDate = (moment().toDate() >= moment(data['start_date']).toDate() && moment(data['end_date']).toDate() >= moment().toDate())
          //console.log("checkDate: "+checkDate) 
          if((!data['active']||!checkDate)&&!AppContants.withoutSign){
            this.SIGN.title = data['title'];
            this.SIGN.text = data['message'];
            this.SIGN.link = data['link'];
            this.SIGN.button = data['button'];
            this.SIGN.button2 = data['button2'];
            this.SIGN.type = "company";
            this.SIGN.logout = data['logout'];
            resolve(true);
          }else{
            this.SIGN.title = "ESPERE...";
            this.SIGN.text = "";
            this.SIGN.link = "";
            this.SIGN.type = "wait";
            this.SIGN.button = '';
            this.SIGN.button2 = '';
            this.SIGN.logout = false;
            resolve(false);
          }
        })
      }else{
        resolve(false);
      }
    })
  }

  checkAppVersion(): Promise<any> {
    return new Promise((resolve, rejected) => {
      if(this.AppIsOnline()){
        //console.log(this.UPDATE)
        let UPDATE = this.afd.object(this.UPDATE).valueChanges();
        UPDATE.forEach(data => {
			//alert("Esta observable muchas veces")
          let sign = this.checkSoftwareVersion(data)
          //console.log(data)
          resolve(sign)
        })
      }else{
        resolve(false);
      }
    })
  }

  checkSoftwareVersion(data){
    return new Promise((resolve, rejected) => {
      let x = parseInt(data['version'].replace('.', '').replace('.', ''));
      if(this.platform.is("ios")){
        let y = parseInt(AppContants.ios_ver.replace('.', '').replace('.', ''));
        //console.log(x+" > "+y+" = "+(x > y));
        if(x > y){
          this.SIGN.title = data['title'];
          this.SIGN.text = data['message'];
          this.SIGN.type = "update";
          this.SIGN.link = data['link-ios'];
          this.SIGN.button = data['button'];
          this.SIGN.button2 = data['button2'];
          this.SIGN.logout = false;
        }else{
          this.SIGN.title = "ESPERE...";
          this.SIGN.text = "";
          this.SIGN.link = "";
          this.SIGN.type = "wait";
          this.SIGN.button = '';
          this.SIGN.button2 = '';
          this.SIGN.logout = false;
        }
      }else{
        let y = parseInt(AppContants.android_ver.replace('.', '').replace('.', ''));
        //console.log(x+" > "+y+" = "+(x > y))
        if(x > y){
          this.SIGN.title = data['title'];
          this.SIGN.text = data['message'];
          this.SIGN.type = "update";
          this.SIGN.link = data['link-android'];
          this.SIGN.button = data['button'];
          this.SIGN.button2 = data['button2'];
          this.SIGN.logout = false;
        }else{
          this.SIGN.title = "ESPERE...";
          this.SIGN.text = "";
          this.SIGN.link = "";
          this.SIGN.type = "wait";
          this.SIGN.button = '';
          this.SIGN.button2 = '';
          this.SIGN.logout = false;
          resolve(false);
        }
      }
      //console.log(this.SIGN.title);
      if(this.SIGN.title != "ESPERE..."){resolve(true);}
      else{resolve(false);}
    })
  }

  checkServerMaintenance(): Promise<any> {
    return new Promise((resolve, rejected) => {
       if(this.AppIsOnline()){ let that = this; 
        let MAINTENANCE = this.afd.object(this.MAINTENANCE).valueChanges();
        MAINTENANCE.forEach(data => {
           if(data['offline']){
             that.SIGN.title = data['title'];
             that.SIGN.text = data['message'];
             that.SIGN.link = data['link'];
             that.SIGN.button = data['button'];
             that.SIGN.button2 = data['button2'];
             that.SIGN.type = "maintenance";
             resolve(true);
           }else{
             that.SIGN.title = "ESPERE...";
             that.SIGN.text = "";
             that.SIGN.link = "";
             that.SIGN.type = "wait";
             that.SIGN.button = '';
             that.SIGN.button2 = '';
             resolve(false);
           }
         })
       }else{
         resolve(false);
       }
    })
  }

  signalCheck(): Promise<any> {
    return new Promise((resolve, rejected) => {
      this.verifyServerDate().then(TIME=>{
        //console.log("WRONGTIME",TIME)
        if(TIME){
          resolve(true);
        }else{
          this.checkAppVersion().then(UPDATE => {
            //console.log("UPDATE",UPDATE)
            if(UPDATE){
              resolve(true);
            }else{
              this.checkServerMaintenance().then(MAINTENANCE => {
                if(MAINTENANCE){
                  resolve(true);
                }else{
                  //console.log("NO SIGN")
                  resolve(false)
                }
              }); 
            }       
          }).catch(e=>{
            this.errorService.setError(CATEGORIA,"ER","20",e.toString(),"Parece que tu conexión a internet es inestable, mientras persista este problema, algunas de las funciones no estarán disponibles.")
          })
        }
      })
    })
  }

  getSign(){
    return this.SIGN; 
  }

  //INTERNET PROVIDER LISTENER
  public AppIsOnline(){
    if(this.platform.is("cordova")){
      return this.isOnline;
    }else{
      return window.navigator.onLine;
    }
  }

  public changeOnlineState(online){
    this.isOnline = online;
  }

  getTypeNetwok():any{
    return this.network.type;
  }

  doOnDisconnect() {
    this.changeOnlineState(false);
    let message = "Parece que tu conexión a internet es inestable, mientras persista este problema, " +
      "algunas de las funciones no estarán disponibles."
    this.errorService.loadingService.showToast(message, 'bottom', true, 1500);
  }

  async conectionStatus(){
    if(!this.init){
      this.network.onConnect().subscribe(() => {
        if (this.isOnline != true) {
          this.statusBar.backgroundColorByHexString("#455A64");
          this.isOnline = true;
          this.doOnConnect();
        }
      });
      this.network.onDisconnect().subscribe(() => {
        if (this.isOnline != false) {
          this.isOnline = false;
          this.statusBar.backgroundColorByHexString("#D32F2F");
          this.doOnDisconnect();
        }
      });
      this.init=true;
    }
    return ;
  }

  doOnConnect() {
    this.changeOnlineState(true);
    let nav = this.app.getActiveNavs()[0];
    if(this.sesion.mail==null&&this.sesion.uid==null) {
      nav.setRoot('LoginPage');
      this.errorService.loadingService.showToast('En línea', 'top', false, 1500);
    } else {
      nav.setRoot('DashboardPage');
      this.errorService.loadingService.showToast('En línea', 'top', false, 1500);
    } 
  }  

  verifyServerDate(){ 
    return new Promise((resolve)=>{ 
      if(this.AppIsOnline()||AppContants.withoutSign){
        let that = this; 
        firebase.database().ref('config/currentTime/').update({ time: firebase.database.ServerValue.TIMESTAMP})
        .then(function (data) {
          firebase.database().ref('config/currentTime/')
            .once('value')
            .then(function (zonepack) {
              let data = zonepack.val(); let myTime = moment(); let t = data['time']; t = new Date(t).toISOString()+"";
              let serverTime = t.split("T"); t = serverTime[0]+" "+serverTime[1].split(".")[0]; 
              let x = new Date();
              let nd = -x.getTimezoneOffset()/60;
              let startserverTime = moment(t); let endserverTime = moment(t);
              //console.log("Server: ",t,"timezone: ",nd,"Actual time: ",new Date())                   
              if(nd>0){             
                startserverTime = moment(t).add((nd-1),'hours'); endserverTime = moment(t).add((nd+1),'hours'); 
              }else if(nd==0){ 
                startserverTime = moment(t).add(1,'hours'); endserverTime = moment(t).subtract(1,'hours'); 
              }else{          
                nd = -nd;
                startserverTime = moment(t).subtract((nd+1),'hours'); endserverTime = moment(t).subtract((nd-1),'hours'); 
              } 
              //console.log('server time: '+ t," myTime: "+myTime.toDate().getTime()," start: "+startserverTime.toDate().getTime()+" = "+(myTime.toDate().getTime()>startserverTime.toDate().getTime())," end: "+endserverTime.toDate()+" = "+(endserverTime>myTime));
              if(myTime.toDate().getTime()>startserverTime.toDate().getTime() && endserverTime>myTime){        
                that.SIGN.title = "ESPERE...";
                that.SIGN.text = "";
                that.SIGN.link = "";
                that.SIGN.type = "wait";
                that.SIGN.button = '';
                that.SIGN.button2 = '';
                resolve(false);
              }else{
                that.SIGN.title = data['title'];
                that.SIGN.text = data['text'];
                that.SIGN.link = data['link'];
                that.SIGN.button = data['button'];
                that.SIGN.button2 = data['button2'];
                that.SIGN.type = "timezone";
                resolve(true)
              }
            }, function serverTimeErr(err) {
              console.log('coulnd nt reach to the server time !');
              resolve(false);
            });
        }, function (err) {
          console.log ('set time error:', err)
          resolve(false);
        });
      }else{
        resolve(false);
      }
    }) 
  }


  async checkFaq(){
    let answer = await this.afd.database.ref("/config/faq").once('value',check=>{
      return check.val();
    })
    return answer;
  }

  saveSesion(user:string,pass:string,uid:string):Promise<any>{  
    return new Promise((resolve,rejected)=>{
      let sesion:Sesion={mail: user,pass:pass,uid:uid};
      this.storage.set("sesion",sesion).then(data=>{
        console.log("saveSesion sucess",data);
        return resolve(data);
      }).catch(error=>{
        console.log("saveSesion error",error);
        return resolve(null);
      });
    });
  }

  getSesionLocal():Promise<Sesion>{
    return new Promise((resolve,rejected)=>{
      //voy a preguntar si hay una sesion en el storage
      let sesion:Sesion={mail: null,pass:null,uid:null};
      this.storage.get('sesion').then(data=>{
        console.log("this.storage.get('sesion').then",data);
        if(data!=null){
          sesion=data;
        }
        this.sesion=sesion;
        console.log("sesion actualizada a ",this.sesion);
        return resolve(sesion);
      }).catch(error=>{
        //nota:si esla primera vez this.sesion igual sera {uid: null, mail: null,pass:null}, 
        //sino se retorna el valor que ya tenia
        return resolve(this.sesion);
      });
    });
  }

  getSesion(){
    return this.sesion;
  }

}