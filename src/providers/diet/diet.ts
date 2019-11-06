import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs/Observable';
import { UserProvider } from '../user/user';
import * as moment from 'moment';
import * as firebase from 'firebase';

const DIETS_NODE ="diet/diet_plan/";
//const EXAMPLE_NODE ="diet/example_plans/";
const ADVANCE_NODE ="user_advance";
const DIET_REMINDER_NODE ="user_diet_reminder";
const DIET_PORTIONS_NODE ="diet/portions/";
const USER_DIET_NODE ="user_diet";

export interface DataItem {percent: string, timestamp: Date}

@Injectable()
export class DietProvider {

  constructor(
    private afs: AngularFirestore,
    private userprov: UserProvider
  ) {
  }
  
  private dietPlanSet : any// AngularFirestoreCollection<DataItem>  
  dietPlanItems : Observable<DataItem[]>
  dietExampleItems : Observable<DataItem[]>
  private dietDataSet : AngularFirestoreCollection<DataItem>
  dietDataItems : Observable<DataItem[]>  
  private movementDataSet : AngularFirestoreCollection<DataItem>
  movementDataItems : Observable<DataItem[]>  
  private weightDataSet : AngularFirestoreCollection<DataItem>
  weightDataItems : Observable<DataItem[]>
  private fatDataSet : AngularFirestoreCollection<DataItem>
  fatDataItems : Observable<DataItem[]>
  private muscleDataSet : AngularFirestoreCollection<DataItem>
  muscleDataItems : Observable<DataItem[]>
  //private dietReminders : AngularFirestoreDocument<{}>
  dietRemindersItems : Observable<{}>
  private user_diet: AngularFirestoreDocument<any>
  private user_diet_obs: Observable<any>
  private typePortions:any;
  private dietPortions:any;
  private portionRules:any;

  public async load_Diets(diet:string){
    if(diet){
      this.dietPlanSet = firebase.firestore().collection(`${DIETS_NODE}${diet}`)
      return this.dietPlanSet.get().then(snapshot =>{
        let diet = []
        snapshot.forEach(doc => {
          diet.push(doc.data())
        });
        return diet;
      });
    }else{
      return false;
    }
    /*this.dietPlanSet = this.afs.collection(`${DIETS_NODE}${diet}`)  
    this.dietExampleSet = this.afs.collection(`${EXAMPLE_NODE}${calories}`)
    this.dietPlanSet.get(). then(data=>{
      this.dietPlanItems = 
    }) //.valueChanges();
    this.dietExampleItems = await this.dietExampleSet.valueChanges();
    return {dietPlan:this.dietPlanItems, dietExample:this.dietExampleItems};*/
  }

  async loadDietinChatbot(){
    return new Promise((resolve,rejected) => {
      let user = this.userprov.userJson; let parameters = [];
      this.load_Diets(user.diet).then(info=>{
        for(let i=0;5>i;i++){
          let food = "";
          if(parseInt(info[i]['animals'])!=0){ food += "Prod. de origen animal "+ info[i]['animals'];if(parseInt(info[i]['animals'])==1){food +=" porción. "}else{food +=" porciones. "}}
          if(parseInt(info[i]['cereals'])!=0){ food += "Cereal y tubérculos "+ info[i]['cereals'];if(parseInt(info[i]['cereals'])==1){food +=" porción. "}else{food +=" porciones. "}}
          if(parseInt(info[i]['fruits'])!=0){  food += "Frutas "+ info[i]['fruits'];if(parseInt(info[i]['fruits'])==1){food +=" porción. "}else{food +=" porciones. "}}
          if(parseInt(info[i]['lacteal'])!=0){ food += "Lácteos "+ info[i]['lacteal'];if(parseInt(info[i]['lacteal'])==1){food +=" porción. "}else{food +=" porciones. "}}
          if(parseInt(info[i]['legumes'])!=0){ food += "Leguminosas "+ info[i]['legumes'];if(parseInt(info[i]['legumes'])==1){food +=" porción. "}else{food +=" porciones. "}}
          if(parseInt(info[i]['oils'])!=0){    food += "Aceites y grasas "+ info[i]['oils'];if(parseInt(info[i]['oils'])==1){food +=" porción. "}else{food +=" porciones. "}}
          if(parseInt(info[i]['vegetables'])!=0){food += "Vegetales "+ info[i]['vegetables'];if(parseInt(info[i]['vegetables'])==1){food +=" porción. "}else{food +=" porciones. "}}
          switch(i){
            case 0: 
              parameters.push({ref:`chat_bot/${user.uid}/parameters/breakfast`,food:food}); 
              parameters.push({ref:`chat_bot_habits/${user.uid}/parameters/breakfast`,food:food}); 
              break; 
            case 1: 
              parameters.push({ref:`chat_bot/${user.uid}/parameters/snack_one`,food:food});
              parameters.push({ref:`chat_bot_habits/${user.uid}/parameters/snack_one`,food:food}); 
              break;
            case 2: 
              parameters.push({ref:`chat_bot/${user.uid}/parameters/lunch`,food:food});
              parameters.push({ref:`chat_bot_habits/${user.uid}/parameters/lunch`,food:food}); 
              break;
            case 3: 
              parameters.push({ref:`chat_bot/${user.uid}/parameters/snack_two`,food:food});
              parameters.push({ref:`chat_bot_habits/${user.uid}/parameters/snack_two`,food:food}); 
              break;
            case 4: 
              parameters.push({ref:`chat_bot/${user.uid}/parameters/dinner`,food:food});
              parameters.push({ref:`chat_bot_habits/${user.uid}/parameters/dinner`,food:food});
              break;
          }
        }
        this.SaveDietParams(parameters).then(() => {
          resolve("done")
        }).catch(error => {rejected(JSON.stringify(error))})
      })
    })
  }

