export const APP_NAME = 'Desktop';
export const APP_DESCRIPTION = '';

// Auth

// (auth)/email/error
export const ERROR_PAGE_TITLE = `Email error – ${APP_NAME}`;
export const ERROR_PAGE_DESCRIPTION = 'Email confirmation';
export const ERROR_TITLE = 'Oops!';

// (auth)/email/result
export const ERROR_UNEXPECTED_FORMAT = 'Unexpected error format';
export const ERROR_EMAIL_TOKEN = 'Unable to verify email token';
export const ERROR_INVALID_SEARCH_PARAMS = 'Invalid search params';

// (auth)/email/verify
export const EMAIL_VERIFY_TITLE = 'Check your inbox';
export const EMAIL_VERIFY_SENT_INTRO = "We've sent a link to";
export const EMAIL_VERIFY_SENT_OUTRO =
  'Please follow the instructions to complete your registration.';
export const EMAIL_VERIFY_SPAM_WARNING =
  "Don't see an email? Check spam folder.";
export const EMAIL_VERIFY_RESEND_BUTTON = 'Resend verification link';

// (auth)/invite
export const INVITE_PAGE_TITLE = `Invite code – ${APP_NAME}`;
export const INVITE_PAGE_DESCRIPTION = 'Account creation';
export const INVITE_CARD_TITLE = 'Invite code';
export const INVITE_CODE_INPUT_PLACEHOLDER = 'Enter the code';
export const INVITE_CONTINUE_BUTTON = 'Continue';
export const ALREADY_HAVE_ACCOUNT = 'Already have an account ?';
export const INVITE_TOAST_WAIT_SECONDS =
  'Please wait for {seconds} seconds and try again';
export const INVITE_TOAST_WAIT_ONE_MINUTE =
  'Please wait for 1 minute and try again';
export const INVITE_TOAST_INVALID_CODE = 'Invalid code';
export const INVITE_TOAST_SERVER_ERROR = 'Server error';

// (auth)/onboarding
export const ONBOARDING_PAGE_TITLE = `Onboarding – ${APP_NAME}`;
export const ONBOARDING_PAGE_DESCRIPTION = 'Account creation';
export const ONBOARDING_CARD_TITLE = 'Onboarding';
export const ONBOARDING_CARD_DESCRIPTION = 'Email successfully verified';
export const ONBOARDING_LABEL_NAME = 'Your name';
export const ONBOARDING_LABEL_PASSWORD = 'Password';
export const ONBOARDING_LABEL_CONFIRM_PASSWORD = 'Confirm password';
export const ONBOARDING_BUTTON_CREATE_ACCOUNT = 'Create an account';
export const ONBOARDING_TOAST_INVITE_MISSING = 'Could not retrieve invite code';

// (auth)/signin
export const SIGNIN_PAGE_TITLE = `Sign In – ${APP_NAME}`;
export const SIGNIN_PAGE_DESCRIPTION = 'Authentication';
export const SIGNIN_CARD_TITLE = 'Sign In';

export const EMAIL_INPUT_LABEL = 'Email';
export const PASSWORD_INPUT_LABEL = 'Password';
export const SIGNIN_BUTTON_LABEL = 'Sign in';
export const CREATE_ACCOUNT_LINK_LABEL = 'Create an account';

// (auth)/signup
export const SIGNUP_PAGE_TITLE = `Sign Up – ${APP_NAME}`;
export const SIGNUP_PAGE_DESCRIPTION = 'Account creation';
export const SIGNUP_CARD_TITLE = 'Sign Up';

// Email
export const VERIFICATION_EMAIL_SUBJECT = 'Confirm Your Email Address';
export const VERIFICATION_EMAIL_TITLE = 'Email Confirmation';
export const VERIFICATION_EMAIL_DESCRIPTION =
  'Click the button below to confirm your email address';
export const VERIFICATION_EMAIL_BUTTON = 'Confirm';

// Inputs
export const EMAIL_INPUT_PLACEHOLDER = 'Enter your email';

