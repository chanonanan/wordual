import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState } from '@stores/user/user.state';

export const AuthGuard: CanActivateFn = (route, state) => {
  const isUsernameValid = inject(Store).selectSnapshot(UserState.isUsernameValid);
    if (!isUsernameValid) {
      inject(Router).navigate(['/'], {
        queryParams: {
          room: route.params['id']
        }
      });
    }

    return true;
};
