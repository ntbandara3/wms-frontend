import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PaymentService } from 'src/app/services/payment.service';
import { AuthService } from 'src/app/services/auth.service';
import { APIResponse } from 'src/app/helpers/api-response';
import { MatSnackBar } from '@angular/material';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

declare const Stripe;

@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.component.html',
  styleUrls: ['./payment-information.component.css']
})
export class PaymentInformationComponent implements OnInit, AfterViewInit {

  public cardNumber: string;
  public cardHoldersName: string;
  public expiry: string;
  public cvc: string;
  public cardType: string;
  public cardTypeImgUrl: string;
  public error;

  @ViewChild('cardInfo') cardInfo: ElementRef;

  stripe; // : stripe.Stripe;
	cardErrors;
  paymentToken: string;
  card: any;

  user;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private userService: UserService,
    private _snackbar: MatSnackBar,
    private router: Router,
  ) { }

  ngOnInit() {
    this.cardTypeImgUrl = 'https://image.ibb.co/cZeFjx/little_square.png';
    this.authService.getCurrentUser().subscribe(user => this.user = user);
  }

  ngAfterViewInit(): void {
		this.stripe = Stripe(environment.stripeKey);
		const elements = this.stripe.elements();

		this.card = elements.create('card', {
      hidePostalCode: true});

  this.card.mount(this.cardInfo.nativeElement);

  this.card.addEventListener('change', ({ error }) => {
			this.cardErrors = error && error.message;
    });
  }

  async addPaymentMethod() {
    this.paymentService.createCustomerWithoutToken(this.user.uid, this.user.email).subscribe((customerResponse: APIResponse) => {

        this.paymentService.getSetupIntentClientSecret().subscribe(async (clientSecretResponse: APIResponse) => {
          const result = await this.stripe.handleCardSetup(
            clientSecretResponse.data,
            this.card,
            {
              payment_method_data: {
                billing_details: { name: this.user.email }
              }
            }
          );

          if (!result.setupIntent) {
						return this._snackbar.open('Could not authenticate your credit/debit card. Please contact your card provider for further assistance.', 'Dismiss', {
							duration: 2000,
						});
          }

          this.paymentService.attachPaymentIntentToCustomer(customerResponse.data.id, result.setupIntent.payment_method).subscribe((r: APIResponse) => {
            if (r.success) {

              

              this.paymentToken = customerResponse.data.id;
              this.userService.updateStripeToken(this.user.uid, this.paymentToken).subscribe((pcResponse: APIResponse) => {
                if (pcResponse.success) {
                  this._snackbar.open('Card created successfully', 'Dismiss', {
                    duration: 2000,
                  });
                  this.router.navigate(['dashboard']);
                }
              })

						}
          }, err => {

						console.log('Something is wrong:', err.message);
						this._snackbar.open(err.message, 'Dismiss', {
							duration: 2000,
						});

					});
        }, err => {

          console.log('Something is wrong:', err.message);
          this._snackbar.open(err.message, "Dismiss", {
            duration: 2000,
          });
  
        });
    }, err => {

      console.log('Something is wrong:', err.message);
      this._snackbar.open(err.message, "Dismiss", {
        duration: 2000,
      });

    });
  }

}
