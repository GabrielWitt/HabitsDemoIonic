import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TestProvider } from '../../providers/test/test';
import { User } from '../../interfaces/user';
import { Test } from '../../interfaces/test'
import { Question } from '../../interfaces/question';
import { UserTest } from '../../interfaces/user_test';
import { UserProvider } from '../../providers/user/user';
import { AnalyticsProvider } from '../../providers/analytics/analytics';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { SettingsProvider } from '../../providers/settings/settings';

@IonicPage()
@Component({
	selector: 'page-quiz',
	templateUrl: 'quiz.html',
})
export class QuizPage {
	user: User;
	test: Test;
	questions: Question[]=[];
	actualQuestion: Question={text:"",type:"",uid:"",points:""};
	indexQuestion: number;
	questionsNumber = 0;

	oneToTen = 6;
	button = true;
	yesNo = false;
	selectInpunt = "1200"
	next: number;
	result1: number;
	result2: number;
	result = {};
	Breturn:boolean= false;
	label:any;

	Answers = [];
	Questions = []

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		private testService: TestProvider,
		private userprovider: UserProvider,
		private analytics:AnalyticsProvider,
		private ngzone: NgZone,
		public menu: MenuController, 
		public language: SettingsProvider
	) {
		this.analytics.saveScreen("Test");
		this.label = this.language.getLanguage('QuizPage');
	}

	async ionViewCanEnter() {
	this.menu.enable(false);
	this.user = this.userprovider.static_user();
	let test = this.user.test;
	if(this.navParams.get('test')) test = this.navParams.get('test');
	if(this.navParams.get('Breturn')) this.Breturn = this.navParams.get('Breturn');
	
    if(test && test != "NOT-ASSIGNED"){
	  let that = this;
	  this.testService.all_test().then(allTest=>{
		  console.log(allTest,allTest.length)
	  	let quests = []
	  	for (var i = 0; i < allTest.length; ++i) {
	  		let testData=allTest[i];
			console.log(testData['uid']+" == "+test);
	  		if(testData['uid'] == test){  
				console.log("testData",testData);
				if(testData.language){
					this.language.setLanguage(testData.language);
					this.label = this.language.getLanguage('QuizPage',testData.language);
				}
				let QUESTIONS = testData["question"];
				let qkeys = Object.keys(QUESTIONS)
				for(let qkey of qkeys){
					quests.push(QUESTIONS[qkey])
				}
				that.test = testData;	
				that.questions = quests;
				that.actualQuestion = that.questions[0];
				that.indexQuestion = 0;
				that.questionsNumber = that.questions.length;
				that.button = (that.questionsNumber == 1)?false:true;
				return true;
			}
	  	}
	  })
    }else{
	 //console.log.log("no pasar");
      this.navCtrl.pop();
      return false;
    }
	}


	nextQuestion() {
		let i = this.indexQuestion + 1;
		 ////console.log.log(this);
		this.ngzone.run(() =>{                       
			if (this.actualQuestion.type != "no") {
				if (this.actualQuestion.type.html == 'range') {
					this.Answers.push({ answer: this.oneToTen, max: this.actualQuestion.points});
				} else if (this.actualQuestion.type.html == 'toggle') {
					let ans = 0;
					if(this.yesNo == this.actualQuestion.type.max) ans = this.actualQuestion.points;
					this.Answers.push({ answer: ans, max: this.actualQuestion.points });
					this.yesNo = false;
				} else if (this.actualQuestion.type.html == 'select') {
					this.Answers.push({ answer: this.selectInpunt, max: this.actualQuestion.points });
				}
			}
			
			if (i < this.questionsNumber - 1) {
				++this.indexQuestion;
				this.actualQuestion = this.questions[this.indexQuestion];
				if (this.actualQuestion.type.html == 'range'){
				 	this.oneToTen = Math.round((this.questions[this.indexQuestion].type.max-this.questions[this.indexQuestion].type.min)/2)+this.questions[this.indexQuestion].type.min;
				}else if (this.actualQuestion.type.html == 'select') {
					this.selectInpunt = this.actualQuestion.points;
				}
			} else { 
				++this.indexQuestion; 
				this.actualQuestion = this.questions[this.indexQuestion];
				this.button = false;
			}
		})
	}
        
    prevQuestion() {
		let i = this.indexQuestion - 1;
		this.ngzone.run(() =>{
			--this.indexQuestion; 
			this.actualQuestion = this.questions[this.indexQuestion];
			this.button = true;
            if (this.actualQuestion.type != "no") {
                let oldAns = this.Answers.pop();
				if (i < this.questionsNumber - 1) {
					if (this.actualQuestion.type.html == 'range'){
						this.oneToTen = oldAns.answer;
					}else if (this.actualQuestion.type.html == 'select') {
						this.selectInpunt = oldAns.answer;
					}else if (this.actualQuestion.type.html == 'toggle') {
						this.yesNo = false;
					}
				}
			}
			
			
		})
	}

	// indicador para mostrar el boton siguiente
	button1() {
		return this.button;
	}

	// indicador para mostrar el boton enviar respuestas
	button2() {
		if (this.button) {
			return false;
		} else {
			return true;
		}
	}

	SendData() {
		//console.log.log(this.Answers,this.test)
		this.analytics.EventWithData("Test",this.test.name);
		if(this.test.type != "diet_test"){
			//console.log.log("wellness")
			let resultado = 0;
			let suma = 0;
			for (let i = 0; i < this.Answers.length; i++) {
					suma = suma + this.Answers[i].max;
					resultado = resultado + this.Answers[i].answer;
			}
			let total = Math.round((resultado * 100) / suma);
			let userTest: UserTest ={
				user: this.user.uid,
				result: total,
				timestamp: new Date().toISOString(),
				test: this.test.uid,
				company: this.user.company.uid
			}
			this.testService.save_user_wellness(userTest);
			this.navCtrl.push("ResultsPage",{test:this.test, result:total, uid:this.user.uid, Breturn:this.Breturn})
		}else{
			//console.log.log("diet")
			let diet_result = "";
			diet_result = this.Answers[3].answer +"-"+ this.checkDietAnswer(this.Answers[0].answer) +"-"+ this.checkDietAnswer(this.Answers[1].answer) +"-"+ this.checkDietAnswer(this.Answers[2].answer);
			this.navCtrl.push("ResultsPage",{test:this.test, result:diet_result, user:this.user, Breturn:this.Breturn})
		}
	}

	checkDietAnswer(x){
		if(x == 1){
			return "si";
		}else{
			return "no";
		}
	}


}
