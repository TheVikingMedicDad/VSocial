import { AdminApp } from '../../admin/admin.types';

export const csdProjectKey = 'vsp';

export const ROUTER_OUTLET_MAIN_SIDENAV = 'main-sidenav';

export const PATH_NAME_IMAGES = 'images';
export const PATH_NAME_ASSETS = 'assets';
export const PATH_NAME_ADMIN = 'admin';
export const PATH_ADMIN_APP_IMAGES =
  '/' + PATH_NAME_ASSETS + '/' + PATH_NAME_IMAGES + '/' + PATH_NAME_ADMIN;

export const ADMIN_ICON_LG = 'icon_lg.svg';
export const ADMIN_APPS_TRANS_KEY = 'ADMIN_APPS';
export const ADMIN_APPS_TRANS_KEY_NAME = 'NAME';

export const ADMIN_APPS: AdminApp[] = [
  {
    nameKey: 'USER_MANAGEMENT',
  },
  // 
  {
    nameKey: 'SYSTEM',
  },
];

export const LANGUAGES = ['en', 'de'];

export const TEMP_MODEL_ID = -1;

export const ARROW_UP = 'ArrowUp';
export const ARROW_RIGHT = 'ArrowRight';
export const ARROW_DOWN = 'ArrowDown';
export const ARROW_LEFT = 'ArrowLeft';
export const ENTER = 'Enter';
export const BACKSPACE = 'Backspace';
