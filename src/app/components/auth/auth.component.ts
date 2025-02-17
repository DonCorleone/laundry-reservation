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
        ...this.user,
        key: this.createUserAvatar(this.user) + '|' + this.user.email
      });
    }
    // Subscribe to login/logout events
    this.netlifyIdentityService.onLogin((user) => {
      this.user = user;
      this.value.emit({
        ...this.user,
        key: this.createUserAvatar(this.user) + '|' + this.user.email
      });
    });

    this.netlifyIdentityService.onLogout(() => {
      this.user = null;
      this.netlifyIdentityService.openModal();
    });
  }

  createUserAvatar(user: User): string {
    // Helper function to extract initials from a string
    const getInitials = (str: string): string => {
      const words = str.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty parts
      if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }
      return (
        (words[0][0] || "").toUpperCase() + (words[1]?.[0] || "").toUpperCase()
      );
    };

    // Determine the source of the avatar
    if (user.user_metadata?.full_name) {
      return getInitials(user.user_metadata.full_name);
    }
    if (user.email) {
      const emailNamePart = user.email.split("@")[0];
      return getInitials(emailNamePart);
    }

    // Fallback: generate deterministic initials from user ID
    const fallbackHash = user.id || "fallback";
    return getInitials(fallbackHash.slice(0, 2));
  }
}
