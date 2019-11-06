import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Step } from '../../interfaces/step';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscribe } from '@firebase/util';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import * as firebase from 'firebase';
import * as moment from 'moment';


@Injectable()
export class FunctionsProvider {

  constructor(
    public http: HttpClient,    
    private afs: AngularFirestore, 
    private afd: AngularFireDatabase,
  ) {  }

  loaded=true;  observer: Observable<any>; test:Subscribe<any>;

  async startfuncion(){ 
    //firebase.firestore().collection("user").where("company.uid","==",'T4vAZiZqBa1iCRhZx7BZ')
    /*firebase.firestore().collection("user_health").orderBy("user").orderBy("month")
    .get().then(getData=>{
      let health = []; 
      getData.forEach(month=>{
        let data = month.data()
        health.push(data)
      })
      //console.log(users);
      //this.changeTest(users);
      console.log(JSON.stringify(health));
    })
    console.log("functions")
    let company_uid = '8UNFEKicTd0LpFbH02JK';*/
    //this.healthStepsRanking(company_uid)
    firebase.firestore().collection("news/23SqDGHowjetoDLnmJId/noticias").get().then(getData=>{
      let news = []; 
      getData.forEach(noticia=>{
        let not = noticia.data();
        let empresas = []; let subs = [];
        if(not.empresas){
          empresas = Object.keys(not.empresas);let aux={};
          for(let empresa of empresas){
            aux[empresa]=true;
          }
          aux['-LMImXWqGEKNG5bxi4wL']=true;
          not.empresas = aux;
        }else{
          not.empresas = {['-LMImXWqGEKNG5bxi4wL']:true}
        }
        if(not.subcategories){
          subs = Object.keys(not.subcategories);let aux={};
          for(let subcategory of subs){
            aux[subcategory]=true;
          }
          aux['-L7bbGkxT8n5kx8-Q8wF']=true;
          not.subcategories = aux;
        }else{
          not.subcategories = {['-LMImXWqGEKNG5bxi4wL']:true}
        }
        if(5>news.length)firebase.firestore().collection("news/-L7bZqwOe6t0cuEuVi3s/noticias").doc(not.uid).set(not);console.log(news.length);
        news.push(not)
      })
      console.log(news)
    });
  }
  