  async SaveDietParams(parameters){
    try{
      await firebase.database().ref(parameters[0].ref).set(parameters[0].food);
      await firebase.database().ref(parameters[1].ref).set(parameters[1].food);
      await firebase.database().ref(parameters[2].ref).set(parameters[2].food);
      await firebase.database().ref(parameters[3].ref).set(parameters[3].food);
      await firebase.database().ref(parameters[4].ref).set(parameters[4].food);
      await firebase.database().ref(parameters[4].ref).set(parameters[5].food);
      await firebase.database().ref(parameters[4].ref).set(parameters[6].food);
      await firebase.database().ref(parameters[4].ref).set(parameters[7].food);
      await firebase.database().ref(parameters[4].ref).set(parameters[8].food);
      await firebase.database().ref(parameters[4].ref).set(parameters[9].food);
      return;
    }catch(e){
      return e;
    }
  }

  public async get_diet(uid){
    this.dietDataSet = this.afs.collection(ADVANCE_NODE).doc(uid).collection("diet")
    this.dietDataItems = this.dietDataSet.valueChanges();
    return this.dietDataItems;
  }
  
 
  
  //REPETIDO
  
  get_fat(uid){
	let set = this.afs.collection(ADVANCE_NODE).doc(uid).collection("fat", ref => ref.orderBy('timestamp','desc').limit(15))
    return set.valueChanges({idField:'key'});
  } 
  
  //REPETIDO
  get_weight(uid){
    return this.afs.collection(ADVANCE_NODE).doc(uid).collection("weight", ref => ref.orderBy('timestamp','desc').limit(15)).valueChanges({idField:'key'});
  }
  
  get_muscle(uid){
	let query = this.afs.collection(ADVANCE_NODE).doc(uid).collection("muscle", ref => ref.orderBy('timestamp','desc'));
    return query.valueChanges({idField:'key'});
  }  
  get_imc(uid){
	let query = this.afs.collection(ADVANCE_NODE).doc(uid).collection("imc", ref => ref.orderBy('timestamp','desc'));
    return query.valueChanges({idField:'key'});
  } 


  public async save_diet_item(diet:DataItem){
    let date = moment(diet.timestamp).format('YYYY-MM-DD');
    this.dietDataSet.doc(date).set(diet);
    return true;
  }
 
  public async get_movement(uid){
      this.movementDataSet = this.afs.collection(ADVANCE_NODE).doc(uid).collection("movement");
      this.movementDataItems = this.movementDataSet.valueChanges();
      return this.movementDataItems;
  }

  public async save_movement_item(movement:DataItem){
    let date = moment(movement.timestamp).format('YYYY-MM-DD');

    this.movementDataSet.doc(date).set(movement)
    return true;
  }

  //iNICIA PESO/GRASA/MUSCULO
  getAdvanceData(uid){
    this.get_weight_advance(uid);
    this.get_fat_advance(uid);
    this.get_muscle_advance(uid);
  }

  //AVANCE DE PESO
  public async get_weight_advance(uid){
    this.weightDataSet = this.afs.collection(ADVANCE_NODE).doc(uid).collection("weight");
    this.weightDataItems = this.weightDataSet.valueChanges();
    return this.weightDataItems
  }

  public async data_weight_advance(){
    return this.weightDataItems
  }

  public async save_weight_item(weight:DataItem){
    let date = moment(weight.timestamp).format('YYYY-MM-DD');
    this.weightDataSet.doc(date).set(weight)
    return true;
  }
  
  //AVANCE DE GRASA CORPORAL
  public async get_fat_advance(uid){
    this.fatDataSet = this.afs.collection(ADVANCE_NODE).doc(uid).collection("fat");
    this.fatDataItems = this.weightDataSet.valueChanges();
  }

  public async data_fat_advance(){
    return this.weightDataItems
  }

  public async save_fat_item(fat:DataItem){
    let date = moment(fat.timestamp).format('YYYY-MM-DD');
    this.fatDataSet.doc(date).set(fat)
    return true;
  }
  
  //AVANCE DE MUSCULO
  public async get_muscle_advance(uid){
    this.muscleDataSet = this.afs.collection(ADVANCE_NODE).doc(uid).collection("muscle");
    this.muscleDataItems = this.weightDataSet.valueChanges();
  }

