import {useState} from 'react';

export interface UseLogin {
  username: string;
  isLoggedIn: boolean;
  loginError: string | null,
  login: () => void;
}

function getDefaultData(showMockData: boolean): UseLogin {
  if (showMockData) {
    return {
      username: '',
      isLoggedIn: false,
      loginError: null,
      login: () => {},
    }
  } else {
    return {
      username: '',
      isLoggedIn: false,
      loginError: null,
      login: () => {},
    }
  }
}
export function useLogin({isLoading, setIsLoading, showMockData}: {showMockData: boolean, isLoading: boolean, setIsLoading: (e: boolean) => void}): UseLogin {
  const defaultData = getDefaultData(showMockData);
  const [isLoggedIn, setIsLoggedIn] = useState(defaultData.isLoggedIn);
  const [username, setUsername] = useState(defaultData.username);
  const [loginError, setLoginError] = useState<null | string>(defaultData.loginError);

  async function login() {
    setIsLoading(true);
    const {username, loginError} = await window.electronApi.youtubeLogin();
    if (loginError) {
      setLoginError(loginError);
      setIsLoggedIn(false);
    } else {
      setUsername(username);
      setLoginError(null);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }
  return {isLoggedIn, username, loginError, login}

}
