import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform,App } from 'ionic-angular';
import { Realtime } from '../../providers/social/social';
//import { Observable} from 'rxjs';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Injectable()
export class NotificationProvider {
  ready:boolean=false;
  delay_observable = of('').pipe(delay(2000));
  subcripcion:any= null;
  subcripcionSalasChat:any=null;
  constructor(
    public firebase: Firebase,
    public platform: Platform,
    private chatlistener: Realtime,
    public app: App) {
    this.platform.ready().then(() => {
      this.ready=true;
    });
  }

  get_token(send_token){
    if (this.platform.is('cordova')) {
      this.firebase.grantPermission();
      this.firebase.getToken().then(token => {
        send_token(token);
      });
    } else {
      send_token('no');
    }
  }


  loadListenerNotification(){
    if (this.platform.is('cordova')){
      this.firebase.onNotificationOpen().subscribe(notification => {
        try{
          if(notification.action!=null&&notification.action=="page"){
            if(!this.chatlistener.actual||(this.chatlistener.actual&&notification.uid!=this.chatlistener.salaActual)){
              this.procesarNotificacion(notification,1);
            }else{
              //lert("ya estoy en ese chat")
            }
          }
        }catch(e){
          console.log("error 1");console.log(e);
        }
      }, function(error) {
        console.log("error"+JSON.stringify(error));
      }); 
    }
  }


  async procesarNotificacion(notification:any,intentos:number){
    try{
      let last = await this.chatlistener.getMyCard();
      if(last!==undefined){
        if(last['last_online']){ 
          last = last['last_online'] 
        }else{ 
          last = "" 
        }
        let notread = 1;
        if(this.subcripcion!=null){
          this.subcripcion.unsubscribe();
        }
        this.obtenerType(notification,0,last,notread);
      }else{ 
        if(intentos<8){
          this.subcripcion=this.delay_observable.subscribe(s => {
            intentos++;
            this.procesarNotificacion(notification,intentos)
          });
        }else{
          //alert("llegue a cinco intentos y no se tuvo la data a tiempo");
        }
      }
    }catch(e){
      console.log("error 2"); console.log(e);
    }
  }


  obtenerType(notification:any,intentos:number,last:any,notread:any){
    let type=this.chatlistener.getTypeChatRomm(notification.uid);
    if(type!="none"){
      let nav = this.app.getActiveNavs()[0];
      if(this.subcripcionSalasChat!=null){
        this.subcripcionSalasChat.unsubscribe();
      }
      if(type=="team"){
        nav.push("ChatPage",{team:true,group_uid:notification.uid,last_online:last,notread:notread});
      }else{
        nav.push("ChatPage",{group_uid:notification.uid,last_online:last,notread:notread});
      }
      this.clearNotifications();
    }else{
      if(intentos<6){
        this.subcripcionSalasChat=this.delay_observable.subscribe(s => {
          intentos++;
          this.obtenerType(notification,intentos,last,notread);
        });
      }else{
        //alert("llegue a cinco intentos y no se obtuvo las salas de chat a tiempo");
      }
    }
  }

  clearNotifications(){
    try{
      //@ts-ignore
      window.FirebasePlugin.clearAllNotifications();
    }catch(e){
      console.log("al borrar la bandeja de notificaciones");
      console.log(e);
    }
  }

  
}