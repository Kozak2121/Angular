import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

import { AuthorizationService, TranslatorService, ActiveModalService,  ModalService } from 'shared/services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  public loginForm: FormGroup;
  public loading = false;
  public formErrors: any = { username: '', password: '' };

  private validationMessages: any = {
    username: {
      required: 'Email is required.',
      email: 'Email invalid.',
      minlength: 'Email must be at least 4 characters long.',
      maxlength: 'Email cannot be more than 32 characters long.',
    },
    password: {
      required: 'Password is required.',
      minlength: 'Password must be at least 6 characters long.',
      maxlength: 'Password cannot be more than 32 characters long.',
    },
  };

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private authorizationService: AuthorizationService,
              private toastrService: ToastrService,
              private activeModalService: ActiveModalService,
              private modalService: ModalService,
              private translatorService: TranslatorService) {}

  public ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(32), Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]],
    });

    this.loginForm.valueChanges.debounceTime(500).subscribe(this.onValueChanged.bind(this));

    this.onValueChanged();
  }

  public ngAfterViewInit() {
    this.translatorService.changeLanguage();
  }

  public onSubmit() {
    if (!this.loginForm.valid) { return this.toastrService.error('Login form invalid'); }

    this.loading = true;
    this.loginForm.disable();
    this.activeModalService.block();

    this.authorizationService.login('password', this.loginForm.value)
      .subscribe(
        (user: any) => {
          this.loading = false;
          this.loginForm.enable();
          this.activeModalService.unblock();

          this.toastrService.success('You have been logged in!', 'Success!');
          this.activeModalService.close({ result: 'success' });
          this.translatorService.changeLanguage();
          this.router.navigate(['profile', user.username]);
        },
        (err: any) => {
          this.loading = false;
          this.loginForm.enable();
          this.activeModalService.unblock();

          this.toastrService.error(err.error.error_description, 'Log in error!');
        });
  }

  public onValueChanged() {
    /* tslint:disable:cyclomatic-complexity forin */
    if (!this.loginForm) { return; }

    const form = this.loginForm;

    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.errors && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          if (!this.formErrors[field]) {
            this.formErrors[field] = `${messages[key]} `;
          }
        }
      }
    }
  }

  public closeModalLogin() {
    this.activeModalService.close();
  }

  public goToRegister() {
    this.activeModalService.close({ result: 'register' });
  }

  public openForgotPasswordModal(): void {
    this.activeModalService.close();

    this.modalService.open(ForgotPasswordComponent);
  }
}
