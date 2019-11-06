import { Component, ViewChild } from '@angular/core';
import { Content, IonicPage, NavController, AlertController, LoadingController, NavParams, Platform, ToastController } from 'ionic-angular';
import { User } from '../../interfaces/user';
import { Department } from '../../interfaces/department';
import { Position } from '../../interfaces/position';
import { RegisterProvider } from '../../providers/register/register';
import { UserProvider } from '../../providers/user/user';
import { ImagesProvider } from '../../providers/images/images';
import { ChatProvider } from '../../providers/chat/chat';
import { Keyboard } from '@ionic-native/keyboard';
import { AuthProvider } from '../../providers/auth/auth';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { SettingsProvider } from '../../providers/settings/settings';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  @ViewChild(Content) content: Content;

  selectedTab = 'Usuario';
  isOnline: Boolean;
  loader: any;
  selectedDepartmentUID: string;
  selectedPositionUID: string;

  user: User
  departments: Department[];
  positions: Position[];
  label:any;

  constructor(
    private navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    private registerProvider: RegisterProvider,
    private userProvider: UserProvider,
    private imageProv: ImagesProvider,
    private userCardProvider:ChatProvider,
    public platform: Platform,
    public keyboard: Keyboard,
    public authProvider: AuthProvider,
	  private analytics:AnalyticsProvider,
    public toast: ToastController,
    private language: SettingsProvider
  ) {
    this.label = this.language.getLanguage('ProfilePage');
  }

  public ionViewCanEnter(){
	this.analytics.saveScreen("Perfil");
    this.user = this.navParams.get('user');
    if(this.user){
      this.label = this.language.getLanguage('ProfilePage',this.user.language);
      //console.log(this.label)
      return true;
    }else{
      this.navCtrl.pop();
      return false;
    }
  }

  ionViewDidLoad() {
    this.isOnline = true;
    this.selectedDepartmentUID = this.user.company.department.uid;
    this.selectedPositionUID = this.user.company.position.uid;
    this.loadDepartments();
    this.loadPositions();
    
  }

  public loadDepartments() {
    this.registerProvider.getDepartmentsByCompany(this.user.company.uid).then(departments => this.departments = departments);
  }

  public loadPositions() {
    this.registerProvider.getPositionsByCompany(this.user.company.uid).then(positions => this.positions = positions);
  }

  ionViewWillEnter(): void {
    this.navCtrl.swipeBackEnabled = true;
  }

  ionViewDidLeave(): void {
    this.navCtrl.swipeBackEnabled = false;
  }

  openTab(tabName) {
    this.selectedTab = tabName;
  }

  updateData(image?) {
    this.hideKeyboard();
    if(this.user.company.department.uid !== this.selectedDepartmentUID){
      this.user.company.department = this.departments.find(element => {
        return element.uid == this.selectedDepartmentUID;
      });
    }
    if(this.user.company.position.uid !== this.selectedPositionUID){
      this.user.company.position = this.positions.find(element => {
        return element.uid == this.selectedPositionUID;
      });
    }
      
      this.showLoadind("dots","Actualizando Datos");
      if (this.user.mail == '' || this.user.born_date == '' || this.user.name == '' || this.user.last_name == '' || this.user.gender == '') {
        let alert = this.alertCtrl.create({
          title: 'Campos Vacios',
          subTitle: 'Por favor verifique los campos tengan su información.',
          buttons: ['Aceptar']
        });
        alert.present();
        this.hideLoading();
      } else {
        //console.log(this.user);
        this.userProvider.updateUser(this.user).then(() => {
          if(!image) this.analytics.EventWithData("Actualización_Datos","Perfil") 
          this.userCardProvider.set_habit_value(this.user.uid, this.user.name, "name");  
          let alert = this.alertCtrl.create({
            title: 'Datos Actualizados',
            subTitle: 'Sus datos se han actualizado correctamente',
            buttons: [{
              text: 'Aceptar',
              handler: () => {
                //this.navCtrl.setRoot(DashboardPage)
              }
            }]
          });
          alert.present();
          this.hideLoading();
        })
      }
  }

  addCameraPhoto(x){
    if (this.authProvider.AppIsOnline()){
      if(this.platform.is('cordova')){
      this.imageProv.addCameraPhoto(x,true).then(img=>{
        this.showLoadind("dots","cargando nueva imagen");
        this.uploadImage(img);
      }).catch(error=>{
        this.showToast(error, 'bottom', false, 3000);
      });
      }else{this.uploadImage("./assets/icons/ninja.png")}
    } else {
      this.showToast('No disponible sin conexión...', 'top', false, 3000);
    }
  }

  uploadImage(url){
    this.imageProv.upload_image(url, this.user.mail+"icon","user_imgs",progress=>{
      console.log(parseInt(progress))
    }).then(image =>{
      this.hideLoading();
      this.user.picture = image;
      this.analytics.EventWithData("Cambio_Imagen",{page:"Perfil"}) 
      this.updateData(true);
    }).catch(err=>alert("error c: "+JSON.stringify(err)));
  }

  hideKeyboard(){
    if(this.platform.is('cordova')){
      this.authProvider.keyboardHide();
    }
  }

  showToast(text, position, showOk, duration) {
    let toast = this.toast.create({
      message: text,
      duration: duration,
      position: position,
      showCloseButton: showOk,
      closeButtonText: 'OK'
    });
    toast.present();
  }

  showLoadind(icon,contend){
    if(this.loader==null){
      this.loader = this.loadingCtrl.create({
        spinner: icon,
        content: contend
      });
    }
    this.loader.present();
  }

  hideLoading(){
    if(this.loader!=null){
      this.loader.dismiss().catch(() => {});;
      this.loader=null;
    }
  }
}