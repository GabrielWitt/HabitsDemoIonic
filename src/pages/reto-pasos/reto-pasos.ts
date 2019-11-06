import { AuthProvider } from './../../providers/auth/auth';
import { HealthProvider } from './../../providers/health/health';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ModalController } from 'ionic-angular';
import { RetosProvider } from '../../providers/retos/retos';
import { ErrorProvider } from '../../providers/error/error';
import { NewsProvider } from '../../providers/news/news';
import { TestProvider } from '../../providers/test/test';
import { UserProvider } from '../../providers/user/user';
import { loadingProvider } from '../../providers/alert/alert';
import { User } from '../../interfaces/user';
import * as firebase from 'firebase';
import { LearningProvider } from '../../providers/learning/learning';

export interface HabitsActivity {title:string,rules:string,status:string,duration:string}

@IonicPage()
@Component({
  selector: 'page-reto-pasos',
  templateUrl: 'reto-pasos.html',
})
export class RetoPasosPage {
	public TestItems:any=[];
	public retos:any;
	public activities:HabitsActivity[];
	private user:User;
	private Lessons=[];
	
	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams, 
		private retosprovider: RetosProvider,
		private healthProvider: HealthProvider,
		private errorService: ErrorProvider,
		private newsprovider: NewsProvider,
		public testprovider: TestProvider,
		public userprovider: UserProvider,
		private authProvider:AuthProvider,
		private platform:Platform,
		private loadinService:loadingProvider,
		public modalCtrl: ModalController,
		private learning: LearningProvider
	) {
	}

    async ionViewDidLoad() {
		this.user = this.userprovider.userJson;
		this.retosprovider.load_all_retos().then( retos => {
			this.retos = retos;
			//console.log(this.retos)
			this.healthProvider.startChallengeProcess().then(ans=>{
			}).catch(error=>{this.errorService.setError("RETOS","ER","1",error.toString(),"Error en carga de datos de reto.");});
		});
		this.retosprovider.loadActvities().then(activities => {
			this.activities = activities;
			//console.log(this.activities)
		});
		this.testprovider.tests_with_answer_user(this.userprovider.userJson.uid).then( tests =>{
			this.TestItems = tests;
			console.log(tests);
		});
	}
  
	selectReto(reto){
		this.navCtrl.push('RankingRetosPage',  {reto: reto});
	}

	selectACtivity(activity){
		if(activity.type=="writing"||activity.type=="image_upload"){
			this.navCtrl.push('ActivityPage',  {activity: activity});
		}else if(activity.type=="video"){ 
			console.log("Reproducir curso",activity);
			this.load_Lesson(activity.video.split("/")[1]).then(lesson => {
				firebase.firestore().doc(activity.video).get().then(topic => {
					this.navCtrl.push('TopicPage',{topic:topic.data(), index:lesson, user:this.user});
				})
			})
		}else if(activity.type=="article"){ 
			firebase.firestore().doc(activity.article).get().then(article => {
				this.linkNotice(article.data());
			})
		}
	}
		
	ionViewWillUnload(){
		this.retosprovider.unsubscribe$.next();
		this.retosprovider.unsubscribe$.complete();
	}

	public goToPage(page: string) {
      if(page=='RetoPasosPage'){
      	console.log('Already in this page')
      }else if(page=='DashboardPage'){
		this.navCtrl.setRoot('DashboardPage')
	  }else if(page == "ranking") {
		this.navCtrl.push('NewsPage', { tab: "rankingTab",news:[]},{animate:false});
	  }else{
		this.navCtrl.pop({animate:false});
		this.navCtrl.push(page,{},{animate:false});
	  }
	}
  
	///////////////////////////////////// ABRIR TEST EN ACTIVIDADES //////////////////////////////////////////////////
	irAlTest(test){
	  if (test.next >= test.dias_prox){
	   this.navCtrl.push("QuizPage", {test: test.uid, Breturn: true});
	  }
	}
	
	irAlResult(test){
	  console.log(test);
	   this.navCtrl.push("ResultsPage", {test: test, result: test.results[0].result, Breturn: true});
	}	

	///////////////////////////////////// ABRIR ARTICULOS EN ACTIVIDADES //////////////////////////////////////////////////
	linkNotice(article) {
		if (this.authProvider.AppIsOnline()) {
			let options = 'location=no,closebuttoncaption=X';
			if(this.platform.is('android')){options = 'location=no,hardwareback=no,footer=yes,closebuttoncaption=X,footercolor=#1B1B1B,closebuttoncolor=#488aff'}
			window.open(article.link, '_blank', options);//, '_system');
			this.newsprovider.testRealizado(this.user.uid,article.uid).then(existe=>{
			  if(!existe){
				this.presentModal(article);
			  }else{
				this.save_read_article(article.uid,null,null);
				this.loadinService.showToast('Artículo visto anteriormente','bottom', true, undefined);
			  }
			})
		  } else {
			this.loadinService.presentToast('No disponible sin conexión...');
		  }
	}

	presentModal(article) {
		const modal = this.modalCtrl.create("ModalTestArticlePage",{article:article,pregunta:article.test_article,test:article.test_article},{cssClass: "modal-test-article"});
		modal.present();
		modal.onDidDismiss((data)=>{
		let aprobado;
		//console.log.log(data);
		if(data.pregunta!=null&&data.respuesta!=null){
			(data.pregunta.correct_answer==data.respuesta)?aprobado=true:aprobado=false;
			this.save_read_article(article.uid,aprobado,data.test.points);
		}
		});
	}

	//funcion para guardar en base de datos que se leyo un articulo
	save_read_article(article_uid,aprobado,points){
	  if(aprobado!=null&&points!=null){
		this.loadinService.showLoading("Procesando Respuesta <br> Por favor espere");
	  }
	  this.newsprovider.save_read_article(this.user.uid, article_uid,aprobado,points).then(existia=> {
		if(aprobado!=null&&points!=null){
		  this.loadinService.dismissLoading();
		  if(!existia&&!aprobado){
			this.loadinService.presentToast("Respuesta incorrecta, no has ganado puntos.");
		  }
		}
	  }).catch(error=>{
		//console.log.log(error);
		if(aprobado!=null&&points!=null){
		  this.loadinService.dismissLoading();
		  this.loadinService.presentToast("No se pudo procesar los datos. Verifique su conexion a internet e intentelo nuevamente");
		}
	  })
	}

	load_Lesson(lesson_ref){
		return new Promise((resolve) => {
			let actuallesson: any;
			this.learning.load_topics().then(data => {
			  this.Lessons = data;
			  this.learning.loadMyClases(this.user.uid).then(mylearning => {
				  mylearning.forEach(myclasses=>{
					if(!myclasses[0]){
					  console.log("sin clases");
					  resolve();
					}else{
					  myclasses.forEach(data=>{
						this.Lessons.forEach(lesson =>{
						  if(data.uid == lesson.uid){ 
							lesson.joined = true;
							lesson.advance = data.topic_number ? data.topic_number : "0"
						  }
						  if(lesson_ref==lesson.uid)actuallesson=lesson;
						})
					  })
					  resolve(actuallesson);
					}
				  })
				})
			});
		})		
	}
}
