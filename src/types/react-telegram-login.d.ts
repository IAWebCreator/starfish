declare module 'react-telegram-login' {
  interface TelegramLoginButtonProps {
    botName: string;
    dataOnauth: (user: {
      id: number;
      first_name: string;
      username: string;
      auth_date: number;
      hash: string;
    }) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: string;
    usePic?: boolean;
    className?: string;
    lang?: string;
  }

  export default function TelegramLoginButton(props: TelegramLoginButtonProps): JSX.Element;
} 