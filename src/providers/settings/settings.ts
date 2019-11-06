import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { español } from '../../app/languages/es';
import { english } from '../../app/languages/en';
import { UserProvider } from '../user/user';
import { User } from '../../interfaces/user';
import { loadingProvider } from '../alert/alert';

const confetti = require('canvas-confetti');
/*
  Generated class for the SettingsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SettingsProvider {
  langSet="es";
  canvas_conffeti: any;
  myConfetti: any;

  constructor(
    public http: HttpClient,
    private userProvider:UserProvider,
    private alert:loadingProvider
  ) {
	
  }

  getLanguageSetting(){
    return this.langSet;
  }

  getLanguage(page,lang?):any{
    if(lang!=undefined) this.langSet = lang;
    if(this.langSet == 'es'){return español[page];}
    else if(this.langSet == 'en'){return english[page];}
  }

  getMenuTitle(title){
    if(this.langSet == 'es'){return español[title];}
    else if(this.langSet == 'en'){return english[title];};
  }

  async setLanguage(lang){
    let user = await this.userProvider.static_user();
    let userUpdate: User ={      
      company: user.company,
      name: user.name,
      last_name:user.last_name,
      //points: user.points,
      uid: user.uid,
      language: lang
    }
    await this.userProvider.updateUser(userUpdate);
    this.alert.presentToast(this.getLanguage('languageSet',lang))
    return;
  }
  
  school(){
	    this.myConfetti({
					particleCount: 5,
					angle: 60,
					ticks: 200,
					zIndex :10200,
					spread: 55,
					origin: {
						x: 0,
						y:0.8
					},
					// colors: colors
				});
		this.myConfetti({
					particleCount: 5,
					angle: 120,
					ticks: 200,
					spread: 55,
					zIndex :10200,
					
					origin: {
						x: 1,
						y:0.8
					},
				   // colors: colors
		});
  }
  
  confetti_school(){
		this.myConfetti=  confetti.create(this.canvas_conffeti, { resize: true });
		this.canvas_conffeti.style.display = 'block';
		let i = 1;
		let interval= null;
        let  interval2=  setInterval(() => {  
			if (i > 10){
				
				clearInterval(interval);
				clearInterval(interval2);
				setTimeout(()=>{
					this.canvas_conffeti.style.display = 'none';
				},3000)
			}else{
				if (i > 1){
					clearInterval(interval);
				}
				if (i < 10){
					interval = setInterval(() => {  
						this.school();
					}, 25*1 )
				}
			}
			i++;
			
		},150);
  }
  
  

}
