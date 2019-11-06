import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { Platform } from 'ionic-angular';
import * as firebase from 'firebase';
import { DeviceInfo } from '../../interfaces/device-info';
import { Device } from '@ionic-native/device';
import { UserProvider } from '../../providers/user/user';
import { ChatProvider } from '../../providers/chat/chat';
import {NotificationProvider} from '../../providers/notification/notification';
import { Observable } from 'rxjs/Observable';
import { Subscribe } from '@firebase/util';
import { FunctionsProvider } from '../functions/functions';


const CONNECTION_NODE = 'user_connections';
const USER_CARD_NODE = "user_card";
const DEVICE_NODE = 'user_device';

@Injectable()
export class MainProvider {

  user_device: DeviceInfo;

  constructor(
    private userprovider: UserProvider,
    private afs: AngularFirestore, 
    private afd: AngularFireDatabase,
    public platform: Platform,    
    public device: Device,
    private NotificationService: NotificationProvider,
    private funtions: FunctionsProvider,
    private userCardProvider:ChatProvider,
    ) {this.loadEventos(); }

  public testToFireStore() {
    this.afd.database.ref('test').once('value').then(dataSnapshot => {
      dataSnapshot.forEach(data => {
        console.log(data);
        this.afs.firestore.collection('test').add(data.val());
      });
    })
  }

  public categoryToFirestore() {
    this.afd.database.ref('category').once('value').then(dataSnapshot => {
      dataSnapshot.forEach(data => {
        let dataVal = data.val();
        delete dataVal['subcategory_uids'];
        delete dataVal['subcategory'];
        delete dataVal['category'];
        this.afs.firestore.collection('habit_category').doc(dataVal['uid']).set(dataVal);
      });
    })
  }

  public subcategoryToFirestore() {
    this.afd.database.ref('subcategory').once('value').then(dataSnapshot => {
      dataSnapshot.forEach(data => {
        let dataVal = data.val();
        //let category = dataVal['category'];
        delete dataVal['habit'];
        this.afs.firestore.collection('habit_subcategory').doc(dataVal['uid']).set(dataVal);
      });
    })
  }

  public habitToFiresTore() {
    this.afd.database.ref('habit').once('value').then(dataSnapshot => {
      dataSnapshot.forEach(data => {
        let dataVal = data.val();
        delete dataVal['goal'];
        this.afs.firestore.doc(`habit/${dataVal['uid']}`).set(dataVal);
      });
    })
  }

  public goalToFirestore() {
    console.log('called');
    this.afd.database.ref('goal').once('value').then(dataSnapshot => {
      dataSnapshot.forEach(data => {
        let dataVal = data.val();
        this.afs.firestore.doc(`habit_goal/${dataVal['uid']}`).set(dataVal);
      });
    })
  }

