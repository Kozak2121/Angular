import {
  ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, Injectable,
  Injector,  ReflectiveInjector, ValueProvider
} from '@angular/core';

import { ModalWindowComponent } from 'shared/components';
import { BasicModal } from 'shared/models';

@Injectable()
export class ModalWindowService {
  private _windows: any[] = [];
  private _activeWindow: any;
  private _body: HTMLElement;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private applicationRef: ApplicationRef,
              private injector: Injector) {
    this._body = document.getElementsByTagName('body')[0];
  }

  public open(component: any, providers: ValueProvider[], data?: any, options?: any) {
    window.scroll(0, 0);
    this._body.classList.add('lock-position');
    const _promise = { _resolve: new Function(), _reject: new Function() };
    const _promiseRet = new Promise((resolve, reject) => {
      _promise._resolve = resolve;
      _promise._reject = reject;
    });

    const _windowRef = this.createElement(ModalWindowComponent, providers);
    (<BasicModal> _windowRef.instance).setOptions(options || {});

    const _componentRef = this.createElement(component, providers);
    if (data) {
      (<BasicModal> _componentRef.instance).setModalData(data);
    }
    (<BasicModal> _componentRef.instance).setOptions(options || {});

    _windowRef.location.nativeElement.appendChild(_componentRef.location.nativeElement);

    this._body.appendChild(_windowRef.location.nativeElement);

    _windowRef.changeDetectorRef.detectChanges();
    _componentRef.changeDetectorRef.detectChanges();

    _promiseRet.catch(() => { /* Nothing */ });

    this._windows.push({ _promise, _componentRef, _windowRef });

    return _promiseRet;
  }

  public close(result?: any) {
    this._body.classList.remove('lock-position');
    this._activeWindow = this._windows.pop();
    this._activeWindow._promise._resolve(result);
    this.destroy();
  }

  public dissmiss(reason?: any) {
    this._body.classList.remove('lock-position');
    this._activeWindow = this._windows.pop();
    this._activeWindow._promise._reject(reason || 'dissmiss modal');
    this.destroy();
  }

  public block() {
    const activeWindow = this._windows[this._windows.length - 1];
    activeWindow._componentRef.location.nativeElement.className = 'blocked';
  }

  public unblock() {
    const activeWindow = this._windows[this._windows.length - 1];
    if (activeWindow._componentRef && activeWindow._componentRef.location) {
      activeWindow._componentRef.location.nativeElement.className = '';
    }
  }

  private createElement(component: any, providers: ValueProvider[]): ComponentRef<Component> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    const modalInjector = ReflectiveInjector.resolveAndCreate(providers, this.injector);
    const componentRef = componentFactory.create(modalInjector);
    this.applicationRef.attachView(componentRef.hostView);

    return componentRef;
  }

  private destroy() {
    const windowElement = this._activeWindow._windowRef.location.nativeElement;
    windowElement.parentNode.removeChild(windowElement);
    this._activeWindow._componentRef.destroy();
    this._activeWindow._windowRef.destroy();
    delete this._activeWindow;
  }
}
