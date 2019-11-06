import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/observable';
import { Content, IonicPage, NavController, NavParams,ModalController, Platform  } from 'ionic-angular';
import { NewsProvider } from '../../providers/news/news';
import { AuthProvider } from '../../providers/auth/auth';
import { User } from '../../interfaces/User';
import { UserProvider } from '../../providers/user/user';
import { loadingProvider } from '../../providers/alert/alert';
import { rankingProvider } from '../../providers/ranking/ranking';
import { HabitProvider } from '../../providers/habit/habit';

import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { UserGoal } from '../../interfaces/user-goal';
import { SettingsProvider } from '../../providers/settings/settings';
//import { Subscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {
  @ViewChild(Content) content: Content;
  userObservable: Observable<User>;
  user:User;
  selectedTab: string;
  active=false;
  firstPlace = {name: '',points: 0,picture: "",number: 0}
  label:any;
  categories: any;
  news = [];
  ranking = [];
  styleClass = "normal";
  userGoal: UserGoal;
  RankShow = false;
  team_ranking = [];
  firstTeam = { uid:"noteam", name:"No existen equipos...", picture:"./assets/img/LogoHabitsOver_Blanco.png", points:"0", number:0 }

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
	  private analytics:AnalyticsProvider,
    public rankingService: rankingProvider,
	  public habitProvider: HabitProvider,
    public loadinService: loadingProvider,
    private newsprovider: NewsProvider,
    private authProvider: AuthProvider,
    private userProvider: UserProvider,
    public modalCtrl: ModalController ,
    private language: SettingsProvider,
    private platform: Platform
    ) {
    this.label = this.language.getLanguage('NewsPage');
    ////console.log.log(this.label)
    this.styleClass = "medix";
    this.selectedTab = "newsTab";
    if (this.navParams.get('tab')) this.selectedTab = this.navParams.get('tab');
    this.user=this.userProvider.static_user();
  }

  ionViewCanEnter() {
    return this.user!=null&&this.user.name!=null&&this.user.name!=""&&this.newsprovider.checkNews();
  }

  ionViewDidLeave(){
    //this.ObvsKiller.unsubscribe();
  }

  ionViewDidLoad() {
	this.analytics.appSeeEvent("El usuario entró a noticias");
    this.userObservable = this.userProvider.user;
      this.userObservable.subscribe(user => {
        this.user=user;
        //console.log.log(this.user);
      });
      this.userObservable
      this.ranking = this.rankingService.ranking;
      if(this.ranking.length>0){
        this.firstPlace = this.ranking[0];
        this.firstPlace.number = 1;
      }
      this.loadNews();
      this.loadTeamRanking()
      if(this.selectedTab==="newsTab"){
        this.active=false;
        this.loadRanking(false);
        this.analytics.saveScreen("Noticias");
      }else{
        this.active=true;
        this.loadRanking(true);
        this.analytics.saveScreen("Ranking");
      }
  }

  selectRank(person,i) {
    this.firstPlace = person;
    this.firstPlace.number = i+1;
    this.content.scrollToTop(300);
  }

  selectTeam(Team,i) {
    this.firstTeam = Team;
    this.firstTeam.number = i+1;
    this.content.scrollToTop(300);
  }

  loadTeamRanking(){
    this.rankingService.get_team_ranking(this.user.company.uid, 10).then(team_ranking => {
      console.log(team_ranking)
      if(team_ranking.length){this.team_ranking=team_ranking;this.selectTeam(this.team_ranking[0],0)}
      else{this.team_ranking.push(this.firstTeam);;console.log(team_ranking)}
    })
  }

  loadRanking(x) {
    if(x){
      this.loadinService.showLoading("Cargando datos del ranking <br> Por favor espere");
    }
    let that = this;let aux =x;
    this.rankingService.get_company_ranking(this.user.company.uid, 10).then(ranking => {
      if(aux){
        that.loadinService.dismissLoading();
        aux=false;
      }
      if(!ranking.error){
        that.ranking = ranking.data;
        if(that.ranking.length>0){
          that.firstPlace = ranking.data[0];
          that.firstPlace.number = 1;
        }
      }else{
        that.loadinService.presentToast("No se pudo cargar los datos. Verifique su conexion a internet e intentelo nuevamente");
      }
      ////console.log.log(this.ranking,this.firstPlace);
    }).catch(Error=>{
      if(aux){
        that.loadinService.dismissLoading();
        aux=false;
        that.loadinService.presentToast("No se pudo cargar los datos. Verifique su conexion a internet e intentelo nuevamente");
        
      }
    });
  }

  splitTitle(title) {
    let split = title.split("_")
    let newTitle = split[0] + " " + split[1];
    return newTitle;
  }

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

  rankingTab = ""; newsTab = "";
  openTab(tabName) {
    this.rankingTab = ""; this.newsTab = "";
    this.selectedTab = tabName;
    switch (tabName){
      case "rankingTab":
        this.active=true;
        this.analytics.saveScreen("Ranking");
        this.loadRanking(true);
        break;
      default:
        this.active=false;
        this.analytics.saveScreen("Noticias");
      break;
    }
    //console.log.log(this.selectedTab)
  }

  changeRank(){
    if(this.RankShow){this.RankShow = false;}
    else{this.RankShow = true;}
  }

  //funcion para cargar articulos
  async loadNews(){
    this.userGoal = this.habitProvider.actualGoal;
    this.newsprovider.loadNews().then(news=>{
      console.log(news)
      this.news= news;
    }).catch(error =>{
      console.log("error",error);
    });
  }

  checkCompany(news):any{  
    return new Promise((resolve, rejected) => {
      let list = [];
      for(let article of news){
      ////console.log.log(article.uid,article.empresas)
        if(article.empresas){
          for (let i =0; i< article.empresas.length; i++){
            if (article.empresas[i] == this.user.company.uid){
              list.push(article);
            }
          }
        }
      }
      resolve(list); 
    });
  }

  //funcion para  obtener el level de un usuario
  getLevel(x) {
    if (x < 100) {
      return 1
    } else if (x < 300) {
      return 2
    } else if (x < 700) {
      return 3
    } else if (x < 1500) {
      return 4
    } else if (x < 3000) {
     return 5
    } else {
      return 5
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

	public goToPage(page: string) {    
	  if(page=='ranking'){
		  console.log('Already in RANK');
	  }else if(page=='DashboardPage'){
      this.navCtrl.setRoot('DashboardPage')
    }else{
      this.navCtrl.pop();
      this.navCtrl.push(page,{},{animate:false});
    }
	}
}