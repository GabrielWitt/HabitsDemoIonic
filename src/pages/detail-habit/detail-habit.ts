import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Chart } from 'chart.js';
import { UserGoal } from '../../interfaces/user-goal';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-detail-habit',
  templateUrl: 'detail-habit.html',
})
export class DetailHabitPage {
  @ViewChild('habitCanvas') habitCanvas;
  userGoal: UserGoal
  goalAdvance: UserGoal[];
  dates: string[];
  data: string[];

  constructor(public navCtrl: NavController, private analytics:AnalyticsProvider, public navParams: NavParams) {
    this.userGoal = this.navParams.get("userGoal");
    this.goalAdvance = this.navParams.get("goalAdvance");
    this.analytics.saveScreen("Detalle de hábito");
    //console.log(this.userGoal)
    this.dates = []; this.data = [];
    for(let day of this.goalAdvance){
      let date = day.timestamp.split("T")[0].split("-")[1]+"/"+day.timestamp.split("T")[0].split("-")[2];
      this.dates.push(date);
      this.data.push(day.percent)
    }
  }

  ionViewDidLoad() {
    if(!this.data){
      this.data = ["0","0","0","0","0"]
      this.dates = ["N/D","N/D","N/D","N/D","N/D"]
    }
    //console.log(this.dates,this.data)
    // __________________Evidencia____________________ //
    this.habitCanvas = new Chart(this.habitCanvas.nativeElement, { 
      type: 'line',
      data: {
          labels: this.dates,
          datasets: [
              {
                  label: 'CUMPLIMIENTO',
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
                  data:  this.data,
                  spanGaps: false,
              }
          ]
        }
    });
  }

}
