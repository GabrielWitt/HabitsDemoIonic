import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-modal-test-article',
  templateUrl: 'modal-test-article.html',
})
export class ModalTestArticlePage {
  test:any=null;
  pregunta:any=null;
  article:any=null;
  respuesta:any=null;

  constructor(
    public navCtrl: NavController, 
    private analytics:AnalyticsProvider, 
    public navParams: NavParams,
    public viewCtrl: ViewController){
      this.pregunta=this.navParams.get('pregunta');
      this.test=this.navParams.get('test');
      this.article=this.navParams.get('article');      
	    this.analytics.saveScreen("Prueba artículo");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalTestArticlePage',this.pregunta,this.test);
  }


  cerrar(){
  	this.viewCtrl.dismiss({respuesta:null,pregunta:null,test:null});
    this.analytics.appSeeEvent("Quiz_Articulo");
  }

  guardarRespuesta(){
  	this.viewCtrl.dismiss({respuesta:this.respuesta,pregunta:this.pregunta,test:this.test});
  }

}
