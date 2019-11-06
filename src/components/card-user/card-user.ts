import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { NavController, Events, ActionSheetController } from 'ionic-angular';
import { TestProvider } from '../../providers/test/test';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { ImgLoaderComponent } from 'ionic-image-loader';
import { HealthProvider } from '../../providers/health/health';
import { Step } from '../../interfaces/step';
import { loadingProvider } from '../../providers/alert/alert';
import { AuthProvider } from '../../providers/auth/auth';
import { ImagesProvider } from '../../providers/images/images';
import { UserProvider } from '../../providers/user/user';
import { Realtime } from '../../providers/social/social';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { SettingsProvider } from '../../providers/settings/settings';
import { User } from '../../interfaces/user';
import { AppContants } from '../../app/app.constants';
import { ErrorProvider } from '../../providers/error/error';
import { Chart } from 'chart.js';

@Component({
  selector: 'card-user',
  templateUrl: 'card-user.html'
})
export class CardUserComponent implements OnChanges {
  @ViewChild('doughnutCanvas') doughnutCanvas;
  @Input("network-status") isOnline: boolean;
  @Input("user") user: User;
  today = 0;
  userpoints: string = '';
  stepsToday:number = 0;
  pointbar: number = 0;
  level: number = 0;
  picture: any;
  monthResume: Step[] = [];
  actualMonth: Step;
  lastTest:string = '';
  loadUser=false;
  lauching = "done";//"cargando...";
  label:any;

  constructor(
    private navCtrl: NavController,
    private analytics:AnalyticsProvider,
    public healthProvider: HealthProvider,
    private alerts: loadingProvider,
    public actionSheetCtrl: ActionSheetController,
    public events: Events,
    public authProvider: AuthProvider,
    private imageProv: ImagesProvider,
    private userProvider: UserProvider,
    private auth: AuthProvider,    
    private test: TestProvider,
    private realtime:Realtime,
    public menuCtrl: MenuController,
    private language: SettingsProvider,
    private error: ErrorProvider
    ) {
      this.label = this.language.getLanguage('CardUserComponent');
      //this.alerts.showLoading("Cargando...");
      events.subscribe('DashboardLoad', () => {
      this.analytics.saveScreen("Dashboard");
      this.menuCtrl.enable(true);
        if (this.user){
          this.authProvider.signalCheck().then(sign => {
            let user = this.userProvider.static_user();
            this.authProvider.checkCompany(user.company.uid).then(company=>{
            if((sign||company)&&!AppContants.withoutSign){
              this.navCtrl.setRoot('SignPage'); 
            }else{
              this.checkPoints();       
              this.checkSteps();
              this.lauching ="done";
              this.auth.keyboardHide();}
            })
          })
        }
      });
  }

async ionViewDidLoad(){ 
  if (!this.user) this.user = await this.userProvider.getUserObservable();
  console.log(this.user)
  if(this.test.getLastTest()) this.lastTest=this.test.getLastTest();
  this.label = this.language.getLanguage('CardUserComponent', this.user.language);  
    let card = {points:this.user.points};
    if(this.auth.AppIsOnline()) this.realtime.getMyCard().then(data => {card = data;});
    if(card&&card.points && card.points>this.user.points) this.user.points = card.points;
    if(card&&card.points && card.points>this.user.points) this.user.points = card.points;
    this.checkPoints();   
    this.checkSteps();    
}

  async ngOnChanges() { 
    if(this.healthProvider.PERMISIONS) this.drawStepsCircle(); 
    if(this.test.getLastTest()) this.lastTest=this.test.getLastTest();
    this.label = this.language.getLanguage('CardUserComponent', this.user.language);  
      let card = {points:this.user.points};
      if(this.auth.AppIsOnline()) this.realtime.getMyCard().then(data => {card = data;});
      if(card&&card.points && card.points>this.user.points) this.user.points = card.points;
      if(card&&card.points && card.points>this.user.points) this.user.points = card.points;
      this.checkPoints();   
      this.checkSteps();      
  }

  onImageLoad(imgLoader: ImgLoaderComponent) {
    //alert(imgLoader.src)
    //console.log(imgLoader)
  }   
  
  profile() {
    this.navCtrl.push('ProfilePage', { user: this.user});
  }

  async checkPoints() {
    if (this.user.points < 100) {
      this.userpoints = '' + this.user.points + ' / 100';
      this.level = 1;
      this.pointbar = this.user.points;
    } else if (this.user.points < 300) {
      this.userpoints = '' + this.user.points + ' / 300';
      this.level = 2;
      this.pointbar = Math.round((this.user.points * 100) / 300);
    } else if (this.user.points < 700) {
      this.userpoints = '' + this.user.points + ' / 700';
      this.level = 3;
      this.pointbar = Math.round((this.user.points * 100) / 700);
    } else if (this.user.points < 1500) {
      this.userpoints = '' + this.user.points + ' / 1500';
      this.level = 4;
      this.pointbar = Math.round((this.user.points * 100) / 1500);
    } else if (this.user.points < 3000) {
      this.userpoints = '' + this.user.points + ' / 3000';
      this.level = 5;
      this.pointbar = Math.round((this.user.points * 100) / 3000);
    } else {
      this.userpoints = '' + this.user.points + ' / 5000';
      this.level = 5;
      this.pointbar = Math.round((this.user.points * 100) / 5000);
    }        
    this.test.load_all_test().then( data=>{
		  if(this.user.test && 
			   this.user.test != "NOT-ASSIGNED" && 
			   this.user.test.length > 0 &&
			   this.user.test != this.lastTest ){
			  console.log(this.user.test);	
				this.lastTest = this.user.test;
			  this.navCtrl.setRoot("QuizPage");
		}}).catch( error => {		})  
  }
  
