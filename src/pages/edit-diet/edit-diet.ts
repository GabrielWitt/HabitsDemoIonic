import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { loadingProvider } from '../../providers/alert/alert';
import { option } from '../../interfaces/option';
import { DietProvider } from '../../providers/diet/diet';
import * as moment from "moment";
import { User } from '../../interfaces/user';

/**
 * Generated class for the EditDietPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-diet',
  templateUrl: 'edit-diet.html',
})
export class EditDietPage {
  user: User;
  changes = false;
  products: any = [];
  diet: any[] = [];
  rules: any[] = [];
  weekDiet:any=[];
  fisrt = false;
  types= []
  mealtypes = [ 
    {type:"animal",title:"Prod. origen animal",img:"./assets/icons/productosanimales.png"},
    {type:"cereals",title:"Cereales y tubérculos",img:"./assets/icons/cereales.png"},
    {type:"fruits", title:"Frutas",img:"./assets/icons/frutas.png"},
    {type:"lacteal",title:"Lácteos",img:"./assets/icons/lacteos.png"}, 
    {type:"legumes",title:"Leguminosas",img:"./assets/icons/leguminosas.png"}, 
    {type:"oils",title:"Aceites y grasas",img:"./assets/icons/oils&fats.png"}, 
    {type:"vegetables",title:"Verduras",img:"./assets/icons/verduras.png"}, 
  ]
  foods = [
    {type:"breakfast",title:"Desayuno",button:"V",img:"./assets/icons/breakfast.png"},
    {type:"snack1",title:"Colación 1",button:"V",img:"./assets/icons/snack1.png"},
    {type:"lunch",title:"Almuerzo",button:"V",img:"./assets/icons/lunch.png"},
    {type:"snack2",title:"Colación 2",button:"V",img:"./assets/icons/snack2.png"},
    {type:"dinner",title:"Cena",button:"V",img:"./assets/icons/dinner.png"}
  ];
  daySelected = moment().format("d");
  days =[{day:"Domingo",value:0},{day:"Lunes",value:1},{day:"Martes",value:2},{day:"Miercoles",value:3},{day:"Jueves",value:4},{day:"Viernes",value:5},{day:"Sabado",value:6}];

 
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alerts:loadingProvider,
    private dietProv:DietProvider
    ) {
    this.user = this.navParams.get('user');
    this.weekDiet = this.navParams.get('weekDiet');  
    let dietData: any[] = this.navParams.get('dietData');  
    this.products = this.navParams.get('products');
    this.types = this.navParams.get('types');
    this.rules = this.navParams.get('rules');
    if(this.navParams.get('dietData'))this.fisrt=true; 
    this.diet = dietData[0];
    if(this.diet){
      //console.log("tiene horarios") 
    }else{
      this.alerts.presentToast("Aun no ha seleccionado Dieta");
      this.navCtrl.pop();
    }
  }

  getDay(i){
    return this.days[i].day;
  }

  checkNumber(food,meal){
    return this.weekDiet[this.daySelected][food][meal].length;
  }

  getItems(food,meal){
    return this.weekDiet[this.daySelected][food][meal];
  }

  getImg(i){
    return this.mealtypes[i].img;
  }

  async SelectProduct(i,food,meal,product){
    let auxmeal = await this.processRules(meal);
    let options: option[]=[];
    for(let j=0;j<this.products.length;j++){
      if(this.products[j].type==auxmeal){
        options.push({
            type: 'radio',
            label: this.products[j].product,
            value: j
        })
      }
    }
    this.alerts.MultipleOption("Seleccione un producto",options).then(result => {
      this.changes = true;
      this.weekDiet[this.daySelected][food][meal][product] = this.products[result]
    }).catch(error =>{console.log("Cancel"+error)});
  }

  async saveSelection(){
    let options: option[]=[{
      type: 'radio',
      label: "Guardardado normal",
      value: 1
    },{
      type: 'radio',
      label: "Copiar "+ this.getDay(this.daySelected) +" para todos.",
      value: 2
    }];
    await this.alerts.MultipleOption("¿Como desea guardar?",options).then(result => {
      this.changes=false;
      if(result==1){
        //console.log("save day");
        this.saveData();
        return;
      }else{
        //console.log("save week");
        for(let i=0;i<7;i++){
          if(i!=parseInt(this.daySelected)){
            this.weekDiet[i] = this.weekDiet[this.daySelected];
          }
        }
        //console.log(this.weekDiet)
        this.saveData();
        return;
      }
    }).catch(error=>{
      //console.log(error);
      this.alerts.presentToast("Sus cambios no se han guardado");
      return;
    });
  }

  saveData(){        
    let newFormat = {
      sunday:this.weekDiet[0],
      monday:this.weekDiet[1],
      tuesday:this.weekDiet[2],
      wednesday:this.weekDiet[3],
      thursday:this.weekDiet[4],
      friday:this.weekDiet[5],
      saturday:this.weekDiet[6],
    };
    if(this.fisrt){this.dietProv.saveUserPortions(newFormat);}
    else{this.dietProv.updateUserPortions(newFormat);}
    this.navCtrl.setRoot("DashboardPage");
  }

  openTab(food){
    let title = food.title;
    document.getElementById("Desayuno").style.display = "none";
    document.getElementById("Colación 1").style.display = "none";
    document.getElementById("Almuerzo").style.display = "none";
    document.getElementById("Colación 2").style.display = "none";
    document.getElementById("Cena").style.display = "none"; 
    for(let food of this.foods){
      if(food.title == title&&food.button == "V"){
        food.button = "-"; 
        document.getElementById(title).style.display = "block";
      }else{
        food.button = "V";
      }
    }
  }

  async processRules(food){
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
    return food;
  }

  exit(){
    //console.log("changes? "+this.changes)
    if(this.changes){
      this.saveSelection().then(()=>{
        this.navCtrl.pop()
      })
    }else{
      this.navCtrl.pop()
    }
  }
}
