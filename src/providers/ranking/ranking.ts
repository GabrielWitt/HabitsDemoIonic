import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFireAuth } from "@angular/fire/auth";
//import { AngularFireDatabase } from "angularfire2/database";
import { AppContants } from '../../app/app.constants';
import * as firebase from 'firebase';

const CHALLENGE_NODE = "retos";
const TEAM_RANK_NODE = "ranking";

@Injectable()
export class rankingProvider {
    public ranking = [];

    public constructor(/*private fireDB: AngularFireDatabase,*/private fireAuth: AngularFireAuth,private http: HttpClient) {
    }

    //funcion para obtener el ranking de una compañia
    public get_company_ranking(company_uid: string, limit: number): Promise<any> {
        return new Promise((resolve, rejected) => {
			console.log( this.fireAuth.auth.currentUser);
            this.fireAuth.auth.currentUser.getIdToken().then(authorizationToken => {
                let URL = `${AppContants.node_api[AppContants.config_mode]}rankingByCompany2`;
                let headers = new HttpHeaders();
                headers = headers.append('Content-Type', 'application/json');
                headers = headers.append('Authorization', 'Bearer ' + authorizationToken);
                this.http.post(URL, { "companyUID": company_uid, "limit": limit, "user_uid":   this.fireAuth.auth.currentUser.uid }, { headers: headers }).subscribe(response => {
                    //@ts-ignore
                    if(!response.error){
                        //@ts-ignore
                        this.ranking = response.data;
                    }
                    return resolve(response);
                },error=>{
                    return rejected(error);
                });
            }).catch(error=>{
                return rejected(error);
            });
        });
    }

    public get_team_ranking(company_uid: string, limit: number): Promise<any> {
        return new Promise((resolve, rejected) => {
            firebase.firestore().collection( `${CHALLENGE_NODE}/${company_uid}/${TEAM_RANK_NODE}`).orderBy('points','desc').limit(limit)
            .get().then(snapshot =>{
                let teams = []
                snapshot.forEach(doc => {
                    let team = doc.data();
                    team.points = Math.round(team.points)
                    teams.push(team);
                });
                resolve(teams)
            });
        })
    }
}