import {ChangeDetectionStrategy, Component, inject, OnInit, output, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';


import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {ILaundryUser} from "../../models/user";

import {ScrollSectionDirective} from "../../directives/scroll-section.directive";

@Component({
    selector: 'app-auth',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    MatIcon,
    MatToolbar,
    MatButton,
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
  user: ILaundryUser | null = null;
  value = output<ILaundryUser>();
  protected http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // Only fetch user data on the browser side
    if (isPlatformBrowser(this.platformId)) {
      // Fetch current user from SSR backend
      this.http.get<ILaundryUser>('/api/auth/user').subscribe({
        next: (user) => {
          this.user = user;
          this.value.emit({
            ...user,
            key: this.createUserAvatar(user) + '|' + user.email
          });
        },
        error: () => {
          this.user = null;
        }
      });
    }
  }

  login() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/api/auth/login'; // SSR endpoint for Auth0 login
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/api/auth/logout'; // SSR endpoint for Auth0 logout
    }
  }

  createUserAvatar(user: ILaundryUser): string {
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
