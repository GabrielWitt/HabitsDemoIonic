import { UserProvider } from './../../providers/user/user';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { loadingProvider } from '../../providers/alert/alert';
import { RetosProvider } from '../../providers/retos/retos';
import { ImagesProvider } from '../../providers/images/images';

@IonicPage()
@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html',
})
export class ActivityPage {
  public activity={
    points:0,rules:"",status: "",timestamp:"",
    title:"",type:"",textarea:false,
    lines:[],uid:'',image:'',
    user_answer:"",send:false,
    date_start: new Date(),date_end: new Date()
  }; 
  public text_area="";
  public progress = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private retoprov: RetosProvider,
    private authProvider: AuthProvider,
    private imageProv: ImagesProvider,
    private alerts: loadingProvider,
    private userprov: UserProvider
    ) {
  }

  ionViewDidLoad() {
    this.activity = this.navParams.get("activity");
    this.activity.image=""; //let now= new Date();
    console.log(this.activity);
    if(this.activity.user_answer){this.activity.image=this.activity.user_answer;this.activity.send = false}
    if(!this.activity.status||this.activity.status=="No aprobado"){this.activity.send = true;} 
    else{this.activity.send = false;} 
  }

  sendActivity(){
    let answer = ""; this.activity.send=false;
    if(this.activity.image){answer=this.activity['image']}else
    if(this.activity.lines){for(let i=0;this.activity.lines.length>i;i++){if(i==0){answer+=this.activity.lines[i].value}else{answer+=" -salto-"+this.activity.lines[i].value}}}else
    if(this.activity.textarea){answer=this.text_area}
    if(answer != ""){
      let activity_response = {user_answer: answer, timestamp: new Date(), status:'Pendiente', uid:this.activity.uid, points:this.activity.points}
      this.retoprov.save_activity_item(activity_response).then(() => {
        this.navCtrl.pop(); this.navCtrl.pop(); this.navCtrl.push("RetoPasosPage");
      }).catch(error => {
        console.log(JSON.stringify(error)); this.activity.send=true; this.alerts.presentToast('Hubo un error al enviar, por favor, intenta de nuevo.')
      })
    }else{
      this.alerts.presentToast('Aun no has completado la actividad, por favor realizalá e intenta de nuevo.')
    }
  }

  addCameraPhoto(){
    if (this.authProvider.AppIsOnline()) {
      this.imageProv.addCameraPhoto(1,true).then(img=>{
        this.alerts.presentToast("Cargando Imagen");
        this.uploadImage(img);
      }).catch(error=>{
        this.alerts.showToast(error, 'bottom', false, 3000);
      });
    } else {
      this.alerts.showToast('No disponible sin conexión...', 'top', false, 3000);
    }
  }

  uploadImage(url){this.userprov.userJson.uid
    this.imageProv.upload_image(url, this.userprov.userJson.mail+"_"+this.activity.uid,"user_activities/"+this.userprov.userJson.company.uid,progress=>{
      console.log(parseInt(progress))
    }).then(image =>{
      this.activity.image=image;
    })
  }

}
