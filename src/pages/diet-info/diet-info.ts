import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { User } from '../../interfaces/user';

@IonicPage()
@Component({
  selector: 'page-diet-info',
  templateUrl: 'diet-info.html',
})
export class DietInfoPage {
  user: User;
  products = []  
  title="Porciones"
  selectedType = {color: "", description:" ", img: "", title: "", type: "portions"}
  types = [];
  rules = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
	  private analytics:AnalyticsProvider
    ) {
      this.user = this.navParams.get('user');
      this.products = this.navParams.get('products');
      this.types = this.navParams.get('types');
      console.log(this.types)
      this.rules = this.navParams.get('rules');
      this.selectedType = this.navParams.get('selectedType');
      //console.log("products",this.products,"types:",this.types);
  }

  ionViewDidLoad() {
  }

   ionViewDidEnter(){
		this.analytics.saveScreen("Info dieta");
	}

  async showFoodInfo(food){
    food = await this.processRules(food);
    for(let typ of this.types){
      if(typ.type == food){
        this.selectedType = typ;
        //console.log(food);
        break;
      }
    }
  }

  async processRules(food){
    if(this.user.diet!=undefined){
      let diet = this.user.diet.split("-");
      for(let rul of this.rules){      
        //console.log(diet[rul.position])
        if(diet[rul.position]=="si"){
          let change = rul.replace.split("-");
          if(food == change[0]){
            return change[1];
          }
        }
      }
    }
    return food;
  }

  back(){
    this.navCtrl.pop();
    /*if(this.selectedType.type=='portions'){
    }else{
      this.selectedType = {color: "", description:" ", img: "", title: "", type: "portions"};
    }*/
  }
  
}
