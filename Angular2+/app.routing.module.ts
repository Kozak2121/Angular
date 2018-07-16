import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InvitationResolver } from 'shared/resolvers';

import { HomeComponent } from './core/home/home.component';
import { FaqComponent } from './core/faq/faq.component';

const ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: {
      invitation: InvitationResolver,
    },
  },
  { path: '', loadChildren: './user/user.module#UserModule' },
  { path: '', loadChildren: './game/game.module#GameModule' },
  { path: '', loadChildren: './store/store.module#StoreModule' },
  { path: 'cms', loadChildren: './cms/cms.module#CmsModule' },
  { path: 'faq', component: FaqComponent },
];

/* tslint:disable:no-unnecessary-class */

@NgModule({
  imports: [
    RouterModule.forRoot(ROUTES),
  ],
})
export class AppRoutingModule {}
