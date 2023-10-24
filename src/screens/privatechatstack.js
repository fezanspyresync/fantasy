import {createStackNavigator} from '@react-navigation/stack';
import PrivateChat from './privatechatroom';
const Stack = createStackNavigator();

const PrivateStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="privatechat"
        component={PrivateChat}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default PrivateStack;
