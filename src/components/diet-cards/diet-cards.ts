import { Component, Input, AfterContentInit, OnChanges } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { DietProvider } from '../../providers/diet/diet';
import { UserProvider } from '../../providers/user/user';
import { loadingProvider } from '../../providers/alert/alert';
import * as moment from 'moment';
import { PushNotificationProvider } from '../../providers/push-notification/push-notification';

@Component({
  selector: 'diet-cards',
  templateUrl: 'diet-cards.html'
})
export class DietCardsComponent implements AfterContentInit, OnChanges  {
  @Input("user") user: any;
  showDiet = false;
  WeigthData: any[] = [];
  DietData: any[] = [];
  dietDocs: any;
  products: any = [];
  rules: any = [];
  types: any = [];
  weekDiet:any=[];
  readyData=false;

  constructor(
    public navCtrl: NavController,
    public toast: ToastController,
    public diet: DietProvider,
    private alerts:loadingProvider,
    private userProvider: UserProvider,
    private localNotification: PushNotificationProvider
  ) {
  }
  
  ngOnChanges(): void {
    if(this.user && this.user.company && this.userProvider.CheckMedVersion(this.user.company.key)){
      this.diet.loadPortions(this.user.company.uid);
      this.showDiet = true;
      this.loadDietData();
      this.weigthData();
      this.movement_data();
    }
  }

  async weigthData() {
    await this.diet.get_weight_advance(this.user.uid).then(weightData => {  
      let WeightEvidence =[]; let WeightDate =[];
      weightData.forEach(function(weightArray){
        weightArray.forEach(function(weight){
          let date = moment(weight.timestamp).format('YYYY-MM-DD')
          WeightDate.push(date);
          WeightEvidence.push(weight['percent']);
        })
      })
      this.WeigthData = [WeightEvidence,WeightDate];
      return ;
    })
  }

  async movement_data(){    
    let MovementEvidence =[]; let MovementDate =[];
    let DietEvidence =[]; let DietDate =[];
    await this.diet.get_movement(this.user.uid).then(movData => {
      this.diet.get_diet(this.user.uid).then(dietData=>{
        movData.forEach(function(movArray){ 
          movArray.forEach(function(mov){  
            let date = mov['timestamp']
            MovementDate.push(date[0]);
            MovementEvidence.push(mov['percent']);
          })
        })
        dietData.forEach(function(diet_){
          diet_.forEach(function(diet){  
            let date = moment(diet.timestamp).format('YYYY-MM-DD')
            DietDate.push(date);
            DietEvidence.push(diet['percent']);
          })
        })
        return;
      })
      return;
    })
    this.DietData = [{movement:[MovementEvidence,MovementDate]},{diet:[DietEvidence,DietDate]}];
    return ;
  }

  dietReminders: any = {}; 
  async loadDietData(){
    if(this.user.diet){ 
      await this.diet.getTypes().then(types => {this.types = types;/*console.log("types:"+this.types.length);*/});    
      await this.diet.loadProducts().then(products => {this.products = products;/*console.log("products:"+this.products.length);*/});
      await this.diet.getRules().then(rules => {this.rules = rules;/*console.log("rules:"+this.rules.length);*/});
      let data = await this.localNotification.getAllIds(); let check = 0;
      for(let id of data){if(id>50||85>id)check++;}
      this.diet.load_Diets(this.user.diet).then(data=>{
        this.dietDocs = data; let that = this;
        this.diet.get_diet_reminders(this.user.uid).then(reminder=>{ 
          that.readyData = true; //console.log(reminder);  
          if(reminder&&reminder['diet']){ 
            that.dietReminders = reminder;
            if(reminder['reminder_update'])that.dietReminders.reminder_update=reminder['reminder_update'].toDate();
            if(reminder['update'])that.dietReminders.update=reminder['update'].toDate();
            if(reminder['active']&&(moment(reminder['update'])>moment(reminder['reminder_update']))){ 
              let message="¿Desea actualizar sus alertas con la nueva dieta seleccionada?";
              if(this.dietReminders['active']&&check==0)message="Sus alarmas están desactivadas. ¿Desea activarlas?";
              that.alerts.showConfirm("Alertas de Dieta",message).then(answer=>{
                if(answer!="already_show"){
                  if(answer){
                    that.readyData = true;
                    that.navCtrl.push("DietPage",{
                      user:that.user, dietData:that.dietDocs, dietReminders:that.dietReminders,
                      products:that.products,types:that.types,weekDiet:that.weekDiet,rules:that.rules
                    })
                    that.alerts.showToast("Presione el bóton alertas en la parte superior. Baje hasta el botón guardar y presionelo para actualizar.",'bottom',"Ok",undefined);
                  }else{
                    that.diet.disable_reminder_update(that.user.uid);
                    that.localNotification.cancelDietLocalNotification();
                    that.alerts.showToast("Se han deshabilitado las alarmas, para reactivarlas ingrese en Mi dieta y configurelas en Alarmas.",'bottom',"Ok",undefined);
                  }
                }
              })
            }
            that.dietReminders.empty=false;
          }else{that.dietReminders["empty"]=true;}
        })
      })
    }
  }

  ngAfterContentInit(): void {

  }

  checkCode(code){
	if(this.user.company.key.substring(0,3) == code){
		return true
	  }  else {
		return false
	  }
  }

  openPage(page) {
      if (page == 'stats') {
        this.movement_data().then(()=>{
          this.weigthData().then(()=>{
            //console.log(this.WeigthData, this.DietData)
            setTimeout(()=>{
              if (this.WeigthData.length || this.DietData[0].length || this.DietData[1].length) {
                this.navCtrl.push("EvidenceInfoPage", {user:this.user, weigth: this.WeigthData, diet: this.DietData });
              } else {
                this.showToast('No hay información disponible aun...', 'top', false, 3000);
              }
            },1000)
          });
        });
      } else if (page == 'diet') {
        if(this.readyData){
          this.navCtrl.push("DietPage",{
            user:this.user, dietData:this.dietDocs, dietReminders:this.dietReminders,
            products:this.products,types:this.types,weekDiet:this.weekDiet,rules:this.rules
          });}else{this.alerts.presentToast("Intente nuevamente...")}
      } else if (page == 'reto') {
        this.navCtrl.push("RetoPasosPage");
      } else if (page == 'progress') {
        this.navCtrl.push("MiprogresoPage");
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
  
  openAlarm(type: string, name: string) {
    this.navCtrl.push('AlarmSetupPage', {
      alarmType: type,
      alarmName: name,
      chatAlarm: false,
      userUID: this.user.uid
    });
  }

  async loadPortions(){
    /*this.diet.loadUserPortions(this.user.uid).then(()=>{
      this.diet.getUserDiet().then(observable=>{
        observable.forEach(data=>{
          let auxweek =[];
          //console.log("readydiet"); 
          this.readydiet = true; 
          if(data){
            auxweek.push(data.sunday);
            auxweek.push(data.monday);
            auxweek.push(data.tuesday);
            auxweek.push(data.wednesday);
            auxweek.push(data.thursday);
            auxweek.push(data.friday);
            auxweek.push(data.saturday);
            //console.log(auxweek); 
            this.weekDiet = auxweek;
            this.checkDiet = true;
          }
        })
      })
    })*/
  }

}