  async changeTest(users:any[]){    
    let count = 0;
    for(let data of users){
      await firebase.firestore().collection("user").doc(data.uid).update({test:'41rQFpHHmoz5I7LZSj5V'}).then(()=>{
        count++;console.log(data.uid+" user: "+data.name+" "+data.last_name+" company: "+data.company.name);return;
        
      })
      console.log(count+" de "+users.length)
    }
  }

HealthAnalitics = [];
healthStepsRanking(company_uid){
  return new Promise((resolve)=>{
    let today = moment().format('L');
    this.afd.database.ref('health_analitycs/'+company_uid+"/timestamp").once('value',timestamp=>{
      //Se ejecuta si la fecha es menor a la actual
      //console.log("Hoy:"+moment(today).toDate()+" > Timestamp:"+moment(timestamp.val()).toDate()+" = "+(moment(today).toDate()>moment(timestamp.val()).toDate()))
      if(!timestamp.val()||(moment(today).toDate()>moment(timestamp.val()).toDate())){
        let auxData = firebase.firestore().collection('user').where('company.uid',"==",company_uid);
        auxData.get().then(users_data=>{
          let users = [];
          users_data.forEach(user=>{
            users.push(user.data())
          })
          this.mixData(users,today,company_uid).then(()=>{
            resolve("done")
          }).catch(error=>{console.log(error);resolve("Error:"+error)})
        })
      }else{
        resolve("already updated")
      }
    })
  })
}

//Une las listas de user / user_health, llama tambien la funcion para generar el archivo de cada filtro.
user_uids = [];
async mixData(users,today,company_uid){
  let year = parseInt(moment(today).format('YYYY')); let m = moment(today).format('M'); // Standard  
  //Recorre los resumen de mes actual de cada usuario.
  for(let user of users){
    let user_data = {
      uid: user.uid,
      name: user.name+" "+user.last_name,
      age: (year - parseInt(moment(user.born_date).format('YYYY'))),  
      picture: user.picture,
      //filtros
      company: user.company.name,
      gender:user.gender,
      department:user.company.department.name,
      position:user.company.position.name
    };
    await this.addUsertoAnalytics(user_data,today,year,m).then(answer=>{
      return ;
    })
  }
  let keys = Object.keys(this.HealthAnalitics);
  for(let key of keys){
    this.HealthAnalitics[key].proms_array = this.HealthAnalitics[key].proms_array.sort(function(a, b){return b-a});
    this.HealthAnalitics[key].ranking = this.HealthAnalitics[key].ranking.sort(function(a,b){let x = a.steps - b.steps; if(x < 0){ x = -1 }else{ x = 1};return x;});
    this.HealthAnalitics[key].ranking = this.HealthAnalitics[key].ranking.reverse();
    if(this.HealthAnalitics[key].ranking.length>10) this.HealthAnalitics[key].ranking = this.HealthAnalitics[key].ranking.slice(0,10);
    this.HealthAnalitics[key].max_steps = this.HealthAnalitics[key].proms_array[0];
    //Agrega el 5%, 25% 50% 75% y 95% por filtro
    this.HealthAnalitics[key]['95']=await this.Percentil(this.HealthAnalitics[key].proms_array,0.95),
    this.HealthAnalitics[key]['75']=await this.Percentil(this.HealthAnalitics[key].proms_array,0.75),
    this.HealthAnalitics[key]['50']=await this.Percentil(this.HealthAnalitics[key].proms_array,0.50)
    this.HealthAnalitics[key]['25']=await this.Percentil(this.HealthAnalitics[key].proms_array,0.25),
    this.HealthAnalitics[key]['05']=await this.Percentil(this.HealthAnalitics[key].proms_array,0.05)
  }//Se agrega la fecha actual
  this.HealthAnalitics['timestamp'] = moment().format('L');
  //console.log(this.HealthAnalitics) 
  //Guarda datos en Realtime por company_uid
  await this.afd.database.ref('health_analitycs/'+company_uid).set(this.HealthAnalitics).then(()=>{
    console.log("Analítica de pasos generados para: "+company_uid+"  en fecha "+today+" con "+keys.length+" filtros.");
    return "Done";
  })
}

//Llama los datos del mes del usuario
addUsertoAnalytics(user_data,today,year,m){
  return new Promise((resolve)=>{
    firebase.firestore().collection("user_health").where('user',"==",user_data.uid).where('year',"==",""+year).where("month","==",parseInt(m)).orderBy("total_steps","desc").limit(1)
    .get().then(present=>{
      let end = parseInt(moment(today).format('D'));
      //console.log("user_uid:"+user_data.uid+" month: "+m+" day:"+end)
      if(7>end){
        let month = m-1;let y = year; if(month==0){month=12;year=""+(parseInt(year)-1)}; 
        firebase.firestore().collection("user_health").where('user',"==",user_data.uid).where('year',"==",""+y).where("month","==",month).orderBy("total_steps","desc").limit(1)
        .get().then(past=>{
          let start = end-7;
          this.getDaySumatory(present,1,end).then(seven_days => {
            this.getDaySumatory(past,start,0).then(seven_days2 => {
              let sum = seven_days + seven_days2;
              if(sum>=1){
                sum = Math.round(sum/7);
                this.userPrepareData(user_data,seven_days,today).then(x=>{
                  resolve("2 month done");
                })
              }else{resolve("empty");}
            })
          })
        })
      }else{
        let start = end-7;
        this.getDaySumatory(present,start,end).then(seven_days => {
          if(seven_days>=1){
            seven_days = Math.round(seven_days/7);
            this.userPrepareData(user_data,seven_days,today).then(x=>{
              resolve("1 month done");
            })
          }else{resolve("empty");}
        })
      }
    })
  })
}

getDaySumatory(Obvs,start,end):Promise<number>{
  return new Promise((resolve)=>{
    let seven_days = 0; let arrax = [];
    if(!Obvs.empty){
      Obvs.forEach(month=>{
        arrax.push(month.data());
        if(arrax.length){     
          let data = arrax[0];
          if(0>start){end = data.month_steps.length; start = end+start;}
          for(let i = start;end>i;i++){
            if(data.month_steps[i]) seven_days += parseInt(data.month_steps[i]);  
          }  
          resolve(seven_days);
        }else{
          resolve(0);
        }
      })
    }else{          
      resolve(0);
    }
  })
}

//Prepara el usuario con los datos de los ultimos 7 días
async userPrepareData(user_data,seven_days,today){
  //console.log(user_data,seven_days)
  if(seven_days){
    //Datos generados por edades
    if(user_data['age']<25){ await this.AnalyticsHealtNode('0_24',seven_days,user_data,today);        
    }else if(user_data['age']>24&&user_data['age']<35){ await this.AnalyticsHealtNode('25_34',seven_days,user_data,today)
    }else if(user_data['age']>34&&user_data['age']<45){ await this.AnalyticsHealtNode('35_44',seven_days,user_data,today)
    }else if(user_data['age']>44&&user_data['age']<65){ await this.AnalyticsHealtNode('45_54',seven_days,user_data,today)
    }else if(user_data['age']>54&&user_data['age']<65){ await this.AnalyticsHealtNode('55_64',seven_days,user_data,today)
    }else{ await this.AnalyticsHealtNode('65&more+',seven_days,user_data,today); }
    //Datos generados por filtros
    let keys = Object.keys(user_data);
    for(let key of keys){
      if(key!='name'&&key!='uid'&&key!='age'&&key!='picture'){
        await this.AnalyticsHealtNode(user_data[key],seven_days,user_data,today)
      }
    }
    return ;
  }else{
    return ;
  }
}

//agrega los datos del usuario a cada filtro
async AnalyticsHealtNode(node,seven_days,user,today){
  node = node.replace(/\./g,'');
  if(this.HealthAnalitics[node]==undefined) await this.generateAnalitics(node);
  this.HealthAnalitics[node].proms_array.push(seven_days);
  this.HealthAnalitics[node].ranking.push({uid:user.uid,name:user.name,picture:user.picture,steps:seven_days});
  return ;
}

//si el filtro no existe crea uno vacio
async generateAnalitics(node){
  this.HealthAnalitics[node] = {
    proms_array:[],
    max_steps:0,
    ranking:[],
  }
  return ;
}

//Percentil
async Percentil(data,percent) {
  let answer = await this.Quartile(data, percent);
  return Math.round(answer);
}

async Quartile(data, q) {
  data = await this.Array_Sort_Numbers(data);
  var pos = ((data.length) - 1) * q;
  var base = Math.floor(pos);
  var rest = pos - base;
  if( (data[base+1]!==undefined) ) {
    return data[base] + rest * (data[base+1] - data[base]);
  } else {
    return data[base];
  }
}

Array_Sort_Numbers(inputarray){
  return inputarray.sort(function(a, b) {
    return a - b;
  });
}

//Llamada a Pasos de hoy 


