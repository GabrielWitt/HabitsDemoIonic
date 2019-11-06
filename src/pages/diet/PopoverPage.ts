import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    templateUrl: 'Popover.html',
  })
  export class PopoverPage {
    name: "Desayuno";
    img: "./assets/icons/breakfast.png";
    constructor(
        public viewCtrl: ViewController,
        public navParams: NavParams,
    ) {
        this.name = this.navParams.get('name')
        this.img = this.navParams.get('img')
    }
  
    close() {
      this.viewCtrl.dismiss();
    }
  }