import { IonicPage, NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { HealthProvider } from '../../providers/health/health';
import { loadingProvider } from '../../providers/alert/alert';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { SettingsProvider } from '../../providers/settings/settings';
import { ErrorProvider } from '../../providers/error/error';
import { User } from '../../interfaces/User';
import { Step } from '../../interfaces/step';
import * as moment from 'moment';
import { Chart } from 'chart.js';

@IonicPage()
@Component({
  selector: 'page-health',
  templateUrl: 'health-steps.html',
})
export class HealthStepsPage {
  @ViewChild('barCanvas') barCanvas;
  @ViewChild('doughnutCanvas') doughnutCanvas;
  //@ViewChild('resumeCanvas') resumeCanvas;
  user: User;
  barChart: any; 
  steps_today = 0;
  today = new Date();
  todayYear = new Date().getFullYear();
  selectedMonth: Step = {
    month: 0,
    year: 0,
    user: "",
    company: "",
    month_steps: [],
    weeks: [],
    weekdays: [],
    total_steps: 0,
    last_update: "",
    steps_day: 0
  };
  monthResume: Step[];
  MonthsData: Step[]=[];
  indexMonth = 0;
  stepsAverage: number;
  label:any;
  steps: Array<number>;
  startWeek: Date;
  endWeek: Date;
  public activities={activity_number:0,duration:0,distance:0,calories:0,intensity:0,points:0};
  public raw_data = "";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public healthProvider: HealthProvider,
    public loadingCtrl: LoadingController,
    private platform: Platform,
    private alerts: loadingProvider,
	  private analytics:AnalyticsProvider,
    private language: SettingsProvider,
    private error: ErrorProvider
  ) {
    this.label = this.language.getLanguage('HealthStepsPage');
    this.user = this.navParams.get("user");
    this.monthResume = this.navParams.get("monthResume");
    this.alerts.showLoading("Cargando datos de salud...");
  }

  //Este carga despues de que el html esta listo, y se encarga de verificar si existen los permisos de Salud en el dispositivo (permite pasar en modo browser)
  ionViewCanEnter() {
    return new Promise(resolve => {  
      if (this.platform.is('cordova')){
      this.healthProvider.checkPermissionHealth().then(check=>{
        if(check == true){
          this.alerts.dismissLoading();
          this.InitHealth() 
          this.analytics.saveScreen("Módulo Salud")
          resolve(true);         
        }else{
          this.alerts.dismissLoading();
          this.navCtrl.pop()
          resolve(false);   
        }
      })
      }else{ 
        this.alerts.dismissLoading();
        this.InitHealth() 
        resolve(true);   
      }
    })
  }

  //Inicia todo health, llama las funciones que obtienen datos actuales, funciones de dibujo y funciones de comparación de fechas.
  async InitHealth() { 
    this.user = this.navParams.get("user");
    this.monthResume = this.navParams.get("monthResume");    
    this.setMonthDisplay()
    this.steps = [10, 10, 10, 10, 10, 10, 10];
    this.steps_today = 0;
    
    moment.locale("es-us")
    this.stepsAverage = 0;
    this.startWeek = moment().isoWeekday(1).toDate();
    this.endWeek = moment().isoWeekday(7).toDate();
    this.loadGraphs();
    this.mixedResumeChart() 
    this.UpdateData().then(()=>{
      this.getHealthSteps().then(()=>{
      })
    }); 
  }

  //Actualiza los datos de resumen de meses.
  setMonthDisplay(){
    this.MonthsData = []; 
    if(this.monthResume){
      this.MonthsData = this.monthResume;
      this.indexMonth = (this.MonthsData.length-1);
      this.selectedMonth = this.MonthsData[this.indexMonth]; 
      this.changeMonth()
    }
  }

  //Dibuja el grafico de barras verticalespara resumen de semanas y el de donnut para pasos actuales.
  async loadGraphs(){
    this.barCanvas = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
          labels: ['lun', 'mar', 'mié', 'jue', 'vie', 'sab', 'dom'],
          datasets: [{
              label: this.label.daily_steps,
              data: this.steps,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
        }
    });

    this.doughnutCanvas = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
          labels: [this.label.steps_today,this.label.steps_remainig],
          datasets: [{
              data: [this.steps_today,(this.user.steps_goal-this.steps_today)],
              backgroundColor: [
                "#36A2EB",
                "#FF6384",
              ],
              hoverBackgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 99, 132, 0.7)',
              ]
          }]
      }
    });
    return;
  }

  //Dibuja el grafico de barras horizontales para resumen del mes en semanas.
  mixedResumeChart(){
    /*this.resumeCanvas = new Chart(this.resumeCanvas.nativeElement, {
      type: 'horizontalBar',
      data: {
        datasets: [{
              label: 'Promedio de pasos por semana',
              data: [0, 40, 20, 30, 40, 10],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)',
                  'rgba(255, 99, 132, 0.2)',
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                  'rgba(255,99,132,1)',
              ],
              borderWidth: 1,   
            }],
        labels: ["Semana",'1', '2', '3', '4','5']
      }
    });*/
  }

  weeksteps = 0;
  //Actualiza los datos de pasos por dia en gráfico de barras verticales
  setSteps(steps: Array<number>) {
    this.steps = steps;
    this.weeksteps = 0; let day = 7;
    if(this.startWeek >= this.today || this.today <= this.endWeek) day = new Date().getDay()?new Date().getDay():7;
    for(let y of steps){this.weeksteps = this.weeksteps + y}
    this.stepsAverage = Math.round(this.weeksteps/day);
    //console.log(this.weeksteps+"/"+day+"="+this.stepsAverage);
    if(this.steps){
      this.barCanvas.data.datasets[0].data = this.steps;
      this.barCanvas.update();
    }
  }

  //Actualiza los datos de pasos y meta en gráfico de donnut (verde para pasos extra,rojo para pasos faltantes y azul para pasos actuales.)
  setTodaySteps(steps: number){ 
    this.steps_today = steps;
    let auxData = [];
    if(this.steps_today>this.user.steps_goal){
      auxData = [this.user.steps_goal,(this.steps_today-this.user.steps_goal)]//steps[1],(steps[0]-steps[1])
      this.doughnutCanvas.data.labels[1]=this.label.extra_steps;
      this.doughnutCanvas.data.datasets[0].backgroundColor[1] = 'rgba(75, 192, 192, 1)';
      this.doughnutCanvas.data.datasets[0].hoverBackgroundColor[1] = 'rgba(75, 192, 192, 0.7)';
      this.doughnutCanvas.data.datasets[0].data = auxData;
      this.doughnutCanvas.update();
    }else{
      let rest = (this.user.steps_goal-this.steps_today)
      auxData = [this.steps_today,rest]
      this.doughnutCanvas.data.labels[1]=this.label.steps_remainig
      this.doughnutCanvas.data.datasets[0].backgroundColor[1] = 'rgba(255, 99, 132, 1)';
      this.doughnutCanvas.data.datasets[0].hoverBackgroundColor[1] = 'rgba(255, 99, 132, 0.7)';
      this.doughnutCanvas.data.datasets[0].data = auxData;
      this.doughnutCanvas.update();
    }
    //this.alerts.presentToast("Pasos de hoy actualizados");
  }

  //Obtiene los datos de la semana entre startWeek y endWeek
  async getHealthSteps() {
    let auxDays = [    ];
    try {
      if (this.platform.is('cordova')){
        let SW = new Date(this.startWeek);
        auxDays = await this.healthProvider.get_steps_by_date(SW,new Date(this.endWeek));
      }else{
        auxDays = [
          Math.floor(Math.random() * 10000), //0
          Math.floor(Math.random() * 10000), //1 
          Math.floor(Math.random() * 10000), //2 
          Math.floor(Math.random() * 10000), //3 
          Math.floor(Math.random() * 10000), //4 
          Math.floor(Math.random() * 10000), //5
          Math.floor(Math.random() * 10000)  //6
        ]
      }
    } catch (error) {
      this.alerts.presentToast(error)
      return;
    } finally {
      this.setSteps(auxDays);
      return;
    }
  }

  //Aumenta una semana en grafico de barras verticales
  addTime() {
    let startWeek = moment(this.startWeek).add(7, 'days').toDate();
    if(moment().isoWeekday(7).toDate() < startWeek){
      this.alerts.presentToast(this.label.canGoback)
    }else{
      this.startWeek = startWeek;
      this.endWeek = moment(this.startWeek).add(6, 'days').toDate();
      this.getHealthSteps()
    }
  }

  //Disminuye una semana en grafico de barras verticales
  substractTime() {
    this.startWeek = moment(this.startWeek).subtract(7, 'days').toDate();
    this.endWeek = moment(this.startWeek).add(6, 'days').toDate();
    this.getHealthSteps()
  }

  //Actualiza los pasos del día actual en gráfico de donnut.
  async UpdateData() {
    let steps = 0;
    this.alerts.showLoading(this.label.gettingSteps);let that = this; setTimeout(()=>{that.alerts.dismissLoading();},500)
    try{
      if(this.user){
        steps = await this.healthProvider.save_actual_steps();
        if(!steps)steps = 0;
        if(0>steps){this.error.reportManualSteps();steps=0;}else{
          this.healthProvider.getHeartRate().then(activity=>{ 
            this.activities = activity[0];
            this.raw_data = JSON.stringify(activity[1])
          }).catch(error=>{alert(error)}); //PRUEBAS HEART_RATE
        }
      }
    } catch (error) { 
      this.alerts.presentToast(error)
      return;
    } finally {
      steps = await this.getTodaySteps(steps);
      steps = parseInt(""+steps)
      this.setTodaySteps(steps);
      return;
    }
  }

  async getTodaySteps(steps){
    /*let localSteps = parseInt(window.localStorage.getItem("steps_today"));
    if(localSteps && steps < localSteps){
      steps = localSteps;
    }*/
    return steps; 
  }
  
  //Traduce la fecha de numeros a string
  dateTranslation(date) {
    let FullDate = new Date(date)
    let day = ""+FullDate.getDate()
    if(FullDate.getDate()<10) day = "0"+day;
    let month = this.label.monthNames[FullDate.getMonth()]
    let year = FullDate.getFullYear()	
    return day+"-"+month+"-"+year;
  }

  //Traduce el mes de numero a string
  monthLabeltranslator(month){
    let index = parseInt(month)
    return this.label.monthFullNames[index]?this.label.monthFullNames[index-1]:"Cargando..."; 
  }

  //Boton para regresar un mes en resumen del mes.
  prevMonth(){
    this.indexMonth = this.indexMonth-1
    if(this.indexMonth<0){
      this.indexMonth = 0;
      this.alerts.presentToast(this.label.canGoforward)
    }else{
      this.selectedMonth = this.MonthsData[this.indexMonth];
      this.changeMonth()
    }
  }

  //Boton para adelantar un mes en resumen del mes.
  nextMonth(){
    this.indexMonth = this.indexMonth+1;
    if(this.indexMonth>(this.MonthsData.length-1)){
      this.indexMonth = (this.MonthsData.length-1);
      this.alerts.presentToast(this.label.canGoback)
    }else{
      this.selectedMonth = this.MonthsData[this.indexMonth];
      this.changeMonth()
    }
  }

  //Actualiza el gráfico de barras horizontales con datos por semana.
  changeMonth(){
    if(this.selectedMonth){
      let weekLabels = []; let data = []
      for(let i=0;i<this.selectedMonth.weeks.length;i++){
        weekLabels.push("Semana "+(i+1));
        data.push(Math.round(this.selectedMonth.weeks[i]/this.selectedMonth.weekdays[i]))      
      }
    }
    /*this.resumeCanvas.data.labels = weekLabels;
    this.resumeCanvas.data.datasets[0].data = data;
    this.resumeCanvas.update();*/
  }
  
}
