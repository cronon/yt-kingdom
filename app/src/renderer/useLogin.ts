import { Auth } from 'common/auth';
import {useEffect, useState} from 'react';

export interface UseLogin {
  username: string;
  isLoggedIn: boolean;
  loginError: string | null,
  login: () => void;
}

function getDefaultData(showMockData: boolean): UseLogin {
  if (showMockData) {
    return {
      username: localStorage.getItem('username') || '',
      isLoggedIn: !!localStorage.getItem('username'),
      loginError: null,
      login: () => {},
    }
  } else {
    return {
      username: localStorage.getItem('username') || '',
      isLoggedIn: !!localStorage.getItem('username'),
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
  useEffect(() => {
    window.electronApi.getChannel().then(res => {
      if (res) {
        console.log('channelId', res.channelId, res.username)
        setUsername(res.username);
        setIsLoggedIn(true);
        localStorage.setItem('username', res.username)
      } else {
        setUsername('')
        setIsLoggedIn(false);
        localStorage.removeItem('username');
      }
    })

  }, []);

  async function login() {
    setIsLoading(true);
    const {username, loginError} = await window.electronApi.youtubeLogin();
    if (loginError) {
      setLoginError(loginError);
      setIsLoggedIn(false);
      localStorage.removeItem('username');
    } else {
      setUsername(username);
      localStorage.setItem('username', username)
      setLoginError(null);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }
  return {isLoggedIn, username, loginError, login}

}