// Buttons
export const SIGNOUT_BUTTON_LABEL = 'Sign out';
export const CONTINUE_BUTTON_LABEL = 'Continue';
export const CANCEL_BUTTON_LABEL = 'Cancel';

// Utils
export const UNKNOWN_ERROR = 'Unknown error';
export const INVALID_SEARCH_PARAMS = 'Invalid search params';
export const INVALID_ERROR_CODE = 'Invalid error code';

// Menu
export const MAIN_MENU_TITLE = 'Main menu';
export const THEME_LABEL_LIGHT = 'Light';
export const THEME_LABEL_DARK = 'Dark';
export const THEME_LABEL_SUFFIX = ' theme';
export const SIGN_OUT_LABEL = 'Sign out';

export const DATA_ERROR = 'Unable to retrieve data';
export const RETRIEVE_DATA = 'Retrieve Data';
export const UPDATE = 'Update';
export const DETAILS = 'Details';

// Pages

// Main page
export const NEWS_BTN_LABEL = 'Read News';
export const NOTES_BTN_LABEL = 'View Notes';
export const SHOW_SIDEBAR_TITLE = 'Show sidebar';
export const HIDE_SIDEBAR_TITLE = 'Hide sidebar';

// Facts page
export const GET_FACT_BTN_LABEL = 'Get Fact';

// Light page
export const GET_LIGHT_DATA_BTN_LABEL = 'Get Schedule';
export const FETCHING_DATA_MESSAGE = 'Retrieving data...';
export const LIGHT_DATA_UPD_AT_MESSAGE = 'dtek update';

// News page
export const NEWS_PAGE_TITLE = `Latest News – ${APP_NAME}`;
export const NEWS_PAGE_DESCRIPTION =
  'Get the latest news, and top stories from around the world.';

// Notes: Common
export const NOTES_PAGE_TITLE = `Notes – ${APP_NAME}`;
export const NOTES_PAGE_DESCRIPTION =
  'Create, edit, and manage your notes all in one place.';
export const EDIT_TITLE = 'Click to edit';

// Notes: Folder page
export const EDIT_FOLDER_DIALOG_TITLE = 'Edit Folder';
export const EDIT_FOLDER_DIALOG_DESCRIPTION =
  'Update the folder title and color';
export const EDIT_FOLDER_DIALOG_ACCEPT_BTN_LABEL = 'Save changes';
export const CREATE_NOTE_BTN_LABEL = 'Create a Note';
export const TOAST_NOTE_ENCRYPTED = 'Note content is encrypted and safe';
export const TOAST_NOTE_DECRYPTED =
  'Note content is decrypted and may be exposed';
export const TOAST_CREATE_NOTE_ERROR = 'Unable to create note';
export const TOAST_UPDATE_FOLDER_ERROR = 'Unable to update folder';
export const TOAST_DELETE_FOLDER_ERROR = 'Unable to delete folder';
export const TOAST_GET_NOTES_ERROR = 'Unable to retrieve notes';
export const DELETE_FOLDER_TITLE = 'Delete folder';
export const CREATE_NOTE_TITLE = 'Create a note';

// Notes: Note page
export const EDIT_FOLDER_FORM_COLOR_PLACEHOLDER = 'Color';
export const PASTE_CONTENT_BTN_LABEL = 'Paste content from clipboard';
export const SAVE_CHANGES_TITLE = 'Save changes';
export const DECRYPT_IN_DB_TITLE = 'Decrypt content in DB';
export const ENCRYPT_NOTE_TITLE = 'Encrypt note content';
export const PREVIEW_MODE_TITLE = 'Preview mode';
export const EDIT_MODE_TITLE = 'Edit mode';
export const CLEAR_NOTE_TITLE = 'Clear note content';
export const DELETE_NOTE_TITLE = 'Delete note';
export const DECRYPTING_NOTE_MESSAGE = 'Decrypting content...';
export const TOAST_NOTE_MOVED_START = 'Note moved to the';
export const TOAST_NOTE_MOVED_END = 'folder';