  public async data_muscle_advance(){
    return this.weightDataItems
  }

  public async save_muscle_item(muscle:DataItem){
    let date = moment(muscle.timestamp).format('YYYY-MM-DD')
    this.muscleDataSet.doc(date).set(muscle)
    return true;
  }

  public async get_diet_reminders(uid){
    /*this.dietReminders = */
    return firebase.firestore().collection(DIET_REMINDER_NODE).doc(uid).get().then(reminders=>{
      return reminders.data()
    })
    /*this.dietRemindersItems = this.dietReminders.valueChanges();
    return this.dietRemindersItems;*/
  }

  public async save_diet_reminders(userUID, days, hours, active, diet){
    this.afs.collection(DIET_REMINDER_NODE).doc(userUID).update({
      days: days,
      hours: hours,
      active: active,
      diet: diet,
    }).then(() => {
        return active;
    })
  }

  public async save_reminder_update(userUID){
    this.afs.collection(DIET_REMINDER_NODE).doc(userUID).update({reminder_update: moment().toDate()}).then(() => {
        return true;
    })
  }

  public async save_diet_update(userUID){
    this.afs.collection(DIET_REMINDER_NODE).doc(userUID).update({update: moment().toDate()}).then(() => {
        return true;
    }).catch(err=>{console.log(err);this.afs.collection(DIET_REMINDER_NODE).doc(userUID).set({update: moment().toDate()})})
  }

  public async disable_reminder_update(userUID){
    this.afs.collection(DIET_REMINDER_NODE).doc(userUID).update({active: false}).then(() => {
        return true;
    });
  }

  
  async processFoods(diet){
    let foods=[];
      for(let i=0;i<5;i++){
        let dietAlert = [];
        if(diet[i].vegetables != "0") dietAlert.push(diet[i].vegetables + " Verduras");
        if(diet[i].fruits != "0")  dietAlert.push(diet[i].fruits + " Frutas");
        if(diet[i].cereals != "0") dietAlert.push(diet[i].cereals + " Cereales/Tubérculos");
        if(diet[i].legumes != "0") dietAlert.push(diet[i].legumes + " Leguminosas");
        if(diet[i].animals != "0") dietAlert.push(diet[i].animals + " Carnes");
        if(diet[i].lacteal != "0") dietAlert.push(diet[i].lacteal + " Lacteos");
        if(diet[i].oils != "0")    dietAlert.push(diet[i].oils + " Aceites/Grasas");
        let text = "";
        for(let j=0;j<dietAlert.length;j++){
          if(j==0){text = dietAlert[j] }else{
            if(j==(dietAlert.length-1)){text = text+" y " + dietAlert[j];}
            else{ text = text+", " + dietAlert[j]; }
          }
        }
        foods[i] = text;
      }
      return foods;
  }


  // Porciones por empresa si no se usa Medix
  loadPortions(company_uid:string){
    if(!company_uid) company_uid= "-LMImXWqGEKNG5bxi4wL";
    this.typePortions = firebase.firestore().collection(DIET_PORTIONS_NODE+"food_types");
    this.dietPortions = firebase.firestore().collection(DIET_PORTIONS_NODE+company_uid).orderBy("product");
    this.portionRules = firebase.firestore().collection(DIET_PORTIONS_NODE+"rules");
    //console.log(DIET_PORTIONS_NODE+company_uid);
  }

  async loadProducts(){
    return this.dietPortions.get().then(snapshot =>{
      let portions = [];
      snapshot.forEach(doc => {
        portions.push(doc.data())
      });
      return portions;
    });
  }

  async getTypes(){
    return this.typePortions.get().then(snapshot =>{
      let types = [];
      snapshot.forEach(doc => {
        types.push(doc.data())
      });
      return types;
    });
  }

  async getRules(){
    return this.portionRules.get().then(snapshot =>{
      let rules = [];
      snapshot.forEach(doc => {
        rules.push(doc.data())
      });
      return rules;
    });
  }
 
  // Carga la dieta del usuario
  async loadUserPortions(uid){
    this.user_diet = await this.afs.collection(USER_DIET_NODE).doc(uid);
    this.user_diet_obs = await this.user_diet.valueChanges();
    return;
  }

  // Devuelve el observable del usuario
  async getUserDiet(){
    return this.user_diet_obs;
  }

  // Crea dieta del usuario
  async saveUserPortions(diet){
    this.user_diet.set(diet).then(()=>{
      return;
    })
  }

  // Actualiza dieta del usuario
  updateUserPortions(diet){
    this.user_diet.update(diet);
  }

  cleanOut(){
    this.dietPlanSet = null;
    this.dietPlanItems = null;
    this.dietExampleItems = null;
    this.dietDataSet = null;
    this.dietDataItems = null; 
    this.movementDataSet = null;
    this.movementDataItems = null;
    this.weightDataSet = null;
    this.weightDataItems = null;
    //this.dietReminders = null;
    this.dietRemindersItems = null;
    this.user_diet = null;
    this.user_diet_obs = null;
  }


}
