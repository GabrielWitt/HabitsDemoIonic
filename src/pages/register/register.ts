import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading, ActionSheetController, Slides , Platform, MenuController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { RegisterProvider } from '../../providers/register/register';
import { User } from '../../interfaces/User';
import { AuthProvider } from '../../providers/auth/auth';
import { Company } from '../../interfaces/Company';
import { Position } from '../../interfaces/Position';
import { Department } from '../../interfaces/Department';
import { ChatProvider } from '../../providers/chat/chat';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { SettingsProvider } from '../../providers/settings/settings';

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  @ViewChild('slides') slides: Slides;
  @ViewChild('companycode1') comcode1;
  @ViewChild('companycode2') comcode2;

  password: string;
  passRepeat: string;
  companyCode: string;
  privacyTerms: boolean;

  user: User;
  selectedCompany: Company;
  departments: Department[];
  selectedDepartment: Department;
  positions: Position[];
  selectedPosition: Position;
  navigate: boolean;
  loader: Loading;

  /**
   * Contructor
   * @param navCtrl 
   * @param navParams 
   * @param alertCtrl 
   * @param loadingCtrl 
   * @param actionSheetCtrl 
   * @param registerProvider 
   * @param authProvider 
   */
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    private registerProvider: RegisterProvider,
    private authProvider: AuthProvider,
    public platform: Platform,
    public keyboard: Keyboard,
    private chatProvider: ChatProvider,
	  private analytics:AnalyticsProvider,
    public menuCtrl: MenuController,
    public language: SettingsProvider
    ) {
    this.menuCtrl.enable(false);
    this.user = {};
    this.privacyTerms = false;
    this.selectedCompany = { name: '' };
    this.companyCode = '';
  }

  /**
   * Initialize ionic components
   */
  ionViewDidLoad(){
    this.slides.lockSwipes(true);
  }
  
  ionViewDidEnter(){
	  this.analytics.saveScreen("Registro");
  }

  loadCompanyByKey() {
    this.hideKeyboard();
    this.companyCode1 = this.companyCode1.toUpperCase();
    this.companyCode2 = this.companyCode2.toUpperCase();
    this.companyCode = this.companyCode1+"-"+this.companyCode2;
    this.showLoader();
    if (this.companyCode != '') {
      this.registerProvider.getCompanyByKey(this.companyCode).then(company => {
        this.selectedCompany = company;
        this.registerProvider.getDepartmentsByCompany(this.selectedCompany.uid).then(departments => {
          this.departments = departments;
          this.registerProvider.getPositionsByCompany(this.selectedCompany.uid).then(positions => {
            this.dismissLoader();
            this.positions = positions
            this.navigate = true;
            this.continue();
          }).catch(reason => {
            this.dismissLoader();
            this.showAlert('Error', reason);
            console.log('error', reason);
          });
        }).catch(reason => {
          this.dismissLoader();
          this.showAlert('Error', reason);
          console.log('error', reason);
        });
      }).catch(reason => {
        this.dismissLoader();
	  let error='Error';
	  if (reason == 'El código ingresado no es válido.'){ error='';}
	  
        this.showAlert(error, reason);
        console.log('error', reason);
      });
    } else {
      this.dismissLoader();
      this.showAlert('Campos vacíos', 'Ingresa el código de tu compañia');
    }
  }

  enterPress(key) {
    if (key.keyCode == 13) {
      this.hideKeyboard();
    }
  }

  companyCode1 ="";
  companyCode2 ="";
  enterCompany(key) {
    if(this.companyCode1.length >2 && key.keyCode != 8) this.comcode2.setFocus()
    if(this.companyCode2.length == 0 && key.keyCode == 8) this.comcode1.setFocus()
    if (key.keyCode == 13) {
      this.loadCompanyByKey()
    }
  }

  register() {
    this.hideKeyboard();
    if(this.authProvider.AppIsOnline()){
      if (!this.user.name){
        this.showAlert('', 'Ingrese su nombre');
      } else if(!this.user.last_name){
        this.showAlert('', 'Ingrese su apellido');
      } else if (!this.user.cell_phone){
        this.showAlert('', 'Ingrese su número de celular');
      } else if (this.user.cell_phone.length < 8){
        this.showAlert('', 'El número de celular debe poseer al menos 8 digitos');
      } else if(!this.user.gender){
        this.showAlert('', 'Ingrese su género');
      } else if (!this.privacyTerms){
        this.showAlert('', 'Es necesario que acepte los términos y condiciones');
      }else if (!this.user.born_date){
        this.showAlert('', 'Ingrese su fecha de nacimiento');
      }else
      {
        this.showLoader();
        this.user.status = 'active';
        this.authProvider.anonymousToPermanent(this.user.mail, this.password).then(auth => {
          let newUID = auth.user.uid;console.log(newUID);
          this.selectedCompany.department = this.selectedDepartment;
          this.selectedCompany.position = this.selectedPosition;
          this.user.uid = newUID;
          this.user.company = this.selectedCompany;
          this.user.points = 0;
          this.user.wellness = 0;
          this.user.points = 0;
          this.user.diet = "Empty";
          this.user.test = "";//this.selectedCompany.test;
          this.user.create_date = new Date();//this.selectedCompany.test;
          this.user.picture = "./assets/user_icons/icon0.png";
          this.user.rol = "user";
          this.user.steps_goal = 8000;
          this.user.tester = false;
          this.user.seven_days = 0;
          this.user.language = this.language.getLanguageSetting();
          this.user.picture = "./assets/user_icons/icon0.png";
          let chatroomAna = {
            create_date: new Date().toISOString(),
            members: {
              ["BOT-001"]: true, 
              [newUID]: true
            },
            name: "Coach Ana",
            type: "bot",
            imagen:"./assets/user_icons/iconAna.png",
            BotUid: "BOT-001"
          }
          let chatroomHabits = {
            create_date: new Date().toISOString(),
            members: {
              ["BOT-002"]: true, 
              [newUID]: true
            },
            name: "Habits Bot",
            type: "bot",
            imagen:"./assets/LogoHabitspng.png",
            BotUid: "BOT-002"  
          }
          this.chatProvider.createChatRoom(chatroomAna,chatroomHabits,this.user.uid,this.user.name,this.selectedCompany.name,this.selectedCompany.key).then(chatroom => {
          let chats_bots_rooms={
            "BOT-001":chatroom.ana,
            //"BOT-002":chatroom.habits se documento porque en la fase beta el habit bot estara disponible solo para ciertos usuarios
          };
          this.user.chat_bot_room = chats_bots_rooms;
            let user_card ={
              company: this.user.company.uid,
              name: `${this.user.name} ${this.user.last_name}`,
              points: 0,
              uid: this.user.uid,
              online: false,
              picture:"./assets/user_icons/icon0.png"
            }
            this.chatProvider.createUserCard(user_card)
            this.registerProvider.createUser(auth.user.uid, this.user).then(() => {   
              this.dismissLoader();
            // this.showAlert('¡Listo!', 'Usuario creado correctamente.');
              this.authProvider.singOut().then(() => {
                this.navCtrl.setRoot('SignInPage',{user:this.user.mail}).then(() => {                
                  this.analytics.saveAllUser(this.user);              
                  this.analytics.appSeeEvent("Nuevo_Usuario");
                  this.showAlert('Cuenta Creada Exitosamente', 'Ingresa tu contraseña para continuar.')
                });
              });
            }).catch(error => {
              this.dismissLoader();
              this.showAlert('Error', error);
            });
          }).catch(error => {
            this.dismissLoader();
            this.showAlert('Error', error);
          });
        }).catch(error => {
          this.dismissLoader();
          this.showAlert('Error', error);
        });
      }
    }else {
      this.showAlert('Conexión inestable', 'Por favor, verifique su conexión y vuelva a intentar. Nota: Es preferible estar conectado a wi-fi para el registro.');
    }
  }

  showLoader() {
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Espere...'
    });
    this.loader.present();
  }

  dismissLoader() {
    this.loader.dismiss().catch(() => {});;
  }

  showAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['Aceptar']
    });
    alert.present();
  }

  //Presentador de TERMINOS Y CONDICIONES
  presentActionSheet() {
    console.log("Action")
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Presione para revisar:',
      buttons: [
        {
          text: 'Aviso de Privacidad',
          role: 'Privacy',
          handler: () => {
            this.navCtrl.push('PrivacyPage');
          }
        }, {
          text: 'Terminos y condiciones',
          handler: () => {
            window.open('https://docs.google.com/document/d/1cNmB-Ka9hZvghlzgU8X6k5ZU7aTvmULNI7xp7WmmlaQ/edit', '_system')
          }
        }, {
          text: 'Aceptar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
            this.hideKeyboard();
          }
        }
      ]
    });
    actionSheet.present();
  }

  validateJobInformation()
  {
    this.hideKeyboard();
    if (!this.selectedDepartment) {
      this.showAlert('', 'Seleccione su departamento');
    }else if(!this.selectedPosition){
      this.showAlert('', 'Seleccione su cargo');
    }
    else{
      this.continue();
    }
  }

  //SLIDE 2 VALIDADOR DE MAILS Y PASSWORDS
  validatePersonalInformation(){
    this.hideKeyboard();
    if (!this.user.mail) {
      this.showAlert('', 'Ingrese un email válido');
    }else if (this.user.mail) {
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let result = re.test(this.user.mail);
      if (!result) {
        this.showAlert('', 'Ingrese un email válido');
      }else if(!this.password){
        this.showAlert('', 'Ingrese una contraseña');
      }else if(!this.passRepeat){
        this.showAlert('', 'Ingrese nuevamente su contraseña ');
      }else if(this.password!=this.passRepeat){
        this.showAlert('', 'Los contraseñas ingresados no coinciden');
      }
      else{
        this.continue();
      }
    }
  }

  continue(){
    this.slides.lockSwipes(false);
    this.slides.slideNext();
    this.hideKeyboard();
    this.slides.lockSwipes(true);
  }

  
  prev() {
    this.slides.lockSwipes(false);
    this.slides.slidePrev();
    this.hideKeyboard();
    this.slides.lockSwipes(true);
  }

  hideKeyboard(){
    if(this.platform.is('cordova')){
      this.authProvider.keyboardHide();
    }
  }
  
}
