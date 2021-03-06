import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.css']
})
export class LeftPanelComponent implements OnInit {

  currentUser;
  tokenResult;

  constructor(
    private authService: AuthService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(response => {
      console.log(response);
      this.currentUser = response;
    });

    this.authService.getIdTokenResult().then(result => this.tokenResult = result);
  }

  public getUserType(type) {
    return this.authService.getUserTypeMapping(type);
  }

  public logout() {
    this.authService.logout()
      .then(() => this.router.navigate(['']))
      .catch(err => this._snackBar.open(err.message, null, { duration: 2000 }));
  }
}
