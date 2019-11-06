import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs/Observable';
import { User } from '../../interfaces/User';
import { Company } from '../../interfaces/Company';
import { Department } from '../../interfaces/Department';
import { AngularFireDatabase } from '@angular/fire/database';
//import { AppContants } from '../../app/app.constants';
import { map } from 'rxjs/operators';
import { merge } from 'rxjs';
import { take } from 'rxjs/operators';

const USER_COLLECTION = 'user';
const COMPANY_COLLECTION = 'company';
const USER_CARD_NODE = "user_card";

@Injectable()
export class UserProvider {

  private userDoc: AngularFirestoreDocument<User>;
  private companyDoc: AngularFirestoreDocument<Company>;
  private departmentDoc: AngularFirestoreDocument<Department>;
  private positionDoc: AngularFirestoreDocument<Position>;

  private _user: Observable<User>;
  private _company: Observable<Company>;
  private _department: Observable<Department>;
  private _position: Observable<Position>;
  public _userCard:any;
  public _userObs:any; 
  private _userCardRef:any=null;

  userJson: User ={};

  constructor(
    private afs: AngularFirestore, 
    private afDatabase: AngularFireDatabase,
    private rtdb: AngularFireDatabase
  ) {
    //  this.getLocations(); // Inicia función para copiar base de datos
    //  this.updateTest();   //Funcion para actualizar 1 solo campo de usuarios 
    //this.LoadData() 
    this._userCard=null;
  }


  public async loadUser(userUID: string) {

		try{
			  this.userDoc = this.afs.doc(`${USER_COLLECTION}/${userUID}`);
			  let CacheOBS = this.userDoc.get({source: "server"}).pipe(take(1), map(userDataSnap => {
					let userData = userDataSnap.data();
					
					if(userData){
						userData.name_first = `${userData.name} ${userData.last_name}`;
						userData.last_name_first = `${userData.last_name} ${userData.name}`;
						userData.picture = this.checkPicture(userData.picture);
					
						return userData;
					}else {
						return {};
					}
			  }))
			  this._userObs =  this.userDoc.valueChanges().pipe( map(userData => {
				if(userData){
				userData.name_first = `${userData.name} ${userData.last_name}`;
				userData.last_name_first = `${userData.last_name} ${userData.name}`;
				userData.picture = this.checkPicture(userData.picture);
				
				return userData;
				}else {
				  return {};
				}
			  }));
			  this._user = 	await merge(CacheOBS, this._userObs);
        //console.log(this._user);
			  this._userCardRef=this.afDatabase.database.ref(`${USER_CARD_NODE}/${userUID}`)
			  this._userCardRef.on("value",data=>{
				this._userCard=data.val();
			  });
		}catch(e){
			alert(e);
		}

      return this._userObs;
  }

  public getUserObservable(){
    return new Promise((resolve) => {
      if(this.userDoc){
        return this.userDoc.valueChanges().pipe(map(userData => {
          userData.name_first = `${userData.name} ${userData.last_name}`;
          userData.last_name_first = `${userData.last_name} ${userData.name}`;
          userData.picture = this.checkPicture(userData.picture);
          resolve(userData);
        }))}
      {
        resolve(false);
      }
    })
  }

  public loadUserCompany(companyUID: string) {
    this.companyDoc = this.afs.doc<Company>(`${COMPANY_COLLECTION}/${companyUID}`);
    this._company = this.companyDoc.valueChanges();

  }

  public loadUserDepartment(companyUID: string, departmentUID: string) {
    this.departmentDoc = this.afs.doc(`${COMPANY_COLLECTION}/${companyUID}/${departmentUID}`);
    this._department = this.departmentDoc.valueChanges();
  }

  public loadUserPosition(companyUID: string, positionUID: string) {
    this.positionDoc = this.afs.doc(`${COMPANY_COLLECTION}/${companyUID}/${positionUID}`);
    this._position = this.positionDoc.valueChanges();
  }

  public async updateUser(user: User): Promise<void> {
    try {
      let user_card ={
        company: user.company.uid,
        name: `${user.name} ${user.last_name}`,
        //points: user.points, nose puede actualizar puntos desde el app
        uid: user.uid,
      }
      if(user.picture) user_card['picture'] = user.picture;
      this.update_user_card(user_card);
      await this.afs.doc(`${USER_COLLECTION}/${user.uid}`).update(user); //user se elimino defirestore
      return;
    } catch (e) {
      throw e;
    }
  }

