declare module 'tough-cookie' {
    export interface Cookie {
      key: string;
      value: string;
      expires: Date | 'Infinity';
      maxAge?: number | 'Infinity';
      domain: string;
      path: string;
      secure?: boolean;
      httpOnly?: boolean;
      extensions?: string[];
      creation: Date;
      lastAccessed: Date;
    }
  }
  