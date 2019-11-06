import { Injectable } from '@angular/core';
import { LoadingController,AlertController ,ToastController, Alert, ActionSheetController } from 'ionic-angular';
import { option } from '../../interfaces/option';


@Injectable()
export class loadingProvider {
  loading:any=null;
  alert: Alert;

  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    ) {
   //console.log("contructor loadingProvider");
  }
   /*muestra una ventana emergente de espera*/
  showLoading(texto) {
      if(this.loading==null){
          this.loading = this.loadingCtrl.create({
              spinner: 'dots',
              content: texto
          });
          this.loading.present();
      }
  }

  /*cierra una ventana emergente de espera*/
  dismissLoading(){
      if(this.loading!=null){
          this.loading.dismiss().catch(() => {});
          this.loading = null;
      }
  }

  presentLoadingText(text,time) {
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: text,
      duration: time
    });

    loading.present();
  }

  showActive=true;
  showConfirm(titulo,text) {
    return new Promise((resolve) =>{
    let that = this;
      if(that.showActive){
          that.showActive=false;
          const confirm = this.alertCtrl.create({
            title:titulo,
            message: text,
            buttons: [
              {
                text: 'Cancelar',
                handler: () => {
                  that.showActive=true;
                  resolve(false);
                }
              },
              {
                text: 'Aceptar',
                handler: () => {
                  that.showActive=true;
                  resolve(true);
                }
              }
            ]
          });
          confirm.present();
      }else{
        resolve("already_show")
      }
    });
  }
 
   presentToast(text:string) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 3000 
    });
    toast.present();
  }
  
  showToast(text, position, showOk, duration) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: duration,
      position: position,
      showCloseButton: showOk,
      closeButtonText: 'OK'
    });
    toast.present();
  }

  ShowInfoAlert(title,text){
    this.alert = this.alertCtrl.create({
      title: title,
      subTitle: text,
      buttons: ['Listo']
    });
    this.alert.present();
  }  

  MultipleOption(title:string,options:option[]): Promise<any> {
    return new Promise((resolve, rejected) => {
      let registerHabit = this.alertCtrl.create({
        title: title,
        inputs: options,
        buttons: [
          {
            text: "Cancelar",
            handler: () => { 
              rejected(); 
            }
          },
          {
            text: "Listo",
            handler: (data) => { 
              resolve(data); 
            }
          },
        ]
      })
      registerHabit.present();
    })
  }

  slowNetwork: any; counter = 0; connectionReady = false; showed=false;
  slowConnectionTimer(user_uid){
    this.connectionReady = false; this.counter=0; this.showed=false;
    this.slowNetwork = setInterval(()=>{
      this.counter++;
      //console.log("seg:"+this.counter)
      if(this.counter>10 || this.connectionReady){
        if(!this.connectionReady){         
          this.stopInterval();
          if(!this.showed){
            this.showToast("Se ha detectado que su conexión es inestable, por favor, espere o intente con otra conexión.","top",'Ok',undefined);
            this.showed=true;
          }
        }
        this.stopInterval();
      }
    },1000)
  }

  stopInterval(){
    let that = this;
    clearInterval(this.slowNetwork);
    clearInterval(this.slowNetwork);
    setTimeout(() => {
      clearInterval(that.slowNetwork);
      clearInterval(that.slowNetwork);      
    }, 500);
  }

  dataReady(){
    this.connectionReady = true;
    clearInterval(this.slowNetwork);
    clearInterval(this.slowNetwork);
    clearInterval(this.slowNetwork);
  }

  links={
    cinco:"https://firebasestorage.googleapis.com/v0/b/habits-ai.appspot.com/o/share%2Fgoal_5000.jpg?alt=media&token=384afb07-8712-4320-91ed-a01db362ae5b",
    seis:"https://firebasestorage.googleapis.com/v0/b/habits-ai.appspot.com/o/share%2Fgoal_6000.jpg?alt=media&token=9372cf75-5c95-4062-ad6a-43df93ea6d25",
    siete:"https://firebasestorage.googleapis.com/v0/b/habits-ai.appspot.com/o/share%2Fgoal_7000.jpg?alt=media&token=f2afea35-e4fc-4c28-ae9b-ce848d61c881",
    ocho:"https://firebasestorage.googleapis.com/v0/b/habits-ai.appspot.com/o/share%2Fgoal_8000.jpg?alt=media&token=bf3a0904-68d0-4b0c-bab9-e0281414e18e",
    nueve:"https://firebasestorage.googleapis.com/v0/b/habits-ai.appspot.com/o/share%2Fgoal_9000.jpg?alt=media&token=a189364f-e8bb-4fc8-9c61-973e019c6718",
    diez:"https://firebasestorage.googleapis.com/v0/b/habits-ai.appspot.com/o/share%2Fgoal_10000.jpg?alt=media&token=b81f3219-904e-47f9-b351-a0e04e698cb9",
  }
  
  async share(social,img,steps){ 
    let url = this.links.cinco; let msg = null; console.log(steps);
    if(steps>6000){url = this.links.seis;}else if(steps>7000){url = this.links.siete}else if(steps>8000){url = this.links.ocho}
    else if(steps>9000){url = this.links.nueve}else if(steps>10000){url = this.links.diez}  
    switch(social){
      case 'W':
          window['plugins'].socialsharing.shareViaWhatsApp(msg,img,url,() => {
            console.log("Share WhatsApp success");
          },err => {
            console.log("Error:"+JSON.stringify(err))
            //this.showToast(JSON.stringify(err),"bottom","OK",undefined);
          });
        break;
      case 'F':
          window['plugins'].socialsharing.shareViaFacebook(msg,img,url,() => {
            console.log("Share Facebook success");
          },err => {
            console.log("Error:"+JSON.stringify(err))
            //this.showToast(JSON.stringify(err),"bottom","OK",undefined);
          });
        break;
      case 'I':
          window['plugins'].socialsharing.shareViaInstagram(msg,url,() => {
            console.log("Share Instagram success");
          },err => {
            console.log("Error:"+JSON.stringify(err))
            //this.showToast(JSON.stringify(err),"bottom","OK",undefined);
          });
        break;
      default:
        console.log("no existe "+social)
    }
  }

  sharebutton(steps){ 
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Deseo compartir en:',
      buttons: [
        {
          text: 'Facebook',
          icon: "logo-facebook",
          handler: () => {
            this.share('F',null,steps);
          }
        },{
          text: 'Instagram',
          icon: "logo-instagram",
          handler: () => {
            this.share('I',null,steps);
          }
        },{
          text: 'Whatsapp',
          icon: "logo-whatsapp",
          handler: () => {
            this.share('W',null,steps);
          }
        }
      ]
    });
    actionSheet.present();
  }
}