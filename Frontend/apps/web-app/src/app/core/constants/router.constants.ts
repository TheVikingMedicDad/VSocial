// path params
export const PATH_PARAM_TOKEN = 'token';
export const PATH_PARAM_ID = 'id';
export const PATH_PARAM_VIEW = 'view';
export const PATH_PARAM_DRAFT_ID = 'draftId';

// path names
export const PATH_NAME_AUTH = 'auth';
export const PATH_NAME_REGISTER = 'signup';
export const PATH_NAME_LOGIN = 'login';
export const PATH_NAME_APP_ENTRY_PAGE = 'dashboard';
export const PATH_NAME_USER_ACCOUNT = 'account';
export const PATH_NAME_TODO = 'todo';
export const PATH_NAME_CONFIRM_REGISTRATION = 'confirm-registration';
export const PATH_NAME_TOKEN = ':' + PATH_PARAM_TOKEN;
export const PATH_NAME_ID = ':' + PATH_PARAM_ID;
export const PATH_NAME_DRAFT_ID = ':' + PATH_PARAM_DRAFT_ID;
export const PATH_NAME_CONFIRM_EMAIL = 'confirm-email';
export const PATH_NAME_REQUEST_PASSWORD_RESET = 'request-password-reset';
export const PATH_NAME_PASSWORD_RESET = 'password-reset';
export const PATH_NAME_ADMIN = 'admin';
export const PATH_NAME_USER_MANAGEMENT = 'user-management';
export const PATH_NAME_USER_LIST = 'list';
export const PATH_NAME_USER_ADD = 'add';
export const PATH_NAME_USER_EDIT = 'edit';
export const PATH_NAME_USER_VIEW = 'view';
export const PATH_NAME_COMPONENT_LIBRARY = 'component-library';
export const PATH_NAME_CONFIRM_DIALOG = 'confirm-dialog';
export const PATH_NAME_CSD_SELECT = 'csd-select';
export const PATH_NAME_STYLEGUIDE = 'styleguide';
export const PATH_NAME_FORM_CONTROLS = 'form-controls';
export const PATH_NAME_BUTTONS = 'buttons';
export const PATH_NAME_CSD_CARDS = 'cards';
export const PATH_NAME_SNACKBARS = 'snackbars';
export const PATH_NAME_OTHER_COMPONENTS = 'others';
export const PATH_NAME_CSD_LISTS = 'lists';
export const PATH_NAME_ACTIVATION_EMAIL_PREVIEW = 'activation-email';
export const PATH_NAME_EXAMPLE_TABLE_PAGE = 'table';
export const PATH_NAME_CSD_STEPPER = 'csd-stepper';
export const PATH_NAME_CSD_VERSION_PAGE = 'version';
export const PATH_NAME_ORGANISATIONS = 'organisations';
export const PATH_NAME_ORGANISATION_LIST = 'list';
export const PATH_NAME_TODO_TABLE_VIEW = 'table';
export const PATH_NAME_ANALYTICS = 'analytics';
export const PATH_NAME_ANALYTICS_BI_EVENTS = 'events';
export const PATH_NAME_DATA_FILTERING = 'filter';
export const PATH_NAME_FILTER_CONFIGURATOR = 'config';
export const COMPONENTS_OVERVIEW = 'components-overview';

export const PATH_NAME_CRUD_MODEL_LIST = '';
export const PATH_NAME_CRUD_MODEL_ADD = 'add';
export const PATH_NAME_CRUD_MODEL_VIEW = '';
export const PATH_NAME_CRUD_MODEL_EDIT = 'edit';
export const PATH_NAME_CRUD_MODEL_NEW = 'new';

// AUTH
export const PATH_REGISTER = '/' + PATH_NAME_AUTH + '/' + PATH_NAME_REGISTER;
export const PATH_LOGIN = '/' + PATH_NAME_AUTH + '/' + PATH_NAME_LOGIN;
export const PATH_CONFIRM_REGISTRATION =
  '/' + PATH_NAME_AUTH + '/' + PATH_NAME_CONFIRM_REGISTRATION;
export const PATH_REQUEST_PASSWORD_RESET =
  '/' + PATH_NAME_AUTH + '/' + PATH_NAME_REQUEST_PASSWORD_RESET;

// Redirect
export const PAGE_NOT_FOUND = '404';

// Invitation System
export const PATH_NAME_INVITATION_SYSTEM = 'invitation';
export const PATH_NAME_INVITATION_CHECK = 'check';

// shortcuts
export const PATH_REGISTER_SHORTCUT = '/' + PATH_NAME_REGISTER;
export const PATH_LOGIN_SHORTCUT = '/' + PATH_NAME_LOGIN;

// Entry Page
export const PATH_APP_ENTRY_PAGE = '/' + PATH_NAME_APP_ENTRY_PAGE;

// User Account
export const PATH_USER_ACCOUNT = '/' + PATH_NAME_USER_ACCOUNT;

// Admin
export const PATH_ADMIN = '/' + PATH_NAME_ADMIN;
export const PATH_ADMIN_USER_VIEW =
  '/' +
  PATH_NAME_ADMIN +
  '/' +
  PATH_NAME_USER_MANAGEMENT +
  '/' +
  PATH_NAME_USER_VIEW +
  '/' +
  PATH_NAME_ID;

// User Management
export const PATH_USER_MANAGEMENT = '/' + PATH_NAME_ADMIN + '/' + PATH_NAME_USER_MANAGEMENT;

// Manage User Invitations Crud Model
export const PATH_NAME_USER_INVITATION = 'user-invitations';
export const PATH_NAME_USER_INVITATION_ACCEPT = 'accept';

// Component Libraries

export const PATH_COMPONENT_LIBRARY = '/' + PATH_NAME_COMPONENT_LIBRARY;
export const PATH_CONFIRM_DIALOG = '/' + PATH_NAME_CONFIRM_DIALOG;