  public register_connection(user_uid: string, callback, company_uid:string) {
    let last_connection_ref = firebase.database().ref(`${USER_CARD_NODE}/${user_uid}/last_online`);
    let online_ref = firebase.database().ref(`${USER_CARD_NODE}/${user_uid}/status`);
    let connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', snap => {
        let is_online = snap.val();
        callback(is_online);
        if (is_online) {
            let now = new Date();
            let day = ""+now.getDate(); if(parseInt(day) < 10) day = "0"+day;
            let month = ""+(now.getMonth()+1); if(parseInt(month) < 10) month = "0"+month;
            let connectionDate = now.getFullYear() + '-' + month + '-' + day;
            this.afd.database.ref(CONNECTION_NODE).child(connectionDate).child(company_uid).child(user_uid).once("value",conecction=>{
              if(conecction.exists()==false){
                this.afd.database.ref(CONNECTION_NODE).child(connectionDate).child(company_uid).child(user_uid).set(now.toISOString())
              }
            });
            let status={
              conected_chat:false,  //true=online,false=offline
              conected_app:true,    //true=online,false=offline
              mode_app:1            //1=foreground,0=background
            }
            online_ref.set(status).then(() =>{            
              //this.analytics.appSeeEvent("Connection");
            });
            status.conected_chat=false;status.conected_app=false;status.mode_app=0;
            online_ref.onDisconnect().set(status);
            last_connection_ref.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
        }
    });
  }

  public save_device_info(user_uid: string, app_ver: string, token: string): Promise<string> {
      return new Promise(resolve => {
          if (this.platform.is('cordova')) {
              this.user_device = {
                  uuid: this.device.uuid,
                  SO: this.device.platform,
                  SO_version: this.device.version,
                  model: this.device.model,
                  app_version: app_ver,
                  brand: this.device.manufacturer,
                  token: token
              }              
              let usercard = {
                uid: user_uid, 
                app_version: app_ver, 
                device: this.device.manufacturer+"("+this.device.model+") / "+this.device.platform+"("+this.device.version+")", 
              }
              //console.log(user_uid, app_ver, JSON.stringify(this.user_device))
              try{
              //console.log(user_uid, app_ver, JSON.stringify(this.user_device))
               this.userCardProvider.updateUserCard(usercard)
               this.afs.collection(DEVICE_NODE).doc(user_uid).collection("devices").doc(this.user_device.uuid).set(this.user_device).then(() => {
                  return resolve(this.device.uuid);
               }).catch(error=>{
                 console.log(error);
                 return resolve('no mobile');
               })
              }catch(e){
                return resolve('no mobile');
              };
          } else {
              return resolve('no mobile');
          }
      });
  }

  cities = [];
  async getOldUser(userUID): Promise<any> {
    return new Promise((resolve, rejected) => {
    this.cities = []
    this.afd.database.ref('country').once('value', country => {
      let countries = country.val();
      this.afd.database.ref('city').once('value', citi => {
        let cities = citi.val();
        let cityKeys = Object.keys(cities)
        for(let citykey of cityKeys){
          this.cities[citykey] = {
            name: cities[citykey].name,
            uid: cities[citykey].country,
            country: countries[cities[citykey].country].name
          }
        }
        this.getCompany(userUID).then(answer => {
          resolve(answer);
        });
      })
    })
  })
  }

  companies:any; departments:any;
  getCompany(userUID): Promise<any> {
    return new Promise((resolve, rejected) => {
    this.afd.database.ref('company').once('value', comp => {
      this.companies = comp.val();
      this.afd.database.ref('department').once('value', deps =>{
        this.departments = deps.val();
        this.tranferUser(userUID).then(answer => {
          resolve(answer);
        });
      })
    })
    })
  }

  tranferUser(uid): Promise<any> {
    return new Promise((resolve, rejected) => {
    this.afd.database.ref('user/'+uid).once('value', userData => {
      let data = userData.val();
      this.get_diet_plan(uid,data.diet).then(diet => {
        console.log(diet,data)
      let user_diet = diet.name;
        let citi = "";
        let dep = "default"; if(this.departments[data.department]) dep = this.departments[data.department].name;
        if(data.city.uid){citi = data.city.uid }else{ citi = data.city }
        let user = {
          address: data.address ? data.address : 'default',
          born_date: data.born_date ? data.born_date : 'default',
          cell_phone: data.cell_phone ? data.cell_phone : 'default',
          chat_bot_room: data.chat_bot_room ? data.chat_bot_room : 'default',
          company: {
            department:{
              name: dep, 
              uid: data.department ? data.department : 'default',
            },
            logo: this.companies[data.company].logo ? this.companies[data.company].logo : 'default',
            name: this.companies[data.company].name ? this.companies[data.company].name : 'default',
            position: {
              name: "default", 
              uid: data.position.uid ? data.position.uid : 'default'
            },
            key: this.companies[data.company].key ? this.companies[data.company].key : 'default' ,
            uid: data.company ? data.company : 'default'
          },
          country: {
            city: {
              name: this.cities[citi].city ? this.cities[citi].city : 'default', 
              uid: citi ? citi : 'default'
            },
            name: this.cities[citi].country ? this.cities[citi].country : 'default',
            uid: this.cities[citi].uid ? this.cities[citi].uid : 'default'
          },
          diet: user_diet ? user_diet : 'Empty',
          gender: data.gender ? data.gender : 'default',
          last_name: data.last_name ? data.last_name : 'default',
          mail: data.mail ? data.mail : 'default',
          name: data.name ? data.name : 'default',
          picture: data.picture ? data.picture : 'default',
          points: data.points ? data.points : 0,
          test: data.test,
          uid: uid,
          wellness: data.wellness ? data.wellness : 0
        }
        console.log(uid,user)
        this.afs.collection('user').doc(uid).set(user).then(function() {
          console.log("Document successfully written!");
          this.tranferBotRoom(user.chat_bot_room)
          resolve("done")
        }).catch(function(e) {
          console.log(e);
          resolve("fail")
        })
      })
    })
    })
  }

  public get_diet_plan(user_uid: string, diet_uid: string): Promise<any> {
      return new Promise((resolve, rejected) => {
        this.afd.database.ref("user_diet").child(user_uid).child(diet_uid).child("diet").once("value",diet => {
          console.log(user_uid,diet_uid,diet.val())
          if(diet.val() == null){ 
            resolve({name:""});       
          }else{
            this.afd.database.ref("diet_plans").child(diet.val()).once("value",snapDiet =>{
              resolve(snapDiet.val())
            })  
          }
          });
      })
  }

  tranferBotRoom(room_uid:string){
    this.afd.database.ref('chat_room/'+room_uid).once('value', Data => {
        let room = Data.val();   
        let membs =[];
        let membsKeys = Object.keys(room.members)
        for(let member of membsKeys){
          membs.push(member)
        }
        room.members = membs;
        console.log(room)
        this.afs.collection('chat_room').doc(room_uid).set(room).then(function() {
        console.log("Document successfully written!");
        }).catch(function(e) {
          console.log(e);
        })
    })
  }

  loadEventos(){
    this.platform.ready().then((/*readySource*/) => {
      //console.log('Platform ready from', readySource);
      //this.chatService.iniciarSesion();
      if(this.platform.is("android")||this.platform.is("ios")){
        this.platform.resume.subscribe((e) => {
          let user=this.userprovider.static_user();
          if(user!=null&&user.uid!=null){
            this.userprovider.getUserCard(user.uid).then(card => {
              if(card!=null&&card.name!=null){
                this.updateStatus(user.uid,card.status.conected_chat,true,1);
              }
            });
            this.NotificationService.clearNotifications()
            //this.socialService.reinstanciar();
          }
        });
        this.platform.pause.subscribe((e) => {
          let user=this.userprovider.static_user();
          if(user!=null&&user.mail!=null){
             this.userprovider.getUserCard(user.uid).then(card => {
              if(card!=null&&card.name!=null){
                this.updateStatus(user.uid,card.status.conected_chat,true,0);
              }
            });
          }
        })
      }
    });
  }

  updateStatus(user_uid,x,y,z){
    let online_ref = firebase.database().ref(`${USER_CARD_NODE}/${user_uid}/status`);
    let status={conected_chat:x,conected_app:y,mode_app:z}
    online_ref.set(status);
  }  

  unsubcribeDeviceToken(user_uid){
    if(this.platform.is('cordova')&&this.user_device!=undefined&&this.user_device.uuid!=undefined){
      this.afs.collection(DEVICE_NODE).doc(user_uid).collection("devices").doc(this.user_device.uuid).delete().then(() => {
        this.user_device = null;
        return true;
     }).catch(error=>{
       console.log(error);
       return false;
     })
   }else{
    return true;
   }
  }

  loaded:any;  observer: Observable<any>; test:Subscribe<any>;
  iusers(){
    this.funtions.startfuncion();  
  }

}