  //Llamada a Pasos de hoy 
  today_steps(user_uid,today){
    return new Promise((resolve)=>{
      this.afd.database.ref('user_card/'+user_uid).once('value',card=>{
        let user_card = card.val();
        if(user_card.startWeek == today){
          resolve(user_card.steps_today)
        }else{
          resolve(0)
        }
      })
    })
  }

  //Llamada a Pasos de semana actual
  week_steps(user_uid,today){
    return new Promise((resolve)=>{
      let startweek = moment(today).isoWeekday(1).toDate();
      this.afd.database.ref('user_card/'+user_uid).once('value',card=>{
        let user_card = card.val(); 
        let cardweek = moment(user_card.startWeek).isoWeekday(1).toDate();
        if(""+startweek == ""+cardweek){
          resolve(user_card.steps_today)
        }else{
          resolve(0)
        }
      })
    })
  }

  //Llamada a pasos mes actual
  month_steps(user_uid,today){
    return new Promise((resolve)=>{
      let startweek = moment(today).format('M')+"-"+moment(today).format('YYYY');
      let health_obvs = this.afs.collection("user_health",ref=>ref.where("user","==",user_uid)).valueChanges();
      health_obvs.subscribe(months=>{  ///SE DEBE CAMBIAR POR GET
        let month_steps = 0;
        for(let m of months){
          let dataweek = m['month']+"-"+m['year'];
          if(startweek==dataweek){
            month_steps = m['total_steps'];
            break;
          }
        }
        resolve(month_steps);
      })
    })
  }

