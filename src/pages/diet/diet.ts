import { Component, ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { IonicPage, NavController, NavParams, LoadingController, Loading, Popover, PopoverController } from 'ionic-angular';
import { DietProvider } from '../../providers/diet/diet';
import { User } from '../../interfaces/user';
import { PopoverPage } from "./PopoverPage";
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { loadingProvider } from '../../providers/alert/alert';
import * as moment from "moment";

@IonicPage()
@Component({
  selector: 'page-diet',
  templateUrl: 'diet.html',
})
export class DietPage {
  @ViewChild(Slides) slides: Slides;
  user: User;
  dietData: any;
  loaderUser: Loading;
  popName: Popover;
  nodiet = "Para iniciar, por favor, presiona el botón azul del abajo para configurar tu menú, una vez cargado podrás presionar sobre 'Personalizar' donde podrás seleccionar los productos sugeridos par nuestros nutricionistas."
  diet: any=[];  
  dietCheck = false;
  dietReminders: any;
  products: any = [];
  type: any = [];
  rules: any = [];
  weekDiet:any=[];
  checkWeekDiet="";
  first=false;
  actualDay = moment().format("d");
  actualTime = moment().format("H");
  nextfood={};
  yourmeal:any;
  types = [ 
    {type:"animals",title:"Prod. origen animal",img:"./assets/icons/productosanimales.png"},
    {type:"cereals",title:"Cereales y tubérculos",img:"./assets/icons/cereales.png"},
    {type:"fruits", title:"Frutas",img:"./assets/icons/frutas.png"},
    {type:"lacteal",title:"Lácteos",img:"./assets/icons/lacteos.png"}, 
    {type:"legumes",title:"Leguminosas",img:"./assets/icons/leguminosas.png"}, 
    {type:"oils",title:"Aceites y grasas",img:"./assets/icons/oils&fats.png"}, 
    {type:"vegetables",title:"Verduras",img:"./assets/icons/verduras.png"}, 
  ]
  foodtime = [
    {num:0,type:"breakfast",title:"Desayuno",start:0,end:8,img:"./assets/icons/breakfast.png"}, //6-8
    {num:1,type:"snack1",title:"Colación 1",start:9,end:11,img:"./assets/icons/snack1.png"},  //9-11
    {num:2,type:"lunch",title:"Almuerzo",start:12,end:14,img:"./assets/icons/lunch.png"},   //12-14
    {num:3,type:"snack2",title:"Colación 2",start:15,end:17,img:"./assets/icons/snack2.png"},  //15-17
    {num:4,type:"dinner",title:"Cena",start:18,end:23,img:"./assets/icons/dinner.png"},   //18-20
  ]
  days =[{day:"Domingo",value:0},{day:"Lunes",value:1},{day:"Martes",value:2},{day:"Miercoles",value:3},{day:"Jueves",value:4},{day:"Viernes",value:5},{day:"Sabado",value:6}];
  ingredients = [];
  selectedType = {color: "", description:" ", img: "", title: "", type: "",show:"nodiet"}

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public dietService: DietProvider,
    private loadingCtrl: LoadingController,
	  private analytics:AnalyticsProvider,
    private popoverCtrl:PopoverController,
    private alerts: loadingProvider
  ) {
    this.user = this.navParams.get('user');
    this.products = this.navParams.get('products');
    this.type = this.navParams.get('types');
    this.rules = this.navParams.get('rules');
    this.dietData = this.navParams.get('dietData'); 
    this.weekDiet = this.navParams.get('weekDiet');
    //console.log(this.dietData)
    if(this.dietData.length) this.selectedType.show="diet_ready"
    //console.log("diet:",this.user.diet);
    this.loaderUser = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Cargando...'
    });
    this.loaderUser.present();
  }

  ionViewDidLoad() { 
    let diet: string[] = this.dietData
    //console.log(diet)
    if(this.dietData.length){ 
      this.processUserDiet();
    }else{
      this.first=true;
      //console.log("No data",this.weekDiet)
      if(diet!=undefined)this.filterDiet();
    } 
    this.dietReminders = this.navParams.get('dietReminders');
    if(diet!=undefined&&diet.length){
      this.diet = this.dietData;
      this.dietCheck = true;
      this.processFoods();
      this.loaderUser.dismiss().catch(() => {});;
    }else{
      this.loaderUser.dismiss().catch(() => {});;
    }
  }

  processUserDiet(){
    //console.log(parseInt(this.actualTime))     
    for(let nextFood of this.foodtime){   
      //console.log("start "+nextFood.start+" end: "+nextFood.end)
      if(parseInt(this.actualTime)>=nextFood.start&&parseInt(this.actualTime)<=nextFood.end){
        this.nextfood = nextFood;
        let that = this;
        setTimeout(()=>{
          that.goToSlide(this.nextfood['num'])
        },1500)
        this.checkWeekDiet=this.nextfood['title'];
      }
    }
  }
  
  ionViewDidEnter(){   
		this.analytics.saveScreen("Módulo Dieta");
	}


  presentName(myEvent, name, img){
    this.popName = this.popoverCtrl.create(PopoverPage,{name:name,img:img})
    this.popName.present({ev:myEvent})
  }

  openPage(page) {
    if(page == "test"){
      this.navCtrl.pop();
      this.navCtrl.push("QuizPage",{test:"19Cw6Ghp5TdbfQet28Hg"});
    }else if(page=="info"){
      this.navCtrl.push("DietInfoPage",{user:this.user,products:this.products,types:this.type,rules:this.rules})
    }else if(page=="editDiet"){
      if(this.weekDiet.length){
        this.navCtrl.push("EditDietPage",{user:this.user,products:this.products, dietData:this.dietData, weekDiet:this.weekDiet,fisrt:this.first,rules:this.rules})
      }else{
        this.alerts.presentToast("Para acceder a este módulo debe configurar su dieta primero");
      }
    }
  }

  foods=[]
  async processFoods(){
    if(this.diet){
      this.foods = await this.dietService.processFoods(this.diet);
    }else{
      this.foods = [];
    }
  }

  openReminders(){
    this.navCtrl.push("DietRemindersPage",{dietText:this.foods, user:this.user,dietData:this.dietData,dietReminders:this.dietReminders});
  }

  

  async filterDiet(){
    let breakfast:any;let snack1:any;let lunch:any;let snack2:any;let dinner:any;
    let diet = this.dietData;
    for(let i=0;i<diet.length;i++){
      switch(i){
        case 0:
          breakfast = await this.addMeal(diet[i]); break;
        case 1:
          snack1 = await this.addMeal(diet[i]); break;
        case 2:
          lunch = await this.addMeal(diet[i]); break;
        case 3:
          snack2 = await this.addMeal(diet[i]); break;
        case 4:
          dinner = await this.addMeal(diet[i]); break;
        default:
        //console.log(i)
      }
    }
    this.weekDiet=[];
    for(let j=0;j<7;j++){
      let day = {0:breakfast,1:snack1,2:lunch,3:snack2,4:dinner}      
      this.weekDiet.push(day);
    }    
    //console.log("Generated weekDiet",this.weekDiet)    
    //this.processUserDiet();
  }

  async addMeal(food){
    let animals= await this.addItems(food['animals']);
    let cereals= await this.addItems(food['cereals']);
    let fruits= await this.addItems(food['fruits']);
    let lacteal= await this.addItems(food['lacteal']);
    let legumes= await this.addItems(food['legumes']);
    let oils= await this.addItems(food['oils']);
    let vegetables = await this.addItems(food['vegetables']);
    let meal = {
      animal: animals,
      cereals: cereals,
      fruits: fruits,
      lacteal: lacteal,
      legumes: legumes,
      oils: oils,
      vegetables: vegetables,
    };
    return meal;
  }

  async addItems(items){
    let meal = [];let item = {product: "-No Selection-", ration: "0"};    
    for(let x=0;x<items;x++){
      meal.push(item);
    }
    return meal;
  }  

  getDay(i){
    return this.days[i].day;
  }

  getImg(i){
    return this.types[i].img;
  }

  goToSlide(index) {
    this.slides.slideTo(index,500 )
  }

  nextSlide() {
    this.slides.slideNext()
  }

  prevSlide() {
    this.slides.slidePrev()
  }

  async showFoodInfo(food){
    if(food=="animals")food="animal";
    food = await this.processRules(food);
    for(let typ of this.type){
      if(typ.type == food){
        //this.selectedType = typ;
        //this.selectedType.show = "portions";
        this.navCtrl.push("DietInfoPage",{user:this.user,products:this.products,types:this.type,rules:this.rules,selectedType:typ})
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
    if(this.selectedType.show=='diet_ready'||this.selectedType.show=="nodiet"){
      this.navCtrl.pop();
    }else{
      this.selectedType = {color: "", description:" ", img: "", title: "", type:"" ,show:"diet_ready"};
    }
  }
}
