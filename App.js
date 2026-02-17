import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Provider } from 'react-redux';
import "react-native-reanimated"
const Stack = createNativeStackNavigator();
import {AllPostsscreen,ViewProfilescreen, Aboutscreen, AddTochatscreen, Chatscreen, DetailsScreen, Homescreen, Messagescreen, Postscreen, Searchscreen, Splashscreen, Settingsscreen, LandingPage } from './screens';
import { Loginscreen } from './screens';
import { Signupscreen } from './screens';
import Store from './context/store';
import {Profilescreen} from './screens';
import { LogBox } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';


export default function App() {
  LogBox.ignoreAllLogs()
  return (

    <AlertNotificationRoot>

   
<NavigationContainer>
  <Provider store={Store}>

          <Stack.Navigator screenOptions={{headerShown: false}}>

            
          <Stack.Screen name="Splashscreen" options={{ gestureEnabled: false }} component={Splashscreen} />
           <Stack.Screen name="LandingPage" options={{ gestureEnabled: false }} component={LandingPage} />
          <Stack.Screen name="Signupscreen" options={{ gestureEnabled: false }} component={Signupscreen} />
          <Stack.Screen name="Loginscreen" options={{ gestureEnabled: false }} component={Loginscreen} />
          <Stack.Screen name="Aboutscreen" options={{ gestureEnabled: false }} component={Aboutscreen} />
          <Stack.Screen name="Homescreen" options={{ gestureEnabled: false }} component={Homescreen} />
      
        
        <Stack.Screen name="AddTochatscreen" options={{ gestureEnabled: false }} component={AddTochatscreen} />
        <Stack.Screen name="Chatscreen"  component={Chatscreen} />
        <Stack.Screen name="Messagescreen" options={{ gestureEnabled: false }} component={Messagescreen} />
        <Stack.Screen name="Profilescreen" options={{ gestureEnabled: false }} component={Profilescreen} />
        <Stack.Screen name="Postscreen" options={{ gestureEnabled: false }} component={Postscreen} />
        <Stack.Screen name="Searchscreen" options={{ gestureEnabled: false }} component={Searchscreen} />
        <Stack.Screen name="DetailsScreen"  component={DetailsScreen} />
        <Stack.Screen name="ViewProfilescreen"  component={ViewProfilescreen} />
        <Stack.Screen name="AllPostsscreen"  component={AllPostsscreen} />
        <Stack.Screen name="Settingsscreen"  component={Settingsscreen} />
        

      </Stack.Navigator>
  
  </Provider>
  </NavigationContainer> 
        </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
