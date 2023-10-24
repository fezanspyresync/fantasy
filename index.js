/**
 * @format
 */

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import {io} from 'socket.io-client';
import {Provider} from 'react-redux';
import store from './src/store/store';
const baseurl =
  Platform.OS === 'android'
    ? 'http://192.168.39.245:3000'
    : 'http://localhost:3000';

export const socket = io.connect(baseurl);

const ReduxApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);
AppRegistry.registerComponent(appName, () => ReduxApp);
