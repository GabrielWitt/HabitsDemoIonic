import { Injectable } from '@angular/core';
import { Company } from '../../interfaces/company';
import { Department } from '../../interfaces/department';
import { Position } from '../../interfaces/position';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../../interfaces/user';

@Injectable()
export class RegisterProvider {

  constructor(private afs: AngularFirestore) { }

  public async getLocationByKey(){
    return true;
  }

  public async getCompanyByKey(companyKey: string): Promise<Company> {
    try {
      ///console.log(companyKey);
      let companiesSnapshot = await this.afs.firestore.collection('company').where('key', '==', companyKey).get();
      //console.log(companiesSnapshot);
      if (companiesSnapshot.size === 1) {
        let company: Company = companiesSnapshot.docs[0].data();
        return company;
      } else if (companiesSnapshot.size > 1) {
        let company: Company = companiesSnapshot.docs[0].data();
        return company;
        //throw 'Error interno.';
      } else {
        throw 'El código ingresado no es válido.';
      }
    } catch (e) {
      throw e;
    }
  }


  public async getDepartmentsByCompany(companyUID: string): Promise<Department[]> {
    try {
      let departmentSnapshot = await this.afs.firestore.collection(`company/${companyUID}/department`).get();
      if (departmentSnapshot.size > 0) {
        let departments: Department[] = departmentSnapshot.docs.map(documentSnapshot => {
          //console.log(documentSnapshot.data())
          return documentSnapshot.data()
        });
        return departments;
      } else {
        throw 'No existen departamentos para esta compañia.';
      }
    } catch (e) {
      throw e;
    }
  }


  public async getPositionsByCompany(companyUID: string): Promise<Position[]> {
    try {
      let positionsSnapshot = await this.afs.firestore.collection(`company/${companyUID}/position`).get();
      if (positionsSnapshot.size > 0) {
        let positions: Position[] = positionsSnapshot.docs.map(documentSnapshot => {
          return documentSnapshot.data()
        });
        return positions;
      } else {
        throw 'No existen posiciones para esta compañia.';
      }
    } catch (e) {
      throw e;
    }
  }

  public async createUser(userUID: string, user: User): Promise<boolean> {
    try {
      await this.afs.collection('user').doc(userUID).set(user);
      return true;
    } catch (e) {
      console.log(e);
      throw 'Error al guardar el usuario';
    }
  }

  

}
