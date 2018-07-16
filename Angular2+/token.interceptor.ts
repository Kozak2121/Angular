import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { Observable } from 'rxjs/Observable';
import { Injector, isDevMode } from '@angular/core';
import { environment } from '@environments/environment';
/**
 * Attaches the token to each request if there is any
 * in case there is no token - sends simple request
 * (if 401 comes back JwtInterceptor will take care of it)
 */

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private inj: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authService = this.inj.get(AuthService);
    if (!authService.getToken()) {
      return next.handle(req);
    }
    if (req.url.indexOf('slicer.knetik.io') >= 0) {
      req = req.clone({
        setHeaders: {
          Authorization: `Basic YWRtaW46dGVzdA==`
        }
      });
    } else {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authService.getToken()}`,
          'x-knetikcloud-appid' : isDevMode() ? 'thermo-dev' : 'hab-' + window.location.host.split('.')[0]
        }
      });
    }
    return next.handle(req);
  }
}
