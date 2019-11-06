import { Component, Input } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { UserGoal } from '../../interfaces/user-goal';
import { NewsProvider } from '../../providers/news/news';
import { SettingsProvider } from '../../providers/settings/settings';

@Component({
  selector: 'card-news',
  templateUrl: 'card-news.html'
})
export class CardNewsComponent {
  @Input("ready") ready: boolean;
  @Input("user_goal") userGoal: UserGoal;
  //@Input("user") 
  user: any;
  label:any;
  
  constructor(private navCtrl: NavController,
    public toastCtrl: ToastController,
    public newsprovider: NewsProvider,
    private language: SettingsProvider
    ) {
      this.label = this.language.getLanguage('CardNewsComponent');
      //console.log(this.label)
  }

  ngOnChanges(): void {    
    if (this.user) {
      this.label = this.language.getLanguage('CardNewsComponent');
    }
  }
  

  goToPage(page) {
    this.navCtrl.push('NewsPage',  {userGoal: this.userGoal});
  }


  showToast(text, position, showOk, duration) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: duration,
      position: position,
      showCloseButton: showOk,
      closeButtonText: 'OK'
    });
    toast.present();
  }

}
