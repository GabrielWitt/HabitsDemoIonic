import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { LearningProvider } from '../../providers/learning/learning';
import { User } from '../../interfaces/User';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnalyticsProvider } from '../../providers/analytics/analytics';

@IonicPage()
@Component({
  selector: 'page-topic',
  templateUrl: 'topic.html',
})
export class TopicPage {
  @ViewChild('player1') player1;
  player: any;
  topic: any;
  ref: any;
  user: User;
  video: SafeResourceUrl = "";
  star="./assets/imgs/star.png";
  grey="./assets/imgs/empty.png";
  stars = 0;
  
  done = false;
  playing = "";icon = "";
  CurrentTime = 0;
  VideoPercent=[false,false,false,false,false,false,false,false,false]
  trick = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,    
    public toast: ToastController,
    public learning: LearningProvider,
    private analytics:AnalyticsProvider,
    protected sanitizer: DomSanitizer
    ) {
    this.topic = this.navParams.get('topic');
    this.ref = this.navParams.get('index');
    this.user = this.navParams.get('user');  //-nocookie
    //console.log(this.topic)
    if(this.topic.type == 'video') this.video = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/'+this.topic.url+'?enablejsapi=1&origin=https://localhost:8100'/*+'&origin=https://www.youtube.com/'*/)
  }

  ionViewDidLoad() {
    if(this.getLock()){
      this.init()
    }else{
      console.log("carga normal")
    }
  }
  
  init() {
    this.player = window['YT']
    let Tag = document.getElementsByTagName('script')[0];
      if(Tag.src.indexOf('widgetapi.js') == -1){
        let tag = document.createElement('script');
        tag.src = './assets/fonts/iframe_api.js';//'https://www.youtube.com/iframe_api';
        let firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        this.startAPI();
        //console.log("cargado")
      }else{
        //console.log(window)
        console.log("Alreadyloaded",this.player)
        this.loadPlayer();
      }
  }

  startAPI(){    
    let that = this;
    window['onYouTubeIframeAPIReady'] = (e) => {
      that.loadPlayer();
    };
  }
  
  loadPlayer(){    
    //console.log("carga video")
    let that = this;
    this.player = new window['YT'].Player('player', {
      width: '100%',
      videoId: this.topic.url,
      //allow
      playerVars:{'playsinline':1, 'enablejsapi': 1, 'modestbranding': 0 ,'fs':0,'rel': 0, 'showinfo': 0,'forceSSL':true},// 'controls': 0,
      events: {
        'onReady': function(event){
          event.target.playVideo();
          //console.log(event)
        },
        'onStateChange': function(event){
          that.done=true;
          switch(event.target.getPlayerState()){
            case -1:  that.playing = "Detenido";    break;  //-1 - unstarted (sin empezar)
            case 0:   that.playing = "done";        break;  //0 - ended (terminado)
            case 1:   that.playing = "play";        break;  //1 - playing (en reproducción)
            case 2:   that.playing = "Pausa";       break;  //2 - paused (en pausa)
            case 3:   that.playing = "Cargando..."; break;  //3 - buffering (almacenando en búfer)
            default: console.log("Estado: "+event.target.getPlayerState()); break; //5 - video cued (video en fila)
          }  
        },
        'onError': this.onPlayerError
      }
    });
  }
  
  onPlayerError(event) {
    console.log(event);
  }
  
  checkPercent(){
    let percent = ""; this.icon = "videocam"; 
    if(this.player && this.done){   
      switch(this.playing){
        case "Detenido":      this.icon = "videocam"; percent = this.playing; break;
        case "done":          this.icon = "checkmark"; percent = "Listo!"; this.backTenSecs(); this.player.pauseVideo(); if(!this.checkVideoComplenion()){ this.trick=true; this.showToast('Para poder terminar el curso, vealo de principio a fin. Presione "Reproducir", por favor."', "middle", false, 3500);}; break;
        case "play":          this.icon = "play"; this.CurrentTime = Math.round((this.player.getCurrentTime()*100)/this.player.getDuration()); this.checkViewed(); percent = ""+this.CurrentTime+"%"; break;
        case "Pausa":         this.icon = "pause"; percent = this.playing; break;
        case "Cargando...":   this.icon = "videocam"; percent = this.playing; break;
        default: this.icon = "videocam"; percent = "Cargando..."; break;
      }      
    }
    return percent;
  }

  checkViewed(){
    if(this.CurrentTime>9&&this.CurrentTime<20){
      this.VideoPercent[0]=true;
    }else if(this.CurrentTime>19&&this.CurrentTime<30){
      this.VideoPercent[1]=true;
    }else if(this.CurrentTime>29&&this.CurrentTime<40){
      this.VideoPercent[2]=true;
    }else if(this.CurrentTime>39&&this.CurrentTime<50){
      this.VideoPercent[3]=true;
    }else if(this.CurrentTime>49&&this.CurrentTime<60){
      this.VideoPercent[4]=true;
    }else if(this.CurrentTime>59&&this.CurrentTime<70){
      this.VideoPercent[5]=true;
    }else if(this.CurrentTime>69&&this.CurrentTime<80){
      this.VideoPercent[6]=true;
    }else if(this.CurrentTime>79&&this.CurrentTime<90){
      this.VideoPercent[7]=true;
    }else if(this.CurrentTime>89){
      this.VideoPercent[8]=true;
    }
  }

  checkVideoComplenion(){
    if(this.VideoPercent[8]&&this.VideoPercent[7]&&this.VideoPercent[6]&&this.VideoPercent[5]&&
      this.VideoPercent[4]&&this.VideoPercent[3]&&this.VideoPercent[2]&&this.VideoPercent[1]&&this.VideoPercent[0]){
      return true;
    }else{
      return false;
    }
  }
  
  restartVideo() {
    this.player.stopVideo();
    this.playing = "Stop"
  }
  
  playVideo() {
    if(this.trick){
      let percent = 0; let x = true;
      for(let i=0;i<9;i++){
        if(this.VideoPercent[i]){if(x)percent++ }
        else{x=false;break; }
      }
      let time = percent / 10 ; //console.log("counts: "+percent+" percent: "+time+" duration: "+this.player.getDuration());      
      time = this.player.getDuration()*time;
      this.backTenSecs(time);
      this.trick = false;
      this.player.playVideo();
    }else{
      this.player.playVideo();
    }
  }
  
  pauseVideo() {
    this.player.pauseVideo();
  }  

  backTenSecs(time?){
    console.log("time:"+time)
    let seconds = this.player.getCurrentTime()-10;
    if(time){seconds = time;}
    console.log(seconds)
    this.player.seekTo(seconds,true)
  }

  onClick(){
    console.log("ClickBloqueado")
    switch(this.player.getPlayerState()){
      case -1:  this.player.playVideo();  break;  //-1 - unstarted (sin empezar)
      case 0:   this.player.stopVideo(); this.player.playVideo();break;          //0 - ended (terminado)
      case 1:   this.player.pauseVideo(); break;          //1 - playing (en reproducción)
      case 2:   this.player.playVideo();  break;         //2 - paused (en pausa)
      default: console.log("Estado: "+this.player.getPlayerState()); break; //5 - video cued (video en fila)
    }
  }
  
  ionViewDidEnter() {
    this.analytics.saveScreen("Clase");
   }

  getLock(){
    if(this.ref.topic <= this.ref.advance){
      return false
    }else{
      return true
    }
  }

  startcheck(i){
    if(i <= this.stars){
      return this.star;
    }else{
      return this.grey;
    }
  }

  setStar(i){
    this.stars = i;
  }

  DoneVideo(){ 
    if(this.stars == 0){
      let message = 'Para completar la lección debes darle una calificicación con las estrellas.';
      this.showToast(message, 'bottom', true, undefined);
    }else{
      this.learning.register_lesson(this.ref,this.stars,this.user.uid); this.ref.advance = this.ref.topic;
      if(this.ref.topic_number == this.ref.topic) this.learning.finishLesson(this.user.uid,this.ref.uid)
      let message = 'Has terminado la clase "' + this.topic.name+'", ¡bien hecho!';
      this.analytics.EventWithData(this.topic.name.replace(" ","_"),this.stars)
      if(this.ref.topic == this.ref.topic_number) this.analytics.EventWithData("Fin_Clases",this.ref.title);
      this.showToast(message, 'bottom', true, 3000);
      this.navCtrl.pop();
      this.navCtrl.pop();
      //this.navCtrl.push('LessonPage',{lesson:this.ref,user:this.user})
    }
  }

  showToast(text, position, showOk, duration) {
    let toast = this.toast.create({
      message: text,
      duration: duration,
      position: position,
      showCloseButton: showOk,
      closeButtonText: 'OK'
    });
    toast.present();
  }

  BackButton(){
    if(this.getLock()) this.player.destroy()
    this.navCtrl.pop();
    /*let firstScriptTag = document.getElementsByTagName('script')//[0];
    for(let x=0;x<firstScriptTag.length;x++){
      if(firstScriptTag[x].src.indexOf('widgetapi.js') != -1) firstScriptTag[x].parentNode.removeChild(firstScriptTag[x]); break;
    }
    this.deleteIframeApi();
  }

  deleteIframeApi(){
    let firstScriptTag = document.getElementsByTagName('script')//[0];
    for(let x=0;x<firstScriptTag.length;x++){
      if(firstScriptTag[x].src.indexOf('iframe_api.js') != -1) firstScriptTag[x].parentNode.removeChild(firstScriptTag[x]); break;
    }*/
  }

}