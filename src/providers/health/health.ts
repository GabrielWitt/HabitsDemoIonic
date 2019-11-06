import { ErrorProvider } from './../error/error';
import { Injectable } from '@angular/core';
import { Health } from '@ionic-native/health';
import { Platform, AlertController } from 'ionic-angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { loadingProvider } from '../alert/alert';
import { AuthProvider } from '../auth/auth';
import { UserProvider } from '../user/user';
import { ChatProvider } from '../chat/chat';
import { Observable } from 'rxjs/Observable';
import { User } from '../../interfaces/user';
import { Step } from '../../interfaces/step';
import { RetosProvider } from '../retos/retos';
import * as moment from 'moment';
import * as firebase from 'firebase';


const HEALTH_PERMISIONS = ['distance', 'steps'];
const HEATLH_STEPS_NODE = 'user_health';
const USER_CARD_NODE = "user_card";
const ERROR_COMPONENT = "Health";

@Injectable()
export class HealthProvider {
  user: User;
  stepsItems :any;
  realSteps: Observable<any>;
  todaySaved = true;
  update_time = moment().format("L"); //moment().set({ hour: 1, minute: 0, second: 0 }).format(); 
  todayDate = moment().set({ hour: 0, minute: 0, second: 0 }).toDate();
  todayMonth = moment().format("MM");
  todayDay = moment().format("DD");
  todayYear = moment().format("YYYY");
  startWeek = moment().isoWeekday(1).toDate();
  endWeek = moment().isoWeekday(7).toDate();
  saveCheck = false;
  todayCheck = false;
  monthResume: Step[]=[];
  steps_today=0;
  steps_week=0;
  updated=false;
  PERMISIONS = false;
  HealthReady = false;
  NotStarted = true;
  ReadyMonths = false;
  logactive = false;

  constructor(
    private health: Health,
    private platform: Platform,
    private afs: AngularFirestore,
    private userProvider: UserProvider,
    public alertCtrl: AlertController,
    private alerts: loadingProvider,
    private auth: AuthProvider,
    private userCardProvider:ChatProvider,
    private fireDB: AngularFireDatabase,
    private challengeProvider: RetosProvider,
    private error: ErrorProvider
    ) {
      this.user = this.userProvider.static_user();
      this.checkLocalData();
  }

  async cleanUpHealth(){    
    this.user={};
    this.stepsItems=[];
    this.realSteps = null;
    this.todaySaved = true;
    this.update_time = moment().format("L"); //moment().set({ hour: 1, minute: 0, second: 0 }).format(); 
    this.todayDate = moment().set({ hour: 0, minute: 0, second: 0 }).toDate();
    this.todayMonth = moment().format("MM");
    this.todayDay = moment().format("DD");
    this.todayYear = moment().format("YYYY");
    this.startWeek = moment().isoWeekday(1).toDate();
    this.endWeek = moment().isoWeekday(7).toDate();
    this.saveCheck = false;
    this.todayCheck = false;
    this.monthResume=[];
    this.steps_today=0;
    this.steps_week=0;
    this.updated=false;
    this.PERMISIONS = false;
    this.HealthReady = false;
    this.HealthMonths = [];
    this.NotStarted = true;
    this.ReadyMonths = false;
    return;
  }

  HealthMonths = [];
  public getHealthResume(uid):any{
    return new Promise((resolve)=>{
      firebase.firestore().collection(HEATLH_STEPS_NODE).where('user', '==', uid).get().then(months=>{
        this.stepsItems = months.docs.forEach(month=>{
          this.HealthMonths.push(month.data())
        })        
        if(this.logactive) console.log(this.HealthMonths);
        resolve(this.HealthMonths);
      })
    })
  }

  async getMonthsObserver(){
    return this.HealthMonths;
  }
  
  ////////////////////////////////////////////////////////// Manejo LocalStorage //////////////////////////////////////////////////

  async localGetItem(name): Promise<any> {
    return new Promise((resolve, rejected) => {
      if(window.localStorage.getItem(name)){resolve(window.localStorage.getItem(name))}
      else{resolve(0)}
    })
  }

  async localSetItem(name,data){
    window.localStorage.setItem(name,data);
  }

  async checkLocalData(){
    let answer = ""; 
    let time: string = await this.localGetItem("update_time")
    if(time!= "empty" && time == this.update_time){
      //console.log('sameday')
      await this.setSavedData();
      answer = "saved";
    }else{
      //console.log('newday')
      await this.resetStepsData();
      //console.log('resetStepsData')
      if(this.ReadyMonths) await this.checkLastMonth(this.user)
      //console.log('checkLastMonth')
      answer = "update";
    }
    return answer;
  }

  //Resetea los pasos guardados localmente
  resetStepsData(){  
    return new Promise((resolve)=>{
      this.localSetItem("steps_today",""+0).then(()=>{
        this.localSetItem("steps_week",""+0).then(()=>{
          this.localSetItem("update_time",this.update_time).then(()=>{});
            resolve()
          });      
      });
    })  
  }

  //Carga los pasos guardados localmente
  async setSavedData(){
    return new Promise((resolve)=>{
      this.localGetItem("steps_today").then(steps => {
        this.localGetItem("steps_week").then(week => {
          this.steps_today = parseInt(steps);
          this.steps_week = parseInt(week);
          resolve();
        })
      })
    })
  }

