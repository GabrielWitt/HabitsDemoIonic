import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { HabitCategory } from '../../interfaces/habit-category';
import { HabitSubcategory } from '../../interfaces/habit-subcategory';
import { HabitGoal } from '../../interfaces/habit-goal';
import { Habit } from '../../interfaces/habit';
import { Reminder } from '../../interfaces/reminder';
import { Observable } from 'rxjs/Observable';
import { UserGoal } from '../../interfaces/user-goal';
import { PushNotificationProvider } from '../push-notification/push-notification';
import { loadingProvider } from '../alert/alert';
import { ChatProvider } from '../chat/chat';
import  { UserProvider } from '../user/user';
import { NewsProvider } from '../news/news';
import { map } from 'rxjs/operators';



const USER_HABIT_NODE = 'user-habit';
const USER_EVICENDE_NODE = 'user-evidence';
const HABIT_GOAL_NODE = 'habit_goal'

@Injectable()
export class HabitProvider {

  private _remindersCollection: AngularFirestoreCollection<Reminder>;
  private _myHabitsCollection: AngularFirestoreCollection<UserGoal>;
  private _myHabit: Observable<any>;
  public actualGoal:  UserGoal = {
	   category:"-L7bZqwOe6t0cuEuVi3s"
  };
  
  constructor(
    private afs: AngularFirestore,
    private localNotificationprovider: PushNotificationProvider,
    private alerts:loadingProvider,
    private userCardProvider:ChatProvider,
	  private userProv: UserProvider,
    public newsprovider: NewsProvider,
    ) {

  }

  public empresa_filter(x:any, empresa:string){
	if (x.empresas){
		for (let i =0; i< x.empresas.length; i++){
			if (x.empresas[i] == empresa){
				return true;
			}
		}
	}
	return false;
  }
  
  public empresas_array(array:any){
	return array.filter((x:any) =>{ return  this.empresa_filter(x, this.userProv.userJson.company.uid)})	
  }
  
  public async getHabitCategories(): Promise<HabitCategory[]> {
    let categorySnapshot = await this.afs.firestore.collection('habit_category').get();
    let habitCategories: HabitCategory[] = categorySnapshot.docs.map(category => {
      return category.data() as HabitCategory;
    });
    return this.empresas_array(habitCategories);
  }

  public async getHabitSubcategories(habitCategoryUID: string): Promise<HabitSubcategory[]> {
    let subcategorySnapshot = await this.afs.firestore.collection('habit_subcategory').where('category', '==', habitCategoryUID).get();
    let habitSubcategories: HabitSubcategory[] = subcategorySnapshot.docs.map(subcategory => {
      return subcategory.data() as HabitSubcategory;
    });
    return this.empresas_array(habitSubcategories);
  }

  public async getHabits(habitSubcategory: string): Promise<Habit[]> {
    let habitSnapshot = await this.afs.firestore.collection('habit').where('subcategory', '==', habitSubcategory).get();
    let habitSubcategories: Habit[] = habitSnapshot.docs.map(habit => {
      return habit.data() as Habit;
    });
    return this.empresas_array(habitSubcategories);
  }

  public async getHabitsByCategory(habitCategoryUID: string): Promise<Habit[]> {
    let habitSnapshot = await this.afs.firestore.collection('habit').where('category', '==', habitCategoryUID).get();
    let habitSubcategories: Habit[] = habitSnapshot.docs.map(habit => {
      console.log(habit.data());
      return habit.data() as Habit;
    });

    return this.empresas_array(habitSubcategories);
  }

  public async getHabitGoals(habitUID: string): Promise<HabitGoal[]> {
    let goalSnapshot = await this.afs.firestore.collection(HABIT_GOAL_NODE).where('habit', '==', habitUID).get();
    let habitGoals: HabitGoal[] = goalSnapshot.docs.map(goal => {
      return goal.data() as HabitGoal;
    });
    return this.empresas_array(habitGoals);
  }

  public async get_goal_by_category(CategoryUID: string): Promise<HabitGoal[]> {
    let goalSnapshot = await this.afs.firestore.collection(HABIT_GOAL_NODE).where('category', '==', CategoryUID).get();
    let habitGoals: HabitGoal[] = goalSnapshot.docs.map(goal => {
      return goal.data() as HabitGoal;
    });
    return this.empresas_array(habitGoals);
  }  

