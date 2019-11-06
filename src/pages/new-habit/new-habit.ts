import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, NavParams, ToastController, LoadingController, ViewController, Events, Platform } from 'ionic-angular';
import { HabitCategory } from '../../interfaces/habit-category';
import { HabitSubcategory } from '../../interfaces/habit-subcategory';
import { Habit } from '../../interfaces/habit';
import { HabitGoal } from '../../interfaces/habit-goal';
import { UserGoal } from '../../interfaces/user-goal';
import { User } from '../../interfaces/user';
import { HabitProvider } from '../../providers/habit/habit';
import { UserProvider } from '../../providers/user/user';
import { ChatProvider } from '../../providers/chat/chat';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { AuthProvider } from '../../providers/auth/auth';
import { ImageLoaderConfig } from 'ionic-image-loader';
import { NewsProvider } from '../../providers/news/news';

/**
 * Generated class for the NewHabitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-habit',
  templateUrl: 'new-habit.html',
})
export class NewHabitPage {

  habitCategories: HabitCategory[];
  habitSubcategories: HabitSubcategory[];
  habits: Habit[];
  habitGoals: HabitGoal[];

  goalSelected: HabitGoal;
  user: User;
  userGoal: UserGoal = {};

  categoryTitle = "";
  categoryPicture = "";
  subCategoryName = "";
  habitName = "";
  imgLoadArray = new Array(5)

  loader: any;
  refresher: any;
  bounceAnimationSubCategory: boolean = false;
  bounceAnimationHabit: boolean = false;
  volverAna:boolean=false;registroHabito:boolean=false;
  newHabitTitle = ""

  constructor(public navCtrl: NavController,
    public toastCtrl: ToastController,
    private habitProvider: HabitProvider,
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public events: Events,
    public userprovider: UserProvider,
    private chatProvider: ChatProvider,
	  private analytics:AnalyticsProvider,
    private authProvider: AuthProvider,
    public platform: Platform,
    private newsprovider:NewsProvider,
    private  imageLoaderConfig: ImageLoaderConfig
    ) {
      this.imageLoaderConfig.enableSpinner(true);
      this.imageLoaderConfig.setBackgroundSize('inherit')
      this.user = this.userprovider.static_user();
      if(this.navParams.get("goalSelection")){
        let prevSelection = this.navParams.get("goalSelection");
        this.categoryTitle = prevSelection.categoryTitle
        this.categoryPicture = prevSelection.categoryPicture
        this.subCategoryName = prevSelection.subCategoryName
        this.habitName = prevSelection.habitName
        this.goalSelected = prevSelection.goalSelected
      }
      this.volverAna=this.navParams.get("volverAna");
      
  }

  ionViewCanEnter(): Promise<boolean> {
    return new Promise((resolve) => {
      this.habitProvider.getHabitCategories().then(categories => {
        console.log(categories)
        this.habitCategories = categories;
        if (categories.length == 0){
          return false;
        }
        this.getSubcategories(0, categories[0]['name'], categories[0]['picture']);
        resolve(true);
      });
    });
  }

  getCategories() {
    this.hideKeyborad()
    if (this.refresher) {
      this.refresher.complete();
    }
    this.presentLoading()
    this.habitProvider.getHabitCategories().then(categories => {
      this.habitCategories = categories;
      this.getSubcategories(0, categories[0]['name'], categories[0]['picture']);
    });
  }


  getSubcategories(index: number, categoryName: string, categoryPicture: string) {
    this.hideKeyborad()
    this.categoryTitle = categoryName;
    this.categoryPicture = categoryPicture
    this.habitSubcategories = [];
    this.habits = [];
    this.habitGoals = [];
    this.bounceAnimationSubCategory = false;
    if (!this.habitCategories[index].hasOwnProperty('habitSubcategories')) {
      this.habitProvider.getHabitSubcategories(this.habitCategories[index].uid).then(subcategories => {
        this.bounceAnimationSubCategory = true;
        this.habitCategories[index].habitSubcategories = subcategories;
        this.habitSubcategories = subcategories;
        if (this.loader) {
          this.loader.dismiss().catch(() => {});;
        }
      });
    } else {
      this.habitSubcategories = this.habitCategories[index].habitSubcategories;
      new Promise(resolve => {
        setTimeout(time => {
          this.bounceAnimationSubCategory = true;
          resolve();
        }, 10);
      });
    }
  }

  getHabits(index: number, subCategoryName: string) {
    this.hideKeyborad()
    this.subCategoryName = subCategoryName
    this.habits = [];
    this.habitGoals = [];
    this.bounceAnimationHabit = false;
    if (!this.habitSubcategories[index].hasOwnProperty('habits')) {
      this.presentLoading();
      this.habitProvider.getHabits(this.habitSubcategories[index].uid).then(habits => {
        this.habitSubcategories[index].habits = habits;
        this.habits = this.habitSubcategories[index].habits;
        this.bounceAnimationHabit = true;
        if (this.loader) {
          this.loader.dismiss().catch(() => {});;
        }
      });
    } else {
      this.habits = this.habitSubcategories[index].habits;
      new Promise(resolve => {
        setTimeout(time => {
          this.bounceAnimationHabit = true;
          resolve();
        }, 10);
      });
    }
  }

  getGoals(index: number, habitName: string) {
    this.hideKeyborad()
    this.habitName = habitName;
    this.habitGoals = [];
    if (!this.habits[index].hasOwnProperty('habitGoals')) {
      this.presentLoading();
      this.habitProvider.getHabitGoals(this.habits[index].uid).then(goals => {
        this.habits[index].habitGoals = goals;
        this.habitGoals = this.sortAlphabetically(this.habits[index].habitGoals);
        if (this.loader) {
          this.loader.dismiss().catch(() => {});;
        }
      });
    } else {
      this.habitGoals = this.sortAlphabetically(this.habits[index].habitGoals);
      new Promise(resolve => {
        setTimeout(time => {
          this.bounceAnimationHabit = true;
          resolve();
        }, 10);
      });
    }
  }

  sortAlphabetically(array){
    let ordered = array.sort(function(a, b){
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    });
    return ordered;
  }

  dosomething(){
    console.log('done');
  }

  setGoal(goal) {
    console.log(goal)
    this.goalSelected = goal;
    if(goal.name != "Otro:"){
      this.hideKeyborad()
    }
  }

  setAlarm(){

  }

  saveUserGoal() {
    if(this.goalSelected){
      this.userGoal.completed_percent = 0;
      this.userGoal.start_date = new Date().toISOString();
      this.userGoal.status = 'active';
      this.userGoal.user = this.user.uid;
      this.userGoal.company = this.user.company.uid;
      this.userGoal.description = this.goalSelected.description,
      this.userGoal.picture = this.goalSelected.picture,
      this.userGoal.goal = this.goalSelected.uid,
      this.userGoal.category = this.goalSelected.category
      this.userGoal.name = this.goalSelected.name
      this.userGoal.subcategory = this.goalSelected.subcategory
      if(this.goalSelected.name == "Otro:" && this.newHabitTitle != ""){
        this.userGoal.name = this.newHabitTitle
        this.UploadGoal()
      }else if(this.goalSelected.name != "Otro:"){
        this.UploadGoal()
      }else{
        this.presentToast("Debes escribir el nombre del hábito antes de continuar.");
      }
    }else{
      this.presentToast("Debes escojer un hábito antes de continuar.");
    }
  }

  UploadGoal(){
    this.habitProvider.create_new_habit(this.userGoal).then(() =>{
      if(this.volverAna!=undefined){
        this.chatProvider.registroHabitoAna.registrado=true;
        this.chatProvider.registroHabitoAna.categoria=this.categoryTitle;
        this.chatProvider.registroHabitoAna.subCategoria=this.subCategoryName;
      }
      this.newsprovider.startNews(this.userGoal,this.user.company.uid).then(data=>{
        this.habitProvider.setHabitSubcategory(this.userGoal.category,this.userGoal.subcategory);
        this.navCtrl.pop();
        this.presentToast("Tu hábito ha sido creado.");
        this.analytics.EventWithData("NewHabit",this.categoryTitle+"-"+this.subCategoryName);
      });
    })
  }

  closePage() {
    this.navCtrl.pop();
  }

  doRefresh(refresher) {
    this.refresher = refresher;
    this.getCategories();
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Cargando..."
    });
    this.loader.present();
  }

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'top'
    });
    toast.onDidDismiss(() => { });
    toast.present();
  }

  showAlarmModal(){
    this.navCtrl.push('AlarmSetupPage', {
      alarmType: 'habit_reminder',
      alarmName: 'Recordatorios',
      chatAlarm: false,
      userUID: this.user.uid,
      goalSelection:{
        categoryTitle: this.categoryTitle,
        categoryPicture: this.categoryPicture,
        subCategoryName: this.subCategoryName,
        habitName:this.habitName,
        goalSelected: this.goalSelected,
      }
    });
  }
  
  ionViewDidLoad() {
    this.analytics.saveScreen("Nuevo hábito");
  }
  
  pressKey(key,goal) {
    this.setGoal(goal)
    if (key.keyCode == 13) {
      this.saveUserGoal();
      this.hideKeyborad();
    }
  }

  hideKeyborad(){
    if(this.platform.is('cordova')){
      this.authProvider.keyboardHide();
    }
  }

}