  //Verifica si los datos son mayores a los guardados localmente, si es asi carga los nuevos, si no, carga los locales
  CheckBackupData(){
    return new Promise((resolve) => {
      this.localGetItem("steps_today").then(steps => {
        this.localGetItem("steps_week").then(week => {
          if(this.steps_today < parseInt(steps)){
            this.steps_today = parseInt(steps);
          }else{
            this.localSetItem("steps_today",""+this.steps_today);
          }          
          if(this.steps_week < parseInt(week)){
            this.steps_week = parseInt(week);
          }else{
            this.localSetItem("steps_week",""+this.steps_week);
          }
          resolve('checkDone')
        })
      })
    })
  }

  //Verifica unacamente los datos de pasos de hoy si son mayores a los guardados localmente, si es asi carga los nuevos, si no, carga los locales
  async CheckTodayStepData(steps){
    await this.localGetItem("steps_today").then(steptoday => {
      if(steps < parseInt(steptoday)){
        this.steps_today = parseInt(steptoday);
      }else{
        this.localSetItem("steps_today",""+this.steps_today);
        this.steps_today = steps;
      }

      return this.steps_today;
    })
    return this.steps_today;
  }
  

  ////////////////////////////////////////////////////////// PERMISOS DE HEALTH ///////////////////////////////////////////////////
  public check(): Promise<boolean> {
    return new Promise((resolve, rejected) => {
      this.health.isAvailable().then((isAvailable: boolean) => {
        if (isAvailable) {
          this.health.isAuthorized(HEALTH_PERMISIONS).then(isAuthorized => {
            resolve(isAuthorized);
          }).catch(error => { 
            if(error == "GoogleApiClient is not connected yet."){
              resolve(true);
              //this.alerts.showToast("Conexión con GoogleFit inestable.","center", false,3000)
            }else{
              rejected('Por favor, reinicia la aplicación para iniciar los servicios de Salud.'+error)
            }
          })
        } else {
          if (this.platform.is('android')&&this.platform.is('cordova')) {
            rejected('google-fit');
          } else {
            rejected('Tu dispositivo no es compatible con Google fit');
          }
        }
      }).catch(e => {
        //alert('Health Avaliable error '+ e);
        rejected('Tu dispositivo no es compatible con Google fit')});
    });
  }

  public prompt_google_fit(): Promise<void> {
    return new Promise((resolve, rejected) => {
      this.health.promptInstallFit().then(() => {
        resolve();
      }).catch(error => {
        console.log(JSON.stringify(error));
        rejected('Error interno, intenta mas tarde, si el error persite comunicate con soporte');
      });
    });
  }

  public request_authorization(): Promise<any> {
    return new Promise((resolve, rejected) => {
      this.health.requestAuthorization(HEALTH_PERMISIONS)
        .then(res => {
          resolve();
        }).catch(e => {
         // alert(JSON.stringify(e))
          console.info('Authorization error '+JSON.stringify(e))
          rejected('Ha ocurrido un error intente mas tarde')
        });
    });
  }

  checkPermissionHealth(): Promise<Boolean>{
    return new Promise(resolve => {
      this.check().then(health => {
        this.PERMISIONS = false;
        this.SavePermission(health);
        if (!health) {          
          this.alerts.showLoading("Obteniendo permisos...");
          this.showConfirm(isUserAuthorized => {
            if (isUserAuthorized) {
              this.request_authorization().then(authHealth => { 
                this.SavePermission("First Time");
                this.alerts.dismissLoading();this.alerts.dismissLoading();
                  this.alerts.showToast("Permisos actualizados. Por favor cierre y vuelva a abrir la aplicación para cargar sus pasos correctamente.","bottom","Ok",undefined);
                  if(this.ReadyMonths){this.checkLastMonth(this.user)}
                  else{this.InitHealth(this.user);}
                  //this.alerts.presentToast(`Es necesario aprobar los permisos de salud para continuar. \n \n Si necesitas ayuda escribe a Ana: "Activar permisos de salud"`);
              }).catch(error => {      
                this.alerts.dismissLoading();
                this.alerts.presentToast(error);
              })
              resolve(false);
            } else {      
              this.alerts.dismissLoading();
              this.alerts.presentToast('Es necesario aprobar los permisos de salud para acceder a esta funcionalidad.');
              resolve(false);
            }
          });
        } else {
          resolve(true);
        }
      }).catch(error => {
        if(error == 'google-fit'){
          this.alerts.showLoading("Solicitando Google Fit...");
          this.showInstallFitCofirm(userAuthorizedInstallFit => {
            if(userAuthorizedInstallFit){
              this.prompt_google_fit().then(_=>{      
                this.alerts.dismissLoading();
                this.alerts.presentToast("Se ha detectado que instaló Google Fit, presione Activar Permisos para continuar.");
              }).catch(error => {      
                this.alerts.dismissLoading();
                this.alerts.presentToast(error)});
            }else{      
              this.alerts.dismissLoading();
              this.alerts.presentToast(userAuthorizedInstallFit);
            }
          });                
        }else{      
          this.alerts.dismissLoading();
          this.alerts.presentToast(error);
        }
        resolve(false);
      });
    })
  }

