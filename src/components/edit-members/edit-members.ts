import { Component, Input } from '@angular/core';
import { ChatProvider } from '../../providers/chat/chat';
import { Member } from '../../interfaces/member';
import { User } from '../../interfaces/User';
import { UserProvider } from '../../providers/user/user';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { ChatRoom } from "../../interfaces/chat-room";
import { loadingProvider } from '../../providers/alert/alert';
import { SearchPipe } from '../../pipes/search/search';
import { Platform } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';

/**
 * Generated class for the EditMembersComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'edit-members',
  templateUrl: 'edit-members.html'
})
export class EditMembersComponent {

  @Input("members") memberList: Member[];
  @Input("group_room") team_room: ChatRoom;
  user: User;
  members: Member[];
  newMembers: Member[]=[];
  search: string = "";
  searchText: string = "";

  constructor(
    private chatService: ChatProvider,
    private userprovider: UserProvider,
    public navCtrl: NavController, 
    private alert: loadingProvider,
    public platform: Platform,
    public authProvider: AuthProvider,
    ) {
    this.user = this.userprovider.static_user();
    this.getAllcards()
  }

  ngOnChanges(): void {   
  }

  getAllcards(){
    this.chatService.get_user_cards_by_company(this.user.company.uid).then(users => {
      this.members = this.sortAlphabetically(users);
      for(var i=0;i<this.members.length;i++){
        for(var j=0;j<this.memberList.length;j++){
          if(this.members[i].uid == this.memberList[j].uid) this.addMember(i);
        }        
      }
    });
  }

  addMember(x){
	  let list  = new SearchPipe().transform(this.members, this.searchText, 'name');
    this.newMembers.push(list[x]);
    let auxList = [];
    for(var i=0;i<this.members.length;i++){
      if(this.members[i].uid != list[x].uid) auxList.push(this.members[i])
    }
    this.members = auxList;
    this.members = this.sortAlphabetically(this.members)
    this.hideKeyboard()
  }

  removeMember(x){
    this.members.push(this.newMembers[x])
    let auxList = [];
    for(var i=0;i<this.newMembers.length;i++){
      if(i != x) auxList.push(this.newMembers[i])
    }
    this.newMembers = auxList;
    this.members = this.sortAlphabetically(this.members)
    this.hideKeyboard()
  }

  dismiss(){
    this.navCtrl.pop()
    this.hideKeyboard()
  }

  memberData(memberList): Promise<string[]>{
    return new Promise((resolve, rejected) => {
      //console.log(memberList)
      let auxMembers = [];
      for(var i=0;i<memberList.length;i++){
        let uid = memberList[i].uid;        
        auxMembers.push(uid);
      }
      resolve(auxMembers)
    })
  }
  
  async saveMembers(){
    this.memberData(this.newMembers).then(auxList => {
      this.chatService.editTeamMembers(this.team_room.uid, auxList).then(() => {
        this.alert.presentToast('Los miebros del Team han sido modificados')
        this.navCtrl.pop();this.navCtrl.pop();
      })
    });
    this.hideKeyboard()
  }

  

  sortAlphabetically(array){
    let ordered = array.sort(function(a, b){
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    });
    return ordered;
  }

  hideKeyboard(){
    if(this.platform.is('cordova')){
      this.authProvider.keyboardHide();
    }
  }
}