  once = [];
  checkMessages(uid,obsv):any{
    return new Promise((resolve=>{
      obsv.subscribe(messages=>{
        if(!this.once[uid]){
          this.once[uid]=true;
          this.verifier(uid,messages).then(data=>{
            resolve(data);
          })
        }
      })
    }))
  }

async verifier(uid,messages){
  let cont2=0;this.percent=0;
  console.log("mensajes: "+messages.length);
  for(let sms of messages){
    cont2++;
    if(typeof sms.timestamp === 'string'){
      await this.rewriteDate(uid,sms).then(data=>{
        return;
      })
    }
    console.log("string: "+cont2+" de "+messages.length+" = "+((cont2*100)/messages.length)+"%");
  }
  console.log("mensajes revisados "+cont2+" strings: "+this.percent);
  return "done";
}

  percent = 0;
  rewriteDate(uid,sms):any{
    return new Promise((resolve=>{
      console.log("timestamp en string",sms);
      this.afs.collection("chat_messages/"+uid+"/messages").doc(sms.uid).update({timestamp:new Date(sms.timestamp)}).then(()=>{
        this.percent++;
        resolve();
      })
    }))
  }

  start = true;
  async changeRegisters(users){ 
    if(this.start){
      this.start = false;
      let count = 0;        
      for(let user of users){
        console.log(user.uid);count++;
        await this.afs.collection("user").doc(user.uid).update({points:0}).then(rsl=>{console.log(user.uid+"firestore points reset")})
        await this.afd.database.ref('user_card/'+user.uid+'/points').set(0).then(rsl=>{console.log(user.uid+"user_card points reset")})
        this.percent = Math.round((count*100)/users.length);
        console.log(this.percent+"%")
      }
    }
  }

  teststart = true;
  //Botón Usuarios
  checkUsers(){
    let users = this.afs.collection("user").valueChanges()
    users.forEach(data=>{
      let usersData = data;
      console.log("Usuarios: "+usersData.length);
      if(this.teststart){
        this.teststart = false;
        //one time function
      }
      //this.dataToJson(data)    //users
    })
  }

  //Botón Evidencia
  checkUserEvidence(){
    let users = this.afs.collection("user-evidence",ref=>ref.orderBy('user')).valueChanges()
    users.forEach(data=>{
      console.log("Evidencia: "+data.length);
      this.dataToJson(data)    //users
    })
  }

  //Botón Hábitos
  checkUserHabit(){
    let users = this.afs.collection("user-habit",ref=>ref.orderBy('user')).valueChanges()
    users.forEach(data=>{
      console.log("Hábitos: "+data.length);
      this.dataToJson(data)    //users
    })
  }

  //Botón AppVersion
 async checkAppVersion(){
    let usersData = this.afs.collection("user").valueChanges()
    usersData.forEach(users => {
      let updates = []; let devices = 0;
      for(let user of users){
        let auxUser = {};
        let device = this.afs.collection(`user_device/${user['uid']}/devices`).valueChanges();
        device.forEach(data=>{
          let count = 1;
          data.forEach(device=>{
            auxUser['app_version'+count] = device['app_version']
            auxUser['device'+count] = device['brand']+"-"+device['model']
            count++; devices++;
          })
          auxUser['uid'] = user['uid'];
          auxUser['name'] = user['name']+" "+user['last_name'];
          auxUser['company'] = user['company'].name;
          updates.push(auxUser)
        })
      }
      console.log("Unificando datos espere...");
      setTimeout(()=>{
        console.log("Usuarios: "+updates.length+", Dispositivos: "+devices)
        this.dataToJson(updates)    //app_version
      },10000)  
    })
  }

