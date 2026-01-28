/**
 * Custom error class for Firestore permission errors.
 * Extends the standard Error class to provide type-specific error handling.
 */
export interface FirestoreErrorData {
  path?: string;
  operation?: string;
  requestResourceData?: any;
}

export class FirestorePermissionError extends Error {
  public data?: FirestoreErrorData;

  constructor(messageOrData: string | FirestoreErrorData = 'Permission denied accessing Firestore') {
    let message: string;
    let data: FirestoreErrorData | undefined;

    if (typeof messageOrData === 'string') {
      message = messageOrData;
    } else {
      data = messageOrData;
      const { path, operation } = messageOrData;
      message = `Failed to ${operation || 'access'} Firestore${path ? ` at path: ${path}` : ''}`;
    }

    super(message);
    this.name = 'FirestorePermissionError';
    this.data = data;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
