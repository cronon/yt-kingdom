import { Auth } from 'common/auth';
import {useEffect, useState} from 'react';

export interface UseLogin {
  username: string;
  isLoggedIn: boolean;
  loginError: string | null,
  login: () => void;
  checkLogin: () => Promise<boolean>;
  channelId: string;
}

function getDefaultData(showMockData: boolean) {
  if (showMockData) {
    return {
      username: localStorage.getItem('username') || '',
      isLoggedIn: !!localStorage.getItem('username'),
      loginError: null,
      channelId: '',
      login: () => {},
    }
  } else {
    return {
      username: localStorage.getItem('username') || '',
      isLoggedIn: !!localStorage.getItem('username'),
      loginError: null,
      channelId: '',
      login: () => {},
    }
  }
}
export function useLogin({isLoading, setIsLoading, showMockData}: {showMockData: boolean, isLoading: boolean, setIsLoading: (e: boolean) => void}): UseLogin {
  const defaultData = getDefaultData(showMockData);
  const [isLoggedIn, setIsLoggedIn] = useState(defaultData.isLoggedIn);
  const [username, setUsername] = useState(defaultData.username);
  const [loginError, setLoginError] = useState<null | string>(defaultData.loginError);
  const [channelId, setChannelId] = useState(defaultData.channelId);
  useEffect(() => {
    checkLogin();
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
  async function checkLogin(): Promise<boolean> {
    return window.electronApi.getChannel().then(res => {
      if (res) {
        setChannelId(res.channelId)
        setUsername(res.username);
        setIsLoggedIn(true);
        localStorage.setItem('username', res.username)
        return true;
      } else {
        setUsername('');
        setChannelId('')
        setIsLoggedIn(false);
        localStorage.removeItem('username');
        return false;
      }
    })
  }
  return {isLoggedIn, username, loginError, login, checkLogin, channelId}

}