  public update_user_card(user_card){
    this.afDatabase.database.ref(`user_card/${user_card.uid}`).update(user_card)
  }

  public get user(): Observable<User> {
    return this._user;
  }

  userObtainer():any{
    return new Promise((resolve)=>{
      this.userDoc.ref.get().then(user_snap => {
        let user = user_snap.data();
        this.set_static_user(user);
        resolve(user);
      })
    })
  }

  public static_user():any{
    return this.userJson;
  }

  public set_static_user(userData){
    this.userJson = userData;
  }  

  public get company(): Observable<Company> {
    return this._company;
  }

  public get department(): Observable<Department> {
    return this._department;
  }

  public get position(): Observable<Position> {
    return this._position;
  }

  private checkPicture(picture: string): string {
    return !picture ? "./assets/user_icons/icon0.png" : picture;
  }

  public get test(): Observable<Company> {
    return this._company;
  }

  Loadweight(){
    let node = "user_goal_weight"  
    this.rtdb.database.ref(node).once('value', Data => {
      let values = Data.val();
      let keys = Object.keys(values)    
      console.log(keys)
      for(let key of keys){  
        let skeys = Object.keys(values[key]) 
        for(let skey of skeys){
        this.afs.collection("user_advance").doc(key).collection("weight").doc(skey).set({
          percent: values[key][skey].percent,
          timestamp: values[key][skey].timestamp
        }).then(function() {
          console.log("Document successfully written!");
        }).catch(function(e) {
          console.log(e);
        })
        }
      }
    })
  }

  LoadMovement(){
    let node = "user_goal_movement"  
    this.rtdb.database.ref(node).once('value', Data => {
      let values = Data.val();
      let keys = Object.keys(values)    
      console.log(keys)
      for(let key of keys){  
        let skeys = Object.keys(values[key]) 
        for(let skey of skeys){
        this.afs.collection("user_advance").doc(key).collection("movement").doc(skey).set({
          percent: values[key][skey].percent,
          timestamp: values[key][skey].timestamp
        }).then(function() {
          console.log("Document successfully written!");
        }).catch(function(e) {
          console.log(e);
        })
        }
      }
    })
  }

  LoadDiet(){
    let node = "user_diet"  
    this.rtdb.database.ref(node).once('value', Data => {
      let values = Data.val();
      let keys = Object.keys(values)    
      console.log(keys)
      for(let key of keys){  
        if(values[key]["evidence"]){
          let skeys = Object.keys(values[key]["evidence"]) 
          for(let skey of skeys){
            console.log(skey+{
              percent: values[key]["evidence"][skey].percent,
              timestamp: values[key]["evidence"][skey].timestamp
            })
          this.afs.collection("user_advance").doc(key).collection("diet").doc(skey).set({
            percent: values[key]["evidence"][skey].percent,
            timestamp: values[key]["evidence"][skey].timestamp
          }).then(function() {
            console.log("Document successfully written!");
          }).catch(function(e) {
            console.log(e);
          })
          }
        }
      }
    })
  }

  CheckMedVersion(companyKey: string){
    /*let CheckKey = ""
    if(companyKey) CheckKey = companyKey.split("-")[0]
    if(CheckKey == AppContants.MedixMode){
      return true;
    }else{
      return false;
    }*/
    return true;
  }

  public async get_once_user_card(user_uid,callback){
    this.afDatabase.database.ref(`${USER_CARD_NODE}/${user_uid}`).once("value",data=>{
      callback(data.val());
    })
  }

  public getUserCard(user_uid): Promise<any>{
    return new Promise((resolve, rejected) => {
      if(this._userCard!=null){
        return resolve(this._userCard);
      }else{
        //debo revisarlo porque no espera que se ejecute la consulta para retornar
        this.afDatabase.database.ref(`${USER_CARD_NODE}/${user_uid}`).once("value",data=>{
          return resolve(data.val());
        }).catch(error=>{
          console.log(5,error);
          return resolve(null);
        }); 
      }
    });
    
  }



  cleanOut(){
    this.userDoc = null;
    this.companyDoc = null;
    this.departmentDoc = null;
    this.positionDoc = null;  
    this._user = null;
    this._company = null;
    this._department = null;
    this._position = null;  
    this.userJson ={};
  }
}

