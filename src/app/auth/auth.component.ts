import {Component, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {User} from "netlify-identity-widget";
import {NetlifyIdentityService} from "../services/netlify-identity.service";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    NgIf
  ],
  template: `
    @if(!user){
      <span>No User found. Please Login.</span><button (click)="openIdentityModal()">Login</button>
    } @else {
      <span>{{ createUserAvatar(user) }}</span><button (click)="logout()">Logout</button>
    }
  `,
  styles: ``
})
export class AuthComponent implements OnInit {
  user: User | null = null;

  constructor(private netlifyIdentity: NetlifyIdentityService) {
  }

  ngOnInit(): void {
    // Check if the user is logged in when the component initializes
    this.user = this.netlifyIdentity.getCurrentUser();

    if (!this.user) {
      // If the user is not logged in, subscribe to login events
      this.openIdentityModal();
    }
    // Subscribe to login/logout events
    this.netlifyIdentity.onLogin((user) => {
      this.user = user;
    });

    this.netlifyIdentity.onLogout(() => {
      this.user = null;
      this.openIdentityModal();
    });
  }

  openIdentityModal() {
    this.netlifyIdentity.openModal();
  }

  logout() {
    this.netlifyIdentity.logout();
  }

  createUserAvatar(user: User) {
    let avatar = '';
    if (!user?.user_metadata?.full_name || !user?.email) {
      return avatar;
    }
    // if the user has a fullname, use the first letter of the first name and the first letter of the last name as the avatar
    if (user.user_metadata?.full_name) {
      const [firstName, lastName] = user.user_metadata.full_name.split(' ');
      avatar = `${firstName[0]}${lastName[0]}`;
    } else {
      // if the user does not have a full name, use the split the email by . before the @ or _ or - or @ itself and use the first letter of each part as the avatar
      const [email] = user.email.split('@');
      const parts = email?.split(/[._-]/);
      avatar = parts?.map(part => part[0]).join('');
    }
    return avatar?.toUpperCase();
  }
}
