import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs/Observable';
import { UserLesson } from '../../interfaces/user-lesson';
import { map } from 'rxjs/operators';

const MODULES_NODE = 'elearning';
const LESSONS_NODE = 'topics';
const USER_LEARNING_NODE = 'user_learning';
const MY_LEARNING_NODE = 'mylearning';
const USER_LESSONS_NODE = 'user_lesson';

export interface DataItem {percent: string, timestamp: string}

@Injectable()
export class LearningProvider {
  
  actualizar:boolean=false;
  private ClassesSet : AngularFirestoreCollection<any>
  ClassesItems : Observable<any[]>
  private myClassesSet : AngularFirestoreCollection<UserLesson>

  constructor(
    private afs: AngularFirestore
  ) {}
  
  public async loadAllClasses(){
    this.ClassesSet = this.afs.collection(MODULES_NODE)
    this.ClassesItems = this.ClassesSet.valueChanges()
    return this.ClassesItems;
  }
  
  public async loadMyClases(uid){
    this.myClassesSet = this.afs.collection(USER_LESSONS_NODE).doc(uid).collection(MY_LEARNING_NODE)
    return this.myClassesSet.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        let lesson = a.payload.doc.data() as UserLesson;
        return lesson;
      });
    }));
  }

  public async load_lessons(uid:string): Promise<any> {
    try{
      let topics = [];
      await this.afs.firestore.collection(MODULES_NODE).doc(uid).collection(LESSONS_NODE)
      .get().then(snapshot => {
        snapshot.forEach(doc => {
          topics.push(doc.data());
        });
      })
     return topics
    } catch (e){
      console.log(`Error ${e}`)
    }
  }

  public register_lesson(ref,stars,user){
    this.afs.firestore.collection(USER_LEARNING_NODE).doc(`${user}${ref.uid}${ref.topic}`).set({
      user: user,
      stars: stars,
      module: ref.module,
      lesson: ref.uid,
      topic: ref.topic,
      timestamp: new Date().toISOString(),
    })
    this.afs.firestore.collection(USER_LESSONS_NODE).doc(user).collection(MY_LEARNING_NODE).doc(ref.uid).update({topic_number:ref.topic})
  }

  public async getLessonsData(user_uid){   
    let response: any;
    await this.afs.firestore.collection(USER_LESSONS_NODE).doc(user_uid).get().then(data =>{
      if(data.exists){ 
        response = data.data().topic;
      }else{
        response = {};
      }
    }).catch(error =>{
      console.log(error);
      return {};
    })
    return response;
  }

  public startLesson(user_uid,lesson){
    this.afs.firestore.collection(USER_LESSONS_NODE).doc(user_uid).collection(MY_LEARNING_NODE).doc(lesson).set({
      timestamp: new Date().toISOString(),
      done: false,
      uid: lesson
    })
  }

  public finishLesson(user_uid,lesson){
    this.afs.firestore.collection(USER_LESSONS_NODE).doc(user_uid).collection(MY_LEARNING_NODE).doc(lesson).update({
      done: true
    })
  }

  public deleteLesson(user_uid,lesson){
    this.afs.firestore.collection(USER_LESSONS_NODE).doc(user_uid).collection(MY_LEARNING_NODE).doc(lesson).delete();
  }

  //Load all classes in learning
  async load_topics(): Promise<any> {
    try{
        let classes = []; let modules = []; 
        await this.loadAllClasses().then(function(querySnapshot){
          querySnapshot.forEach(function(classArray){
            classArray.forEach(function(classItem){
            let lesson = classItem;
            let done = false; let join = false; let advance = 0;
              modules.push(lesson['module'])
              classes.push({
                uid: lesson['uid'],
                title: lesson['title'],
                description: lesson['description'],
                picture: lesson['picture'],
                topic_number: lesson['topic_number'],
                joined: join,
                done: done,
                module: lesson['module'],
                advance: advance
              })        
            });
          });
        }); 
        return classes; 
    } catch (e){
      console.log(`Error ${e}`)
    }
  }
  public cleanOut(){
    this.ClassesSet = null;
    this.ClassesItems = null;
    this.myClassesSet = null;
  }

  API:any;
  setAPI(event){
    this.API = event;
  }
  
  getAPI(){
    return this.API;
  }

}
