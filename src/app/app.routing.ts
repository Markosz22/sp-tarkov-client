import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'instance-overview', pathMatch: 'full' },
  { path: 'setting', loadComponent: () => import('./components/personal-setting/personal-setting.component') },
  { path: 'instance-overview', loadComponent: () => import('./components/instance-overview/instance-overview.component') },
  { path: 'mod-list', loadComponent: () => import('./components/mod-list/mod-list.component') },
  { path: 'mod-load-order', loadComponent: () => import('./components/mod-load-order/mod-load-order.component') },
  { path: 'mod-update-overview', loadComponent: () => import('./components/mod-update-overview/mod-update-overview.component') },
  {
    path: 'top-rated',
    loadComponent: () => import('./core/components/generic-mod-list/generic-mod-list.component'),
    data: { sortField: 'cumulativeLikes', sortOrder: 'DESC' },
  },
  {
    path: 'new',
    loadComponent: () => import('./core/components/generic-mod-list/generic-mod-list.component'),
    data: { sortField: 'time', sortOrder: 'DESC' },
  },
  {
    path: 'updated',
    loadComponent: () => import('./core/components/generic-mod-list/generic-mod-list.component'),
    data: { sortField: 'lastChangeTime', sortOrder: 'DESC' },
  },
  {
    path: 'most-loaded',
    loadComponent: () => import('./core/components/generic-mod-list/generic-mod-list.component'),
    data: { sortField: 'downloads', sortOrder: 'DESC' },
  },
  {
    path: 'tags',
    loadComponent: () => import('./core/components/generic-mod-list/generic-mod-list.component'),
    data: { tags: true },
  },
];
