import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

/**
 * Generated class for the ModalNivelHabitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modal-nivel-habit',
  templateUrl: 'modal-nivel-habit.html',
})
export class ModalNivelHabitPage {
	resp:number=5;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ModalNivelHabitPage');
  }

  cerrar(){
  	this.viewCtrl.dismiss({respuesta:this.resp});
    
  }
}
