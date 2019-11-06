import { Platform } from 'ionic-angular/platform/platform';
//import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { AngularFirestore/*, AngularFirestoreCollection*/ } from '@angular/fire/firestore';
import { AngularFireDatabase } from "@angular/fire/database";
import { TestProvider } from '../../providers/test/test';
import * as firebase from 'firebase';

const NEWS_NODE = 'news';
const DOCS_NODE = 'noticias';
const ARTICLE_READ_NODE = 'user_read_article';

@Injectable()
export class NewsProvider {


  constructor(
    public afs: AngularFirestore,
    private fireDB: AngularFireDatabase,
    private testService: TestProvider,
    private platform: Platform,
    ) {

  }

  //private NewsSet : AngularFirestoreCollection<any>
  NewsObservable : any;
  newsListener:any=[];
  NewsItems:any=[];
  subcategoryActual:string=null;
  readyNews:boolean=false;

  checkNews(){
    return this.readyNews
  }

  news:any;
  startNews(goal, empresa):any{  
    return new Promise((resolve, rejected) => {
      this.news = null; this.NewsObservable = null;
      if(goal&&goal.category&&goal.subcategory){
        this.testService.load_all_test();
        this.subcategoryActual = goal.subcategory;
        let ref =`${NEWS_NODE}/${goal.category}/${DOCS_NODE}`;
        console.log("cat: "+goal.category+" sub: "+this.subcategoryActual+" empresa: "+empresa)
        this.news = firebase.firestore().collection(ref).where("subcategories."+this.subcategoryActual,"==",true).where("empresas."+empresa,"==",true);
        this.readyNews = true;
        resolve("News_Loaded"); 
      }else{
        this.readyNews = true;
        resolve("no_news_load"); 
      }
    });
  }
  
  /*newsContainer():any{  
    return new Promise((resolve, rejected) => {   
      this.newsListener = [];
      this.NewsObservable.subscribe(news => {
        resolve(news)
        //setTimeout(() => { ;}, 1000);      
      });
    });
  }*/

  loadNews():any{  
    return new Promise((resolve, rejected) => {
      if(this.subcategoryActual){
        this.news.get().then(snapshot =>{
          let news = []
          snapshot.forEach(doc => {
            //console.log(doc.id, '=>', doc.data());
            //console.log(doc.data().subcategories)
            news.push(doc.data())
          });
          news = news.sort(function(a, b) {
            a = new Date(a.create_date);
            b = new Date(b.create_date);
            return a>b ? -1 : a<b ? 1 : 0;
          });
          //console.log(news);
          resolve(news)
        })
      }else{
        resolve([]);
      }
    });
  }

  public save_read_article(user_uid: string, article_uid:string,aprobado:Boolean,points:number) {
    return new Promise((resolve, rejected) => {
        let now = new Date();
        let day = ""+now.getDate(); if(parseInt(day) < 10) day = "0"+day;
        let month = ""+(now.getMonth()+1); if(parseInt(month) < 10) month = "0"+month;
        //let read_article_uid = now.getFullYear() + '-' + month + '-' + day
        let read_article = {
          resul_test:{
            aprobado:aprobado,
            points:points,
            timestamp: now.toISOString(),
          },
          lecturas:{
            lastLectura: now.toISOString(),
            cant:1
          }
        }
        let ref = this.fireDB.database.ref(ARTICLE_READ_NODE).child(user_uid).child(article_uid)
        ref.once('value').then(function(snapshot) {
            let existia=false;
            if(snapshot.exists()){
                //ya existe debo actualizar
                read_article.lecturas.cant=snapshot.val().lecturas.cant+1;
                read_article.lecturas.lastLectura=new Date().toISOString();
                read_article.resul_test=snapshot.val().resul_test;
                existia=true;
            }
            ref.update(read_article).then(() => {
              resolve(existia);
            }).catch(error=>{
              rejected(error);
            })
        }).catch(error=>{
          rejected(error);
        })
    });
  }

  testRealizado(user_uid,article_uid):any{
    return new Promise((resolve, rejected) => {
      let ref = this.fireDB.database.ref(ARTICLE_READ_NODE).child(user_uid).child(article_uid).child("resul_test");
      ref.once('value').then(function(snapshot) {
        resolve(snapshot.exists());
      }).catch(error=>{
        resolve(false);
      })
    });
  }

  public cleanOut(){
    //this.NewsSet=null;
    this.news = null;
    this.NewsObservable=null;
    this.NewsItems=[];
  }


  ///////////////////////// FAQ SERVICES /////////////////////////////////////////
  loadFaq(){
    return new Promise((resolve,reject)=>{
      let plat = "none"; if(this.platform.is("android")){plat="android"}else{plat="iOS"}
      firebase.firestore().collection('FAQ').where("device."+plat,"==",true).get()
      .then(snapshot => {
        let categories = [];
        snapshot.forEach(doc => {
          //console.log(doc.id, '=>', doc.data());
          categories.push(doc.data())
        });
        //console.log(categories);
        resolve(categories)
      })
      .catch(err => {
        reject(err)
        console.log('Error getting documents', err);
      });
    })
  }
}
