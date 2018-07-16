import { Injectable } from '@angular/core';

import { ModalContext } from 'shared/models';

@Injectable()
export class ActiveModalService {
  private _context: ModalContext;

  public set context(value: ModalContext) {
    this._context = value;
  }

  public close(result?: any): void {
    this._context.close(this, result);
  }

  public dismiss(reason?: any): void {
    this._context.dismiss(this, reason);
  }

  public block(): void {
    this._context.block(this);
  }

  public unblock(): void {
    this._context.unblock(this);
  }
}
