import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PointsProvider } from '../../providers/points/points';
import { SettingsProvider } from '../../providers/settings/settings';
/**
 * Generated class for the HistorialPuntosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-historial-puntos',
  templateUrl: 'historial-puntos.html',
})
export class HistorialPuntosPage {

  label:any={
    title:"My points",
    monthNames:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    monthFullNames:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    getMore:"See more..."
  };

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public pointsservice: PointsProvider,
    private language: SettingsProvider
  ) {
    this.label = this.language.getLanguage('HistorialPuntosPage'); 
  }

  ionViewDidLoad() {
    this.label = this.language.getLanguage('HistorialPuntosPage'); 
    if (!this.pointsservice.startKey){
      this.pointsservice.GetHistorialPuntos();
    }
  }
  
  more(){
	  this.pointsservice.GetHistorialPuntos();
  }

  //Traduce el mes de numero a string
  monthLabeltranslator(month){
    let index = new Date(month).getMonth();
    return this.label.monthFullNames[index]?this.label.monthFullNames[index]:"Cargando..."; 
  }

}
