import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';

import { ActiveModalService } from 'shared/services/active-modal.service';

@Component({
  selector: 'app-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.less'],
})
export class ModalWindowComponent implements OnInit, OnDestroy {
  @ViewChild('backdrop') public backdrop: any;

  public dismissBackdrop: Function;

  constructor(private activeModal: ActiveModalService, private renderer: Renderer2) {}

  public ngOnInit() {
    this.dismissBackdrop = this.renderer.listen(
      this.backdrop.nativeElement,
      'click',
      this.activeModal.dismiss.bind(this.activeModal, 'dismiss backdrop'));
  }

  public ngOnDestroy(): void {
    this.dismissBackdrop();
  }
}
