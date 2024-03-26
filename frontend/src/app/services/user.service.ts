import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import axios from 'axios';
import UserFull from 'src/app/interfaces/full-user';
import FullUser from 'src/app/interfaces/full-user';
import Company from '../interfaces/company';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userNameSubject = new BehaviorSubject<string>("");

  private isLoggedInSubject = new BehaviorSubject<boolean>(true);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private isAdminSubject = new BehaviorSubject<boolean>(true);
  isAdmin$ = this.isAdminSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<FullUser | undefined>(undefined);
  currentUser$ = this.currentUserSubject.asObservable();

  private allUsersSubject = new BehaviorSubject<FullUser[]>([]);
  allUsers$ = this.allUsersSubject.asObservable();

  private currentCompanyIdSubject = new BehaviorSubject<number>(-1);
  currentCompanyId$ = this.currentCompanyIdSubject.asObservable();

  private companyListSubject = new BehaviorSubject<Company[]>([]);
  companyList$ = this.companyListSubject.asObservable();

  constructor() { }

  getFirstAndLastInitial(firstName: string, lastName: string) {
    const lastInitial = lastName.charAt(0).toUpperCase() + '.';
    return `${firstName} ${lastInitial}`;
  }

  userNameObservable(){
    return this.userNameSubject.asObservable();
  }

  companyListObservable(){
    return this.companyListSubject.asObservable();
  }
  
  updateCurrentCompanyId(newId: number) {
    this.currentCompanyIdSubject.next(newId);
  }

  currentCompanyIdObservable() {
    return this.currentCompanyIdSubject.asObservable();
  }

  allUsersObservable(): Observable<FullUser[]> {
    return this.allUsersSubject.asObservable();
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  isLoggedInObservable(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  isAdminObservable(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  updateCurrentUser(newUser: UserFull | undefined) {
    this.currentUserSubject.next(newUser);
    if (newUser){
      this.userNameSubject.next(this.getFirstAndLastInitial(newUser.profile.firstname, newUser.profile.lastname));
    }
  }

  async fetchAllUsers(companyId: number) {
    try {
      const response = await axios.get(`/company/${companyId}/users`)
      console.log("All Users Response Data: ", response.data);
      this.allUsersSubject.next(response.data);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
  }

  async fetchUserFromDB(username: string, password: string) {
    try {
      const response = await axios.post('/users/login', {
        username,
        password,
      });

      // TODO: Perform check on response to make sure user logged in
      console.log('User logged in successfully:', response.data);

      this.updateCurrentUser(response.data);

      return {status: 200, ...response.data};
      
    } catch (error) {
      switch (error) {
        case "No User":
          console.log("Placeholder: Username Not Found");
          break;
        case "Incorrect Password":
          console.log("Placeholder: Incorrect Password");
          break;
        default:
          console.log("Unknown error occured");
          break;
      }
      console.error('Login error message:', error);

      this.updateCurrentUser(undefined);

      return {status: 400}; 
    }

  };

  async authenticate(username: string, password: string) {
    const response = await this.fetchUserFromDB(username, password);

    if (response.status === 400) {
      this.isLoggedInSubject.next(false);
      this.isAdminSubject.next(false);
      return;
    } else {
      this.isLoggedInSubject.next(true);
    }
    
    if (response.isAdmin) {
      this.isAdminSubject.next(true);
    } else {
      this.isAdminSubject.next(false);
    }
    return;
  }

  logout() {
    this.isLoggedInSubject.next(false);
    this.isAdminSubject.next(false);
  }

  loginAsNotAdmin() {
    this.isLoggedInSubject.next(true);
    this.isAdminSubject.next(false);
  }

  loginAsAdmin() {
    this.isLoggedInSubject.next(true);
    this.isAdminSubject.next(true);
  }
}
