import { Injectable, ValueProvider } from '@angular/core';

import { ModalContext } from 'shared/models';

import { ActiveModalService } from 'shared/services';
import { ModalWindowService } from 'shared/services';

@Injectable()
export class ModalService implements ModalContext {
  private activeModalProvider: ValueProvider;
  constructor(private modalWindowService: ModalWindowService,
              private activeModalService: ActiveModalService) {
    this.activeModalService.context = this as ModalContext;
    this.activeModalProvider = { provide: ActiveModalService, useValue: this.activeModalService };
  }

  public open(component: any, data?: any, options?: any): Promise<any> {
    return this.modalWindowService.open(component, [this.activeModalProvider], data, options);
  }

  public close(invoker: any, result?: any): void {
    if (invoker instanceof ActiveModalService) {
      this.modalWindowService.close(result);
    } else {
      throw new Error('This component is not Modal Window!');
    }
  }

  public dismiss(invoker: any, reason?: any): void {
    if (invoker instanceof ActiveModalService) {
      this.modalWindowService.dissmiss(reason);
    } else {
      throw new Error('This component is not Modal Window!');
    }
  }

  public block(invoker: any): void {
    if (invoker instanceof ActiveModalService) {
      this.modalWindowService.block();
    } else {
      throw new Error('This component is not Modal Window!');
    }
  }

  public unblock(invoker: any): void {
    if (invoker instanceof ActiveModalService) {
      this.modalWindowService.unblock();
    } else {
      throw new Error('This component is not Modal Window!');
    }
  }
}
