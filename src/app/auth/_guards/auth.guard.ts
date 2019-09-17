
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './../_services/auth.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';


import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService) {
  }

  private getUrlParameter(url, name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(url);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // tslint:disable-next-line:no-string-literal
    const roles = route.data['roles'] as Array<string>;
    // console.log('[canActivate]: roles: ' + roles);
    // console.log('[canActivate]: user: ', currentUser);
    if (roles) {
      // console.log('into roles')
      if (!currentUser || !roles.includes(currentUser.role.name)) {
        this.toastr.error('You are not authorized. Redirected to Profile');
        this.router.navigate(['/profile']);
        return false;
      }
    }
    return this.authService.verify().pipe(map(
      (data) => {
        // console.log('[AuthGuard] data: ', data);
        if (data !== null && data.success) {
          // logged in so return true
          this.authService.loggedIn = true;
          return true;
        } else {
          // error when verify so redirect to login page with the return url
          localStorage.removeItem('currentUser');
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      },
      (error) => {
        // console.log(error);
        // error when verify so redirect to login page with the return url
        localStorage.removeItem('currentUser');
        this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
        return false;
      })).pipe(catchError((err) => {
        return throwError(err);
      }));
  }
}
