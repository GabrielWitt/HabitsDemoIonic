import { Component,Input,ViewChild,ElementRef,Renderer2  } from '@angular/core';
import { Chart } from 'chart.js';


@Component({
  selector: 'chart',
  templateUrl: 'chart.html'
})
export class ChartComponent {
  @ViewChild('canvas') canvasChart: ElementRef; 
  @Input("data") data: any;
  @Input("height") height: string;

  constructor(private renderer: Renderer2) {
    console.log('Hello ChartComponent');
  }

  ngOnInit(): void {
  	this.renderer.setAttribute(this.canvasChart.nativeElement, "height", this.height);
  	let percentiles=[];let dataGrafica=[];let backgroundColorArray=[];
  	for (var index in this.data) {
  		if (isNaN(parseInt(index))==false) percentiles.push(parseInt(index));
  	}
    console.log(this.data);
  	//this.data.percentilUser
  	percentiles.sort((a,b)=>a-b);
  	let labels=percentiles.map(percentil  =>{
  		console.log(this.data.percentilUser,percentil,(this.data.percentilUser>=percentil));
  		backgroundColorArray.push((this.data.percentilUser>=percentil)?"#03A9F4":"#b8cae8");
  		if(percentil==5) percentil;
  		dataGrafica.push(this.data[percentil]);
        return percentil+"%";
    });
    dataGrafica.push(this.data.max_steps);
    labels.push('100%');
    backgroundColorArray.push((this.data.percentilUser>=this.data.max_steps)?"#03A9F4":"#b8cae8");
  	console.log("datos",labels,dataGrafica);
   	let barChartData = {
      labels: labels,
      datasets: [{
        label: 'Pasos',
        backgroundColor: backgroundColorArray,
        data: dataGrafica
      }],
    };
    setTimeout(()=>{
    	if(this.canvasChart!=null) {
    		this.act_chart(this.canvasChart.nativeElement,barChartData,this.data.grafico);
    	}
    },200);
  }




  /*funcion para crear actualizar la grafica*/
  act_chart(element,data,type){
    let barCanvas =new Chart(element, {
      type: type,
      data: data,
      options: {
        responsive: true,
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: this.data.titulo,
        },
        scales: {
			yAxes: [{
				display: true,
				position: 'right',
			}],
		}
      }
    });  
    setTimeout(()=>  barCanvas.resize(),1000);  
  }

}
