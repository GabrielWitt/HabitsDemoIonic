import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TestProvider } from '../../providers/test/test';
import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-tests',
  templateUrl: 'tests.html',
})
export class TestsPage {

  TestItems:any=[];
  constructor(public navCtrl: NavController, 
			  public navParams: NavParams,
			  public testprovider: TestProvider,
			  public userprovider: UserProvider) {
  }

  ionViewDidEnter() {
	console.log(this);
	this.testprovider.tests_with_answer_user(this.userprovider.userJson.uid).then( tests =>{
		this.TestItems = tests;
		console.log(tests);
	});
  }
  
  irAlTest(test){
	if (test.next >= test.dias_prox){
	 this.navCtrl.push("QuizPage", {test: test.uid, Breturn: true});
	}
  }
  
  irAlResult(test){
	console.log(test);
	 this.navCtrl.push("ResultsPage", {test: test, result: test.results[0].result, Breturn: true});
  }
  
  
  

}