  //Botón Evidencia-Avance
  checkDietReminder(){
    let users = this.afs.collection("user_diet_reminder").valueChanges()
    users.forEach(data=>{
      console.log("user_reminders: "+data.length);
      this.dataToJson(data)    //users
    })
  }

  // Botón Salud 
  healthUsers = true;
  checkHealth(){
    let health = this.afs.collection("user_health",ref=>ref.where("company","==","-LQfBHxRojOBYPc8P-T7").orderBy('user').orderBy('month')).snapshotChanges().map(docs =>{
      return docs.map(doc=>{
        const data = doc.payload.doc.data() as Step;
        data.uid =doc.payload.doc.id;
        return data;
      })
    })
    health.forEach(data=>{
      console.log("Documentos de Salud: "+data.length);
      if(this.healthUsers){this.healthUsers=false;this.startList(data);}
      ///this.dataToJson(data)
    })
  }

  newstart = true;
  async startList(health){
    if(this.newstart){
      this.newstart = false;
      let user = -1; let byUsers = []; let lastUser = "";
      for(let month of health){
        if(lastUser != month.user){
          lastUser = month.user; user++;
          let prom_step = await this.getProm(month.month_steps);
          if(!prom_step||prom_step < month.steps_day) prom_step = month.steps_day;
          byUsers[user]={uid:month.user,[month.month]:prom_step}
          byUsers[user]['weeks'] = await this.getWeeks(month.month,month.weeks,month.weekdays);          
        }else{
          let prom_step = await this.getProm(month.month_steps);
          if(!prom_step || prom_step < month.steps_day) prom_step = month.steps_day;
          byUsers[user][month.month]=prom_step;
          byUsers[user]['weeks'] = await this.getWeeks(month.month,month.weeks,month.weekdays,byUsers[user]['weeks']);     
        }        
      }
      console.log(byUsers);
      console.log(this.weeksHabits)
      this.checkResults(byUsers)
    }    
  }

  weeksHabits = [[0,1]];
  async getWeeks(mes,pasos,semanas,prev?){
    let weekdata = []; if(prev) weekdata = prev;
    let cal = ((mes-1)*5)+1
    for(let i = 0;i<5;i++){
      let prom = Math.round(pasos[i]/semanas[i]);
      let weeknum = i + cal;
      if(26>weeknum){
        weekdata[weeknum] = prom;
        if(!this.weeksHabits[weeknum]){this.weeksHabits[weeknum]=[prom,1]}
        else{this.weeksHabits[weeknum][0]+=prom;this.weeksHabits[weeknum][1]++;}
      }
    }
    return weekdata;
  }

  async getProm(steps){
    let sum = 0; let division = 0;
    for(let i = 0;i<steps.length;i++){
      if(steps[i]!=0)division++;
      sum += parseInt(steps[i]);
    }
    if(!division) division=1;
    let total = Math.round(sum/division)
    return total;
  }
  