  openPage(page) {
    if (page == 'steps') {  
      this.healthProvider.getMonthsObserver().then(resume => {
        if(resume){ 
          this.monthResume = resume.sort(function(a,b){
          let x = new Date(a.year, a.month, 1).getTime() - new Date(b.year, b.month, 1).getTime();
          if(x < 0){ x = -1 }
          else{ x = 1}
          return x;
          });
        }
        //console.log(this.monthResume)
        if(this.monthResume==[]){this.UpdateSteps()}
        this.navCtrl.push("HealthStepsPage",{
          user: this.user,
          monthResume: this.monthResume
        }); 
      }) 
    }
  }

  //////////////////////////////// CAPTURA DE IMAGEN DE PERFIL /////////////////////////////////////////////////

  presentActionSheet(){
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Cambiar foto de perfil:',
      buttons: [
        {
          text: 'Cámara',
          icon: "camera",
          handler: () => {
            this.addCameraPhoto(1)
          }
        }, {
          text: 'Galería',
          icon: "images",
          handler: () => {
            this.addCameraPhoto(2)
          }
        }, {
          text: 'Cancelar',
          icon: 'close',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  addCameraPhoto(x){
    if (this.authProvider.AppIsOnline()) {
      this.imageProv.addCameraPhoto(x,true).then(img=>{
        this.alerts.showLoading("Actualizando Datos");
        this.uploadImage(img);
      }).catch(error=>{
        this.alerts.showToast(error, 'bottom', false, 3000);
      });
    } else {
      this.alerts.showToast('No disponible sin conexión...', 'top', false, 3000);
    }
  }

  uploadImage(url){
    this.imageProv.upload_image(url, this.user.mail+"icon","user_imgs",progress=>{
      console.log(parseInt(progress))
    }).then(image =>{
      this.user.picture = image;
      this.updateData();
    })
  }

  updateData() {      
    this.userProvider.updateUser(this.user).then(() => {
      this.alerts.dismissLoading();      
      this.analytics.EventWithData("Cambio_Imagen",{page:"Dashboard"})       
      this.analytics.saveAllUser(this.user);
      this.alerts.showConfirm('Imagen Actualizada','Sus foto de perfil se han enviado correctamente');
    })
  }

  //////////////////////////////// DATOS DE SALUD /////////////////////////////////////////////////
  
  //Verifica el numero de pasos hasta llegar a la meta;
  preview = "0";step_percent=0;prev_val=0;
  progress_step(){
    this.step_percent = 0;
    //this.stepsToday=2200;
    if (this.user){
      if (this.user.steps_goal){this.step_percent = this.stepsToday*100/this.user.steps_goal}
      else{this.step_percent = this.stepsToday*100/5000}
    }else{
      this.step_percent = 0;
    }
    this.step_percent= Math.round(this.step_percent)
    if(this.prev_val>this.step_percent||this.step_percent == NaN||!this.step_percent){this.step_percent=this.prev_val;}
    else{this.prev_val=this.step_percent;}
    if(this.step_percent > 100){this.step_percent=100}
    return  this.step_percent;
  }

  //Captura los pasos actuales y los envia al usercard, tambien calcula los pasos semanales()
   async checkSteps(): Promise<any> {  
    if(this.user){//
      this.stepsToday = await this.healthProvider.save_actual_steps();
      //this.stepsToday=-1;
      this.progress_step();
      console.log("card_steps "+this.stepsToday)
      if(this.stepsToday==undefined)this.stepsToday=0;
      if(0>this.stepsToday){this.error.reportManualSteps();this.stepsToday=0;}
      if(this.healthProvider.PERMISIONS) this.updateCircle(this.stepsToday); 
      return "done";
    }
  }

  //Muestra un toast cuando se actualizan los pasos a travez del botón.
  UpdateSteps(){
    this.checkSteps().then(steps => {  
      if(this.stepsToday){
        this.alerts.presentToast("Pasos actualizados");
      }else{
        this.alerts.presentToast("No se pudo procesar pasos actuales. ¿Ya activó los permisos de pasos?");
      }
    })
  }

  circle_ready=false;
  drawStepsCircle(){  
    this.doughnutCanvas = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
          labels: [""],
          datasets: [{
              data: [99,1],
              backgroundColor: [
                "#36A2EB",
                "#FFFFFF",
              ],
              hoverBackgroundColor: [
                '#1B96E9',
                "#FFFFFF",
              ],
              borderColor: '#E3DAD5',
              borderWidth: 0
          }]
      },
      options:{
        cutoutPercentage: 85,
        legend: { display: false }
      }
    });
    this.circle_ready = true;
  }

  updateCircle(steps){    
    let data = []
    if(this.stepsToday>10000){data = [this.stepsToday,0]}
    else if(10000>this.stepsToday){data = [this.stepsToday,(10000-this.stepsToday)]}
    else if(8000>this.stepsToday){data = [this.stepsToday,(8000-this.stepsToday)]}
    else{data = [this.stepsToday,(6000-this.stepsToday)]}
    if(this.circle_ready){ 
      this.doughnutCanvas.data.datasets[0].data = data;
      this.doughnutCanvas.update();
    }
  }
}