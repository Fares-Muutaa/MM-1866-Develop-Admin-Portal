export interface SearchParamsProps {
    searchParams: {
      page: string;
      search: string;
      size: string;
      column: string;
      order: string;
     
    };
  }

export interface Form {
    passwordLabel: string;
    passwordPlaceholder: string;
    resetButton: string;
}

export interface FormMessages {
    error: string;
    success: string;
    userNotFound: string;
    UpdatePass: string;
}

export interface PasswordValidation {
    minLength: string;
    mustIncludeLetters: string;
    mustIncludeUppercase: string;
    mustIncludeNumbers: string;
    mustIncludeSpecialChar: string;
}

export interface ResetPassword {
    title: string;
    description: string;
    renew: string;
    form: Form;
    formMessages: FormMessages;
    passwordValidation: PasswordValidation;
}
