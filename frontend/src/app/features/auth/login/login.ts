import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { destinoSeguro } from '../../../core/auth/destino';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AUTH_API);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly enviando = signal(false);
  protected readonly errorIngreso = signal<string | null>(null);
  protected readonly verPassword = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    inject(Title).setTitle('Iniciar sesión · AquaFeed');
  }

  protected entrar(): void {
    this.errorIngreso.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth
      .login({ email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuario) => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          void this.router.navigateByUrl(destinoSeguro(returnUrl, usuario.rol));
        },
        error: (error: unknown) => {
          this.enviando.set(false);
          this.errorIngreso.set(
            error instanceof Error ? error.message : 'No pudimos iniciar sesión.',
          );
        },
      });
  }
}