  showInstallFitCofirm(callback){
    const confirm = this.alertCtrl.create({
      title: 'Datos de salud',
      message: 'Habits necesita instalar Google Fit, para obtener tus datos de salud',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            callback(false);
          }
        },
        {
          text: 'Ir a Google Play',
          handler: () => {
            callback(true);
          }
        }
      ]
    });
    confirm.present();
  }

  showConfirm(callback) {
    const confirm = this.alertCtrl.create({
      title: 'Datos de salud',
      message: 'A Habits le gustaría acceder a tus datos de salud para analizar y visualizar tus actividades. Es necesario aprobar todos los permisos para brindarte un funcionamiento apropiado',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            callback(false);
          }
        },
        {
          text: 'Autorizar',
          handler: () => {
            callback(true);
          }
        } 
      ]
    });
    confirm.present();
  }

  //Guarda en una variable si hay o no permisos y guarda en user card el estado de autorización de Salud.
  async SavePermission(authorization){
    let label = "unauthorized"
    if(authorization == "First Time"){
      this.PERMISIONS = true;
      label = authorization;
    }else if(authorization == true){
      this.PERMISIONS = true;
      label = "authorized"
    }else{
      this.PERMISIONS = false;
    }
    let user = await this.userProvider.static_user();
    let goalToday = {
      uid:user.uid, 
      health_authorization:label, 
    }
    this.userCardProvider.updateUserCard(goalToday)
    return;
  }

//////////////////////////////////////////////////////// SOLICITUD DE DATOS A HEALTH //////////////////////////////////////////////////////////////

  public get_querysteps_by_day(date: Date): Promise<number> {
    let start = moment(date).set({ hour: 0, minute: 0, second: 0 });
    let end = moment(date).set({ hour: 23, minute: 59, second: 59 });
    return new Promise((resolve, rejected) => {
      if (this.platform.is('cordova')){
        if (this.PERMISIONS) {
          this.health.query({
            startDate: start.toDate(),
            endDate: end.toDate(),
            dataType: 'steps',
            limit: 1000,
            filtered: true
          }).then(data => {
            if(this.logactive) console.log("get_querysteps_by_day: "+JSON.stringify(data))
            let today_steps = 0;
            for(let metric of data){
              if(this.logactive) console.log(metric.sourceBundleId);
              if(metric.sourceBundleId!="com.google.android.apps.fitness") today_steps += parseInt(metric.value);
            }
            if(this.logactive) console.log("get_querysteps_by_day: "+today_steps)
            resolve(today_steps)
          }).catch(err => {
            //console.log("get_steps_by_day: "+err)
            rejected('Error interno');
          });
        } else {
          //console.log('get_steps_by_day: no autorizado');
          rejected(`Es necesario aprobar los permisos de salud para acceder a esta funcionalidad. Busca y abre la aplicación "Salud" o "Health" en tu teléfono (Ya está instalada). Ve a la sección de "Fuentes" o "Sources". Da click en Habits y activa todos los permisos. \n \n Si necesitas ayuda escribe a Ana: "Activar permisos de salud"`);
          throw new Error('Activa los permisos para Habits en la app salud');
        }
      }else{
        resolve(Math.floor( Math.random() * 2000));
      }
    })
  }

  public get_steps_by_day(date: Date): Promise<number> {
    let start = moment(date).set({ hour: 0, minute: 0, second: 0 });
    let end = moment(date).set({ hour: 23, minute: 59, second: 59 });
    return new Promise((resolve, rejected) => {
      if (this.platform.is('cordova')){
        if (this.PERMISIONS) {
          this.health.queryAggregated({
            startDate: start.toDate(), // three days ago
            endDate: end.toDate(), // now
            dataType: 'steps',
            bucket: 'day',
            filtered: true
          }).then(data => {
            //console.log("get_steps_by_day: "+data)
            //alert(JSON.stringify(data));
            resolve(Number.parseInt(data[0].value))
          }).catch(err => {
            //console.log("get_steps_by_day: "+err)
            rejected('Error interno');
          });
        } else {
          //console.log('get_steps_by_day: no autorizado');
          rejected(`Es necesario aprobar los permisos de salud para acceder a esta funcionalidad. Busca y abre la aplicación "Salud" o "Health" en tu teléfono (Ya está instalada). Ve a la sección de "Fuentes" o "Sources". Da click en Habits y activa todos los permisos. \n \n Si necesitas ayuda escribe a Ana: "Activar permisos de salud"`);
          throw new Error('Activa los permisos para Habits en la app salud');
        }
      }else{
        resolve(Math.floor( Math.random() * 30000));
      }
    })
  }

  public get_steps_by_date(start: Date, end: Date): Promise<number[]> {
    //console.log(start+"-"+end)
    return new Promise((resolve, rejected) => {
    if (this.platform.is('cordova')){
      if (this.PERMISIONS) {
        this.health.queryAggregated({
          startDate: start,
          endDate: end,
          dataType: 'steps',
          bucket: 'day',
          filtered: true
        }).then(data => { 
          //alert(JSON.stringify(data));
          let stepCount = [];
          for (let daySteps of data) {
            stepCount.push(Number.parseInt(daySteps.value));
          }
          resolve(stepCount)
        }).catch(err => {
          if(this.logactive) console.log(err)
          rejected('Error interno');
        });
      } else {
        //console.log('no autorizado');
        rejected(`Es necesario aprobar los permisos de salud para acceder a esta funcionalidad. Busca y abre la aplicación "Salud" o "Health" en tu teléfono (Ya está instalada). Ve a la sección de "Fuentes" o "Sources". Da click en Habits y activa todos los permisos. \n \n Si necesitas ayuda escribe a Ana: "Activar permisos de salud"`);
        throw new Error('Activa los permisos para Habits en la app salud');
      }
    }else{
      let cero = []
      for(let i=0;i<end.getDate();i++){
        cero.push(Math.floor(Math.random() * 30000))
      }      
      resolve(cero)
    }
    })
  }

  public get_heart_rate_by_day(date: Date): Promise<any[]> {
    let start = moment(date).set({ hour: 0, minute: 0, second: 0 });
    let end = moment(date).set({ hour: 23, minute: 59, second: 59 });
    return new Promise((resolve, rejected) => {
      if (this.platform.is('cordova')){
        if (this.PERMISIONS) {
          this.health.queryAggregated({
            startDate: start.toDate(), // today at 00 hours
            endDate: end.toDate(), // now
            dataType: "activity",
            bucket: 'day',
            filtered: true
          }).then(data => {
            //console.log("get_steps_by_day: "+data)
            //alert(JSON.stringify(data));
            resolve(data);
          }).catch(err => {
            if(this.logactive) console.log("get_steps_by_day: "+err)
            rejected('Error interno');
          });
        } else {
          //console.log('get_steps_by_day: no autorizado');
          rejected(`Es necesario aprobar los permisos de salud para acceder a esta funcionalidad. Busca y abre la aplicación "Salud" o "Health" en tu teléfono (Ya está instalada). Ve a la sección de "Fuentes" o "Sources". Da click en Habits y activa todos los permisos. \n \n Si necesitas ayuda escribe a Ana: "Activar permisos de salud"`);
          throw new Error('Activa los permisos para Habits en la app salud');
        }
      }else{
        rejected('cordova_plugin_not_detected');
      }
    })
  }

