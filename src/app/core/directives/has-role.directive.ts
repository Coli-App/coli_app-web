import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { UserState } from '@app/state/UserState';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private userState = inject(UserState);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set appHasRole(roles: string | string[]) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    effect(() => {
      const userRole = this.userState.userRole();

      if (userRole && allowedRoles.includes(userRole)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
