import {ChangeDetectionStrategy, Component, inject, OnInit, output} from '@angular/core';
import {NgIf} from "@angular/common";
import {User} from "netlify-identity-widget";
import {NetlifyIdentityService} from "../../services/netlify-identity.service";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatFabButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {ILaundryUser} from "../../models/user";
import {MatGridList} from "@angular/material/grid-list";
import {ScrollSectionDirective} from "../../directives/scroll-section.directive";

@Component({
  selector: 'app-auth',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    MatFormField,
    MatInput,
    MatIcon,
    MatFabButton,
    MatToolbar,
    MatButton,
    MatGridList,
    ScrollSectionDirective
  ],
  styles: `
    span.userinfo {
      text-wrap: auto;
    }
  `,
  templateUrl: 'auth.component.html'
})
export class AuthComponent implements OnInit {
  user: User | null = null;
  value = output<ILaundryUser>();
  protected netlifyIdentityService = inject(NetlifyIdentityService);

  ngOnInit(): void {
    // Check if the user is logged in when the component initializes
    this.user = this.netlifyIdentityService.getCurrentUser();

    if (!this.user) {
      // If the user is not logged in, subscribe to login events
      this.netlifyIdentityService.openModal();
    } else {
      this.value.emit({
        ... this.user,
        key: this.createUserAvatar(this.user) + '|' + this.user.email
      });
    }
    // Subscribe to login/logout events
    this.netlifyIdentityService.onLogin((user) => {
      this.user = user;
      this.value.emit({
        ... this.user,
        key: this.createUserAvatar(this.user) + '|' + this.user.email
      });
    });

    this.netlifyIdentityService.onLogout(() => {
      this.user = null;
      this.netlifyIdentityService.openModal();
    });
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