  DATAJSON = [];
  checkResults(byUsers){
    let cont=0;
    let sum1 = 0; let div1 = 0;
    let sum2 = 0; let div2 = 0;
    let sum3 = 0; let div3 = 0;
    let sum4 = 0; let div4 = 0;
    let sum5 = 0; let div5 = 0;
    for(let user of byUsers){
      let m1 =user[1]?user[1]:"0000"
      let m2 =user[2]?user[2]:"0000"
      let m3 =user[3]?user[3]:"0000"
      let m4 =user[4]?user[4]:"0000"
      let m5 =user[5]?user[5]:"0000"
      let show = cont + " m1:"+m1+" m2:"+m2+" m3:"+m3+" m4:"+m4+" m5:"+m5;
      cont++
      if(parseInt(m1)){sum1+=m1;div1++};
      if(parseInt(m2)){sum2+=m2;div2++};
      if(parseInt(m3)){sum3+=m3;div3++};
      if(parseInt(m4)){sum4+=m4;div4++};
      if(parseInt(m5)){sum5+=m5;div5++};
      console.log(show);
      this.setJSON({
        uid:user.uid,
        mes1:m1,
        mes2  :m2,
        mes3:m3,
        mes4:m4,
        mes5:m5,
      },user.weeks)
    }
    let promUser= Math.round((div1+div2+div3+div4+div5)/5);
    console.log("Promedio de User:"+promUser)
    console.log("mes Enero   - total:"+sum1+" usuarios: "+div1+" sum/prom: "+Math.round(sum1/promUser)+" sum/user: "+Math.round(sum1/div1))
    console.log("mes Febrero - total:"+sum2+" usuarios: "+div2+" sum/prom: "+Math.round(sum2/promUser)+" sum/user: "+Math.round(sum2/div2))
    console.log("mes Marzo   - total:"+sum3+" usuarios: "+div3+" sum/prom: "+Math.round(sum3/promUser)+" sum/user: "+Math.round(sum3/div3))
    console.log("mes Abril   - total:"+sum4+" usuarios: "+div4+" sum/prom: "+Math.round(sum4/promUser)+" sum/user: "+Math.round(sum4/div4))
    console.log("mes Mayo    - total:"+sum5+" usuarios: "+div5+" sum/prom: "+Math.round(sum5/promUser)+" sum/user: "+Math.round(sum5/div5)) 
    let promusers=0; let conteo = -1; let totalweeks = [];
    for(let week of this.weeksHabits){
      conteo++; let weekprom = Math.round(week[0]/62);
      promusers+=week[1];totalweeks.push(weekprom);
      if(conteo)console.log("Semana"+conteo+" promedio pasos: "+ weekprom); 
    }
    promusers = Math.round(promusers/25)
    console.log("promedio usuarios semanas:"+promusers)
    this.setJSON({
      uid:"Promedio Total",
      mes1:Math.round(sum1/promUser),
      mes2:Math.round(sum2/promUser),
      mes3:Math.round(sum3/promUser),
      mes4:Math.round(sum4/promUser),
      mes5:Math.round(sum5/promUser),
    },totalweeks)
    console.log(this.DATAJSON)
  }

  setJSON(data, weeks){
    let auxData =data;
    for(let i = 0;i<25;i++){
      if(weeks[i+1]){
        auxData['semana'+i] = weeks[i+1];
      }else{
        auxData['semana'+i] = 0;
      }
    }
    this.DATAJSON.push(auxData)
    this.dataToJson(this.DATAJSON) 
  }

  //Botón Cursos
  checkLearning(){
    let users = this.afs.collection("user_learning").valueChanges()
    users.forEach(data=>{
      console.log("Cursos calificados: "+data.length);
      this.dataToJson(data)    //users
    })
  }

  //Botón Lecciones
  checkLessons(){
    let updates = []; let courses = 0;
    let usersData = this.afs.collection("user").valueChanges()
    usersData.forEach(users => {
      for(let user of users){
        let auxUser = {}
        let device = this.afs.collection(`user_lesson/${user['uid']}/mylearning`).valueChanges();
        device.forEach(data=>{
          let count = 1;
          data.forEach(course=>{
            auxUser['Curso'+count] = course['uid']
            auxUser['Clases'+count] = course['topic_number']
            auxUser['Terminado'+count] = course['done']
            if(course['done']) courses++;
            count++;
          })
          auxUser['uid'] = user['uid'];
          auxUser['name'] = user['name']+" "+user['last_name'];
          auxUser['company'] = user['company'].name;
          updates.push(auxUser)
        })
      }
      console.log("Unificando datos espere...");
      setTimeout(()=>{
        console.log("Usuarios: "+updates.length+", cursos completados: "+courses)
        this.dataToJson(updates)    //app_version
      },10000)  
    })
  }

