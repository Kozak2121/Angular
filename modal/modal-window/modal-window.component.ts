import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';

import { ActiveModalService } from 'shared/services';
import { BasicModal } from 'shared/models';

@Component({
  selector: 'app-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.less'],
})
export class ModalWindowComponent extends BasicModal implements OnInit, OnDestroy {
  @ViewChild('backdrop') public backdrop: any;

  public dismissBackdrop: Function;
  public modalOptions: any;

  constructor(private activeModal: ActiveModalService, private renderer: Renderer2) { super(); }

  public ngOnInit() {
    if (this.modalOptions.unclosable) { return; }

    this.dismissBackdrop = this.renderer.listen(
      this.backdrop.nativeElement,
      'click',
      this.activeModal.dismiss.bind(this.activeModal, 'dismiss backdrop'));
  }

  public ngOnDestroy(): void {
    if (this.dismissBackdrop) {
      this.dismissBackdrop();
    }
  }
}