/////////////////////////////////GUARDAR DATOS ////////////////////////////////////////////////////////////

// Crea un nuevo mes en Health
  public async saveMonthData(user,startmonth,month_uid?){
    let fullMonthdays =  moment(startmonth).endOf("month"); let month = parseInt(moment(startmonth).format("MM"));
    let monthSteps = []
    let startWeek = startmonth.getDay();//moment().startOf('month').toDate();
    if (this.platform.is('cordova')){ monthSteps = await this.get_steps_by_date(startmonth,new Date(fullMonthdays.toDate())).catch(err=>{return [-1];});}
    let weekData = await this.calculateWeeks(month,startWeek,monthSteps);
    let monthResume: Step  = {
      last_update: this.update_time,
      month: month,
      day: monthSteps.length,
      year: moment(startmonth).format("YYYY"),
      user: user.uid,
      company: user.company.uid,
      month_steps: monthSteps,
      weeks: weekData.week,
      weekdays: weekData.weekdays,
      total_steps: weekData.total,
      steps_day: Math.round(weekData.total / weekData.total_days),
      uid: month_uid
    }
    if(month_uid==undefined){ 
      this.checkIfMonthData(monthResume.month,monthResume.year).then(check =>{
        if(check){
          //console.log("Creando:"+fullMonthdays.format("MM YYYY"))
          month_uid = this.afs.createId(); monthResume.uid=month_uid;
          this.afs.collection(HEATLH_STEPS_NODE).doc(month_uid).set(monthResume);
        }    
      })
    }else{
      //console.log("Actualizando:"+fullMonthdays.format("MM YYYY"))
      await this.afs.collection(HEATLH_STEPS_NODE).doc(month_uid).update(monthResume).then(()=>{  
        return;
      })
    }    
    return monthResume;
  }

///////////////////////////////////////////// FUNCIONES DE RESPALDO Y CALCULO ///////////////////////////////////////////////////////////
              // Bis En,Fe,Ma,Ab,Ma,Jn,Jl,Ag,Sp,Oc,Nv,Dc
  monthFullDays =[29,31,28,31,30,31,30,31,31,30,31,30,31]