  //Botón Test
  checkTest(){
    let users = this.afs.collection("user_test",ref=>ref.orderBy('user')).valueChanges()
    users.forEach(data=>{
      console.log("Pruebas: "+data.length);
      this.dataToJson(data)    //users
    })
  }

  //Funcion que transforma de json a URL, 
  dataToJson(data){
    var theJSON = JSON.stringify(data);
    console.log(theJSON)
    var uri = "data:application/json;charset=UTF-8," + encodeURIComponent(theJSON);
    console.log(uri,"presiona Copiar(Copy) y pegar en una pestaña en blanco, despues presionar CTRL+S para guardar.") 
  }

  reloadHealth(){
    let health = this.afs.collection("user_health",ref=>ref.orderBy('user')).snapshotChanges().map(docs =>{
      return docs.map(doc=>{
        const data = doc.payload.doc.data() as Step;
        data.uid =doc.payload.doc.id;
        return data;
      })
    })
    health.forEach(data=>{
      console.log(data)
      let uids = 0;
      for(let month of data){
        if(month.uid) uids++;
        //if(!month.last_update) month.last_update = "2019-4-20";
        //if(!month.day) month.day = month.month_steps.length;
        //this.afs.collection("user_health").doc(month.uid).set(month).then(()=>{console.log("Saved")})
      }
      console.log("datos:"+data.length+", contados:"+uids)
    })
  }  

  async newsProv(){
    let news_cat = ["-L7bZqwOe6t0cuEuVi3s","-L7bZqwdctzKnZC8-N1t","-LGb2FJzLS6Osq1A0sNq","-LLV3WuhohL7m9K5tkNb","ACymCNxxxHJ9x4ywsYvt"];
    await this.ProcessTestAritcles(news_cat[3])
  }

  loadedNews=true;
  ProcessTestAritcles(cat){
    return new Promise((resolve)=>{
      console.log("Category: "+cat);
      this.observer = this.afs.collection('/news/'+cat+'/docs').valueChanges();
      this.observer.subscribe(articles=>{
        console.log("articulos",articles.length)
        if(this.loadedNews){
          this.loadedNews=false;
          this.saveTestInArticle(cat,articles).then(()=>{
            resolve("Done")
          })
        }
      })
    })
  }

  async saveTestInArticle(cat,articles){
    let cont = 0; let NoUpdate = 0; 
    for(let article of articles){
      let new_news = {
        create_date: new Date(),
        category_uid: article.category_uid,
        description: article.description,
        link: article.link,
        picture: article.picture,
        test_article: {
          opciones: article.test_article?article.test_article.opciones:["Verdadero", "Falso", ""],
          correct_answer: article.test_article?article.test_article.response_corret:"Verdadero",
          text: article.test_article?article.test_article.text:"¿Este articulo te fue de ayuda?",
          name: "Test de artículo",
          points: 2,
          empresas:[]
        },
        title: article.title,
        uid: article.uid,
        empresas:{},
        subcategories:{}
      }
      if(article.empresas)for(let company of article.empresas){
        new_news['empresas'][company]=true;
      }
      console.log(new_news.empresas)
      if(article.subcategory) new_news['subcategories'][article.subcategory]=true
      if(article.subcategories){
        for(let subcat of article.subcategories){
          new_news['subcategories'][subcat]=true
        }
      }
      if(new_news.test_article.correct_answer==undefined)new_news.test_article.correct_answer="90%"
      console.log('copied: '+cont,new_news);
      await this.afs.collection('/news/'+cat+'/noticias/').doc(article.uid).set(new_news).then(()=>{
        cont++;console.log(article.uid+" done "+cont+" of "+articles.length);
        return ;
      })  
    }
    console.log('copied: '+cont+" skiped: "+NoUpdate);
    return;
  }

}