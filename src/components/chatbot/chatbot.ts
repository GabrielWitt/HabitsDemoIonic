import { Component, Input, NgZone, ViewChild } from '@angular/core';
import { User } from '../../interfaces/user';
import { UserProvider } from '../../providers/user/user';
import { loadingProvider } from '../../providers/alert/alert';
import { Content } from 'ionic-angular';
//import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the ChatbotComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */ 
@Component({
  selector: 'chatbot',
  templateUrl: 'chatbot.html'
})
export class ChatbotComponent {
  @Input("messages") messages: any;
  @Input("subtitle") subtitle: any;
  @ViewChild(Content) content: Content;
  user: User
  text: string;
  msmListListener = 0;
  defaultSMS = 0;
  messageCount = 0;
  new_msj:number=0;
  limit_msj:number=0;
  chatHeigth:number = 0;
  badge:number = 0;
  firstLoad = true;
  bottom = true;
  isRefresher = false;
  scrollBottombutton = false;
  showmessages = [];

  constructor(
    private userprovider:UserProvider,
    private loadingprovider:loadingProvider,
    private ngzone:NgZone,
    //private authProvider: AuthProvider
  ) {
    this.user = this.userprovider.static_user()
    //let signal = this.authProvider.signalCheck();
    //if(signal) console.log("Señal:"+signal)
  }

  ngOnChanges(): void {    
    //console.log(this.messages)
    if (this.messages){
      let that = this;
      //Primera Carga
      if(this.firstLoad && this.messages.length != 0){
        //console.log(this.messages)
        if(this.messages.length > 20 ){ this.defaultSMS = 20;}
        else{this.defaultSMS = this.messages.length;}
        this.limit_msj = this.paginationMessages(true);
        this.showmessages = this.messages.slice(this.limit_msj);
        //console.log(this.showmessages)
        this.firstLoad = false;
        setTimeout(() => {that.goBottom();},700)
        //console.log("Primera carga, mensajes: "+this.messages.length)
      }
      if(this.messageCount != this.messages.length && this.messageCount != 0){
        this.new_msj = this.messages.length - this.messageCount;
        //console.log("mensajes nuevos: "+this.new_msj);
        if(this.new_msj>5){
          this.loadingprovider.showLoading("Cargando mensajes...");
          this.limit_msj = this.paginationMessages(true);
          this.showmessages = this.messages.slice(this.limit_msj);
          setTimeout(() => {that.loadingprovider.dismissLoading();that.goBottom();},300)
        }else{
          let newmsj = this.messages.slice(this.messages.length-this.new_msj)
          this.loadMessage(newmsj);
          this.limit_msj = this.paginationMessages();
        }
        if(!this.bottom) setTimeout(() => {that.goBottom();},300)
      }
      this.messageCount = this.messages.length;
      //console.log("Total memsajes: "+this.messages.length+" Show memsajes: "+this.showmessages.length);
    }
    if(this.subtitle == "escribiendo..."){
      if(!this.bottom) this.goBottom();
    }
  }

  async loadMessage(messages){
    for(let i = 0;i<messages.length;i++){
      this.showmessages.push(messages[i]);
      if(this.showmessages[this.showmessages.length-2].message == this.showmessages[this.showmessages.length-1].message){
        //console.log("Detectado duplicado")
        this.showmessages[this.showmessages.length-2]=this.messages[this.messages.length-2];
      }
    }
  }

  checkconection(){ 
    return window.navigator.onLine
  }

  paginationMessages(x?){
    if(x==undefined) x=false;
    let start = 0;
    //console.log("contador: "+start+", mensajes nuevos: "+this.new_msj+", mensajesPrevios: "+this.defaultSMS+", mensajesActuales: "+ this.msmListListener)
    if(this.new_msj){
      this.msmListListener = this.msmListListener + this.new_msj;
      //console.log("bottomButton? "+this.bottom+", firstload:"+!x)
      if(this.bottom && !x){
        this.badge = this.badge + this.new_msj;
      }
      this.new_msj = 0;
    }
    start = this.defaultSMS + this.msmListListener;
    let init = this.messages.length - start
    //console.log("init: "+init+" badge: "+this.badge);
    return init;
  }

  goBottom(){
    let that = this;
    this.scrollBottombutton = true;
    if (this.content != null && this.content._scroll != null) {
      let contentHeight = this.content.getContentDimensions().contentHeight; 
      this.content.scrollToBottom(500).then(() => {
        this.bottom = false;
        this.badge = 0;
        if(this.showmessages[this.showmessages.length-1].type=="img"){
          setTimeout(() => {
            if(!that.isElementInViewPort(document.getElementById('check-point'),contentHeight)) that.content.scrollToBottom(300)
          },1200)
        }
      });     
    } else {
      //console.log("no-content")
    }
  }
  
  //This function just check if element is fully in vertical viewport or not
  isElementInViewPort(element: HTMLElement,  viewPortHeight: number) {
    let rect = element.getBoundingClientRect(); 
    let fin = rect.top >= 0  && ((rect.bottom-50) <= viewPortHeight)
    if(fin) this.badge = 0;
    //console.log("Posisión fin: "+rect.bottom+" <= viewPortHeight: "+viewPortHeight+" = bottom?: "+fin)
    return fin;
 }

  onScrollStart() {
    let that = this;
    if(this.scrollBottombutton){
      this.bottom = false; //Está en fondo.  
      this.scrollBottombutton = false;
    }else{
      setTimeout(() => {
        let contentHeight = this.content.getContentDimensions().contentHeight;
        that.bottom = !that.isElementInViewPort(document.getElementById('check-point'),contentHeight);
      },300)    
    }  
  }

  doRefresh(refresher) {
  this.loadingprovider.showLoading("Cargando...");
	this.isRefresher = true;
    this.ngzone.run(() => {
    this.defaultSMS = this.defaultSMS+20;
    if(this.defaultSMS > this.messages.length ){
      this.defaultSMS = this.messages.length;
      this.loadingprovider.presentToast("Se han cargado todos los mensajes existentes.")
    }
	  this.limit_msj = this.paginationMessages();
    this.showmessages = this.messages.slice(this.limit_msj);
        setTimeout(() => {
          if (this.content) {			
            if(refresher)refresher.complete();
            this.loadingprovider.dismissLoading();
			      this.isRefresher = false;
          }
        },800) 
    }) 
  }
}