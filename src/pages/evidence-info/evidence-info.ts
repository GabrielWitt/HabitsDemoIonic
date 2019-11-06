import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading , AlertController,} from 'ionic-angular';
import { User } from '../../interfaces/User';
import { Chart } from 'chart.js';
import { DietProvider } from '../../providers/diet/diet';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import * as moment from 'moment'

export interface DataItem {percent: string, timestamp: Date};
@IonicPage()
@Component({
  selector: 'page-evidence-info',
  templateUrl: 'evidence-info.html',
})
export class EvidenceInfoPage {
  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild('AdvancelineCanvas') AdvancelineCanvas;
  lineChart: any;
  AdvancelineChart: any;
  user: User;  
  weekEvidence: any[]=[];
  start: true;
  loaderUser: Loading;
  isOnline = true;
  lineDietLabels: Array<any>;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private dietprovider: DietProvider,
    private alertCtrl: AlertController,
    private analytics:AnalyticsProvider
  ) {
    this.user = this.navParams.get("user")
    this.loaderUser = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Cargando...'
    });
    this.loaderUser.present();    
  }

  ionViewWillEnter(){}

  ionViewDidEnter(){
		this.analytics.saveScreen("Evidence-Info");
	}
  async ionViewDidLoad() {
    await this.loadWeightChart()
    this.loaderUser.dismiss();
  }

  loadWeightChart(){    
    let weigth = this.navParams.get("weigth");
    console.log(weigth,  this.navParams.get("weigth"));
    // __________________PESO____________________ //
    this.lineChart = new Chart(this.lineCanvas.nativeElement, { 
      type: 'line',
      data: {
          labels: this.dateArray(weigth[1]),
          datasets: [
              {
                  label: 'PESO CORPORAL',
                  fill: false,
                  lineTension: 0.1,
                  backgroundColor: "transparent",//'#f0eff5',
                  borderColor: '#3295EA',//'#36b8ea',
                  borderCapStyle: 'butt',
                  borderDash: [],
                  borderDashOffset: 0.0,
                  borderJoinStyle: 'miter',
                  pointBorderColor: '#3295EA',
                  pointBackgroundColor: "transparent",
                  pointBorderWidth: 4,
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: '#1895fd',
                  pointHoverBorderWidth: 2,
                  pointRadius: 2,
                  pointHitRadius: 10,
                  data: weigth[0],
                  spanGaps: false,
              }
          ]
        }
    });
    //this.loadAdvanceCard()
  }

  loadAdvanceCard(){    
    let data = this.navParams.get("diet")
    //console.log(data)
    let diet = data[1].diet;
    let movement = data[0].movement;
    this.lineDietLabels = this.dateArray(diet[1])
    if(diet[1].length < movement[1].length) this.lineDietLabels = this.dateArray(movement[1])
    // __________________PESO____________________ //
    this.AdvancelineChart = new Chart(this.AdvancelineCanvas.nativeElement, { 
      type: 'line',
      data: {
          labels: this.lineDietLabels,
          datasets: [
              {
                  label: "ALIMENTACIÓN",
                  data: diet[0],
                  fill: false,
                  lineTension: 0.1,
                  borderCapStyle: 'butt',
                  borderDash: [],
                  borderDashOffset: 0.0,
                  borderJoinStyle: 'miter',
                  pointBorderWidth: 4,
                  pointHoverRadius: 5,
                  pointHoverBorderWidth: 2,
                  pointRadius: 2,
                  pointHitRadius: 10,
                  spanGaps: false,
                  backgroundColor: "transparent",//'#f0eff5',
                  borderColor: '#3C4B8E',//'#36b8ea',
                  pointBackgroundColor: "#3C4B8E",
                  pointBorderColor: '#3C4B8E',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: '#3C4B8E'
              },
              {
                  label: "EJERCICIO",
                  data: movement[0],
                  fill: false,
                  lineTension: 0.1,
                  borderCapStyle: 'butt',
                  borderDash: [],
                  borderDashOffset: 0.0,
                  borderJoinStyle: 'miter',
                  pointBorderWidth: 4,
                  pointHoverRadius: 5,
                  pointHoverBorderWidth: 2,
                  pointRadius: 2,
                  pointHitRadius: 10,
                  spanGaps: false,
                  backgroundColor: "transparent",//'#f0eff5',
                  borderColor: '#6D181D',//'#36b8ea',
                  pointBackgroundColor: "#6D181D",
                  pointBorderColor: '#6D181D',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: '#6D181D'
              },
          ]
        }
    });
  }


  chartClicked(){
    console.log("click")
  }

  dateArray(dateArray:string[]){
    let newDateArray = []
    for(var i = 0;i<dateArray.length;i++){
      newDateArray.push(this.fixDate(dateArray[i]))
    }
    return newDateArray;
  }

  fixDate(date) {
    let shortDate = date.split("-");
    switch (shortDate[1]) {
      case "01":
        shortDate[1] = "Ene";
        break;
      case "02":
        shortDate[1] = "Feb";
        break;
      case "03":
        shortDate[1] = "Mar";
        break;
      case "04":
        shortDate[1] = "Abr";
        break;
      case "05":
        shortDate[1] = "May";
        break;
      case "06":
        shortDate[1] = "Jun";
        break;
      case "07":
        shortDate[1] = "Jul";
        break;
      case "08":
        shortDate[1] = "Ago";
        break;
      case "09":
        shortDate[1] = "Sep";
        break;
      case "10":
        shortDate[1] = "Oct";
        break;
      case "11":
        shortDate[1] = "Nov";
        break;
      case "12":
        shortDate[1] = "Dic";
        break;
      default:
        break;
    }
    let newDateForm = shortDate[1] + "/" + shortDate[2]
    return newDateForm;
  }
  
   //Peso
  WeightRecord() {
    let registerMovement = this.alertCtrl.create({
      title: "Registra tu peso",
      inputs: [{ name: "kilos", placeholder: "Ingrese en kilos (ejem. 70.85)" },],
      buttons: [
        {
          text: "Listo",
          handler: (data) => {
            let aux: DataItem = {
              percent: ""+parseFloat(data['kilos']),
              timestamp: new Date()
            }
			if (parseFloat(data['kilos']) > 0){
				let that = this;
				this.dietprovider.save_weight_item(aux).then(() => {
					that.dietprovider.get_weight_advance(this.user.uid).then(weightData => {  
					  let WeightEvidence =[]; let WeightDate =[];
					  weightData.forEach(function(weightArray){
						weightArray.forEach(function(weight){
						  let date = moment(weight.timestamp).format('YYYY-MM-DD')
						  WeightDate.push(date);
						  WeightEvidence.push(weight['percent']);
						})
					  })
					   
					  that.loadWeightChart();
					  return ;
					})
				})
			}
          }
        }
      ]
    })
    registerMovement.present();
  }

}
