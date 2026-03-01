import { ErrorMessageEnum } from './error-message.enum';

/**
 * Maps ErrorMessageEnum to HTTP status codes
 */
export const ERROR_CODE_CONFIG: Record<ErrorMessageEnum, number> = {
  // Standard errors
  [ErrorMessageEnum.NO_CONTENT]: 204,
  [ErrorMessageEnum.MOVED_PERMANENTLY]: 301,
  [ErrorMessageEnum.FOUND]: 302,
  [ErrorMessageEnum.NOT_MODIFIED]: 304,
  [ErrorMessageEnum.BAD_REQUEST_EXCEPTION]: 400,
  [ErrorMessageEnum.UNAUTHORIZED]: 401,
  [ErrorMessageEnum.FORBIDDEN]: 403,
  [ErrorMessageEnum.NOT_FOUND]: 404,
  [ErrorMessageEnum.METHOD_NOT_ALLOWED]: 405,
  [ErrorMessageEnum.TOO_MANY_REQUESTS]: 429,
  [ErrorMessageEnum.SERVER_SIDE_ERROR]: 500,
  [ErrorMessageEnum.NOT_IMPLEMENTED]: 501,
  [ErrorMessageEnum.BAD_GATEWAY]: 502,
  [ErrorMessageEnum.SERVICE_UNAVAILABLE]: 503,
  [ErrorMessageEnum.GATEWAY_TIMEOUT]: 504,


  // Uploader errors
  [ErrorMessageEnum.INVALID_FILE_UPLOAD]: 400,
  [ErrorMessageEnum.FILE_TOO_LARGE]: 400,
  [ErrorMessageEnum.TOO_MANY_FILES]: 400,
  [ErrorMessageEnum.TOO_MANY_FIELDS]: 400,
  [ErrorMessageEnum.INVALID_FILE_TYPE]: 400,
  [ErrorMessageEnum.INVALID_MODEL_USE_CASE]: 400,
  [ErrorMessageEnum.MISSING_CONTENT_TYPE]: 400,
  [ErrorMessageEnum.NO_FILE_PROVIDED]: 400,
  [ErrorMessageEnum.FILE_DOES_NOT_EXIST]: 404,

  // Auth errors
  [ErrorMessageEnum.EMAIL_ALREADY_EXIST]: 409,
  [ErrorMessageEnum.VALID_VERIFICATION_CODE_EXIST]: 409,
  [ErrorMessageEnum.USER_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.USER_EMAIL_ALREADY_VERIFIED]: 409,
  [ErrorMessageEnum.USER_NOT_VERIFIED]: 401,
  [ErrorMessageEnum.INVALID_VERIFICATION_CODE]: 400,
  [ErrorMessageEnum.EXPIRED_VERIFICATION_CODE]: 400,
  [ErrorMessageEnum.WRONG_EMAIL_OR_PASSWORD]: 401,
  [ErrorMessageEnum.VERIFIED_PHONE_NUMBER_EXIST]: 409,
  [ErrorMessageEnum.UNDEFINED_EMAIL_AND_PHONE_NUMBER]: 400,
  [ErrorMessageEnum.USER_EMAIL_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.USER_PHONE_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.USER_PHONE_NUMBER_ALREADY_VERIFIED]: 409,
  [ErrorMessageEnum.USER_DOES_NOT_HAVE_VERIFIED_EMAIL]: 401,
  [ErrorMessageEnum.USER_DOES_NOT_HAVE_VERIFIED_PHONE_NUMBER]: 401,
  [ErrorMessageEnum.VERIFIED_EMAIL_EXIST]: 409,
  [ErrorMessageEnum.NOT_PROVIDED_EMAIL]: 400,
  [ErrorMessageEnum.SOCIAL_ID_ALREADY_EXIST]: 409,
  [ErrorMessageEnum.EMAIL_PROVIDED_BOTH_MANUALLY_AND_BY_SOCIAL_PROVIDE]: 400,
  [ErrorMessageEnum.INVALID_SOCIAL_AUTH_TOKEN]: 401,
  [ErrorMessageEnum.INCORRECT_PASSWORD]: 401,
  [ErrorMessageEnum.USER_ALREADY_CONNECTED_TO_THIS_SOCIAL_PROVIDER]: 409,
  [ErrorMessageEnum.ADMIN_GROUP_WITH_THIS_NAME_ALREADY_EXIST]: 409,
  [ErrorMessageEnum.INVALID_PERMISSIONS_CODES_LIST]: 400,
  [ErrorMessageEnum.ADMIN_GROUP_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.NOT_PROVIDED_NOTIFICATION_TOKEN]: 400,
  [ErrorMessageEnum.EXPIRED_ACCESS_TOKEN]: 498,
  [ErrorMessageEnum.PASSWORD_RESET_REQUIRED]: 403,
  [ErrorMessageEnum.PROFILE_COMPLETION_REQUIRED]: 403,
  [ErrorMessageEnum.EMAIL_MISMATCH]: 400,
  [ErrorMessageEnum.EMAIL_NOT_VERIFIED]: 401,
  [ErrorMessageEnum.INVALID_CREDENTIALS]: 401,
  [ErrorMessageEnum.INVALID_OTP]: 400,
  [ErrorMessageEnum.EXPIRED_OTP]: 400,
  [ErrorMessageEnum.PASSWORD_RESET_NOT_ALLOWED]: 403,
  [ErrorMessageEnum.SAME_PASSWORD_ERROR]: 400,

  // Notifications
  [ErrorMessageEnum.NOTIFICATION_ALREADY_MARKED_AS_SEEN]: 409,
  [ErrorMessageEnum.NOTIFICATION_RECEIVER_DOES_NOT_EXIST]: 404,

  // Region
  [ErrorMessageEnum.COUNTRY_ALREADY_EXIST]: 409,
  [ErrorMessageEnum.INVALID_COUNTRY_CODE]: 400,
  [ErrorMessageEnum.COUNTY_DOES_NOT_EXIST]: 404,

  // Payment
  [ErrorMessageEnum.PAYMENT_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.CITY_DOES_NOT_EXIST]: 404,

  // Other
  [ErrorMessageEnum.INVALID_USER_IDS]: 400,
  [ErrorMessageEnum.FAQ_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.APP_CONTACT_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.POLICY_WITH_THIS_TYPE_ALREADY_EXIST]: 409,
  [ErrorMessageEnum.POLICY_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.PARENT_BLOG_CATEGORY_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.NESTED_BLOG_CATEGORY_PARENT]: 400,
  [ErrorMessageEnum.SLUG_ALREADY_EXIST]: 409,
  [ErrorMessageEnum.BLOG_CATEGORY_ALREADY_EXIST]: 409,
  [ErrorMessageEnum.BLOG_CATEGORY_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.TAG_DOES_NOT_EXIST]: 404,
  [ErrorMessageEnum.CANNOT_DELETE_LAST_API_KEY]: 400,
  [ErrorMessageEnum.USER_ALREADY_EXIST]: 409,

  // API Key tier limits
  [ErrorMessageEnum.API_KEY_LIMIT_REACHED_FREE]: 403,
  [ErrorMessageEnum.API_KEY_LIMIT_REACHED_PRO]: 403,
  [ErrorMessageEnum.API_KEY_LIMIT_REACHED_ENTERPRISE]: 403,

  // Auth Guard: Token validation errors
  [ErrorMessageEnum.MISSING_AUTHORIZATION_HEADER]: 401,
  [ErrorMessageEnum.INVALID_BEARER_TOKEN_FORMAT]: 400,
  [ErrorMessageEnum.INVALID_TOKEN]: 401,
  [ErrorMessageEnum.TOKEN_NOT_FOUND_IN_SESSION]: 401,
  [ErrorMessageEnum.TOKEN_VERIFICATION_FAILED]: 401,

  // Auth Guard: API Key validation errors
  [ErrorMessageEnum.MISSING_API_KEY_HEADER]: 401,
  [ErrorMessageEnum.INVALID_API_KEY]: 401,
  [ErrorMessageEnum.API_KEY_EXPIRED]: 401,
  [ErrorMessageEnum.API_KEY_USAGE_LIMIT_EXCEEDED_FREE]: 429,
  [ErrorMessageEnum.API_KEY_USAGE_LIMIT_EXCEEDED_PRO]: 429,
  [ErrorMessageEnum.API_KEY_USAGE_LIMIT_EXCEEDED_ENTERPRISE]: 429,

  // Auth Guard: User identity errors
  [ErrorMessageEnum.USER_IDENTITY_NOT_FOUND]: 401,
  [ErrorMessageEnum.USER_EMAIL_NOT_VERIFIED]: 401,
  [ErrorMessageEnum.USER_ACCOUNT_INACTIVE]: 403,

  // Auth Guard: Authorization errors
  [ErrorMessageEnum.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorMessageEnum.INSUFFICIENT_ROLE]: 403,
};
