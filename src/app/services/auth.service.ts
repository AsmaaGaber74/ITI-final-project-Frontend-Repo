import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Registration } from '../models/Registration';
import { Login } from '../models/Login';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  register(user: Registration): Observable<any> {
    return this.http.post(`${environment.baseUrl}/api/Account/register`, user);
  }

  login(credentials: Login): Observable<any> {
    return this.http.post(`${environment.baseUrl}/api/Account/login`, credentials).pipe(
      map((response: any) => {
        if (response && response.token) {
          // Save the token to local storage or session storage
          localStorage.setItem('jwtToken', response.token);
          localStorage.setItem('tokenExpiration', response.expiration);
        }
        return response;
      }),
      catchError(error => {
        // Handle errors appropriately
        return throwError(error);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const expiration = localStorage.getItem('tokenExpiration');
    return !!token && new Date(expiration!) > new Date(); // Simple check for token presence and not expired
  }

  logout(): void {
    // Remove token and other user data from storage
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('tokenExpiration');
  }

  // Method to automatically attach JWT to HttpHeaders (for making authenticated requests)
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
