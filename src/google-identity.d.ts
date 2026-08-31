interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize(options: {
        client_id: string;
        callback(response: GoogleCredentialResponse): void;
      }): void;
      renderButton(
        parent: HTMLElement,
        options: {
          type: 'standard';
          theme: 'outline' | 'filled_blue' | 'filled_black';
          size: 'large' | 'medium' | 'small';
          text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
          shape: 'rectangular' | 'pill' | 'circle' | 'square';
          logo_alignment: 'left' | 'center';
          width: number;
        },
      ): void;
    };
  };
}

interface Window {
  google?: GoogleIdentityServices;
}