  public async create_new_habit(newHabit: UserGoal) {
    let habitUID = this.afs.createId(); 
    newHabit.uid = habitUID;
    this.afs.firestore.collection(USER_HABIT_NODE).doc(habitUID).set(newHabit).then(()=>{
      this.userCardProvider.set_habit_value(newHabit.user, newHabit.name, "habit");
      return "done";
    })
  }  

  userHabit=[]; newsloader=true;
  public getMyHabits(userUID: string,company_uid:string): any {
    return new Promise((resolve)=>{
      this._myHabitsCollection = this.afs.collection(USER_HABIT_NODE, ref => ref.where('user', '==', userUID).orderBy("start_date","desc").limit(1));
      this._myHabit = this._myHabitsCollection.valueChanges();
      this._myHabit.subscribe(habit => {
        //console.log(habit)
        this.userHabit = habit;
        if(this.newsloader){
          this.newsloader=false;
          this.newsprovider.startNews(this.userHabit[0],company_uid)
        }
        resolve(this.userHabit)
      })  
    })
  }

  getHabitObserver(){
    return this.userHabit;
  }
  subcat=""; cat="";
  setHabitSubcategory(cat,sub){
    //console.log("category: "+cat+" subcategory: "+sub)
    this.cat = cat;
    this.subcat = sub;
  }

  getHabitSubcategory(){
    return {category:this.cat,subcategory:this.subcat};
  }

  public getMyAdvance(goalUID: string): Observable<UserGoal[]> {
    this._myHabitsCollection = this.afs.collection(USER_EVICENDE_NODE, ref => ref.where('user_goal', '==', goalUID));
    return this._myHabitsCollection.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const id = a.payload.doc.id;
        let goal = a.payload.doc.data()// as UserGoal;
        goal.uid = id;
        return goal;
      });
    }));
  }

  public async record_evidence(goal, evidence){
    if(goal){
      let evidenceUID = this.afs.createId(); 
      evidence.user = goal.user;
      evidence.user_goal = goal.uid;
      evidence.goal = goal.goal;
      evidence.category = goal.category;
      evidence.uid = evidenceUID;
      let advance = parseInt(goal.completed_percent) +parseInt(evidence.percent);
      this.afs.firestore.collection(USER_EVICENDE_NODE).doc(evidenceUID).set(evidence).then(()=>{ 
        this.afs.firestore.collection(USER_HABIT_NODE).doc(goal.uid).update({completed_percent:(advance)})     
        return;
      })
    }else{   
      this.alerts.presentToast("Error al guardar, no existe un hábito que registrar.")
      return;
    }
  }

  public async saveAlarm(reminder: Reminder, typeID: number): Promise<boolean> {
    try {
      this.localNotificationprovider.prepareNotificationReminder("SAVE",reminder,typeID)
      await this._remindersCollection.add(reminder);
      return true;
    } catch (error) {
      throw error;
    }
  }

  public async editAlarm(reminder: Reminder, typeID: number): Promise<boolean> {
    try {
      if(reminder.status){
        this.localNotificationprovider.prepareNotificationReminder("EDIT",reminder,typeID)
      }else{
        this.localNotificationprovider.deleteLocalNotification(reminder,typeID)
      }
      await this._remindersCollection.doc(reminder.uid).update(reminder);
      return true;
    } catch (error) {
      throw error;
    }
  }

  public async deleteAlarm(reminder: Reminder, typeID: number): Promise<void> {
    try{
      await this.localNotificationprovider.deleteLocalNotification(reminder,typeID).then(() =>{
         this._remindersCollection.doc(reminder.uid).delete().then(() =>{
          return;
         })
      })
    }catch(error){
      throw error;
    }
  }

  public getAlarmType(type: string, userUID: string): Observable<Reminder[]> {
    this._remindersCollection = this.afs.collection('reminder', ref => ref.where('type', '==', type).where('user', '==', userUID));
    return this._remindersCollection.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const id = a.payload.doc.id;
        let reminder = a.payload.doc.data() as Reminder;
        reminder.uid = id;
        return reminder;
      });
    }));
  }

  cleanOut(){
    this._myHabitsCollection = null;
    this._remindersCollection = null;
    this.newsloader=true;
  }

}
