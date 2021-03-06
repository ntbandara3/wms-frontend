import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material';
import { APIResponse } from 'src/app/helpers/api-response';

export class SignUpErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  private matcher: SignUpErrorStateMatcher;
  private emailFormControl: FormControl;
  private passwordFormControl: FormControl;
  private nameFormControl: FormControl;
  private isLoading: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.matcher = new SignUpErrorStateMatcher();
    this.emailFormControl = new FormControl('', [
      Validators.required,
      Validators.email
    ]);
    this.passwordFormControl = new FormControl('', [
      Validators.required,
      // Validators.pattern('^ (?=.* [a - z])(?=.* [A - Z])(?=.* [0 - 9])(?=.* [!@#\$ %\^&\*]) (?=.{ 8,})')
    ]);
    this.nameFormControl = new FormControl('', [
      Validators.required,
      // Validators.pattern('/^[A-Za-z]+$/')
    ]);
    this.isLoading = false;
  }

  public get Matcher(): ErrorStateMatcher {
    return this.matcher;
  }

  public get EmailFormControl(): FormControl {
    return this.emailFormControl;
  }

  public get PasswordFormControl(): FormControl {
    return this.passwordFormControl;
  }

  public get NameFormControl(): FormControl {
    return this.nameFormControl;
  }

  public get getLoadingState(): boolean {
    return this.isLoading;
  }

  signup() {
    this.isLoading = true;
    this.authService.signup(
      this.nameFormControl.value,
      this.emailFormControl.value,
      this.passwordFormControl.value
    ).subscribe((response: APIResponse) => {
      this.authService.login(this.emailFormControl.value, this.passwordFormControl.value).then((user) => {
        this.authService.getCurrentUser().subscribe((user: firebase.User) => {
          this.authService.sendVerificationEmail(user.uid).subscribe((emailResponse: APIResponse) => {
            if (response.success) {
              this.router.navigate(['emailverification']);
              this.isLoading = false;
            }
          });
        });
      });
    }, (err: any) => {
        console.log(err);
    });
  }

}