//Calcula las semanas en un mes y el numero de dias de cada semana. Tambien resta los dias en 0 para el calculo del promedio del mes.
  async calculateWeeks(month,startWeek,monthSteps){
    let dayCount = this.monthFullDays[month]; let year = parseInt(this.todayYear);
    //Calcula si es año bisciesto y si es febrero, asigna la posición 0 de monthFullDays;
    if((((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))||month==2) dayCount = this.monthFullDays[0];
    let week = []; let countWeek = 0; let total = 0; let weekdays = []; let total_days = 0;
    for(let i = 0;i<dayCount;i++){
      if(!week[countWeek]) week[countWeek] = 0;
      if(!weekdays[countWeek]) weekdays[countWeek] = 0;
      if (!monthSteps[i]) monthSteps[i] = ""+0
      week[countWeek] = week[countWeek] + parseInt(monthSteps[i]);
      total = total + parseInt(monthSteps[i]); if(parseInt(monthSteps[i])) total_days++;
      startWeek++; weekdays[countWeek]++;
      if(startWeek > 6){ startWeek = 0; countWeek++; }
    }
    if(!total_days) total_days = 1;
    return {
      week: week,
      total: total,
      weekdays: weekdays,
      total_days:total_days
    }
  }

  // Verifica si existe el mes del año enviado.
  public async checkIfMonthData(month, year){
    for(let x of this.monthResume){      
      if((x.month == month && x.year == year)||(x.month == parseInt(month) && x.year == parseInt(year))){
        ////console.log(month+"-"+x.year+" found"); 
        return false;
      }
    }
    return true;
  }
  
  //Obtiene el mes actual de la lista de meses
  async getActualMonth(){
    for(let month of this.monthResume){
      if(month.year==this.todayYear||month.year==parseInt(this.todayYear)){
        if(month.month==this.todayMonth||month.month==parseInt(this.todayMonth)){
          return month;
        }
      }
    }
    return {uid:"NO"};
  }

  //Cierra sesion de Health.
  cleanOut(){    
    this.user=null;
    this.stepsItems=null;
    this.realSteps=null;
    this.todaySaved = true;
    this.cleanUpHealth();
  }

  //////////////////////////////////// HEALTH DATA Guarda y actuliza los datos por mes///////////////////////////////

  
  InitHealth(user): Promise<any>{
    return new Promise(resolve => {
      this.HealthReady = false;
      if(this.NotStarted){
        this.user = user; 
        this.NotStarted = false;
        this.getHealthResume(user.uid).then(data => {
          if(data.length){this.monthResume = data;}
          if(!this.ReadyMonths){              
            this.ReadyMonths = true;
            if (this.platform.is('cordova')){
              this.check().then(health => {
                if(this.logactive) console.log(health);
                this.SavePermission(health);
                if (!health) { console.log("No hay permisos"); this.HealthReady = true; resolve("no_permision");}
                else{let that = this; setTimeout(()=>{that.checkLastMonth(user).then(LastMonth=>{
                  if(this.logactive) console.log("DONE INIT")
                  resolve(LastMonth)
                })},2000);} //Inicia funcion en cordova si hay permisos
              }).catch(error => {this.alerts.presentToast(error);resolve("no_permision")})
            }else{let that = this;this.PERMISIONS=true; setTimeout(()=>{that.checkLastMonth(user).then(LastMonth=>{
              if(this.logactive) console.log("DONE INIT")
              resolve(LastMonth)
            })},2000);}  //Inicia funcion en browser
          }else{
            resolve("loaded");  //Devuelve observable de meses
          }
        })   
      }else{
        resolve("loaded");  //Devuelve observable de meses
      }
    })
  }

  //Verifica si se han guardado datos de mes pasado, si no, guarda los datos del mes pasado.
  checkLastMonth(user){ 
    return new Promise((resolve)=>{
      if(this.logactive) console.log("checkLastMonth")   
      if(!this.saveCheck){
        this.saveCheck = true
        let lastMonth = moment().subtract(1, 'months'); let month = lastMonth.format('MM'); let year = lastMonth.format('YYYY');  
        let fecha = moment(lastMonth).startOf('month').toDate();
        this.checkIfMonthData(month,year).then(check =>{
          ////console.log("crear?:"+month+"-"+year+"="+check)
          let that = this;
          if(check){      
          //this.alerts.showLoading("Verificando pasos de "+this.monthLabeltranslator(month)+"...")    
            this.saveMonthData(user,fecha).then(lastMonth =>{
              //this.alerts.dismissLoading()  
              //this.alerts.showToast("Datos del mes de "+this.monthLabeltranslator(month)+" guardados","bottom","OK",3000);
              setTimeout(()=>{that.saveToday(user).then(today=>{
                resolve(today)
              })},1000);            
            }).catch(error => {
              //console.log(error);
              resolve(error)
              this.alerts.dismissLoading()    
            })
          }else{
            let endMonthDate = moment(lastMonth).endOf("month").toDate();
            setTimeout(()=>{
              for(let x of that.monthResume){
                if((x.month == month && x.year == year)||(x.month == parseInt(month) && x.year == parseInt(year))){
                  ////console.log("Actualizar?:"+month+"-"+year+"="+(!x.last_update || (moment(x.last_update).toDate() < endMonthDate)))
                  if(!x.last_update || (moment(x.last_update).toDate() < endMonthDate)){
                    //that.alerts.showLoading("Verificando pasos de "+that.monthLabeltranslator(month)+"...") 
                    that.saveMonthData(user,fecha,x.uid).then(lastMonth =>{
                      //that.alerts.dismissLoading()  
                      //this.alerts.showToast("Datos del mes de "+this.monthLabeltranslator(month)+" guardados","bottom","OK",3000);
                      setTimeout(()=>{that.saveToday(user)},1000);            
                    }).catch(error => {
                      resolve(error)
                      //console.log(error);
                      //that.alerts.dismissLoading()    
                    })
                    break;
                  }
                }
              }
              that.alerts.dismissLoading() 
            },400);   
            setTimeout(()=>{
              that.saveToday(user).then(today=>{
                resolve(today)
              })},1000);              
          }
        })
      }else{
        this.saveToday(user).then(today=>{
          resolve(today)
        })
      }
    })
  }

  //Verifica si se han guardado datos de mes actual a la fecha de hoy, si no, guarda los datos del mes actual.
  async saveToday(user){
    return new Promise((resolve)=>{
      if(this.logactive) console.log("saveToday")
      if(!this.todayCheck){
        //console.log("!todayCheck")
        this.todayCheck = true;  let fecha = moment().startOf('month').toDate();
        this.checkIfMonthData(this.todayMonth,this.todayYear).then(check =>{
          if(this.logactive) console.log("checkIfMonthData "+check);
          //console.log("crear?:"+this.todayMonth+"-"+this.todayYear+"="+check);
          this.checkStepsGoal(this.user).then(()=>{
            if(this.logactive) console.log("checkStepsGoal ");
            if(check){
              //console.log("checkStepsGoal"+check)  
              //this.alerts.showLoading("Verificando pasos de "+this.monthLabeltranslator(this.todayMonth)+"...");
              this.saveMonthData(user,fecha).then(lastMonth =>{
                //console.log(lastMonth)
                //this.alerts.dismissLoading()  
                //this.alerts.showToast("Datos del mes de "+this.monthLabeltranslator(this.todayMonth)+" guardados","bottom","OK",6000)
                this.calculateWeekSteps().then(Week=>{
                  resolve(Week)
                });
              }).catch(error => { 
                //console.log(error)
                this.calculateWeekSteps().then(Week=>{
                  resolve(Week)
                });   
              })
            }else{ 
              if(this.logactive) console.log("!check"+check)  
              this.getActualMonth().then(actualMonth=>{
                if(this.logactive) console.log("mes actual?: "+actualMonth.uid);
                if(actualMonth.uid!="NO"){
                  //console.log("actualMonth"+actualMonth.uid) 
                  let card_update = moment(actualMonth.last_update).set({ hour: 1, minute: 0, second: 0 }).toDate();
                  ////console.log("Actualizar?:"+this.todayMonth+"-"+this.todayYear+"="+(card_update < this.todayDate));
                  if(card_update < this.todayDate){
                    //console.log("card_update<todayDate"+card_update) 
                    //this.alerts.showLoading("Verificando pasos de "+this.monthLabeltranslator(this.todayMonth)+"...");
                    this.saveMonthData(user,fecha,actualMonth.uid).then(actual =>{
                      //this.alerts.presentToast("Pasos de "+this.monthLabeltranslator(this.todayMonth)+" actualizados");
                      this.calculateWeekSteps().then(Week=>{
                        resolve(Week)
                      });   ;
                      //this.alerts.dismissLoading()  
                    }).catch(error => {console.log(error);resolve(error);})
                  }else{
                    //console.log("card_update>todayDate"+card_update) 
                    this.calculateWeekSteps().then(Week=>{
                      resolve(Week)
                    });   ; 
                  }
                }else{
                  //console.log("!actualMonth"+actualMonth.uid) 
                  this.todayCheck = false;
                  this.calculateWeekSteps().then(Week=>{
                    resolve(Week)
                  }); 
                } 
              })
            }
          })
        })
      }
    })
  }

  //////////////////////////////////// CALCULADOR DE PASOS DIARIOS Y SEMANALES ///////////////////////////////
  //Calcula los datos de la semana y separa los datos de hoy y el resto de dias;  
  doneMonthCheck= false;
  async calculateWeekSteps(){  
    return new Promise((resolve)=>{   
      this.HealthReady = true;
      if(this.logactive) console.log("calculateWeekSteps")
      let today = this.todayDate.getDay(); let auxDays = [    ];
      if(today == 0){today = 6}else{today = today -1}
      try {
        if (this.platform.is('cordova')){
          let SW = new Date(this.startWeek);
          this.get_steps_by_date(SW,new Date(this.endWeek)).then(alldays=>{
            auxDays = alldays;
            let week = 0;
            for(let i=0;i<today;i++){
              week = week + auxDays[i]
            }
            this.steps_today = auxDays[today];
            this.steps_week = week;
            ////console.log("steps_today: "+this.steps_today+", steps_week: "+(this.steps_week+this.steps_today))
            this.doneMonthCheck= true;
            this.CheckBackupData().then(()=>{
              this.save_actual_steps().then(today_steps=>{
                resolve("done")
              }).catch(err=>{resolve("error")});
            })
          }).catch(err=>{resolve("error")}); 
        }else{
          let day = this.todayDate.getDay()?this.todayDate.getDay():7
          for(let i=0;i<day;i++){
            auxDays.push(Math.floor(Math.random() * 10000))
          }
          let week = 0;
          for(let i=0;i<today;i++){
            week = week + auxDays[i]
          }
          this.steps_today = auxDays[today];
          this.steps_week = week;
          ////console.log("steps_today: "+this.steps_today+", steps_week: "+(this.steps_week+this.steps_today))
          this.doneMonthCheck= true; 
          this.CheckBackupData().then(()=>{
            this.save_actual_steps().then(today_steps=>{
              resolve("done")  
            }).catch(err=>{resolve("error")});
          })
        }
      } catch (error) {
        this.alerts.presentToast(error)
        resolve("error");
      }
      ////console.log("steps_week: "+JSON.stringify(auxDays))
    })   
  }

  //Solicita y actualiza los pasos del dia actual y calcula tambien los pasos de la semana
  async save_actual_steps() {
    if(this.logactive) console.log('save_actual_steps')
    if(this.doneMonthCheck) {
      let stepsToday = 0; 
      this.update_time = moment().format("L");
      stepsToday = await this.SaveWeekData();
      if(this.logactive) console.log("actual: "+stepsToday)
      return stepsToday;
    }
  }

  //Guarda los datos en Usercard
  private async SaveWeekData(){
      if(!this.user) await this.userProvider.static_user();
      let stepsToday = await this.loadTodaySteps();
      let answer = await this.checkLocalData();
      if(answer == "update"){
        this.checkStepsGoal(this.user).then(()=>{
          this.calculateWeekSteps();
        })
      }else{
      if(stepsToday != "no_permision"){
        if(this.user&&this.auth.AppIsOnline()){
          let healthToday = {
            uid:this.user.uid, 
            steps_goal:this.user.steps_goal?this.user.steps_goal:8000, 
            steps_today:stepsToday, 
            steps_week:(this.steps_week+stepsToday),
            update_date:this.update_time
          }
          this.userCardProvider.updateUserCard(healthToday);
          //console.log("Saved: ",healthToday)
          return stepsToday
        }else{
          //console.log("NoConnection||Steps: "+stepsToday)
          return stepsToday
        }
      }else{
        //console.log("no_permision")
        return 0;
      }
    }
  }

  //Captura los pasos del dia actual
  private async loadTodaySteps(): Promise<any>{
    return new Promise(resolve => {
      if(this.platform.is("android")){
        this.get_steps_by_day/*.get_querysteps_by_day*/(moment().toDate()).then(valor => {
          //console.log("loadTodaySteps: "+valor)
          resolve(valor)
          //this.CheckTodayStepData(valor).then(steps => {;})    
        },error=>{
          //console.log("no_permisos",error)
          resolve("no_permision")
        }).catch(error => {
          //console.log("no_permisos",error)
          resolve("no_permision")
        });
      }else{
        this.get_steps_by_day(moment().toDate()).then(valor => {
          //console.log("loadTodaySteps: "+valor)
          resolve(valor)
          //this.CheckTodayStepData(valor).then(steps => {;})    
        },error=>{
          //console.log("no_permisos",error)
          resolve("no_permision")
        }).catch(error => {
          //console.log("no_permisos",error)
          resolve("no_permision")
        });
      }
    })
  }

  //VERIFICACION DE FECHA ACTUALIZACIÓN DIARIA ///////CON FECHA DE INICIO SEMANA
  async checkStepsGoal(user,first?){
    return new Promise(resolve => { 
      if(this.logactive) console.log("checkStepsGoal")
      if(!first) first = false;
      //console.log(user)
      if(!user.steps_goal){
        if(this.logactive) console.log("First_time?"+first)
        //console.log("no_steps_goal")
        if(first){
          this.saveStepsGoal(5000).then(()=>{
            //console.log("noStepsGoal8000")
            resolve();
          }).catch(err=>{resolve("error")})
        }else{
          resolve();
        }
      }else{
        if(this.auth.AppIsOnline()){
          this.fireDB.database.ref(USER_CARD_NODE).child(user.uid).once("value",data => {
            let card=data.val(); 
            let prevDate = moment(card['update_date']).set({ hour: 1, minute: 0, second: 0 }).toDate(); 
            let startWeek = moment(/*this.startWeek*/this.update_time).set({ hour: 0, minute: 0, second: 0 }).toDate();
            if(card['update_date']){
              //console.log("card_date:"+prevDate+" < startWeek:"+startWeek+" = "+(prevDate < startWeek)) 
              let goal = 4500;
              if(this.user&&this.user.steps_goal) goal=this.user.steps_goal;
              if(prevDate < startWeek&&10000!=goal){
                this.CalculateStepGoal(goal).then(goal => {
                  //console.log(goal)
                  if(goal != "done"){
                    this.saveStepsGoal(goal).then(()=>{
                      resolve();
                    })
                  }else{
                    resolve();
                  }          
                })
              } else{
                resolve();
              }
            }else{      
              ////console.log("No timestamp")
              this.saveStepsGoal(5000).then(()=>{
                resolve();
              })
            }
          })          
        }else{
          this.todayCheck = false;
          resolve();
        }
      }
    })
  }

  //Calculo de nueva meta de pasos
  CalculateStepGoal(goal): Promise<any> {
    return new Promise(resolve => { 
      let SW = moment(this.update_time).subtract(1,'days').toDate();
      this.get_steps_by_day(SW).then(auxDays=>{
        //console.log("yesterday_steps: "+auxDays)
        if(auxDays==0){
          //console.log("step 0")
          resolve(5000);
        }else{
          let newGoal = auxDays+500;
          if(newGoal>10000)newGoal = 10000;
          if(5000>newGoal)newGoal = 5000;
          //console.log(newGoal)
          resolve(newGoal);
        }
      }).catch(err=>{resolve(5000)})
      /*let startLastWeek = moment(this.startWeek).subtract(7, 'days').toDate();
      let endLastWeek = moment(startLastWeek).add(6, 'days').toDate();
      ////console.log(startLastWeek+" / "+endLastWeek)
      try {
        if (this.platform.is('cordova')){
          let SW = new Date(startLastWeek);
          this.get_steps_by_date(SW,new Date(endLastWeek)).then(auxDays=>{
            let week = 0; //console.log("stepsLastWeek: "+JSON.stringify(auxDays))
            for(let i=0;i<auxDays.length;i++){
              week = week + auxDays[i]
            }
            if(week==0){
              resolve(8000);
            }else{
              let newGoal = Math.round(week/auxDays.length);
              newGoal = Math.round(newGoal*1.2);
              //console.log("pasosSemana/dias - "+week+"/"+auxDays.length+" = nueva_meta: "+newGoal)
              resolve(newGoal);
            }
          })
        }else{
          let week = 0;
          for(let i=0;i<7;i++){
            week = week + Math.floor(Math.random() * 10000);
          }
          let newGoal = Math.round(week/7);
          newGoal = Math.round(newGoal+(newGoal*0.2));
          //console.log("pasosSemana/dias - "+week+"/"+7+" = nueva_meta: "+newGoal)
          resolve(newGoal);
        }
      } catch (error) {
        this.alerts.presentToast(error)
        //console.log("error: "+error)
        resolve("done");
      }*/
    })
  }

  //Update de Meta de pasos
  async saveStepsGoal(goal){
    let user = await this.userProvider.static_user();
    let userUpdate: User ={      
      company: user.company,
      name: user.name,
      last_name:user.last_name,
      //points: user.points, No se puede actualizar puntos desde el app
      uid: user.uid,
      steps_goal: goal
    }
    let goalToday = {
      uid:user.uid, 
      steps_goal:goal, 
      startWeek:moment(this.startWeek).format("L"),
    }
    //console.log(userUpdate,goalToday)
    await this.userProvider.updateUser(userUpdate).catch(err=>{return ;})
    this.userCardProvider.updateUserCard(goalToday).catch(err=>{return ;})
    let that = this;
    setTimeout(()=>{
      that.alerts.ShowInfoAlert("Nueva meta de pasos","Se te ha asignado una nueva meta de pasos de "+goal);
    },2500)
    return ;
  }

  async saveSevenDaysProm(){    
    return new Promise((resolve)=>{
      //console.log("saveSevenDaysProm start")
      if(this.PERMISIONS){
        let user = this.userProvider.static_user()  
        let old_steps = 0; let prom = 0; 
        let start_seven = new Date(moment().subtract(8,'days').format('L'));
        let end_seven = new Date(moment().subtract(1,'days').format('L'));
        //console.log("saveSevenDaysProm start_seven: "+start_seven + "end_seven: "+end_seven)
        this.get_steps_by_date(start_seven,end_seven).then(last_seven => {
          for(let day of last_seven){prom += day;}
          let lastMonday = moment(this.startWeek).subtract(7, 'days').toDate(); let lastSunday = moment(this.startWeek).subtract(1,'day').toDate();
          //console.log("saveSevenDaysProm lastMonday: "+lastMonday," lastSunday: "+lastSunday)
          this.get_steps_by_date(new Date(lastMonday),new Date(lastSunday)).then(old_week => {
            for(let old_day of old_week){old_steps += old_day;}
            if(prom != 0){prom = Math.round(prom/last_seven.length)} ;
            let userUpdate: User ={ company: user.company, name: user.name,
              last_name:user.last_name,
              //points:user.points,  points no se puede actualizar desde la APP
              uid: user.uid,
              seven_days: prom,
              old_week: old_steps,
            }
            let goalToday = {uid:user.uid, seven_days: userUpdate.seven_days, old_week: userUpdate.old_week, }
            this.userProvider.updateUser(userUpdate)
            this.userCardProvider.updateUserCard(goalToday)
            //console.log("saveSevenDaysProm 7 days prom: "+JSON.stringify(goalToday))
            //alert(JSON.stringify(goalToday))
            resolve("Done");
          }).catch(err=>{this.error.setError(ERROR_COMPONENT,"ER","2",err.toString(),"Error al obtener la semana pasada."); console.log("Error old_week"+err);resolve("Error old_week") ;})
        }).catch(err=>{this.error.setError(ERROR_COMPONENT,"ER","1",err.toString(),"Error al obtener los siete días."); console.log("Error seven_days"+err);resolve("Error seven_days") ;})       
      }else{
        //console.log("No_permisson")
        resolve("No_permisson") 
      }
    })
  }

  async startChallengeProcess(){
    if(this.PERMISIONS){ 
      this.challengeProvider.checkChallenge().then(reto=>{
        if(reto && reto.myTeam && moment(reto.fecha_fin).toDate() > moment().toDate() && moment().toDate() > moment(reto.fecha_inicio).toDate()){ this.uploadChallengeSteps(reto).then(()=>{return "Done";}) }
        else{console.log("No challenge_team || outofDate");return "No challenge_team || outofDate";}
      }).catch(err=>{this.error.setError(ERROR_COMPONENT,"ER","3",err.toString(),"Error al obtener datos reto."); console.log("Error challenge_team"+err);return "Error al obtener datos reto.";})
    }else{console.log("No_permisson");return "No_permisson";} 
  }

  async uploadChallengeSteps(reto){
    this.get_steps_by_date(reto.fecha_inicio,reto.fecha_fin).then(step_array=>{
      let sum = 0; for(let step of step_array){sum+=step;};
      this.challengeProvider.updateChallegeSteps(this.user.company.uid,reto,this.user.uid,sum,moment().toDate())
      .then(answer=>{
        //console.log("answer: "+answer)
        let goalToday = {uid:this.user.uid, reto:{update:answer, reto_steps:sum}}
        this.userCardProvider.updateUserCard(goalToday).then(ans=>{
          //console.log("goalToday"+JSON.stringify(goalToday));
          return ;
        })
      })
    })
  }

  checkHealthState(){
    return this.HealthReady;
  }

  getTodayDate(){
    return this.update_time;
  }

  async getRawTodaySteps(){
    return await this.loadTodaySteps()
  }

  getHeartRate():any{
    return new Promise((resolve,reject)=>{
      this.get_heart_rate_by_day(moment().toDate()).then(heart=>{
        if(heart[0]){this.processActivities(heart).then(fit_data=>{resolve([fit_data,heart[0]['value']]);})}
        else{resolve({activity_number:0,duration:0,distance:0,calories:0,intensity:0,points:0})}        
      }).catch(error=>{
        this.alerts.presentToast(error);
        reject();
      })
    });
  }

  processActivities(actis){ 
    return new Promise((resolve)=>{
      let activities =actis[0]['value'];
      let keys = Object.keys(actis[0]['value']);
      let act_time = 0; let distance = 0; let cals=0; let count = 0;let intensity = 0;
      for(let key of keys){
        if(activities[key].distance&&activities[key].duration&&key!="still"){
          act_time+=activities[key].duration;
          distance+=activities[key].distance;
          cals+=activities[key].calories;
          count++;
        }
      }      
      if(act_time!=0) intensity = Math.round(cals/act_time);
      act_time = Math.round(act_time/36000); Math.round(cals/act_time); let points = Math.round((Math.round(distance/1000)*intensity*1.4));
      distance = Math.round(distance); cals = Math.round(cals);
      //alert(JSON.stringify({activity_number:count,duration:act_time,distance:distance,calories:cals,intensity:intensity,points:points}))
      resolve({activity_number:count,duration:act_time,distance:distance,calories:cals,intensity:intensity,points:points}); 
    })
  } //dur 76 cals 328 distance 3689.17

  async msToHMS( ms ) {
    // 1- Convert to seconds:
    let seconds = ms / 1000;
    // 2- Extract hours:
    let hours = Math.round( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds-(hours*3600); // seconds remaining after extracting hours
    // 3- Extract minutes:
    let minutes = Math.round( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds-(minutes*60);
    let time_duration = hours+":"+minutes+":"+seconds;
    return time_duration;
}

}