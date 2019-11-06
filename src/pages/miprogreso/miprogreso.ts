import { Component, ViewChild} from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { Chart } from 'chart.js';
import { DietProvider } from '../../providers/diet/diet'
import { UserProvider } from '../../providers/user/user'
//import { take, takeLast, last} from 'rxjs/operators';


@IonicPage()
@Component({
  selector: 'page-miprogreso',
  templateUrl: 'miprogreso.html',
})
export class MiprogresoPage {
  
   barChartPeso:any;
   barChartMuscle:any;
   barChartGrasa:any;
   
   A:any;
   B:any;
   C:any;
   D:any;
  
   @ViewChild('barCanvasPeso') barCanvasPeso; 
   @ViewChild('barCanvasGrasa') barCanvasGrasa; 
   @ViewChild('barCanvasMuscle') barCanvasMuscle;
   @ViewChild('barCanvasImc') barCanvasImc;
   
    constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		public dietProv:DietProvider,
		public userProv: UserProvider
	) { }

	act_chart( element, label, labelx, data ){
	
		let DataE1 = [];
		let DataE2 = [];
		let DataE3 = [];
		let DataE4 = [];
		if (label == 'imc'){
			if (labelx.length == 0 && data.length == 0){
				labelx.push('no');
				labelx.push('no');
				data.push(15);
				data.push(15);
				
				
			}
			for (let i =0; i < data.length;i ++){
				DataE1.push(18.5 - 15);
				DataE2.push(25 - 15);
				DataE3.push(29 - 15);
				DataE4.push(36 - 15);
				
			}
		}
		let barCanvas:any=null;
		if (label == 'imc'){
			
			 barCanvas = new Chart(element, {
				  type: 'line',
				  data: {
				  labels: labelx,
				  datasets: [{
					  label: [label],
					  data:data,
					  backgroundColor: 'rgba(54, 162, 235, 1)',
					  borderColor: 'rgba(54, 162, 235, 1)',
					  borderWidth: 1,
					  fill: false,
				  },
				  
				  
				  {
					  label: [label],
					  data:DataE1,
					  backgroundColor: 'rgba(255, 224, 149, 0.5)',
					  borderColor: 'rgba(255, 224, 149, 1)',
					  borderWidth: 1,
					 fill: 'origin',
				  },
				  
				  
				  
				  {
					  label: [label],
					  data:DataE2,
					  backgroundColor: 'rgba(180, 235, 154, 0.5)',
					  borderColor: 'rgba(180, 235, 154, 1)',
					  borderWidth: 1,
					  fill: '-1',
				  },
				  
				  {
					  label: [label],
					  data:DataE3,
					  backgroundColor: 'rgb(244, 181, 130, 0.5)',
					  borderColor: 'rgba(244, 181, 130, 1)',
					  borderWidth: 1,
					  fill: '-1',
				  },
				  
				  {
					  label: [label],
					  data:DataE4,
					  backgroundColor: 'rgba(255, 155, 183, 0.5)',
					  borderColor: 'rgba(255, 155, 183, 1)',
					  borderWidth: 1,
					  fill: '-1',
				  }
				  
				  ]
			  },
			  options: {
				   title: {
					display: false,
					},
					 legend: {
						display: false,
				},
				  scales: {
					  yAxes: [{
						  ticks: {
							  beginAtZero:true,
							   // Include a dollar sign in the ticks
							callback: function(value, index, values) {
								return  parseInt(value) + 15 + "%";
							}
						  }
						  
						  
					  }]
				  },
				  
				  
				  tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							//var label = data.datasets[tooltipItem.datasetIndex].label || '';
							console.log(tooltipItem, data);
							return parseInt(tooltipItem.value)+15;
						}
					}
				}
				}
			});	
	    }else{
			 barCanvas = new Chart(element, {
				  type: 'line',
				  data: {
				  labels: labelx,
				  datasets: [{
					  label: [label],
					  data:data,
					  backgroundColor: 'rgba(54, 162, 235, 1)',
					  borderColor: 'rgba(54, 162, 235, 1)',
					  borderWidth: 1,
					  fill: false,
					},
				  ]
			  },
			  options: {
				   title: {
					display: false,
					},
					 legend: {
						display: false,
				},
				  scales: {
					  yAxes: [{
						  ticks: {
							  beginAtZero:true,
							   // Include a dollar sign in the ticks
							callback: function(value, index, values) {
								return  parseInt(value) + "%";
							}
						  }
						  
						  
					  }]
				  },
				  
				  
				  tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							//var label = data.datasets[tooltipItem.datasetIndex].label || '';
							return parseInt(tooltipItem.value);
						}
					}
				}
				}
			});	
		
		}
		setTimeout(()=> {  
			barCanvas.resize()
			setTimeout(()=> {  
			if  (label == 'imc') {
				console.log('put words')
				for(let i = 1; i <  barCanvas.data.datasets.length; i++){
					let auxB=barCanvas.data.datasets[i];
					let key = Object.keys(auxB._meta)[0];
					
					if (auxB._meta[key] && auxB._meta[key].data.length> 0 && auxB._meta[key].data[0]._model){
						auxB =auxB._meta[key].data[0]._model;
						if (i == 1){
							
							let top = parseInt(auxB.y) + 60;
							this.A ={
								top: top +"px",
								display: 'block'
							}
							console.log(this.A, auxB );
						}
						if (i == 2){
							
							let top = parseInt(auxB.y) + 100;
							this.B ={
								top: top +"px",
								display: 'block'
							}
							console.log(this.A, auxB );
						}
						
						if (i == 3){
							
							let top = parseInt(auxB.y) + 80;
							this.C ={
								top: top +"px",
								display: 'block'
							}
							console.log(this.A, auxB );
						}
						
						if (i == 4){
							
							let top = parseInt(auxB.y) + 100;
							this.D ={
								top: top +"px",
								display: 'block'
							}
							console.log(this.A, auxB );
						}
						
						
					}
					
				}
			}},1000);
		
		},1000);	
		return barCanvas;
	}
	
	proccessData(element, label, dataToProcess){
		let data = [];let labels = []; let start=0;
		if(dataToProcess.length>10){start=(dataToProcess.length-10);}
		for (let i =start; i < dataToProcess.length;i ++){
			    data.unshift(dataToProcess[i].percent - (label =="imc"?15:0));
				let date = new Date(dataToProcess[i].key+"T13:00:00");
				console.log(date);
				labels.unshift(date.toLocaleDateString())
		}
		return this.act_chart(element, label, labels, data )
	}
	
	fOBS:any;
	wOBS:any;
	mOBS:any;
	iOBS:any;
	
	
	ionViewDidLoad(){
		this.fOBS = this.dietProv.get_fat(this.userProv.userJson.uid).subscribe( data => { console.log(data); this.proccessData(this.barCanvasGrasa.nativeElement, 'fat', data);})
		this.wOBS =this.dietProv.get_weight(this.userProv.userJson.uid).subscribe( data => {console.log(data); this.proccessData(this.barCanvasPeso.nativeElement, 'weight', data);})
		this.mOBS =this.dietProv.get_muscle(this.userProv.userJson.uid).subscribe( data => {console.log(data); this.proccessData(this.barCanvasMuscle.nativeElement, 'muscle', data);})
		this.iOBS =this.dietProv.get_imc(this.userProv.userJson.uid).subscribe( data => {console.log(data); this.proccessData(this.barCanvasImc.nativeElement, 'imc', data);})
	}
	
	ionViewWillLeave(){
		this.fOBS.unsubscribe();
		this.wOBS.unsubscribe();
		this.mOBS.unsubscribe();
		this.iOBS.unsubscribe();
	}
}