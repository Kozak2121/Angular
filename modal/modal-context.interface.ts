export interface ModalContext {
  close(invoker: any, result?: any): void;
  dismiss(invoker: any, reason?: any): void;
  block(invoker: any): void;
  unblock(invoker: any): void;
}
